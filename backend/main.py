"""
Karrar.ai — Contract Analysis API
==================================
Pure-Python implementation of the AI Legal Contract Risk Analysis pipeline.
Replaces the previous n8n webhook-based workflow with direct OpenRouter calls.

Agents (all use arcee-ai/trinity-large-preview:free via OpenRouter):
  1. Risk Assessment Agent       — per-clause risk scoring      (Karrarayush07)
  2. Explanation Agent           — per-clause plain-English      (KarrarNavsafe)
  3. Counter-Terms Agent         — per-clause (negotiable only)  (KarrarAyushgirizoho)
  4. Global Explanation Agent    — full-contract summary         (KarrarGiriayushzoho)
  5. Regulatory Compliance Agent — full-contract legal check     (KarrarAvi)
"""

import asyncio
import json
import os
import re
from typing import Any, Dict, List, Optional

import fitz  # PyMuPDF
import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

load_dotenv()

app = FastAPI(
    title="Karrar.ai — Contract Analysis API",
    description="Upload a legal contract PDF to extract clauses and analyze them with AI agents.",
    version="2.0.0",
)

# ---------------------------------------------------------------------------
# CORS — allow the Vercel frontend (and any other origin) to call this API
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

# One dedicated key per agent for better rate-limit distribution
API_KEY_RISK       = os.getenv("OPENROUTER_API_KEY_RISK", "")        # Agent 1 — Risk Assessment
API_KEY_EXPLAIN    = os.getenv("OPENROUTER_API_KEY_EXPLAIN", "")     # Agent 2 — Explanation
API_KEY_COUNTER    = os.getenv("OPENROUTER_API_KEY_COUNTER", "")     # Agent 3 — Counter-Terms
API_KEY_GLOBAL     = os.getenv("OPENROUTER_API_KEY_GLOBAL", "")      # Agent 4 — Global Explanation
API_KEY_COMPLIANCE = os.getenv("OPENROUTER_API_KEY_COMPLIANCE", "")  # Agent 5 — Regulatory Compliance

MODEL = os.getenv("OPENROUTER_MODEL", "arcee-ai/trinity-large-preview:free")


# ---------------------------------------------------------------------------
# Helpers — PDF
# ---------------------------------------------------------------------------

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Open a PDF from bytes and return all text concatenated."""
    text_parts: List[str] = []
    with fitz.open(stream=pdf_bytes, filetype="pdf") as doc:
        for page in doc:
            text_parts.append(page.get_text())
    return "\n".join(text_parts)


_CLAUSE_SPLIT_RE = re.compile(
    r"""
    (?:                        # Non-capturing group for alternatives
        (?:^|\n)               # start of string or newline
        \s*                    # optional whitespace
        (?:                    # numbered item variants
            \d+[\.)\]]\s       # "1. " or "1) "
          | (?:Clause|Section) # keyword headers
            \s+\d+             # followed by a number
            [\.:\s]            # followed by . or : or space
        )
      | \n{2,}                 # OR two-or-more consecutive newlines
    )
    """,
    re.VERBOSE | re.IGNORECASE,
)


def split_into_clauses(text: str) -> List[str]:
    """Split contract text into individual clause strings."""
    parts = _CLAUSE_SPLIT_RE.split(text)
    return [p.strip() for p in parts if p and p.strip()]


# ---------------------------------------------------------------------------
# Helpers — OpenRouter API
# ---------------------------------------------------------------------------

def _extract_json(raw: str) -> Optional[Dict[str, Any]]:
    """Extract the first JSON object from a raw string (handles markdown fences, etc.)."""
    start = raw.find("{")
    end = raw.rfind("}")
    if start == -1 or end == -1:
        return None
    try:
        return json.loads(raw[start : end + 1])
    except json.JSONDecodeError:
        return None


async def call_openrouter(
    api_key: str,
    prompt: str,
    *,
    temperature: float = 0.1,
    max_tokens: int = 1000,
) -> Optional[Dict[str, Any]]:
    """
    Call OpenRouter chat completions and return the parsed JSON from the
    assistant's response.  Returns None on any failure.
    """
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    body = {
        "model": MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(OPENROUTER_URL, headers=headers, json=body)
            resp.raise_for_status()
            data = resp.json()
            content = data["choices"][0]["message"]["content"]
            return _extract_json(content)
    except Exception as exc:
        print(f"[OPENROUTER ERROR] {exc}")
        return None


# ---------------------------------------------------------------------------
# Agent 1 — Risk Assessment  (per-clause, Key 1)
# ---------------------------------------------------------------------------

async def assess_risk(clause_text: str, clause_index: int) -> Dict[str, Any]:
    """Score a single clause for legal risk."""
    prompt = (
        "Legal risk analyst for Indian contract law. Analyze clause. "
        "Return ONLY JSON no markdown:\n"
        '{"riskScore":<0-100>,"riskLevel":"<Critical|High|Medium|Low>",'
        '"riskReason":"<one sentence>","negotiable":<true|false>}\n'
        "75-100=Critical,50-74=High,25-49=Medium,0-24=Low\n"
        f"Clause:{clause_text}"
    )
    parsed = await call_openrouter(API_KEY_RISK, prompt)

    if parsed is None:
        parsed = {
            "riskScore": 50,
            "riskLevel": "Medium",
            "riskReason": "Could not parse AI response",
            "negotiable": False,
        }

    parsed["clause_index"] = clause_index
    parsed["original"] = clause_text
    return parsed


# ---------------------------------------------------------------------------
# Agent 2 — Explanation  (per-clause, Key 2)
# ---------------------------------------------------------------------------

async def explain_clause(clause_text: str, clause_index: int) -> Dict[str, Any]:
    """Explain a clause in plain English for Indian freelancers."""
    prompt = (
        "Plain English explainer for Indian freelancers. "
        "Explain clause in 1-2 sentences. Return ONLY JSON no markdown:\n"
        '{"plain":"<explanation>","freelancerImpact":"<positive|negative|neutral>"}\n'
        f"Clause:{clause_text}"
    )
    parsed = await call_openrouter(API_KEY_EXPLAIN, prompt)

    if parsed is None:
        parsed = {
            "plain": "Could not parse explanation",
            "freelancerImpact": "neutral",
        }

    parsed["clause_index"] = clause_index
    return parsed


# ---------------------------------------------------------------------------
# Agent 3 — Counter-Terms  (per-clause, only if negotiable, Key 1)
# ---------------------------------------------------------------------------

async def generate_counter_term(
    clause_text: str, clause_index: int
) -> Dict[str, Any]:
    """Generate an alternative clause that protects the freelancer."""
    prompt = (
        "Contract negotiation expert for Indian freelancers. "
        "Generate counter-term valid under Indian Contract Act 1872. "
        "Return ONLY JSON no markdown:\n"
        '{"counter":"<replacement clause>","negotiationTip":"<one sentence tip>"}\n'
        f"Clause:{clause_text}"
    )
    parsed = await call_openrouter(API_KEY_COUNTER, prompt, temperature=0.2, max_tokens=1500)

    if parsed is None:
        parsed = {"counter": None, "negotiationTip": ""}

    parsed["clause_index"] = clause_index
    return parsed


def null_counter(clause_index: int) -> Dict[str, Any]:
    """Return a placeholder when a clause is not negotiable."""
    return {"counter": None, "negotiationTip": "", "clause_index": clause_index}


# ---------------------------------------------------------------------------
# Agent 4 — Global Explanation  (full contract, Key 2)
# ---------------------------------------------------------------------------

async def analyze_global(full_text: str) -> Dict[str, Any]:
    """Produce a high-level summary and readability score for the full contract."""
    prompt = (
        "Analyze contract for Indian freelancers. Return ONLY JSON no markdown:\n"
        '{"summary":"<2-3 sentence summary>","readabilityScore":<0-100>,'
        '"grade":"<A|B|C|D|F>"}\n'
        "80-100=A,60-79=B,40-59=C,20-39=D,0-19=F\n"
        f"Contract:{full_text}"
    )
    parsed = await call_openrouter(API_KEY_GLOBAL, prompt)

    if parsed is None:
        parsed = {
            "summary": "Could not generate summary",
            "readabilityScore": 50,
            "grade": "C",
        }

    return {
        "plain": parsed.get("summary", ""),
        "readabilityScore": parsed.get("readabilityScore", 50),
        "grade": parsed.get("grade", "C"),
    }


# ---------------------------------------------------------------------------
# Agent 5 — Regulatory Compliance  (full contract, Key 2)
# ---------------------------------------------------------------------------

async def check_compliance(full_text: str) -> Dict[str, Any]:
    """Check for violations of Indian contract / IT / IP law."""
    prompt = (
        "Indian contract law expert. Find violations. Focus: Indian Contract Act 1872, "
        "IT Act 2000, Section 27 non-compete, IP laws. Return ONLY JSON no markdown:\n"
        '{"issues":[{"clause_reference":"<first 8 words>",'
        '"legal_issue":"<violation>","law_citation":"<Act+Section>",'
        '"severity":"<void|unenforceable|caution>"}],'
        '"strategy":"<one sentence strategy>"}\n'
        f"Contract:{full_text}"
    )
    parsed = await call_openrouter(API_KEY_COMPLIANCE, prompt, max_tokens=2000)

    if parsed is None:
        parsed = {
            "issues": [],
            "strategy": "Review all flagged clauses with a lawyer before signing.",
        }

    return {
        "issues": parsed.get("issues", []),
        "strategy": parsed.get("strategy", "Review flagged clauses with a lawyer."),
        "status": "Reviewed",
    }


# ---------------------------------------------------------------------------
# Orchestrator — runs all agents in parallel, merges into final report
# ---------------------------------------------------------------------------

async def run_analysis_pipeline(
    clauses: List[str], full_text: str
) -> Dict[str, Any]:
    """
    Execute the full 5-agent analysis pipeline.

    Parallel execution plan (mirrors the n8n workflow):
      Stream 1: clause → Risk Assessment → (if negotiable) Counter-Terms
      Stream 2: clause → Explanation
      Stream 3: full_text → Global Explanation
      Stream 4: full_text → Regulatory Compliance
    """

    print(f"[PIPELINE] Starting analysis of {len(clauses)} clauses")

    # ------------------------------------------------------------------
    # Phase 1: Run risk assessments + explanations + global + regulatory
    #          ALL in parallel
    # ------------------------------------------------------------------
    risk_tasks = [assess_risk(c, i) for i, c in enumerate(clauses)]
    explanation_tasks = [explain_clause(c, i) for i, c in enumerate(clauses)]
    global_task = analyze_global(full_text)
    regulatory_task = check_compliance(full_text)

    # Gather everything in one shot
    all_results = await asyncio.gather(
        asyncio.gather(*risk_tasks),
        asyncio.gather(*explanation_tasks),
        global_task,
        regulatory_task,
    )

    risk_results: List[Dict] = all_results[0]
    explanation_results: List[Dict] = all_results[1]
    global_exp: Dict = all_results[2]
    regulatory: Dict = all_results[3]

    print(f"[PIPELINE] Phase 1 complete — {len(risk_results)} risks, "
          f"{len(explanation_results)} explanations")

    # ------------------------------------------------------------------
    # Phase 2: Counter-Terms — only for negotiable clauses
    # ------------------------------------------------------------------
    counter_tasks = []
    counter_indices = []

    for risk in risk_results:
        idx = risk.get("clause_index", 0)
        if risk.get("negotiable", False):
            counter_tasks.append(generate_counter_term(risk.get("original", ""), idx))
            counter_indices.append(idx)

    if counter_tasks:
        counter_results_raw = await asyncio.gather(*counter_tasks)
    else:
        counter_results_raw = []

    # Build a lookup by clause_index
    counter_lookup: Dict[int, Dict] = {}
    for cr in counter_results_raw:
        counter_lookup[cr["clause_index"]] = cr

    print(f"[PIPELINE] Phase 2 complete — {len(counter_results_raw)} counter-terms generated")

    # ------------------------------------------------------------------
    # Phase 3: Build final report  (mirrors n8n "Build Final Report" node)
    # ------------------------------------------------------------------
    merged_clauses = []
    for i, risk in enumerate(risk_results):
        ci = risk.get("clause_index", i)
        exp = explanation_results[i] if i < len(explanation_results) else {}
        ctr = counter_lookup.get(ci)

        merged_clauses.append({
            "clause_index": ci,
            "original_text": risk.get("original", ""),
            "riskScore": risk.get("riskScore", 0),
            "riskLevel": risk.get("riskLevel", "Unknown"),
            "riskReason": risk.get("riskReason", ""),
            "negotiable": risk.get("negotiable", False),
            "counter": ctr["counter"] if ctr else None,
            "explanation": exp.get("plain"),
            "freelancerImpact": exp.get("freelancerImpact"),
        })

    # Overall score
    if merged_clauses:
        overall_score = round(
            sum(c["riskScore"] for c in merged_clauses) / len(merged_clauses)
        )
    else:
        overall_score = 0

    def _risk_level(score: int) -> str:
        if score >= 75:
            return "Critical"
        if score >= 50:
            return "High"
        if score >= 25:
            return "Medium"
        return "Low"

    def _count_by(level: str) -> int:
        return sum(
            1
            for c in merged_clauses
            if (c.get("riskLevel") or "").lower() == level.lower()
        )

    report = {
        "overallScore": overall_score,
        "riskLevel": _risk_level(overall_score),
        "clauses": merged_clauses,
        "agentOutputs": {
            "risk": {
                "critical": _count_by("Critical"),
                "high": _count_by("High"),
                "medium": _count_by("Medium"),
                "low": _count_by("Low") + _count_by("Unknown"),
            },
            "explanation": {
                "summary": global_exp.get("plain", "Summary not available."),
                "readabilityScore": global_exp.get("readabilityScore", 0),
                "grade": global_exp.get("grade", "N/A"),
            },
            "negotiation": {
                "counterTermsGenerated": sum(
                    1 for c in merged_clauses if c["counter"] is not None
                ),
                "strategy": (
                    "Review and revise clauses to ensure compliance with "
                    "Indian Contract Act 1872, IT Act 2000, and IP laws."
                ),
            },
            "compliance": {
                "status": regulatory.get("status", "Unknown"),
                "issues": (
                    regulatory.get("issues")
                    if isinstance(regulatory.get("issues"), list)
                    else []
                ),
            },
        },
    }

    print(f"[PIPELINE] Final report built — overall score: {overall_score}")
    return report


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------

@app.post("/analyze")
async def analyze_contract(file: UploadFile = File(...)):
    """Accept a PDF upload, extract clauses, run AI analysis, return report."""

    print(f"[DEBUG] Received file: {file.filename}")

    # --- Validate file ---
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded.")

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are accepted. Please upload a .pdf file.",
        )

    # --- Validate API keys ---
    missing_keys = []
    for name, val in [
        ("OPENROUTER_API_KEY_RISK", API_KEY_RISK),
        ("OPENROUTER_API_KEY_EXPLAIN", API_KEY_EXPLAIN),
        ("OPENROUTER_API_KEY_COUNTER", API_KEY_COUNTER),
        ("OPENROUTER_API_KEY_GLOBAL", API_KEY_GLOBAL),
        ("OPENROUTER_API_KEY_COMPLIANCE", API_KEY_COMPLIANCE),
    ]:
        if not val:
            missing_keys.append(name)
    if missing_keys:
        raise HTTPException(
            status_code=500,
            detail=f"Missing OpenRouter API keys: {', '.join(missing_keys)}. Set them in .env",
        )

    # --- Read & parse PDF ---
    try:
        pdf_bytes = await file.read()
        print(f"[DEBUG] PDF read successfully, {len(pdf_bytes)} bytes")
        full_text = extract_text_from_pdf(pdf_bytes)
        print(f"[DEBUG] Extracted {len(full_text)} chars of text")
    except Exception as exc:
        print(f"[DEBUG] PDF parsing error: {exc}")
        raise HTTPException(
            status_code=400,
            detail=f"Failed to read or parse the PDF: {exc}",
        )

    clauses = split_into_clauses(full_text)
    print(f"[DEBUG] Split into {len(clauses)} clauses")

    if not clauses:
        raise HTTPException(
            status_code=400,
            detail="No clauses could be extracted from the PDF. The document may be empty or in an unsupported format.",
        )

    # --- Run analysis pipeline ---
    try:
        report = await run_analysis_pipeline(clauses, full_text)
    except Exception as exc:
        print(f"[DEBUG] Pipeline error: {exc}")
        raise HTTPException(
            status_code=500,
            detail=f"Analysis pipeline failed: {exc}",
        )

    return JSONResponse(content=report)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

@app.get("/")
async def root():
    return {"status": "ok", "service": "Karrar.ai Contract Analysis API", "version": "2.0.0"}
