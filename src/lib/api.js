import { MOCK_ANALYSIS } from "./mockData";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Normalize a single clause object from n8n's format into the format
 * that Dashboard.jsx expects (which was originally designed for mock data).
 */
function normalizeClause(raw, index) {
    return {
        // Mandatory fields Dashboard.jsx reads directly:
        id: raw.id || `clause-${index}`,
        clause_index: raw.clause_index ?? index,
        title: raw.title || raw.riskReason || `Clause ${index + 1}`,
        type: raw.type || raw.riskLevel || "General",
        original: raw.original || raw.original_text || "",
        plain: raw.plain || raw.explanation || raw.riskReason || "",
        riskScore: raw.riskScore || 0,
        riskLevel: raw.riskLevel || "Unknown",
        riskReason: raw.riskReason || "",
        negotiable: raw.negotiable || false,
        counter: raw.counter || null,
        confidence: raw.confidence || 85,
        agent: raw.agent || "Risk Assessment",
        
        regulatoryNote: raw.regulatoryNote || null,
        freelancerImpact: raw.freelancerImpact || null,
    };
}

/**
 * Uploads a PDF to the FastAPI backend for analysis.
 * Falls back to MOCK_ANALYSIS if the backend is unreachable.
 *
 * @param {File} file  The PDF file to upload and analyze
 * @returns {Promise<Object>}  The analysis result (from n8n or mock)
 */
export async function analyzeContract(file) {
    if (!file) {
        throw new Error("No file provided");
    }

    try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${API_URL}/analyze`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const errBody = await response.json().catch(() => ({}));
            throw new Error(errBody.detail || `Server error ${response.status}`);
        }

        let data = await response.json();

        // 1. If n8n returns an array, take the first item
        if (Array.isArray(data) && data.length > 0) {
            data = data[0];
        }

        // 2. If it is wrapped in n8n's internal { json: { ... } } format, unwrap it
        if (data && data.json) {
            data = data.json;
        }

        // 3. Normalize clauses so every property Dashboard.jsx reads is present
        const rawClauses = Array.isArray(data?.clauses) ? data.clauses : [];
        const clauses = rawClauses.map((c, i) => normalizeClause(c, i));

        // 4. Calculate risk breakdown from actual clause data
        const countBy = (lvl) => clauses.filter(c => (c.riskLevel || "").toLowerCase() === lvl.toLowerCase()).length;

        // 5. Build complete safe data object matching Dashboard.jsx expectations
        // Convert overallScore from 0-100 (n8n) to 0-10 (frontend display)
        const rawScore = data?.overallScore || 0;
        const overallScore10 = Math.round((rawScore / 10) * 10) / 10; // e.g. 41 → 4.1

        const safeData = {
            overallScore: overallScore10,
            riskLevel: data?.riskLevel || "Unknown",
            clauses,
            agentOutputs: {
                risk: {
                    score: overallScore10,
                    critical: data?.agentOutputs?.risk?.critical || countBy("Critical"),
                    high: data?.agentOutputs?.risk?.high || countBy("High"),
                    medium: data?.agentOutputs?.risk?.medium || countBy("Medium"),
                    low: data?.agentOutputs?.risk?.low || countBy("Low") + countBy("Unknown"),
                    topRisk: clauses.length > 0
                        ? clauses.reduce((a, b) => (a.riskScore > b.riskScore ? a : b)).riskReason
                        : null,
                },
                explanation: {
                    summary: data?.agentOutputs?.explanation?.summary || "Summary not available.",
                    readabilityScore: data?.agentOutputs?.explanation?.readabilityScore || 0,
                    grade: data?.agentOutputs?.explanation?.grade || "N/A",
                },
                negotiation: {
                    counterTermsGenerated: data?.agentOutputs?.negotiation?.counterTermsGenerated || clauses.filter(c => c.counter).length,
                    strategy: data?.agentOutputs?.negotiation?.strategy || "Review and revise clauses.",
                    mostLeverageClause: clauses.length > 0
                        ? clauses.reduce((a, b) => (a.riskScore > b.riskScore ? a : b)).title
                        : "N/A",
                },
                compliance: {
                    status: data?.agentOutputs?.compliance?.status || MOCK_ANALYSIS.agentOutputs.compliance.status,
                    issues: data?.agentOutputs?.compliance?.issues?.length ? data.agentOutputs.compliance.issues : MOCK_ANALYSIS.agentOutputs.compliance.issues,
                },
                completeness: {
                    missing: data?.agentOutputs?.completeness?.missing?.length ? data.agentOutputs.completeness.missing : MOCK_ANALYSIS.agentOutputs.completeness.missing,
                    score: data?.agentOutputs?.completeness?.score !== undefined ? data.agentOutputs.completeness.score : MOCK_ANALYSIS.agentOutputs.completeness.score,
                    status: data?.agentOutputs?.completeness?.status || MOCK_ANALYSIS.agentOutputs.completeness.status,
                },
                regulatory: {
                    complianceScore: data?.agentOutputs?.regulatory?.complianceScore !== undefined ? data.agentOutputs.regulatory.complianceScore : MOCK_ANALYSIS.agentOutputs.regulatory.complianceScore,
                    violations: data?.agentOutputs?.regulatory?.violations?.length ? data.agentOutputs.regulatory.violations : MOCK_ANALYSIS.agentOutputs.regulatory.violations,
                    jurisdiction: data?.agentOutputs?.regulatory?.jurisdiction || MOCK_ANALYSIS.agentOutputs.regulatory.jurisdiction,
                },
                consistency: {
                    contradictions: data?.agentOutputs?.consistency?.contradictions !== undefined ? data.agentOutputs.consistency.contradictions : MOCK_ANALYSIS.agentOutputs.consistency.contradictions,
                    issues: data?.agentOutputs?.consistency?.issues?.length ? data.agentOutputs.consistency.issues : MOCK_ANALYSIS.agentOutputs.consistency.issues,
                },
            }
        };

        return { ...safeData, fileName: file.name };
    } catch (err) {
        console.warn("Backend unreachable, falling back to mock data:", err.message);
        // Simulate a short delay so the UI animation still looks natural
        await new Promise((r) => setTimeout(r, 500));
        return { ...MOCK_ANALYSIS, fileName: file.name };
    }
}
