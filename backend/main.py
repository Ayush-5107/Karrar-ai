import os
import re
from typing import List

import fitz  # PyMuPDF
import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

load_dotenv()

app = FastAPI(
    title="Karrar.ai — Contract Analysis API",
    description="Upload a legal contract PDF to extract clauses and analyze them via n8n.",
    version="1.0.0",
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
N8N_WEBHOOK_URL = os.getenv("N8N_WEBHOOK_URL", "")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Open a PDF from bytes and return all text concatenated."""
    text_parts: List[str] = []
    with fitz.open(stream=pdf_bytes, filetype="pdf") as doc:
        for page in doc:
            text_parts.append(page.get_text())
    return "\n".join(text_parts)


# Pattern matches numbered items  (1. / 2. / 1) / 2) etc.),
# "Clause N", "Section N", or double-newlines.
_CLAUSE_SPLIT_RE = re.compile(
    r"""
    (?:                        # Non-capturing group for alternatives
        (?:^|\n)               # start of string or newline
        \s*                    # optional whitespace
        (?:                    # numbered item variants
            \d+[\.\)]\s        # "1. " or "1) "
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
    # Strip whitespace and drop empty strings
    return [p.strip() for p in parts if p and p.strip()]


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------

@app.post("/analyze")
async def analyze_contract(file: UploadFile = File(...)):
    """Accept a PDF upload, extract clauses, forward to n8n, return response."""

    print(f"[DEBUG] Received file: {file.filename}")

    # --- Validate file ---
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded.")

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are accepted. Please upload a .pdf file.",
        )

    print(f"[DEBUG] N8N_WEBHOOK_URL = '{N8N_WEBHOOK_URL}'")
    if not N8N_WEBHOOK_URL:
        raise HTTPException(
            status_code=500,
            detail="N8N_WEBHOOK_URL environment variable is not configured.",
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

    # --- Build payload ---
    payload = {
        "filename": file.filename,
        "full_text": full_text,
        "clauses": clauses,
    }

    # --- Forward to n8n ---
    try:
        print(f"[DEBUG] Sending to n8n: {N8N_WEBHOOK_URL}")
        async with httpx.AsyncClient(timeout=300.0) as client:
            response = await client.post(N8N_WEBHOOK_URL, json=payload)
            print(f"[DEBUG] n8n response status: {response.status_code}")
            response.raise_for_status()
    except httpx.HTTPStatusError as exc:
        print(f"[DEBUG] n8n HTTP error: {exc.response.status_code} - {exc.response.text}")
        raise HTTPException(
            status_code=500,
            detail=f"n8n returned an error (HTTP {exc.response.status_code}): {exc.response.text}",
        )
    except httpx.RequestError as exc:
        print(f"[DEBUG] n8n request error: {exc}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to reach n8n webhook: {exc}",
        )

    # --- Return n8n's response ---
    try:
        n8n_json = response.json()
        print(f"[DEBUG] n8n JSON keys: {list(n8n_json.keys()) if isinstance(n8n_json, dict) else 'not a dict'}")
    except Exception:
        n8n_json = {"raw": response.text}
        print(f"[DEBUG] n8n response was not JSON, raw text: {response.text[:200]}")

    return JSONResponse(content=n8n_json)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

@app.get("/")
async def root():
    return {"status": "ok", "service": "Karrar.ai Contract Analysis API"}
