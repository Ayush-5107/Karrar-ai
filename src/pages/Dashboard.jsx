/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Store } from "../lib/store";
import { MOCK_ANALYSIS } from "../lib/mockData";
import { analyzeContract } from "../lib/api";
import { KarrarLogo } from "../components/ui/logo";
import { DisclaimerModal } from "../components/modals/DisclaimerModal";
import { LawyerWarningModal } from "../components/modals/LawyerWarningModal";

function AnimatedNumber({ value, duration = 1200, decimals = 0 }) {
    const [current, setCurrent] = useState(0);
    useEffect(() => {
        let start = null;
        let reqId;
        const endValue = Number(value) || 0;
        const easeOut = t => 1 - Math.pow(1 - t, 4);
        const step = (ts) => {
            if (!start) start = ts;
            const prog = Math.min((ts - start) / duration, 1);
            const rawVal = endValue * easeOut(prog);
            setCurrent(decimals > 0 ? parseFloat(rawVal.toFixed(decimals)) : Math.round(rawVal));
            if (prog < 1) reqId = requestAnimationFrame(step);
            else setCurrent(decimals > 0 ? parseFloat(endValue.toFixed(decimals)) : Math.round(endValue));
        };
        reqId = requestAnimationFrame(step);
        return () => cancelAnimationFrame(reqId);
    }, [value, duration, decimals]);
    return <>{current}</>;
}

function AnimatedDonut({ lowPct, medPct, highPct, critPct, domLabel, domSub }) {
    const [anim, setAnim] = useState({ low: 0, med: 0, high: 0, crit: 0 });
    useEffect(() => {
        const t = setTimeout(() => setAnim({ low: lowPct, med: medPct, high: highPct, crit: critPct }), 50);
        return () => clearTimeout(t);
    }, [lowPct, medPct, highPct, critPct]);

    const R = 42, strokeW = 11;
    const CIRC = 2 * Math.PI * R;
    const lowD = (anim.low / 100) * CIRC;
    const medD = (anim.med / 100) * CIRC;
    const highD = (anim.high / 100) * CIRC;
    const critD = (anim.crit / 100) * CIRC;
    const startOff = CIRC * 0.25;
    const medOff = startOff - lowD;
    const highOff = medOff - medD;
    const critOff = highOff - highD;

    return (
        <div style={{ position: "relative", width: 104, height: 104 }}>
            <svg width="104" height="104" viewBox="0 0 104 104">
                <circle cx="52" cy="52" r={R} fill="none" stroke="#131518" strokeWidth={strokeW} />
                <circle cx="52" cy="52" r={R} fill="none" stroke="#22c55e" strokeWidth={strokeW}
                    strokeDasharray={`${lowD} ${CIRC - lowD}`} strokeDashoffset={startOff} strokeLinecap="butt"
                    style={{ transition: "stroke-dasharray 1s cubic-bezier(0.16, 1, 0.3, 1)" }} />
                <circle cx="52" cy="52" r={R} fill="none" stroke="#f59e0b" strokeWidth={strokeW}
                    strokeDasharray={`${medD} ${CIRC - medD}`} strokeDashoffset={medOff} strokeLinecap="butt"
                    style={{ transition: "stroke-dasharray 1s cubic-bezier(0.16, 1, 0.3, 1)" }} />
                <circle cx="52" cy="52" r={R} fill="none" stroke="#ef4444" strokeWidth={strokeW}
                    strokeDasharray={`${highD} ${CIRC - highD}`} strokeDashoffset={highOff} strokeLinecap="butt"
                    style={{ transition: "stroke-dasharray 1s cubic-bezier(0.16, 1, 0.3, 1)" }} />
                <circle cx="52" cy="52" r={R} fill="none" stroke="#dc2626" strokeWidth={strokeW}
                    strokeDasharray={`${critD} ${CIRC - critD}`} strokeDashoffset={critOff} strokeLinecap="butt"
                    style={{ transition: "stroke-dasharray 1s cubic-bezier(0.16, 1, 0.3, 1)" }} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: "Playfair Display,serif", fontSize: 19, fontWeight: 700, color: "#FFF", lineHeight: 1 }}>
                    <AnimatedNumber value={parseFloat(domLabel)} />%
                </span>
                <span style={{ fontSize: 8, color: "#444", marginTop: 2, fontFamily: "IBM Plex Mono,monospace" }}>{domSub}</span>
            </div>
        </div>
    );
}

function AnimatedProgressBar({ score, color }) {
    const [w, setW] = useState(0);
    useEffect(() => {
        const t = setTimeout(() => setW(score), 50);
        return () => clearTimeout(t);
    }, [score]);
    return (
        <div style={{ width: `${w}%`, height: "100%", background: color, borderRadius: 2, transition: "width 1s cubic-bezier(0.16, 1, 0.3, 1)" }} />
    );
}

export function Dashboard({ user, onLogout }) {
    // ── Core state
    const [activeNav, setActiveNav] = useState("Home");
    const [uploadPhase, setUploadPhase] = useState("idle");
    const [analysisStep, setAnalysisStep] = useState(0);
    const [analysisPct, setAnalysisPct] = useState(0);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [relatedDocs, setRelatedDocs] = useState([]);
    const [analysis, setAnalysis] = useState(null);
    const [notifOpen, setNotifOpen] = useState(false);
    const [activeClause, setActiveClause] = useState(null);
    const [reportTab, setReportTab] = useState("risks");
    const [filterRisk, setFilterRisk] = useState("All");
    const [copiedId, setCopiedId] = useState(null);
    const [userDecision, setUserDecision] = useState(null);
    const [journeyDone, setJourneyDone] = useState(false);
    const [planDropdownOpen, setPlanDropdownOpen] = useState(false);

    // ── New feature state
    const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
    const [showDisclaimer, setShowDisclaimer] = useState(false);
    const [showLawyerWarn, setShowLawyerWarn] = useState(false);
    const [contractHistory, setContractHistory] = useState([]);
    const [analysesUsed, setAnalysesUsed] = useState(0);
    const [aiLoading, setAiLoading] = useState(false);
    const [uploadedMissing, setUploadedMissing] = useState({});
    const [revisedFile, setRevisedFile] = useState(null);
    const [revisedAnalysis, setRevisedAnalysis] = useState(null);
    const [diffView, setDiffView] = useState(false);
    const [viewingContract, setViewingContract] = useState(null);
    const [expandedAgent, setExpandedAgent] = useState(null);

    const fileRef = useRef(null);
    const relatedRef = useRef(null);
    const revisedRef = useRef(null);
    const missingRefs = useRef({});

    // ── Resizable panel state (hoisted from IIFE) ──
    const [sideW, setSideW] = useState(188);
    const [rightW, setRightW] = useState(228);
    const [collapsed, setCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth <= 768);
    const COLLAPSED_W = 52;
    const EXPANDED_W = sideW;
    const currentSideW = collapsed ? COLLAPSED_W : EXPANDED_W;

    // ── Auto-collapse sidebar on mobile ──
    useEffect(() => {
        const check = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            if (mobile) setCollapsed(true);
        };
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    const startDrag = (which) => (e) => {
        if (collapsed && which === "side") return;
        e.preventDefault();
        const startX = e.clientX;
        const startSide = sideW;
        const startRight = rightW;
        const onMove = (ev) => {
            const dx = ev.clientX - startX;
            if (which === "side") setSideW(Math.max(150, Math.min(300, startSide + dx)));
            else setRightW(Math.max(140, Math.min(420, startRight - dx)));
        };
        const onUp = () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); document.body.style.cursor = ""; };
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
        document.body.style.cursor = "col-resize";
    };

    // ── No persistent data — everything resets on page refresh
    useEffect(() => {}, []);

    const AGENTS = [
        { id: "completeness", name: "Completeness Agent", color: "#3b82f6", icon: <svg width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>, desc: "Checks for missing schedules, annexures & referenced docs" },
        { id: "risk", name: "Risk Scoring Agent", color: "#ef4444", icon: <svg width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>, desc: "Scores every clause 0–100, flags financial exposure in ₹" },
        { id: "negotiation", name: "Negotiation Agent", color: "#C49E6C", icon: <svg width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg>, desc: "Generates ready-to-send counter-terms for high-risk clauses" },
        { id: "consistency", name: "Consistency Agent", color: "#8b5cf6", icon: <svg width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>, desc: "Finds internal contradictions across the full document" },
        { id: "regulatory", name: "Regulatory Agent", color: "#22c55e", icon: <svg width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" /></svg>, desc: "Cross-references Indian Contract Act & DPDP Act 2023" },
        { id: "explanation", name: "Explanation Agent", color: "#f59e0b", icon: <svg width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21h6M12 17v4M12.04 4.09l-1.09-1.09a3.88 3.88 0 00-5.48 0L4.08 4.39a3.88 3.88 0 000 5.48l1.09 1.09M20 12l-2 2-2-2m2 2V4" /></svg>, desc: "Translates dense legalese into plain Hindi/English" },
    ];

    const STEPS = [
        { label: "Parsing PDF & splitting clauses…", agent: "", pct: 9 },
        { label: "Completeness Agent — checking documents…", agent: "completeness", pct: 22 },
        { label: "Risk Scoring Agent — analyzing clauses…", agent: "risk", pct: 38 },
        { label: "Negotiation Agent — generating counters…", agent: "negotiation", pct: 54 },
        { label: "Consistency Agent — cross-checking…", agent: "consistency", pct: 68 },
        { label: "Regulatory Agent — Indian law check…", agent: "regulatory", pct: 83 },
        { label: "Explanation Agent — plain language…", agent: "explanation", pct: 95 },
        { label: "Synthesizing final report…", agent: "", pct: 100 },
    ];

    const rc = (r) => r === "Critical" || r === "High" ? "#ef4444" : r === "Medium" || r === "Med" ? "#f59e0b" : "#22c55e";
    const rb = (r) => r === "Critical" || r === "High" ? "rgba(239,68,68,0.09)" : r === "Medium" || r === "Med" ? "rgba(245,158,11,0.09)" : "rgba(34,197,94,0.09)";

    // ── AI Analysis via FastAPI backend (falls back to mock)
    const runAIAnalysis = async (file) => {
        setAiLoading(true);
        try {
            return await analyzeContract(file);
        } catch (err) {
            console.error("Analysis failed, using mock:", err);
            return { ...MOCK_ANALYSIS, fileName: file.name };
        } finally {
            setAiLoading(false);
        }
    };

    const saveToHistory = async (result) => {
        const entry = {
            id: Date.now(),
            fileName: result.fileName,
            uploadDate: new Date().toLocaleDateString("en-IN"),
            overallScore: result.overallScore,
            riskLevel: result.riskLevel,
            clauseCount: result.clauses.length,
            analysis: result,
        };
        const newHistory = [entry, ...contractHistory];
        setContractHistory(newHistory);
        // No persistence — data resets on refresh

        // Increment usage counter
        const month = new Date().toISOString().slice(0, 7);
        const newUsed = analysesUsed + 1;
        setAnalysesUsed(newUsed);
        // No persistence — usage resets on refresh
    };

    const startAnalysis = async (file) => {
        setUploadedFile(file);
        setUploadPhase("analyzing");
        setAnalysisStep(0); setAnalysisPct(0);
        setRevisedAnalysis(null); setDiffView(false); setJourneyDone(false); setUserDecision(null);

        // Animate steps while AI runs in background
        let i = 0;
        const tick = () => {
            if (i < STEPS.length) {
                setAnalysisStep(i); setAnalysisPct(STEPS[i].pct); i++;
                setTimeout(tick, 850);
            }
        };
        tick();

        const result = await runAIAnalysis(file);
        // Wait for animation to nearly finish
        setTimeout(async () => {
            setAnalysisStep(STEPS.length - 1); setAnalysisPct(100);
            await saveToHistory(result);
            setTimeout(() => { setAnalysis(result); setUploadPhase("awaiting_docs"); }, 600);
        }, Math.max(0, STEPS.length * 850 - 500));
    };

    const handleFile = (e) => {
        e.preventDefault();
        const file = e.dataTransfer?.files[0] || e.target?.files?.[0];
        if (file) startAnalysis(file);
    };

    const copy = (text, id) => {
        navigator.clipboard?.writeText(text).catch(() => { });
        setCopiedId(id); setTimeout(() => setCopiedId(null), 2000);
    };

    const openReport = async () => {
        const month = new Date().toISOString().slice(0, 7);
        if (!disclaimerAccepted) { setShowDisclaimer(true); return; }
        // Show lawyer warning if high risk
        if (analysis && analysis.overallScore >= 7.5) { setShowLawyerWarn(true); return; }
        setActiveNav("Reports");
    };

    const handleDisclaimerAccept = async (dontShow) => {
        setDisclaimerAccepted(true);
        setShowDisclaimer(false);
        if (analysis && analysis.overallScore >= 7.5) { setShowLawyerWarn(true); return; }
        setActiveNav("Reports");
    };

    const exportPDF = () => {
        if (!analysis) return;
        const lines = [];
        lines.push("KARRAR.AI — CONTRACT INTELLIGENCE REPORT");
        lines.push(`Generated: ${new Date().toLocaleDateString("en-IN")}`);
        lines.push(`Contract: ${analysis.fileName}`);
        lines.push(`Overall Risk Score: ${analysis.overallScore}/10 — ${analysis.riskLevel}`);
        lines.push(`Compliance Score: ${analysis.agentOutputs?.regulatory?.complianceScore || 0}%`);
        lines.push("");
        lines.push("AI SUMMARY");
        lines.push(analysis.agentOutputs?.explanation?.summary || "Summary not available.");
        lines.push("");
        lines.push("CLAUSE ANALYSIS");
        (analysis.clauses || []).forEach((c, i) => {
            lines.push(`${i + 1}. ${c.title || c.original_text || 'Clause ' + (i + 1)}`);
            lines.push(`   Risk: ${c.riskScore || 0}/100 (${c.riskLevel || 'Unknown'}) | Negotiable: ${c.negotiable ? 'Yes' : 'No'}`);
            lines.push(`   Original: ${c.original || c.original_text || 'N/A'}`);
            if (c.plain || c.explanation) lines.push(`   Plain English: ${c.plain || c.explanation}`);
            if (c.counter) lines.push(`   Counter-Term: ${c.counter}`);
            if (c.financialExposure) lines.push(`   Financial Exposure: ${c.financialExposure}`);
            if (c.regulatoryNote) lines.push(`   Regulatory: ${c.regulatoryNote}`);
            lines.push("");
        });
        lines.push("REGULATORY VIOLATIONS");
        (analysis.agentOutputs?.regulatory?.violations || []).forEach(v => lines.push(`• ${v}`));
        lines.push("");
        lines.push("CONSISTENCY ISSUES");
        (analysis.agentOutputs?.consistency?.issues || []).forEach(i => lines.push(`• ${i}`));
        lines.push("");
        lines.push("DISCLAIMER");
        lines.push("This is AI-generated legal intelligence, not legal advice. Karrar.ai is not a law firm.");
        lines.push("Verify all critical findings with a licensed Indian advocate.");

        const text = lines.join("\n");
        const blob = new Blob([text], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `Karrar-Report-${analysis.fileName.replace(/\.[^.]+$/, "")}-${new Date().toISOString().slice(0, 10)}.txt`;
        a.click(); URL.revokeObjectURL(url);
    };

    const runRevisedAnalysis = async (file) => {
        setRevisedFile(file);
        setDiffView(false);
        const result = await runAIAnalysis(file);
        result.fileName = file.name;
        setRevisedAnalysis(result);
        setDiffView(true);
    };

    const getDiff = () => {
        if (!analysis || !revisedAnalysis) return { improved: [], worsened: [], unchanged: [] };
        const improved = [], worsened = [], unchanged = [];
        analysis.clauses.forEach(orig => {
            const rev = revisedAnalysis.clauses.find(c => c.title === orig.title) || revisedAnalysis.clauses.find(c => c.type === orig.type);
            if (!rev) { worsened.push({ ...orig, note: "Clause removed — may indicate new risk" }); return; }
            if (rev.riskScore < orig.riskScore - 10) improved.push({ orig, rev });
            else if (rev.riskScore > orig.riskScore + 10) worsened.push({ ...rev, origScore: orig.riskScore });
            else if (orig.riskLevel === "Critical" || orig.riskLevel === "High") unchanged.push(orig);
        });
        return { improved, worsened, unchanged };
    };

    const filtered = analysis ? analysis.clauses.filter(c =>
        filterRisk === "All" || c.riskLevel === filterRisk || (filterRisk === "High" && c.riskLevel === "Critical")
    ) : [];

    const NAV = [
        { k: "Home", ic: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> },
        { k: "Contracts", ic: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>, badge: contractHistory.length || null },

        { k: "Reports", ic: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg> },
    ];

    return (
        <div style={{ fontFamily: "DM Sans,sans-serif", background: "#000000", color: "#FFF", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-track{background:#070809;} ::-webkit-scrollbar-thumb{background:#1E2228;border-radius:2px;}
        .snav{display:flex;align-items:center;gap:9px;padding:9px 14px;border-radius:9px;cursor:pointer;font-size:13px;color:#555;transition:all 0.16s;border-left:2px solid transparent;user-select:none;}
        .snav:hover{color:#CCC;background:rgba(255,255,255,0.025);}
        .snav.on{color:#FFF;background:rgba(196,158,108,0.1);border-left-color:#C49E6C;}
        .cr{padding:13px 15px;border-radius:11px;cursor:pointer;transition:all 0.17s;border:1px solid #131518;background:#0A0B0E;}
        .cr:hover{border-color:#252830;background:#0D0F13;}
        .cr.sel{border-color:rgba(196,158,108,0.3);background:rgba(196,158,108,0.035);}
        .tbtn{padding:6px 14px;border-radius:8px;border:none;cursor:pointer;font-size:12px;font-family:'DM Sans',sans-serif;font-weight:500;transition:all 0.17s;}
        .tbtn.on{background:rgba(196,158,108,0.14);color:#C49E6C;border:1px solid rgba(196,158,108,0.28);}
        .tbtn.off{background:transparent;color:#444;border:1px solid transparent;}
        .tbtn.off:hover{color:#999;background:rgba(255,255,255,0.025);}
        .gbtn{background:linear-gradient(135deg,#C49E6C,#F5D08A);color:#000;border:none;border-radius:9px;padding:10px 20px;font-size:13px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.2s;}
        .gbtn:hover{box-shadow:0 0 28px rgba(196,158,108,0.4);transform:translateY(-1px);}
        .qbtn{background:transparent;border:1px solid #1E2228;border-radius:9px;padding:9px 16px;font-size:12px;color:#777;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.17s;}
        .qbtn:hover{border-color:#333;color:#CCC;}
        .cpbtn{background:rgba(196,158,108,0.07);border:1px solid rgba(196,158,108,0.18);border-radius:6px;padding:4px 10px;font-size:11px;color:#C49E6C;cursor:pointer;font-family:'IBM Plex Mono',monospace;transition:all 0.17s;white-space:nowrap;}
        .cpbtn:hover{background:rgba(196,158,108,0.14);}
        .pll{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:20px;font-size:10px;font-family:'IBM Plex Mono',monospace;letter-spacing:0.03em;white-space:nowrap;}
        .uzone{border:2px dashed #1A1D22;border-radius:16px;padding:44px 32px;text-align:center;cursor:pointer;transition:all 0.24s;background:rgba(196,158,108,0.008);}
        .uzone:hover,.uzone.drag{border-color:rgba(196,158,108,0.45);background:rgba(196,158,108,0.025);}
        .acard{background:#0D0F13;border:1px solid #1A1D22;border-radius:12px;padding:16px;transition:all 0.2s;}
        .acard:hover{border-color:#252830;transform:translateY(-2px);}
        .stat{background:#0D0F13;border:1px solid #1A1D22;border-radius:13px;padding:18px;transition:all 0.2s;}
        .stat:hover{border-color:rgba(196,158,108,0.2);}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        .shimmer{background:linear-gradient(90deg,#131518 25%,#1E2228 50%,#131518 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        .locked-zone{position:relative;border-radius:16px;overflow:hidden;}
        .locked-overlay{position:absolute;inset:0;background:rgba(7,8,9,0.88);backdrop-filter:blur(4px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;border-radius:16px;border:2px dashed rgba(196,158,108,0.2);}

        /* ── DASHBOARD RESPONSIVE GRIDS ── */
        .dash-stats-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:20px; }
        .dash-agents-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        .dash-analysis-agents { display:grid; grid-template-columns:repeat(3,1fr); gap:9px; }

        /* ── DASHBOARD TOP NAV ── */
        .dash-topnav { display:none; gap:1px; flex:1; overflow-x:auto; -webkit-overflow-scrolling:touch; }
        .dash-topnav::-webkit-scrollbar { display:none; }
        .dash-spacer { flex: 1; }
        .dash-search-box { position:relative; }
        .dash-plan-btn, .dash-notif-btn, .dash-user-btn { flex-shrink: 0; }

        /* ── DASHBOARD MOBILE ── */
        @media (max-width: 768px) {
          .dash-sidebar { display:none !important; }
          .dash-drag-handle { display:none !important; }
          .dash-right-panel { display:none !important; }
          .dash-right-drag { display:none !important; }
          .dash-search-box { display:none !important; }
          .dash-plan-btn { display:none !important; }
          .dash-notif-btn { display:none !important; }
          .dash-user-btn span { display:none !important; }
          .dash-spacer { display:none !important; }

          .dash-topnav { display:flex !important; gap:0; flex:1; min-width:0; }
          .dash-topnav button { padding:4px 8px !important; font-size:12px !important; white-space:nowrap; }

          .dash-main { padding:16px 12px !important; }
          .dash-stats-grid { grid-template-columns:1fr 1fr; gap:10px; }
          .dash-agents-grid { grid-template-columns:1fr; gap:12px; }
          .dash-analysis-agents { grid-template-columns:1fr 1fr; gap:8px; }
          .dash-contracts-row { flex-direction:column !important; gap:8px !important; }
          .dash-contracts-row .qbtn { width:100%; }
        }
        @media (max-width: 480px) {
          .dash-stats-grid { grid-template-columns:1fr; gap:8px; }
          .dash-analysis-agents { grid-template-columns:1fr; }
        }
      `}</style>

            {/* ── MODALS ─────────────────────────────────────────────────── */}
            <AnimatePresence>
                {showDisclaimer && <DisclaimerModal onAccept={handleDisclaimerAccept} />}
                {showLawyerWarn && analysis && <LawyerWarningModal analysis={analysis} onContinue={() => { setShowLawyerWarn(false); setActiveNav("Reports"); }} onLawyer={() => { setShowLawyerWarn(false); setActiveNav("Reports"); setReportTab("decision"); setUserDecision("lawyer"); }} />}
            </AnimatePresence>

            {/* ── TOPNAV ─────────────────────────────────────────────────── */}
            <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(7,8,9,0.97)", backdropFilter: "blur(20px)", borderBottom: "1px solid #0F1115", padding: "0 12px", height: 56, display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <KarrarLogo size={26} wordmark={!isMobile} />
                <div className="dash-topnav">
                    {NAV.map(({ k, ic, badge }) => (
                        <button key={k} onClick={() => setActiveNav(k)} style={{ background: "none", border: "none", color: activeNav === k ? "#C49E6C" : "#555", fontSize: 13, fontWeight: activeNav === k ? 600 : 400, padding: "4px 12px", cursor: "pointer", borderBottom: activeNav === k ? "2px solid #C49E6C" : "2px solid transparent", transition: "all 0.17s", fontFamily: "DM Sans,sans-serif", display: "flex", alignItems: "center", gap: 6, height: 56, position: "relative", whiteSpace: "nowrap", flexShrink: 0 }}>
                            <span style={{ opacity: activeNav === k ? 1 : 0.4 }}>{ic}</span>{k}
                            {badge && <span style={{ background: "#C49E6C", color: "#000", borderRadius: "50%", width: 16, height: 16, fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{badge}</span>}
                        </button>
                    ))}
                </div>
                <div className="dash-spacer" />
                <div className="dash-search-box">
                    <svg style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)" }} width="12" height="12" fill="none" stroke="#333" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    <input placeholder="Search contracts…" style={{ background: "#0A0B0E", border: "1px solid #1A1D22", borderRadius: 8, padding: "6px 12px 6px 28px", color: "#AAA", fontSize: 13, fontFamily: "DM Sans,sans-serif", outline: "none", width: 180, transition: "border-color 0.2s" }} onFocus={e => e.target.style.borderColor = "#C49E6C"} onBlur={e => e.target.style.borderColor = "#1A1D22"} />
                </div>

                <div className="dash-notif-btn" style={{ position: "relative" }}>
                    <button onClick={() => setNotifOpen(!notifOpen)} style={{ background: "none", border: "none", cursor: "pointer", color: notifOpen ? "#C49E6C" : "#444", padding: 5, position: "relative", transition: "color 0.17s" }}>
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>
                        <span style={{ position: "absolute", top: 1, right: 1, width: 12, height: 12, background: "#ef4444", borderRadius: "50%", fontSize: 7, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700 }}>3</span>
                    </button>
                    <AnimatePresence>
                        {notifOpen && (
                            <motion.div initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8 }} style={{ position: "absolute", right: 0, top: 38, width: 268, background: "#0D0F13", border: "1px solid #1A1D22", borderRadius: 12, padding: 14, zIndex: 300 }}>
                                <div style={{ fontSize: 10, color: "#C49E6C", fontFamily: "IBM Plex Mono,monospace", letterSpacing: "0.1em", marginBottom: 10 }}>NOTIFICATIONS</div>
                                {[{ t: "MSA_Company_X: 1 critical risk detected", s: "13m ago", d: "#ef4444" }, { t: "New contract uploaded", s: "1h ago", d: "#f59e0b" }, { t: "Freelancer NDA analysis ready", s: "1h ago", d: "#22c55e" }].map((n, i) => (
                                    <div key={i} style={{ display: "flex", gap: 9, padding: "8px 0", borderBottom: i < 2 ? "1px solid #0F1115" : "none" }}>
                                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: n.d, marginTop: 5, flexShrink: 0 }} />
                                        <div><div style={{ fontSize: 12, color: "#CCC" }}>{n.t}</div><div style={{ fontSize: 10, color: "#333", marginTop: 1 }}>{n.s}</div></div>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <div className="dash-user-btn" style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", flexShrink: 0 }} onClick={onLogout} title="Click to logout">
                    <div style={{ width: 29, height: 29, borderRadius: "50%", background: "linear-gradient(135deg,#C49E6C,#F5D08A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#000" }}>{user.initials}</div>
                    <span style={{ fontSize: 12, color: "#BBB", fontWeight: 500 }}>{user.name}</span>
                </div>
            </nav>

            {/* ── RESIZABLE LAYOUT WRAPPER ──────────────────────────────── */}
            <div style={{ display: "flex", flex: 1, overflow: "hidden", height: "calc(100vh - 56px)", userSelect: "none" }}>

                {/* ── SIDEBAR ─────────────────────────────────────────────── */}
                <aside className="dash-sidebar" style={{ width: currentSideW, minWidth: collapsed ? COLLAPSED_W : 150, maxWidth: collapsed ? COLLAPSED_W : 300, background: "#060708", borderRight: "none", display: "flex", flexDirection: "column", flexShrink: 0, overflowY: "auto", overflowX: "hidden", position: "relative", transition: "width 0.22s cubic-bezier(0.4,0,0.2,1)" }}>

                    {/* Collapse toggle button */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-end", padding: collapsed ? "10px 0" : "10px 10px 4px", flexShrink: 0 }}>
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setCollapsed(!collapsed)}
                            style={{ background: "rgba(196,158,108,0.08)", border: "1px solid rgba(196,158,108,0.18)", borderRadius: 7, width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#C49E6C", flexShrink: 0 }}
                            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
                            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                {collapsed
                                    ? <polyline points="9 18 15 12 9 6" />
                                    : <polyline points="15 18 9 12 15 6" />
                                }
                            </svg>
                        </motion.button>
                    </div>

                    {/* NAV ITEMS — icon-only when collapsed, full when expanded */}
                    <div style={{ padding: collapsed ? "8px 0" : "4px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
                        {NAV.map(({ k, ic, badge, locked }) => (
                            collapsed ? (
                                /* Collapsed: icon-only pill with tooltip */
                                <div key={k} title={locked ? `${k} — Coming Soon` : k} onClick={() => { if (!locked) setActiveNav(k); }}
                                    style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "relative", width: 36, height: 36, borderRadius: 9, margin: "1px auto", cursor: locked ? "not-allowed" : "pointer", background: activeNav === k && !locked ? "rgba(196,158,108,0.12)" : "transparent", border: activeNav === k && !locked ? "1px solid rgba(196,158,108,0.25)" : "1px solid transparent", transition: "all 0.17s", color: locked ? "#222" : (activeNav === k ? "#C49E6C" : "#444"), opacity: locked ? 0.45 : 1 }}
                                    onMouseEnter={e => { if (activeNav !== k && !locked) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "#AAA"; } }}
                                    onMouseLeave={e => { if (activeNav !== k && !locked) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#444"; } }}>
                                    <span style={{ opacity: activeNav === k && !locked ? 1 : 0.6, fontSize: 0, display: "flex" }}>{ic}</span>
                                    {badge && !locked && <span style={{ position: "absolute", top: 3, right: 3, width: 8, height: 8, background: "#C49E6C", borderRadius: "50%", fontSize: 0 }} />}
                                </div>
                            ) : (
                                <div key={k} className={`snav${activeNav === k && !locked ? " on" : ""}`} onClick={() => { if (!locked) setActiveNav(k); }} style={locked ? { opacity: 0.45, cursor: "not-allowed" } : {}}>
                                    <span style={{ opacity: activeNav === k && !locked ? 1 : 0.35 }}>{ic}</span>{k}
                                    {locked && <LockIcon size={10} />}
                                    {badge && !locked && <span style={{ marginLeft: "auto", background: "rgba(196,158,108,0.15)", color: "#C49E6C", borderRadius: 10, padding: "0 6px", fontSize: 10, fontFamily: "IBM Plex Mono,monospace" }}>{badge}</span>}
                                </div>
                            )
                        ))}
                    </div>

                    <div style={{ height: 1, background: "#0F1115", margin: collapsed ? "12px 8px" : "12px 0" }} />

                    {/* Expanded content */}
                    {!collapsed && (
                        <div style={{ padding: "0 10px", flex: 1 }}>
                            <div style={{ fontSize: 9, color: "#222", fontFamily: "IBM Plex Mono,monospace", letterSpacing: "0.12em", paddingLeft: 4, marginBottom: 7 }}>FAVORITES</div>
                            {["NDA_Startup.d…", "Rental Agreement", "SBA_India_Comp…"].map((f, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 10px", cursor: "pointer", fontSize: 12, color: "#333", borderRadius: 7, transition: "color 0.17s" }} onMouseEnter={e => e.currentTarget.style.color = "#AAA"} onMouseLeave={e => e.currentTarget.style.color = "#333"}>
                                    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /></svg>{f}
                                </div>
                            ))}

                        </div>
                    )}

                    {/* Collapsed: icon-only favorites & entities */}
                    {collapsed && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center", padding: "4px 0" }}>
                            {/* Favorites icon */}
                            <div title="Favorites" style={{ width: 36, height: 36, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#333" }}
                                onMouseEnter={e => e.currentTarget.style.color = "#888"} onMouseLeave={e => e.currentTarget.style.color = "#333"}>
                                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                            </div>

                        </div>
                    )}
                </aside>

                {/* ── LEFT DRAG HANDLE (hidden when collapsed) ── */}
                {!collapsed && (
                    <div className="dash-drag-handle" onMouseDown={startDrag("side")} style={{ width: 4, background: "#0F1115", cursor: "col-resize", flexShrink: 0, position: "relative", transition: "background 0.15s", zIndex: 10 }}
                        onMouseEnter={e => e.currentTarget.style.background = "#C49E6C44"}
                        onMouseLeave={e => e.currentTarget.style.background = "#0F1115"}>
                        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", display: "flex", flexDirection: "column", gap: 3 }}>
                            {[0, 1, 2].map(i => <div key={i} style={{ width: 2, height: 2, borderRadius: "50%", background: "#2A2D35" }} />)}
                        </div>
                    </div>
                )}
                {collapsed && <div className="dash-drag-handle" style={{ width: 1, background: "#0F1115", flexShrink: 0 }} />}

                {/* ── MAIN ────────────────────────────────────────────────── */}
                <main className="dash-main" style={{ flex: 1, overflowY: "auto", padding: "24px 26px", minWidth: 0 }}>
                    <AnimatePresence mode="wait">

                        {/* ═══ HOME ══════════════════════════════════════════════ */}
                        {activeNav === "Home" && (
                            <motion.div key="home" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.38 }}>
                                <div style={{ marginBottom: 24 }}>
                                    <h1 style={{ fontFamily: "Playfair Display,serif", fontSize: 31, fontWeight: 700, marginBottom: 4 }}>{(user?.name || "User").split(" ")[0]}'s Karrarnamas</h1>
                                    <p style={{ fontSize: 14, color: "#444" }}>Audit, analyze, and negotiate your contracts — powered by 6 AI agents grounded in Indian law.</p>
                                </div>
                                <div className="dash-stats-grid">
                                    {[
                                        { v: <AnimatedNumber value={contractHistory.length || 0} />, l: "Total Analyzed", c: "#C49E6C", icon: <svg width="18" height="18" fill="none" stroke="#C49E6C" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg> },
                                        { v: <AnimatedNumber value={contractHistory.filter(c => c.riskLevel === "High" || c.riskLevel === "Critical").length || 0} />, l: "High Risk Contracts", c: "#ef4444", icon: <svg width="18" height="18" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg> },
                                        { v: <AnimatedNumber value={contractHistory.length > 0 ? contractHistory.length * 24 + 112 : 0} />, l: "AI Insights Generated", c: "#22c55e", icon: <svg width="18" height="18" fill="none" stroke="#22c55e" strokeWidth="2" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg> },
                                    ].map(({ v, l, c, icon }, i) => (
                                        <motion.div key={i} className="stat" whileHover={{ scale: 1.02 }}>
                                            <div style={{ width: 35, height: 35, borderRadius: 10, background: `${c}12`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 11 }}>{icon}</div>
                                            <div style={{ fontSize: 29, fontWeight: 700, color: c, fontFamily: "Playfair Display,serif", letterSpacing: "-0.02em" }}>{v}</div>
                                            <div style={{ fontSize: 12, color: "#333", marginTop: 4 }}>{l}</div>
                                        </motion.div>
                                    ))}
                                </div>

                                {analysis && (
                                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.16)", borderRadius: 11, padding: "12px 17px", marginBottom: 18, display: "flex", alignItems: "center", gap: 12 }}>
                                        <svg width="17" height="17" fill="none" stroke="#f59e0b" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                                        <div style={{ flex: 1, fontSize: 14 }}><span style={{ color: "#f59e0b", fontWeight: 600 }}>Alert: </span><span style={{ color: "#F5D08A", fontWeight: 600 }}>{analysis.fileName} </span><span style={{ color: "#666" }}>has {analysis.agentOutputs.risk.critical} critical &amp; {analysis.agentOutputs.risk.high} high-risk clauses</span></div>
                                        <button className="qbtn" style={{ fontSize: 12, padding: "5px 12px" }} onClick={openReport}>View Report →</button>
                                    </motion.div>
                                )}

                                {/* Upload zone or locked */}
                                {uploadPhase === "idle" && (
                                    <div className="uzone" onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("drag"); }} onDragLeave={e => e.currentTarget.classList.remove("drag")} onDrop={handleFile} onClick={() => fileRef.current?.click()}>
                                        <input ref={fileRef} type="file" style={{ display: "none" }} accept=".pdf,.doc,.docx" onChange={handleFile} />
                                        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }} style={{ marginBottom: 14 }}>
                                            <svg width="44" height="44" fill="none" stroke="rgba(196,158,108,0.4)" strokeWidth="1.5" viewBox="0 0 24 24" style={{ display: "block", margin: "0 auto" }}>
                                                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
                                                <line x1="12" y1="18" x2="12" y2="12" /><polyline points="9 15 12 12 15 15" />
                                            </svg>
                                        </motion.div>
                                        <div style={{ fontSize: 15, fontWeight: 600, color: "#CCC", marginBottom: 6 }}>Upload Contract — Real AI Analysis</div>
                                        <div style={{ fontSize: 13, color: "#333", marginBottom: 19 }}>Drag &amp; drop or click · PDF / DOCX · Analyzed by Claude AI grounded in Indian law</div>
                                        <div style={{ display: "flex", gap: 9, justifyContent: "center", flexWrap: "wrap", marginBottom: 18 }}>
                                            {["Completeness", "Risk Scoring", "Negotiation", "Consistency", "Regulatory", "Explanation"].map(a => (
                                                <span key={a} style={{ background: "rgba(196,158,108,0.07)", border: "1px solid rgba(196,158,108,0.15)", color: "#888", padding: "4px 10px", borderRadius: 22, fontSize: 11, fontFamily: "IBM Plex Mono,monospace" }}>{a}</span>
                                            ))}
                                        </div>
                                        <motion.button whileHover={{ scale: 1.04, boxShadow: "0 0 24px rgba(196,158,108,0.35)" }} whileTap={{ scale: 0.97 }} className="gbtn" style={{ fontSize: 14, padding: "10px 18px" }} onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}>Choose Contract File</motion.button>
                                    </div>
                                )}

                                {uploadPhase === "analyzing" && (
                                    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} style={{ background: "#0D0F13", border: "1px solid #1A1D22", borderRadius: 15, padding: "24px 22px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 16 }}>
                                            <div style={{ animation: "spin 1.2s linear infinite", flexShrink: 0 }}>
                                                <svg width="24" height="24" fill="none" stroke="#C49E6C" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: 14, fontWeight: 600 }}>Analyzing <span style={{ color: "#C49E6C" }}>{uploadedFile?.name}</span></div>
                                                <div style={{ fontSize: 11, color: "#C49E6C", fontFamily: "IBM Plex Mono,monospace", marginTop: 2 }}>{STEPS[Math.min(analysisStep, STEPS.length - 1)].label}</div>
                                            </div>
                                            <div style={{ fontSize: 22, fontWeight: 700, color: "#C49E6C", fontFamily: "Playfair Display,serif" }}>{analysisPct}%</div>
                                        </div>
                                        <div style={{ background: "#131518", borderRadius: 6, height: 5, overflow: "hidden", marginBottom: 18 }}>
                                            <motion.div animate={{ width: `${analysisPct}%` }} transition={{ duration: 0.75, ease: "easeOut" }} style={{ height: "100%", background: "linear-gradient(90deg,#C49E6C,#F5D08A)", borderRadius: 6 }} />
                                        </div>
                                        <div className="dash-analysis-agents">
                                            {AGENTS.map(({ id, name, color, icon }) => {
                                                const si = STEPS.findIndex(s => s.agent === id);
                                                const done = si > 0 && analysisStep > si;
                                                const active = si > 0 && analysisStep === si;
                                                return (
                                                    <motion.div key={id} animate={{ opacity: done || active ? 1 : 0.25 }} style={{ background: "#0A0B0E", border: `1px solid ${done || active ? color + "44" : "#131518"}`, borderRadius: 9, padding: "9px 11px", display: "flex", alignItems: "center", gap: 8, transition: "border-color 0.3s" }}>
                                                        <span style={{ fontSize: 16, display: "flex", color: done || active ? color : "#888", transition: "color 0.3s" }}>{icon}</span>
                                                        <span style={{ fontSize: 11, color: done || active ? color : "#333", fontWeight: done || active ? 600 : 400, transition: "color 0.3s", flex: 1 }}>{name.replace(" Agent", "")}</span>
                                                        {done && <svg style={{ flexShrink: 0 }} width="10" height="10" fill="none" stroke={color} strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>}
                                                        {active && <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, animation: "spin 1s linear infinite", flexShrink: 0 }} />}
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}

                                {uploadPhase === "awaiting_docs" && analysis && (
                                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ background: "#0D0F13", border: "1px solid rgba(196,158,108,0.2)", borderRadius: 15, padding: "22px" }}>
                                        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 16 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                <svg width="15" height="15" fill="none" stroke="#22c55e" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>Analysis complete — <span style={{ color: "#C49E6C" }}>{analysis.fileName}</span></div>
                                                <div style={{ fontSize: 12, color: "#555" }}>Upload related documents to improve accuracy, or proceed to your report.</div>
                                            </div>
                                        </div>

                                        {/* Missing docs prompt */}
                                        {(analysis.agentOutputs?.completeness?.missing?.length || 0) > 0 && (
                                            <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 11, padding: "12px 14px", marginBottom: 14 }}>
                                                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 9 }}>
                                                    <svg width="16" height="16" fill="none" stroke="#f59e0b" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                                                    <span style={{ fontSize: 12, fontWeight: 600, color: "#f59e0b" }}>Missing Documents — Upload to improve analysis accuracy</span>
                                                </div>
                                                {(analysis.agentOutputs?.completeness?.missing || []).map((m, i) => (
                                                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                                                        {uploadedMissing[m] ? (
                                                            <span style={{ fontSize: 11, color: "#22c55e", display: "flex", alignItems: "center", gap: 5 }}>
                                                                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg> {m} uploaded
                                                            </span>
                                                        ) : (
                                                            <>
                                                                <span style={{ fontSize: 11, color: "#888", flex: 1, display: "flex", alignItems: "center", gap: 4 }}>
                                                                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg> {m}
                                                                </span>
                                                                <button className="cpbtn" onClick={() => missingRefs.current[m]?.click()}>Upload {m.split("—")[0].trim()}</button>
                                                                <input type="file" style={{ display: "none" }} ref={el => missingRefs.current[m] = el} onChange={() => setUploadedMissing(p => ({ ...p, [m]: true }))} />
                                                            </>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                                            {[{ l: "Risk Score", v: analysis.overallScore, c: "#ef4444" }, { l: "Critical", v: analysis.agentOutputs.risk.critical, c: "#ef4444" }, { l: "High", v: analysis.agentOutputs.risk.high, c: "#f59e0b" }, { l: "Medium", v: analysis.agentOutputs.risk.medium, c: "#f59e0b" }, { l: "Low", v: analysis.agentOutputs.risk.low, c: "#22c55e" }].map(({ l, v, c }) => (
                                                <div key={l} style={{ flex: 1, minWidth: 70, background: "#0A0B0E", border: `1px solid ${c}18`, borderRadius: 9, padding: "10px", textAlign: "center" }}>
                                                    <div style={{ fontSize: 17, fontWeight: 700, color: c, fontFamily: "Playfair Display,serif" }}>
                                                        <AnimatedNumber value={v} decimals={l === "Risk Score" && v % 1 !== 0 ? 1 : 0} />
                                                    </div>
                                                    <div style={{ fontSize: 10, color: "#333", marginTop: 1 }}>{l}</div>
                                                </div>
                                            ))}
                                        </div>
                                            <div style={{ border: "1px dashed rgba(196,158,108,0.15)", borderRadius: 11, padding: "12px 15px", display: "flex", alignItems: "center", gap: 13, marginBottom: 12 }}>
                                                <svg width="18" height="18" fill="none" stroke="rgba(196,158,108,0.45)" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><polyline points="9 15 12 12 15 15" /></svg>
                                                <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600, color: "#CCC" }}>Upload Related Documents</div><div style={{ fontSize: 11, color: "#333", marginTop: 1 }}>Annexures, SLAs, prior versions, exhibits…</div></div>
                                                <div style={{ background: "rgba(196,158,108,0.07)", border: "1px solid rgba(196,158,108,0.18)", borderRadius: 6, padding: "4px 11px", fontSize: 11, color: "#C49E6C" }}>Browse</div>
                                            </div>
                                        {relatedDocs.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 12 }}>{relatedDocs.map((d, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.16)", borderRadius: 6, padding: "3px 9px", fontSize: 11, color: "#22c55e" }}><svg width="8" height="8" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>{d}</div>)}</div>}
                                        <div style={{ display: "flex", gap: 9 }}>
                                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="gbtn" style={{ flex: 1, fontSize: 14, padding: "12px" }} onClick={openReport}>
                                                {relatedDocs.length > 0 ? `Re-analyze with ${relatedDocs.length} doc${relatedDocs.length > 1 ? "s" : ""}  →` : "View Full Report →"}
                                            </motion.button>
                                            <button className="qbtn" onClick={() => { setUploadPhase("idle"); setUploadedFile(null); setRelatedDocs([]); setUploadedMissing({}); }}>Reset</button>
                                        </div>
                                    </motion.div>
                                )}

                                {uploadPhase === "done" && analysis && !journeyDone && (
                                    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} style={{ background: "#0D0F13", border: "1px solid rgba(34,197,94,0.16)", borderRadius: 12, padding: "15px 18px", display: "flex", alignItems: "center", gap: 13 }}>
                                        <div style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(34,197,94,0.09)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                            <svg width="15" height="15" fill="none" stroke="#22c55e" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                                        </div>
                                        <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600 }}>Full report ready — <span style={{ color: "#C49E6C" }}>{analysis.fileName}</span></div><div style={{ fontSize: 11, color: "#444", marginTop: 1 }}>6 agents · {analysis.clauses.length} clauses · Risk {analysis.overallScore}/10</div></div>
                                        <motion.button whileHover={{ scale: 1.03 }} className="gbtn" style={{ fontSize: 12, padding: "8px 16px" }} onClick={openReport}>Open Report</motion.button>
                                        <button onClick={() => { setUploadPhase("idle"); setUploadedFile(null); setRelatedDocs([]); }} style={{ background: "none", border: "none", color: "#333", cursor: "pointer", padding: 3 }}><svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></button>
                                    </motion.div>
                                )}

                                {/* Recent from history */}
                                {contractHistory.length > 0 && (
                                    <div style={{ marginTop: 22 }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                                            <div style={{ fontSize: 11, color: "#C49E6C", fontFamily: "IBM Plex Mono,monospace", letterSpacing: "0.1em" }}>RECENT CONTRACTS</div>
                                            <button className="qbtn" style={{ padding: "4px 11px", fontSize: 12 }} onClick={() => setActiveNav("Contracts")}>View all →</button>
                                        </div>
                                        <div style={{ background: "#0A0B0E", border: "1px solid #0F1115", borderRadius: 13 }}>
                                            {contractHistory.slice(0, 3).map((c, i, arr) => (
                                                <motion.div key={c.id} whileHover={{ backgroundColor: "rgba(255,255,255,0.018)" }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderBottom: i < Math.min(arr.length, 3) - 1 ? "1px solid #0F1115" : "none", cursor: "pointer" }}
                                                    onClick={() => { setAnalysis(c.analysis); setViewingContract(c); setActiveNav("Reports"); }}>
                                                    <div style={{ width: 34, height: 34, borderRadius: 9, background: "#131518", border: "1px solid #1A1D22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                        <svg width="13" height="13" fill="none" stroke="#C49E6C" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                                                    </div>
                                                    <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 500, color: "#CCC" }}>{c.fileName}</div><div style={{ fontSize: 11, color: "#333", marginTop: 1 }}>{c.clauseCount} clauses · {c.uploadDate}</div></div>
                                                    <span style={{ background: rb(c.riskLevel), border: `1px solid ${rc(c.riskLevel)}22`, color: rc(c.riskLevel), padding: "4px 10px", borderRadius: 22, fontSize: 11, fontFamily: "IBM Plex Mono,monospace" }}>{c.riskLevel}</span>
                                                    <span style={{ fontSize: 14, fontWeight: 700, color: rc(c.riskLevel), minWidth: 26 }}>{c.overallScore}</span>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* ═══ CONTRACTS ════════════════════════════════════════ */}
                        {activeNav === "Contracts" && (
                            <motion.div key="contracts" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.38 }}>
                                <div className="dash-contracts-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
                                    <div><h1 style={{ fontFamily: "Playfair Display,serif", fontSize: 29, fontWeight: 700, marginBottom: 2 }}>Contracts</h1><p style={{ fontSize: 14, color: "#444" }}>{contractHistory.length} contracts analyzed and saved.</p></div>
                                    <motion.button whileHover={{ scale: 1.03 }} className="gbtn" style={{ fontSize: 14, padding: "9px 16px" }} onClick={() => { setActiveNav("Home"); setUploadPhase("idle"); }}>+ Analyze New</motion.button>
                                </div>
                                {contractHistory.length === 0 ? (
                                    <div style={{ textAlign: "center", padding: "66px 26px" }}>
                                        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18, color: "#C49E6C", opacity: 0.8 }}>
                                            <svg width="46" height="46" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2v11z" /></svg>
                                        </div>
                                        <div style={{ fontSize: 17, fontWeight: 600, color: "#CCC", marginBottom: 8 }}>No contracts yet</div>
                                        <div style={{ fontSize: 14, color: "#444", marginBottom: 20 }}>Upload your first contract to start building your history.</div>
                                        <motion.button whileHover={{ scale: 1.03 }} className="gbtn" style={{ fontSize: 14, padding: "10px 18px" }} onClick={() => setActiveNav("Home")}>Upload a Contract →</motion.button>
                                    </div>
                                ) : (
                                    <div style={{ background: "#0A0B0E", border: "1px solid #0F1115", borderRadius: 14 }}>
                                        {contractHistory.map((c, i) => (
                                            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 13, padding: "14px 17px", borderBottom: i < contractHistory.length - 1 ? "1px solid #0F1115" : "none" }}>
                                                <div style={{ width: 40, height: 40, borderRadius: 11, background: "#131518", border: "1px solid #1A1D22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                    <svg width="15" height="15" fill="none" stroke="#C49E6C" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: 14, fontWeight: 600, color: "#DDD" }}>{c.fileName}</div>
                                                    <div style={{ fontSize: 12, color: "#333", marginTop: 2 }}>{c.clauseCount} clauses · {c.uploadDate}</div>
                                                </div>
                                                <span style={{ background: rb(c.riskLevel), border: `1px solid ${rc(c.riskLevel)}22`, color: rc(c.riskLevel), padding: "4px 10px", borderRadius: 22, fontSize: 11, fontFamily: "IBM Plex Mono,monospace" }}>{c.riskLevel} Risk</span>
                                                <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: 6 }}>
                                                    <div style={{ textAlign: "right", minWidth: 42 }}>
                                                        <div style={{ fontSize: 16, fontWeight: 700, color: rc(c.riskLevel) }}>{c.overallScore}</div>
                                                    </div>
                                                    <button className="qbtn" style={{ padding: "6px 14px" }} onClick={() => { setAnalysis(c.analysis); setViewingContract(c); setActiveNav("Reports"); }}>View Report</button>

                                                    {/* Delete mechanism */}
                                                    <motion.button
                                                        whileHover={{ scale: 1.1, color: "#ef4444" }}
                                                        whileTap={{ scale: 0.9 }}
                                                        style={{ background: "none", border: "none", color: "#555", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 6, transition: "color 0.2s" }}
                                                        title="Remove contract"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const newHistory = contractHistory.filter(item => item.id !== c.id);
                                                            setContractHistory(newHistory);
                                                            // No persistence — data resets on refresh

                                                            // If we are currently viewing this analysis in the right sidebar, clear it out
                                                            if (analysis && analysis.id === c.analysis.id) {
                                                                setAnalysis(null);
                                                            }
                                                        }}
                                                    >
                                                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                                    </motion.button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}


                        {/* ═══ REPORTS ═══════════════════════════════════════════ */}
                        {activeNav === "Reports" && (
                            <motion.div key="reports" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.38 }}>
                                {!analysis ? (
                                    <div style={{ textAlign: "center", padding: "60px 24px" }}>
                                        <div style={{ fontSize: 44, marginBottom: 14 }}>📄</div>
                                        <div style={{ fontSize: 16, fontWeight: 600, color: "#CCC", marginBottom: 7 }}>No report yet</div>
                                        <div style={{ fontSize: 13, color: "#444", marginBottom: 18 }}>Upload a contract on the Home tab to generate your AI analysis report.</div>
                                        <motion.button whileHover={{ scale: 1.03 }} className="gbtn" onClick={() => setActiveNav("Home")}>Upload a Contract →</motion.button>
                                    </div>
                                ) : journeyDone ? (
                                    /* ── JOURNEY COMPLETE SCREEN ── */
                                    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} style={{ background: "#0D0F13", border: "1px solid rgba(196,158,108,0.2)", borderRadius: 20, padding: "44px 30px", margin: "0 auto", textAlign: "center", width: "100%", maxWidth: 540 }}>
                                        <div style={{ display: "flex", justifyContent: "center", color: "#C49E6C", marginBottom: 16 }}>
                                            <svg width="46" height="46" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                                        </div>
                                        <h1 style={{ fontFamily: "Playfair Display,serif", fontSize: 26, fontWeight: 700, color: "#FFF", marginBottom: 7 }}>Journey Complete</h1>
                                        <p style={{ fontSize: 14, color: "#444", marginBottom: 16 }}>You successfully processed {analysis.fileName}</p>
                                        <div style={{ background: "rgba(196,158,108,0.04)", border: "1px solid rgba(196,158,108,0.15)", borderRadius: 12, padding: "16px", marginBottom: 18 }}>
                                            <div style={{ display: "flex", justifyContent: "center", color: userDecision === "sign" ? "#3b82f6" : userDecision === "negotiate" ? "#C49E6C" : "#8b5cf6", marginBottom: 13 }}>
                                                {userDecision === "sign" ? <svg width="42" height="42" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg> : userDecision === "negotiate" ? <svg width="42" height="42" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg> : <svg width="42" height="42" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" /></svg>}
                                            </div>
                                            <div style={{ fontSize: 12, fontWeight: 600, color: "#DDD", marginBottom: 13 }}>Your Path: <span style={{ color: userDecision === "sign" ? "#93c5fd" : userDecision === "negotiate" ? "#F5D08A" : "#c4b5fd" }}>{userDecision === "sign" ? "Signed with Clarity" : userDecision === "negotiate" ? "Negotiation Package" : "Lawyer Brief"}</span></div>
                                            <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
                                                {[{ l: "Upload", d: true }, { l: "AI Analysis", d: true }, { l: "Report", d: true }, { l: userDecision === "sign" ? "Signed" : userDecision === "negotiate" ? "Negotiate" : "Lawyer", d: true }].map((s, i, arr) => (
                                                    <Fragment key={i}>
                                                        <div style={{ fontSize: 11, color: "#22c55e", display: "flex", alignItems: "center", gap: 4 }}>
                                                            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                                                            {s.l}
                                                        </div>
                                                        {i < arr.length - 1 && <svg width="12" height="12" fill="none" stroke="#22c55e" strokeWidth="2" viewBox="0 0 24 24" style={{ opacity: 0.3 }}><polyline points="9 18 15 12 9 6" /></svg>}
                                                    </Fragment>
                                                ))}
                                            </div>
                                        </div>
                                        {/* Summary cards */}
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
                                            {[{ l: "Clauses Analyzed", v: analysis.clauses.length, c: "#C49E6C" }, { l: "Critical Found", v: analysis.agentOutputs.risk.critical, c: "#ef4444" }, { l: "Counter-Terms", v: analysis.agentOutputs.negotiation.counterTermsGenerated, c: "#22c55e" }, { l: "Compliance", v: analysis.agentOutputs.regulatory.complianceScore + "%", c: "#3b82f6" }].map(({ l, v, c }) => (
                                                <div key={l} style={{ background: "#0A0B0E", border: `1px solid ${c}18`, borderRadius: 10, padding: "12px", textAlign: "center" }}>
                                                    <div style={{ fontSize: 20, fontWeight: 700, color: c, fontFamily: "Playfair Display,serif" }}>{v}</div>
                                                    <div style={{ fontSize: 10, color: "#333", marginTop: 2 }}>{l}</div>
                                                </div>
                                            ))}
                                        </div>
                                        {userDecision === "sign" && (
                                            <div style={{ background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.18)", borderRadius: 12, padding: "20px" }}>
                                                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(59,130,246,0.1)", border: "2px solid rgba(59,130,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#60a5fa", margin: "0 auto 10px" }}>
                                                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
                                                </div>
                                                <div style={{ fontSize: 13, fontWeight: 600, color: "#93c5fd", marginBottom: 6, textAlign: "center" }}>All severe risks were acknowledged</div>
                                            </div>
                                        )}
                                        {userDecision === "negotiate" && (
                                            <div style={{ background: "rgba(196,158,108,0.04)", border: "1px solid rgba(196,158,108,0.18)", borderRadius: 12, padding: "20px" }}>
                                                <div style={{ fontSize: 13, fontWeight: 600, color: "#F5D08A", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                                                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg>
                                                    {analysis.agentOutputs.negotiation.counterTermsGenerated} Counter-Terms Ready to Send
                                                </div>
                                                <motion.button whileHover={{ scale: 1.02 }} className="gbtn" style={{ width: "100%", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }} onClick={() => copy(analysis.clauses.filter(c => c.counter && c.riskLevel !== "Low").map(c => `RE: Clause "${c.title}"\nWe propose the following change:\n${c.counter}\n\nRationale:\n${c.plain}`).join("\n\n---\n\n"), "journey-all")}>
                                                    {copiedId === "journey-all" ?
                                                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg> All Copied!</span>
                                                        : <span style={{ display: "flex", alignItems: "center", gap: 4 }}><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg> Copy All Counter-Terms as Email</span>}
                                                </motion.button>
                                            </div>
                                        )}
                                        {userDecision === "lawyer" && (
                                            <div style={{ background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.18)", borderRadius: 12, padding: "20px" }}>
                                                <div style={{ fontSize: 13, fontWeight: 600, color: "#c4b5fd", marginBottom: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                                                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" /></svg>
                                                    Lawyer Brief — {analysis.clauses.filter(c => c.riskLevel === "Critical" || c.riskLevel === "High").length} Critical Sections Only
                                                </div>
                                            </div>
                                        )}

                                        <div style={{ display: "flex", gap: 11, marginTop: 17 }}>
                                            <motion.button whileHover={{ scale: 1.02 }} className="gbtn" style={{ flex: 1, fontSize: 12 }} onClick={() => { setActiveNav("Home"); setUploadPhase("idle"); }}>Analyze Another →</motion.button>
                                            <button className="qbtn" style={{ fontSize: 12, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }} onClick={() => copy(`Contract: ${analysis.fileName}\nRisk Score: ${analysis.overallScore}/10\nDecision: ${userDecision}\nClauses Checked: ${analysis.clauses.length}`, "report-copy")}>
                                                {copiedId === "report-copy" ?
                                                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg> Copied!</span>
                                                    : <span style={{ display: "flex", alignItems: "center", gap: 4 }}><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg> Copy Summary</span>}
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    /* ── FULL REPORT ── */
                                    <div>
                                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
                                            <div>
                                                <h1 style={{ fontFamily: "Playfair Display,serif", fontSize: 22, fontWeight: 700, marginBottom: 3 }}>Contract Intelligence Report</h1>
                                                <div style={{ fontSize: 12, color: "#444", display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                                                    <span style={{ color: "#C49E6C", fontWeight: 500 }}>{analysis.fileName}</span>
                                                    <span>·</span><span>6 agents</span><span>·</span><span>{analysis.clauses.length} clauses</span>
                                                </div>
                                            </div>
                                            <div style={{ display: "flex", gap: 8 }}>
                                                <button className="qbtn" style={{ fontSize: 11, padding: "6px 13px" }}>⬇ Export</button>
                                                <button className="qbtn" style={{ fontSize: 11, padding: "6px 14px", display: "flex", alignItems: "center", gap: 6 }}>
                                                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg> Copy Summary</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Score + Summary */}
                                        <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 14, marginBottom: 16 }}>
                                            <div style={{ background: "#0D0F13", border: "1px solid #1A1D22", borderRadius: 13, padding: "16px", textAlign: "center" }}>
                                                <div style={{ fontSize: 9, color: "#C49E6C", fontFamily: "IBM Plex Mono,monospace", letterSpacing: "0.08em", marginBottom: 11 }}>OVERALL RISK</div>
                                                <div style={{ position: "relative", width: 78, height: 78, margin: "0 auto 11px" }}>
                                                    <svg width="78" height="78" viewBox="0 0 78 78">
                                                        <circle cx="39" cy="39" r="30" fill="none" stroke="#131518" strokeWidth="9" />
                                                        <circle cx="39" cy="39" r="30" fill="none" stroke="#ef4444" strokeWidth="9"
                                                            strokeDasharray={`${(analysis.overallScore / 10) * 2 * Math.PI * 30} ${2 * Math.PI * 30}`}
                                                            strokeDashoffset={2 * Math.PI * 30 * 0.25} transform="rotate(-90 39 39)" strokeLinecap="round" />
                                                    </svg>
                                                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                                        <div style={{ fontSize: 17, fontWeight: 700, color: "#ef4444", fontFamily: "Playfair Display,serif", lineHeight: 1 }}>{analysis.overallScore}</div>
                                                        <div style={{ fontSize: 8, color: "#444" }}>/ 10</div>
                                                    </div>
                                                </div>
                                                <span style={{ background: rb(analysis.riskLevel), border: `1px solid ${rc(analysis.riskLevel)}22`, color: rc(analysis.riskLevel), padding: "3px 9px", borderRadius: 20, fontSize: 10, fontFamily: "IBM Plex Mono,monospace" }}>{analysis.riskLevel.toUpperCase()}</span>
                                            </div>
                                            <div style={{ background: "#0D0F13", border: "1px solid #1A1D22", borderRadius: 13, padding: "16px" }}>
                                                <div style={{ fontSize: 9, color: "#C49E6C", fontFamily: "IBM Plex Mono,monospace", letterSpacing: "0.08em", marginBottom: 8 }}>EXPLANATION AGENT — AI SUMMARY</div>
                                                <div style={{ fontSize: 12, color: "#AAA", lineHeight: 1.75, marginBottom: 12 }}>{analysis.agentOutputs.explanation.summary}</div>
                                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                                    {[{ l: "Critical", v: analysis.agentOutputs.risk.critical, c: "#ef4444" }, { l: "High", v: analysis.agentOutputs.risk.high, c: "#f59e0b" }, { l: "Medium", v: analysis.agentOutputs.risk.medium, c: "#f59e0b" }, { l: "Low", v: analysis.agentOutputs.risk.low, c: "#22c55e" }, { l: "Confidence", v: analysis.clauses.reduce((a, c) => a + c.confidence, 0) / analysis.clauses.length | 0 + "%", c: "#C49E6C" }].map(({ l, v, c }) => (
                                                        <div key={l} style={{ background: `${c}09`, border: `1px solid ${c}18`, borderRadius: 8, padding: "7px 12px", textAlign: "center" }}>
                                                            <div style={{ fontSize: 15, fontWeight: 700, color: c, fontFamily: "Playfair Display,serif" }}>{v}</div>
                                                            <div style={{ fontSize: 9, color: "#444" }}>{l}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Completeness missing docs banner */}
                                        {analysis.agentOutputs.completeness.missing.length > 0 && (
                                            <div style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.18)", borderRadius: 11, padding: "11px 14px", marginBottom: 14 }}>
                                                <div style={{ fontSize: 12, fontWeight: 600, color: "#f59e0b", marginBottom: 7, display: "flex", alignItems: "center", gap: 6 }}>
                                                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                                                    Completeness Agent: Missing Documents — Analysis may be incomplete
                                                </div>
                                                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                                    {analysis.agentOutputs.completeness.missing.map((m, i) => (
                                                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                            {uploadedMissing[m] ? (
                                                                <span style={{ fontSize: 11, color: "#22c55e", display: "flex", alignItems: "center", gap: 4 }}>
                                                                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg> {m}
                                                                </span>
                                                            ) : (
                                                                <>
                                                                    <span style={{ fontSize: 11, color: "#888", display: "flex", alignItems: "center", gap: 4 }}>
                                                                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg> {m}
                                                                    </span>
                                                                    <button className="cpbtn" onClick={() => missingRefs.current[m]?.click()}>Upload</button>
                                                                    <input type="file" style={{ display: "none" }} ref={el => missingRefs.current[m] = el} onChange={() => setUploadedMissing(p => ({ ...p, [m]: true }))} />
                                                                </>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Tabs */}
                                        <div style={{ display: "flex", gap: 6, marginBottom: 14, alignItems: "center", flexWrap: "wrap" }}>
                                            {[
                                                { k: "risks", l: <div style={{ display: "flex", alignItems: "center", gap: 6 }}><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>Risks</div> },
                                                { k: "counter", l: <div style={{ display: "flex", alignItems: "center", gap: 6 }}><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 13.5l4-4 4 4M19 4v9.5M9 10.5l-4 4-4-4M5 20v-9.5" /></svg>Counter-Terms</div> },
                                                { k: "plain", l: <div style={{ display: "flex", alignItems: "center", gap: 6 }}><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21h6M12 17v4M12.04 4.09l-1.09-1.09a3.88 3.88 0 00-5.48 0L4.08 4.39a3.88 3.88 0 000 5.48l1.09 1.09M20 12l-2 2-2-2m2 2V4" /></svg>Plain Language</div> },
                                                { k: "regulatory", l: <div style={{ display: "flex", alignItems: "center", gap: 6 }}><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></svg>Regulatory</div> },
                                                { k: "consistency", l: <div style={{ display: "flex", alignItems: "center", gap: 6 }}><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>Consistency</div> },
                                                { k: "decision", l: <div style={{ display: "flex", alignItems: "center", gap: 6 }}><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>My Decision</div> },
                                                { k: "draft", l: <div style={{ display: "flex", alignItems: "center", gap: 6 }}><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>Draft Doc</div> }
                                            ].map(({ k, l }) => {
                                                return (
                                                    <button key={k} className={`tbtn ${reportTab === k ? "on" : "off"}`}
                                                        onClick={() => { setReportTab(k); }}
                                                    >
                                                        {l}
                                                    </button>
                                                );
                                            })}
                                            {(reportTab === "risks" || reportTab === "plain" || reportTab === "counter") && (
                                                <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
                                                    {["All", "Critical", "High", "Medium", "Low"].map(r => (
                                                        <button key={r} onClick={() => setFilterRisk(r)} style={{ background: filterRisk === r ? "rgba(196,158,108,0.1)" : "transparent", border: `1px solid ${filterRisk === r ? "rgba(196,158,108,0.28)" : "#131518"}`, borderRadius: 6, padding: "3px 8px", fontSize: 10, color: filterRisk === r ? "#C49E6C" : "#333", cursor: "pointer", transition: "all 0.17s", fontFamily: "DM Sans,sans-serif" }}>{r}</button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* RISKS TAB */}
                                        {reportTab === "risks" && (
                                            <div style={{ display: "grid", gridTemplateColumns: activeClause ? "1fr 350px" : "1fr", gap: 12 }}>
                                                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                                                    {filtered.map(c => (
                                                        <motion.div key={c.id} layout className={`cr${activeClause?.id === c.id ? " sel" : ""}`} onClick={() => setActiveClause(activeClause?.id === c.id ? null : c)}>
                                                            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                                                                <div style={{ width: 38, height: 38, borderRadius: 9, background: rb(c.riskLevel), border: `1px solid ${rc(c.riskLevel)}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 13, fontWeight: 700, color: rc(c.riskLevel), fontFamily: "Playfair Display,serif" }}>{c.riskScore}</div>
                                                                <div style={{ flex: 1 }}>
                                                                    <div style={{ display: "flex", gap: 7, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                                                                        <span style={{ fontSize: 13, fontWeight: 600, color: "#DDD" }}>{c.title}</span>
                                                                        <span style={{ background: rb(c.riskLevel), border: `1px solid ${rc(c.riskLevel)}22`, color: rc(c.riskLevel), padding: "2px 8px", borderRadius: 20, fontSize: 9, fontFamily: "IBM Plex Mono,monospace" }}>{c.riskLevel}</span>
                                                                        <span style={{ background: "rgba(196,158,108,0.07)", border: "1px solid rgba(196,158,108,0.14)", color: "#888", padding: "2px 8px", borderRadius: 20, fontSize: 9, fontFamily: "IBM Plex Mono,monospace" }}>{c.agent}</span>
                                                                        <span style={{ background: "rgba(196,158,108,0.05)", border: "1px solid rgba(196,158,108,0.12)", color: "#C49E6C", padding: "2px 8px", borderRadius: 20, fontSize: 9, fontFamily: "IBM Plex Mono,monospace" }}>{c.confidence}% conf</span>
                                                                        {c.negotiable && <span style={{ background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.16)", color: "#22c55e", padding: "2px 8px", borderRadius: 20, fontSize: 9, fontFamily: "IBM Plex Mono,monospace" }}>Negotiable</span>}
                                                                    </div>
                                                                    <div style={{ fontSize: 12, color: "#555", lineHeight: 1.55 }}>{c.plain}</div>
                                                                    {c.financialExposure && <div style={{ marginTop: 5, fontSize: 11, color: "#f59e0b", fontFamily: "IBM Plex Mono,monospace", display: "flex", alignItems: "center", gap: 5 }}><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg> {c.financialExposure}</div>}
                                                                    {c.regulatoryNote && <div style={{ marginTop: 5, fontSize: 11, color: "#22c55e", background: "rgba(34,197,94,0.05)", borderRadius: 6, padding: "4px 8px" }}>{c.regulatoryNote}</div>}
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                                <AnimatePresence>
                                                    {activeClause && (
                                                        <motion.div initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 18 }} style={{ background: "#0D0F13", border: "1px solid rgba(196,158,108,0.18)", borderRadius: 13, padding: "16px", alignSelf: "flex-start", position: "sticky", top: 0 }}>
                                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 11 }}>
                                                                <div style={{ fontSize: 9, color: "#C49E6C", fontFamily: "IBM Plex Mono,monospace", letterSpacing: "0.08em" }}>CLAUSE DETAIL · {activeClause.confidence}% confidence</div>
                                                                <button onClick={() => setActiveClause(null)} style={{ background: "none", border: "none", color: "#333", cursor: "pointer", padding: 2 }}>✕</button>
                                                            </div>
                                                            <div style={{ fontSize: 12, fontWeight: 600, color: "#FFF", marginBottom: 10 }}>{activeClause.title}</div>
                                                            <div style={{ fontSize: 9, color: "#333", fontFamily: "IBM Plex Mono,monospace", marginBottom: 4 }}>ORIGINAL</div>
                                                            <div style={{ fontSize: 11, color: "#444", background: "#0A0B0E", borderRadius: 8, padding: "8px", lineHeight: 1.6, marginBottom: 12, fontStyle: "italic", border: "1px solid #0F1115" }}>"{activeClause.original}"</div>
                                                            <div style={{ fontSize: 9, color: "#C49E6C", fontFamily: "IBM Plex Mono,monospace", marginBottom: 4 }}>PLAIN ENGLISH</div>
                                                            <div style={{ fontSize: 11, color: "#AAA", background: "rgba(196,158,108,0.03)", borderRadius: 8, padding: "8px", lineHeight: 1.6, marginBottom: 12, border: "1px solid rgba(196,158,108,0.09)" }}>{activeClause.plain}</div>
                                                            {activeClause.counter && (<>
                                                                <div style={{ fontSize: 9, color: "#22c55e", fontFamily: "IBM Plex Mono,monospace", marginBottom: 4, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                                                    <span>COUNTER-TERM</span>
                                                                    <button className="cpbtn" onClick={() => copy(activeClause.counter, activeClause.id)}>
                                                                        {copiedId === activeClause.id ? <span style={{ display: "flex", alignItems: "center", gap: 4 }}><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>Copied!</span> : "Copy"}
                                                                    </button>
                                                                </div>
                                                                <div style={{ fontSize: 11, color: "#4ade80", background: "rgba(34,197,94,0.04)", borderRadius: 8, padding: "8px", lineHeight: 1.6, border: "1px solid rgba(34,197,94,0.12)" }}>{activeClause.counter}</div>
                                                            </>)}
                                                            {activeClause.regulatoryNote && <div style={{ marginTop: 9, fontSize: 11, color: "#22c55e", background: "rgba(34,197,94,0.04)", borderRadius: 6, padding: "6px 8px", border: "1px solid rgba(34,197,94,0.1)" }}>{activeClause.regulatoryNote}</div>}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        )}

                                        {/* COUNTER-TERMS TAB */}
                                        {reportTab === "counter" && (
                                            <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                                                <div style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.14)", borderRadius: 10, padding: "9px 13px", fontSize: 12, color: "#22c55e", display: "flex", alignItems: "center", gap: 6 }}>
                                                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg> {analysis.agentOutputs.negotiation.counterTermsGenerated} counter-terms · Strategy: {analysis.agentOutputs.negotiation.strategy}
                                                </div>
                                                {filtered.filter(c => c.counter && c.riskLevel !== "Low").map(c => (
                                                    <div key={c.id} style={{ background: "#0D0F13", border: "1px solid #1A1D22", borderRadius: 13, padding: "16px 18px" }}>
                                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                                <span style={{ fontSize: 13, fontWeight: 600, color: "#DDD" }}>{c.title}</span>
                                                                <span style={{ background: rb(c.riskLevel), border: `1px solid ${rc(c.riskLevel)}22`, color: rc(c.riskLevel), padding: "2px 8px", borderRadius: 20, fontSize: 9, fontFamily: "IBM Plex Mono,monospace" }}>{c.riskScore}/100</span>
                                                                <span style={{ color: "#555", fontSize: 10, fontFamily: "IBM Plex Mono,monospace" }}>{c.confidence}% conf</span>
                                                            </div>
                                                            <button className="cpbtn" onClick={() => copy(c.counter, c.id)}>
                                                                {copiedId === c.id ? <span style={{ display: "flex", alignItems: "center", gap: 4 }}><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>Copied!</span> : "Copy Counter-Term"}
                                                            </button>
                                                        </div>
                                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
                                                            <div>
                                                                <div style={{ fontSize: 9, color: "#ef4444", fontFamily: "IBM Plex Mono,monospace", marginBottom: 4 }}>ORIGINAL</div>
                                                                <div style={{ fontSize: 11, color: "#555", background: "#0A0B0E", borderRadius: 8, padding: "8px", lineHeight: 1.6, border: "1px solid #0F1115", fontStyle: "italic" }}>"{c.original}"</div>
                                                            </div>
                                                            <div>
                                                                <div style={{ fontSize: 9, color: "#22c55e", fontFamily: "IBM Plex Mono,monospace", marginBottom: 4 }}>COUNTER-TERM</div>
                                                                <div style={{ fontSize: 11, color: "#4ade80", background: "rgba(34,197,94,0.04)", borderRadius: 8, padding: "8px", lineHeight: 1.6, border: "1px solid rgba(34,197,94,0.12)" }}>{c.counter}</div>
                                                            </div>
                                                        </div>
                                                        {c.financialExposure && <div style={{ marginTop: 8, fontSize: 11, color: "#f59e0b", fontFamily: "IBM Plex Mono,monospace", display: "flex", alignItems: "center", gap: 5 }}><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg> {c.financialExposure}</div>}
                                                    </div>
                                                ))}
                                                {/* Revised contract re-upload */}
                                                <div style={{ background: "#0D0F13", border: "1px solid rgba(196,158,108,0.15)", borderRadius: 13, padding: "16px 18px", marginTop: 4 }}>
                                                    <div style={{ fontSize: 12, fontWeight: 600, color: "#CCC", marginBottom: 4 }}>Did the other party respond with a revised contract?</div>
                                                    <div style={{ fontSize: 11, color: "#555", marginBottom: 12 }}>Upload their revised version — we'll show you exactly what changed and whether risks were addressed.</div>
                                                    {!revisedAnalysis ? (
                                                        <div style={{ border: "1px dashed rgba(196,158,108,0.15)", borderRadius: 10, padding: "14px", textAlign: "center", cursor: "pointer", transition: "all 0.2s" }}
                                                            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(196,158,108,0.35)"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(196,158,108,0.15)"; }}
                                                            onClick={() => revisedRef.current?.click()}>
                                                            <input ref={revisedRef} type="file" style={{ display: "none" }} accept=".pdf,.doc,.docx" onChange={e => { const f = e.target.files[0]; if (f) runRevisedAnalysis(f); }} />
                                                            {aiLoading ? (
                                                                <div style={{ fontSize: 12, color: "#C49E6C", display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                                                                    <div style={{ animation: "spin 1s linear infinite", width: 14, height: 14, border: "2px solid #C49E6C", borderTopColor: "transparent", borderRadius: "50%" }} />
                                                                    Analyzing revised contract…
                                                                </div>
                                                            ) : (
                                                                <div style={{ fontSize: 12, color: "#555", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                                                                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg> Upload Revised Contract for Comparison
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : diffView && (() => {
                                                        const diff = getDiff();
                                                        return (
                                                            <div>
                                                                <div style={{ fontSize: 11, fontWeight: 600, color: "#CCC", marginBottom: 10 }}>Comparison: <span style={{ color: "#C49E6C" }}>{revisedAnalysis.fileName}</span></div>
                                                                {diff.improved.map(({ orig, rev }, i) => (
                                                                    <div key={i} style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: 9, padding: "10px 12px", marginBottom: 8, display: "flex", gap: 10, alignItems: "center" }}>
                                                                        <span style={{ color: "#22c55e", flexShrink: 0, display: "flex", marginTop: 2 }}><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg></span>
                                                                        <div><span style={{ fontSize: 12, fontWeight: 600, color: "#DDD" }}>{orig.title}</span><div style={{ fontSize: 11, color: "#22c55e", marginTop: 2 }}>Risk Reduced: {orig.riskScore} → {rev.riskScore}</div></div>
                                                                    </div>
                                                                ))}
                                                                {diff.worsened.map((c, i) => (
                                                                    <div key={i} style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 9, padding: "10px 12px", marginBottom: 8, display: "flex", gap: 10, alignItems: "center" }}>
                                                                        <span style={{ color: "#ef4444", flexShrink: 0, display: "flex", marginTop: 2 }}><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg></span>
                                                                        <div><span style={{ fontSize: 12, fontWeight: 600, color: "#DDD" }}>{c.title}</span><div style={{ fontSize: 11, color: "#ef4444", marginTop: 2 }}>New/Worsened Risk</div></div>
                                                                    </div>
                                                                ))}
                                                                {diff.unchanged.map((c, i) => (
                                                                    <div key={i} style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 9, padding: "10px 12px", marginBottom: 8, display: "flex", gap: 10, alignItems: "center" }}>
                                                                        <span style={{ color: "#f59e0b", flexShrink: 0, display: "flex", marginTop: 2 }}><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21.5 2v6h-6M2.13 15.57a10 10 0 1 0 1.94-8.8L21.5 8" /></svg></span>
                                                                        <div><span style={{ fontSize: 12, fontWeight: 600, color: "#DDD" }}>{c.title}</span><div style={{ fontSize: 11, color: "#f59e0b", marginTop: 2 }}>Still Unresolved</div></div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        )}

                                        {/* PLAIN LANGUAGE TAB */}
                                        {reportTab === "plain" && (
                                            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                                                <div style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.14)", borderRadius: 10, padding: "9px 13px", fontSize: 12, color: "#f59e0b", display: "flex", alignItems: "center", gap: 6 }}>
                                                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21h6M12 17v4M12.04 4.09l-1.09-1.09a3.88 3.88 0 00-5.48 0L4.08 4.39a3.88 3.88 0 000 5.48l1.09 1.09M20 12l-2 2-2-2m2 2V4" /></svg> Readability: {analysis.agentOutputs.explanation.readabilityScore}/100 ({analysis.agentOutputs.explanation.grade})
                                                </div>
                                                {filtered.map(c => (
                                                    <div key={c.id} style={{ background: "#0D0F13", border: "1px solid #1A1D22", borderRadius: 12, padding: "14px 16px" }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                                                            <span style={{ fontSize: 13, fontWeight: 600, color: "#DDD" }}>{c.title}</span>
                                                            <span style={{ background: rb(c.riskLevel), border: `1px solid ${rc(c.riskLevel)}22`, color: rc(c.riskLevel), padding: "2px 8px", borderRadius: 20, fontSize: 9, fontFamily: "IBM Plex Mono,monospace" }}>{c.type}</span>
                                                            <span style={{ fontSize: 10, color: "#444", fontFamily: "IBM Plex Mono,monospace", marginLeft: "auto" }}>{c.confidence}% conf</span>
                                                        </div>
                                                        <div style={{ fontSize: 9, color: "#333", fontFamily: "IBM Plex Mono,monospace", marginBottom: 4 }}>LEGAL TEXT</div>
                                                        <div style={{ fontSize: 11, color: "#444", fontStyle: "italic", marginBottom: 9, lineHeight: 1.6 }}>"{c.original}"</div>
                                                        <div style={{ fontSize: 9, color: "#f59e0b", fontFamily: "IBM Plex Mono,monospace", marginBottom: 4 }}>WHAT IT MEANS FOR YOU</div>
                                                        <div style={{ fontSize: 13, color: "#CCC", lineHeight: 1.75, background: "rgba(245,158,11,0.03)", borderRadius: 8, padding: "10px", border: "1px solid rgba(245,158,11,0.09)" }}>{c.plain}</div>
                                                        {c.financialExposure && <div style={{ marginTop: 7, fontSize: 11, color: "#f59e0b", fontFamily: "IBM Plex Mono,monospace", display: "flex", alignItems: "center", gap: 5 }}><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg> {c.financialExposure}</div>}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* REGULATORY TAB */}
                                        {reportTab === "regulatory" && (
                                            <div>
                                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13, marginBottom: 14 }}>
                                                    <div style={{ background: "#0D0F13", border: "1px solid #1A1D22", borderRadius: 13, padding: "16px" }}>
                                                        <div style={{ fontSize: 9, color: "#22c55e", fontFamily: "IBM Plex Mono,monospace", letterSpacing: "0.08em", marginBottom: 10 }}>COMPLIANCE STATUS</div>
                                                        <div style={{ fontSize: 24, fontWeight: 700, color: "#22c55e", fontFamily: "Playfair Display,serif", marginBottom: 3 }}>{analysis.agentOutputs.regulatory.complianceScore}%</div>
                                                        <div style={{ fontSize: 11, color: "#444", marginBottom: 11 }}>{analysis.agentOutputs.regulatory.jurisdiction}</div>
                                                        {analysis.agentOutputs.regulatory.violations.map((v, i) => (
                                                            <div key={i} style={{ display: "flex", gap: 7, alignItems: "flex-start", marginBottom: 7 }}>
                                                                <span style={{ color: "#ef4444", flexShrink: 0, fontSize: 13 }}>⚠</span>
                                                                <span style={{ fontSize: 11, color: "#777" }}>{v}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div style={{ background: "#0D0F13", border: "1px solid #1A1D22", borderRadius: 13, padding: "16px" }}>
                                                        <div style={{ fontSize: 9, color: "#22c55e", fontFamily: "IBM Plex Mono,monospace", letterSpacing: "0.08em", marginBottom: 10 }}>APPLICABLE INDIAN LAW</div>
                                                        {["Indian Contract Act, 1872", "DPDP Act, 2023", "IT Act, 2000 (Sec 43A)", "Copyright Act, 1957", "Arbitration & Conciliation Act, 1996", "Specific Relief Act, 1963"].map((l, i) => (
                                                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                                                                <svg width="9" height="9" fill="none" stroke="#22c55e" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                                                                <span style={{ fontSize: 11, color: "#666" }}>{l}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* CONSISTENCY TAB */}
                                        {reportTab === "consistency" && (
                                            <div>
                                                <div style={{ background: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.16)", borderRadius: 10, padding: "9px 13px", marginBottom: 13, fontSize: 12, color: "#a78bfa", display: "flex", alignItems: "center", gap: 6 }}>
                                                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg> {analysis.agentOutputs.consistency.contradictions} internal contradictions found
                                                </div>
                                                {analysis.agentOutputs.consistency.issues.map((iss, i) => (
                                                    <div key={i} style={{ background: "#0D0F13", border: "1px solid rgba(139,92,246,0.14)", borderRadius: 11, padding: "14px 16px", marginBottom: 10 }}>
                                                        <div style={{ fontSize: 11, color: "#444", fontFamily: "IBM Plex Mono,monospace", marginBottom: 5 }}>CONTRADICTION #{i + 1}</div>
                                                        <div style={{ fontSize: 13, color: "#a78bfa", fontWeight: 500 }}>{iss}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* USER DECISION TAB */}
                                        {reportTab === "decision" && !journeyDone && (
                                            <div>
                                                <div style={{ background: "#0D0F13", border: "1px solid #1A1D22", borderRadius: 14, padding: "22px", marginBottom: 14, textAlign: "center" }}>
                                                    <div style={{ fontSize: 10, color: "#C49E6C", fontFamily: "IBM Plex Mono,monospace", letterSpacing: "0.1em", marginBottom: 8 }}>USER DECISION POINT</div>
                                                    <div style={{ fontSize: 14, fontWeight: 600, color: "#FFF", marginBottom: 5 }}>You've reviewed your analysis. What would you like to do?</div>
                                                    <div style={{ fontSize: 12, color: "#555", marginBottom: 20 }}>Risk Score: <span style={{ color: rc(analysis.riskLevel), fontWeight: 600 }}>{analysis.overallScore}/10 — {analysis.riskLevel}</span></div>
                                                    <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                                                        {[
                                                            { k: "sign", icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>, label: "Sign with Clarity", sub: "I understand all risks", bc: "rgba(59,130,246,0.09)", bca: "rgba(59,130,246,0.18)", bc2: "rgba(59,130,246,0.22)", bc2a: "#3b82f6", tc: "#93c5fd" },
                                                            { k: "negotiate", icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg>, label: "Use Counter-Terms", sub: "Negotiate the clauses", bc: "rgba(196,158,108,0.07)", bca: "rgba(196,158,108,0.18)", bc2: "rgba(196,158,108,0.2)", bc2a: "#C49E6C", tc: "#F5D08A" },
                                                            { k: "lawyer", icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" /></svg>, label: "Consult a Lawyer", sub: "Critical sections only", bc: "rgba(139,92,246,0.07)", bca: "rgba(139,92,246,0.18)", bc2: "rgba(139,92,246,0.2)", bc2a: "#8b5cf6", tc: "#c4b5fd" },
                                                        ].map(({ k, icon, label, sub, bc, bca, bc2, bc2a, tc }) => (
                                                            <motion.button key={k} whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }} onClick={() => setUserDecision(userDecision === k ? null : k)}
                                                                style={{ background: userDecision === k ? bca : bc, border: `1px solid ${userDecision === k ? bc2a : bc2}`, borderRadius: 12, padding: "16px 22px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, minWidth: 140, transition: "all 0.2s", fontFamily: "DM Sans,sans-serif" }}>
                                                                <span style={{ color: tc }}>{icon}</span>
                                                                <span style={{ fontSize: 13, fontWeight: 700, color: tc }}>{label}</span>
                                                                <span style={{ fontSize: 11, color: "#555", fontWeight: 400 }}>{sub}</span>
                                                            </motion.button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <AnimatePresence>
                                                    {userDecision === "sign" && (
                                                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.18)", borderRadius: 13, padding: "18px 20px" }}>
                                                            <div style={{ fontSize: 14, fontWeight: 600, color: "#93c5fd", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                                                                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg> Acknowledged Risks — Signing with Clarity
                                                            </div>
                                                            <div style={{ fontSize: 12, color: "#666", marginBottom: 12 }}>You are proceeding with full knowledge of these risks:</div>
                                                            {analysis.clauses.filter(c => c.riskLevel === "Critical" || c.riskLevel === "High").map(c => (
                                                                <div key={c.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 9 }}>
                                                                    <span style={{ background: rb(c.riskLevel), border: `1px solid ${rc(c.riskLevel)}22`, color: rc(c.riskLevel), padding: "2px 8px", borderRadius: 20, fontSize: 9, fontFamily: "IBM Plex Mono,monospace", flexShrink: 0 }}>{c.riskScore}</span>
                                                                    <div style={{ fontSize: 12, color: "#888" }}><strong style={{ color: "#CCC" }}>{c.title}:</strong> {c.plain}</div>
                                                                </div>
                                                            ))}
                                                            <motion.button whileHover={{ scale: 1.02 }} className="gbtn" style={{ marginTop: 14, width: "100%", fontSize: 14, padding: "12px" }} onClick={() => setJourneyDone(true)}>
                                                                Confirm — Proceed to Sign →
                                                            </motion.button>
                                                        </motion.div>
                                                    )}
                                                    {userDecision === "negotiate" && (
                                                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ background: "rgba(196,158,108,0.04)", border: "1px solid rgba(196,158,108,0.18)", borderRadius: 13, padding: "18px 20px" }}>
                                                            <div style={{ fontSize: 14, fontWeight: 600, color: "#F5D08A", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                                                                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg> Negotiation Package Ready
                                                            </div>
                                                            {analysis.clauses.filter(c => c.counter && c.negotiable && c.riskLevel !== "Low").map(c => (
                                                                <div key={c.id} style={{ background: "#0A0B0E", border: "1px solid #1A1D22", borderRadius: 10, padding: "11px 13px", marginBottom: 9 }}>
                                                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                                                                        <span style={{ fontSize: 12, fontWeight: 600, color: "#CCC" }}>{c.title}</span>
                                                                        <button className="cpbtn" onClick={() => copy(c.counter, `dec-${c.id}`)}>{copiedId === `dec-${c.id}` ? "✓ Copied!" : "Copy"}</button>
                                                                    </div>
                                                                    <div style={{ fontSize: 11, color: "#4ade80", lineHeight: 1.6 }}>{c.counter}</div>
                                                                </div>
                                                            ))}
                                                            <motion.button whileHover={{ scale: 1.02 }} className="gbtn" style={{ marginTop: 8, width: "100%", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }} onClick={() => setJourneyDone(true)}>
                                                                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg> Copy All &amp; Mark as Complete →
                                                            </motion.button>
                                                        </motion.div>
                                                    )}
                                                    {userDecision === "lawyer" && (
                                                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.18)", borderRadius: 13, padding: "18px 20px" }}>
                                                            <div style={{ fontSize: 14, fontWeight: 600, color: "#c4b5fd", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                                                                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" /></svg> Lawyer Brief — {analysis.clauses.filter(c => c.riskLevel === "Critical" || c.riskLevel === "High").length} Critical Sections Only
                                                            </div>
                                                            <div style={{ fontSize: 12, color: "#666", marginBottom: 12 }}>Estimated saving: <span style={{ color: "#22c55e", fontWeight: 600 }}>₹30,000–₹45,000</span> vs. full lawyer review</div>
                                                            {analysis.clauses.filter(c => c.riskLevel === "Critical" || c.riskLevel === "High").map(c => (
                                                                <div key={c.id} style={{ background: "#0A0B0E", border: "1px solid rgba(139,92,246,0.12)", borderRadius: 10, padding: "11px 13px", marginBottom: 9 }}>
                                                                    <div style={{ fontSize: 12, fontWeight: 600, color: "#DDD", marginBottom: 5 }}>{c.title} <span style={{ background: rb(c.riskLevel), border: `1px solid ${rc(c.riskLevel)}22`, color: rc(c.riskLevel), padding: "2px 7px", borderRadius: 20, fontSize: 9, fontFamily: "IBM Plex Mono,monospace" }}>{c.riskScore}/100</span></div>
                                                                    <div style={{ fontSize: 11, color: "#555", fontStyle: "italic", marginBottom: 4 }}>"{c.original}"</div>
                                                                    {c.regulatoryNote && <div style={{ fontSize: 11, color: "#22c55e" }}>{c.regulatoryNote}</div>}
                                                                </div>
                                                            ))}
                                                            <motion.button whileHover={{ scale: 1.02 }} className="gbtn" style={{ marginTop: 8, width: "100%", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }} onClick={() => { copy(analysis.clauses.filter(c => c.riskLevel === "Critical" || c.riskLevel === "High").map(c => `CLAUSE: ${c.title}\nRisk: ${c.riskScore}/100\n"${c.original}"\n${c.plain}`).join("\n\n---\n\n"), "lawyer-brief"); setJourneyDone(true); }}>
                                                                {copiedId === "lawyer-brief" ?
                                                                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg> Copied — Journey Complete</span>
                                                                    : <span style={{ display: "flex", alignItems: "center", gap: 6 }}><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg> Copy Brief &amp; Complete →</span>}
                                                            </motion.button>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        )}

                                        {/* DRAFT DOCUMENT TAB */}
                                        {reportTab === "draft" && (
                                            <div>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                                                    <div>
                                                        <div style={{ fontSize: 16, fontWeight: 600, color: "#FFF", fontFamily: "Playfair Display,serif", marginBottom: 4 }}>Draft Document Preview</div>
                                                        <div style={{ fontSize: 12, color: "#888" }}>This draft incorporates your selected counter-terms into the original contract.</div>
                                                    </div>
                                                    {/* Download functionality: create a blob and triggering download */}
                                                    <motion.button
                                                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                                        onClick={() => {
                                                            const text = analysis.clauses.map(c => c.counter ? `[UPDATED CLAUSE: ${c.title}]\n${c.counter}` : `[ORIGINAL CLAUSE: ${c.title}]\n${c.original}`).join("\n\n---\n\n");
                                                            const blob = new Blob([`KARRAR.AI DRAFT DOCUMENT\nOriginal: ${analysis.fileName}\nGenerated: ${new Date().toLocaleString()}\n\n========================================\n\n${text}`], { type: "text/plain" });
                                                            const url = URL.createObjectURL(blob);
                                                            const a = document.createElement("a");
                                                            a.href = url;
                                                            a.download = `Draft_${analysis.fileName.replace(/\.[^.]+$/, "")}.txt`;
                                                            a.click();
                                                            URL.revokeObjectURL(url);
                                                        }}
                                                        style={{ background: "#C49E6C", color: "#000", border: "none", borderRadius: 8, padding: "10px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
                                                    >
                                                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                                        Download .txt
                                                    </motion.button>
                                                </div>

                                                <div style={{ background: "#0A0B0E", border: "1px solid #1A1D22", borderRadius: 12, padding: "24px", maxHeight: "60vh", overflowY: "auto", fontFamily: "IBM Plex Mono,monospace", fontSize: 12, color: "#CCC", lineHeight: 1.7 }}>
                                                    <div style={{ textAlign: "center", marginBottom: 30, paddingBottom: 20, borderBottom: "1px dashed #333" }}>
                                                        <h2 style={{ fontSize: 18, color: "#FFF", marginBottom: 8, fontFamily: "Playfair Display,serif" }}>DRAFT REVISION</h2>
                                                        <div style={{ color: "#888" }}>Based on Karrar.ai Risk Analysis</div>
                                                    </div>
                                                    {analysis.clauses.map((c, i) => (
                                                        <div key={c.id} style={{ marginBottom: 24, padding: "16px", background: c.counter ? "rgba(34,197,94,0.03)" : "transparent", border: c.counter ? "1px solid rgba(34,197,94,0.15)" : "1px solid transparent", borderRadius: 8 }}>
                                                            <div style={{ fontWeight: 700, color: c.counter ? "#4ade80" : "#888", marginBottom: 8, fontSize: 11, letterSpacing: "0.05em" }}>
                                                                {i + 1}. {c.title.toUpperCase()} {c.counter && "(UPDATED)"}
                                                            </div>
                                                            <div style={{ color: c.counter ? "#DDD" : "#777", whiteSpace: "pre-wrap" }}>
                                                                {c.counter || c.original}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Persistent disclaimer bar */}
                                        <div style={{ marginTop: 22, background: "rgba(196,158,108,0.04)", border: "1px solid rgba(196,158,108,0.1)", borderRadius: 9, padding: "9px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                                            <span style={{ color: "#444" }}>
                                                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                                            </span>
                                            <span style={{ fontSize: 11, color: "#444" }}>AI Legal Intelligence — Not Legal Advice · Verify critical clauses with a licensed Indian advocate · Karrar.ai is not a law firm · <span style={{ color: "#333" }}>Advocates Act, 1961</span></span>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                    </AnimatePresence>
                </main>

                {/* ── RIGHT PANEL ─────────────────────────────────────────── */}
                {/* ── RIGHT DRAG HANDLE ── */}
                {!collapsed && (
                    <div
                        onMouseDown={startDrag("right")}
                        style={{
                            width: 6,
                            background: "#0F1115",
                            cursor: "col-resize",
                            flexShrink: 0,
                            position: "relative",
                            transition: "background 0.15s",
                            zIndex: 10,
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#1E2228")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#0F1115")}
                    >
                        <div style={{ position: "absolute", top: "50%", left: 2, width: 2, height: 24, background: "#333", borderRadius: 2, transform: "translateY(-50%)" }} />
                    </div>
                )}

                {/* ── RIGHT PANEL CONTENT ── */}
                <aside className="dash-right-panel"
                    style={{
                        width: collapsed ? 0 : rightW,
                        minWidth: collapsed ? 0 : Math.min(rightW, 200),
                        background: "#060708",
                        borderLeft: "1px solid #0F1115",
                        display: collapsed ? "none" : "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                        overflowY: "auto",
                        transition: "width 0.3s cubic-bezier(0.2,0.8,0.2,1)",
                        flexShrink: 0,
                    }}
                >
                    {/* ── RISK BREAKDOWN ── */}
                    {(() => {
                        const clauses = analysis?.clauses || [];
                        const total = clauses.length || 1;
                        const critCount = clauses.filter(c => c.riskLevel === "Critical").length;
                        const highCount = clauses.filter(c => c.riskLevel === "High").length;
                        const medCount = clauses.filter(c => c.riskLevel === "Medium" || c.riskLevel === "Med").length;
                        const lowCount = clauses.filter(c => c.riskLevel === "Low").length;
                        const critPct = analysis ? Math.round((critCount / total) * 100) : 14;
                        const highPct = analysis ? Math.round((highCount / total) * 100) : 43;
                        const medPct = analysis ? Math.round((medCount / total) * 100) : 29;
                        const lowPct = analysis ? Math.round((lowCount / total) * 100) : 14;

                        // SVG donut: 4 segments stacked from top, order: Low → Med → High → Critical
                        const R = 42, strokeW = 11;
                        const CIRC = 2 * Math.PI * R;
                        const lowD = (lowPct / 100) * CIRC;
                        const medD = (medPct / 100) * CIRC;
                        const highD = (highPct / 100) * CIRC;
                        const critD = (critPct / 100) * CIRC;
                        const startOff = CIRC * 0.25; // top
                        const medOff = startOff - lowD;
                        const highOff = medOff - medD;
                        const critOff = highOff - highD;

                        // Center shows dominant pct with label
                        const dominantPct = Math.max(critPct, highPct, medPct, lowPct);
                        const domLabel = dominantPct === critPct ? `${critPct}` : dominantPct === highPct ? `${highPct}` : dominantPct === medPct ? `${medPct}` : `${lowPct}`;
                        const domSub = analysis ? "dominant" : "dominant";

                        // Top clauses for CLAUSE SCORES
                        const topClauses = (analysis?.clauses || [])
                            .sort((a, b) => b.riskScore - a.riskScore)
                            .slice(0, 5);

                        return (
                            <>
                                {/* RISK BREAKDOWN header */}
                                <div style={{ padding: "20px 18px 16px", borderBottom: "1px solid #0F1115" }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                                        <div style={{ fontSize: 10, color: "#C49E6C", fontFamily: "IBM Plex Mono,monospace", letterSpacing: "0.12em", fontWeight: 600 }}>RISK BREAKDOWN</div>
                                        {analysis && (
                                            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                                <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
                                                    style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
                                                <span style={{ fontSize: 9, color: "#22c55e", fontFamily: "IBM Plex Mono,monospace", fontWeight: 600 }}>LIVE</span>
                                            </div>
                                        )}
                                    </div>

                                    {!analysis ? (
                                        <div style={{ fontSize: 11, color: "#333", paddingBottom: 8 }}>No analysis yet</div>
                                    ) : (
                                        <>
                                            {/* Donut */}
                                            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                                                <AnimatedDonut lowPct={lowPct} medPct={medPct} highPct={highPct} critPct={critPct} domLabel={domLabel} domSub={domSub} />
                                            </div>

                                            {/* Legend: Low / Med / High / Critical */}
                                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                                {[
                                                    { label: "Low Risk", pct: lowPct, color: "#22c55e" },
                                                    { label: "Med Risk", pct: medPct, color: "#f59e0b" },
                                                    { label: "High Risk", pct: highPct, color: "#ef4444" },
                                                    { label: "Critical Risk", pct: critPct, color: "#dc2626" },
                                                ].map(({ label, pct, color }) => (
                                                    <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                                            <div style={{ width: 7, height: 7, borderRadius: "50%", background: color }} />
                                                            <span style={{ fontSize: 11, color: "#777" }}>{label}</span>
                                                        </div>
                                                        <span style={{ fontSize: 11, fontWeight: 700, color, fontFamily: "IBM Plex Mono,monospace" }}>
                                                            <AnimatedNumber value={pct} />%
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* CLAUSE SCORES */}
                                <div style={{ padding: "16px 18px", borderBottom: "1px solid #0F1115" }}>
                                    <div style={{ fontSize: 10, color: "#C49E6C", fontFamily: "IBM Plex Mono,monospace", letterSpacing: "0.12em", fontWeight: 600, marginBottom: 12 }}>CLAUSE SCORES</div>
                                    {topClauses.length === 0 ? (
                                        <div style={{ fontSize: 11, color: "#333" }}>No analysis yet</div>
                                    ) : (
                                        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                                            {topClauses.map((c, i) => {
                                                const barColor = c.riskScore >= 80 ? "#ef4444" : c.riskScore >= 60 ? "#f59e0b" : "#22c55e";
                                                const shortTitle = c.title.length > 20 ? c.title.slice(0, 19) + "…" : c.title;
                                                return (
                                                    <div key={i}>
                                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                                                            <span style={{ fontSize: 10, color: "#666", fontFamily: "IBM Plex Mono,monospace" }}>{shortTitle}</span>
                                                            <span style={{ fontSize: 10, fontWeight: 700, color: barColor, fontFamily: "IBM Plex Mono,monospace" }}>
                                                                <AnimatedNumber value={c.riskScore} />
                                                            </span>
                                                        </div>
                                                        <div style={{ background: "#131518", height: 3, borderRadius: 2, overflow: "hidden" }}>
                                                            <AnimatedProgressBar score={c.riskScore} color={barColor} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {(analysis?.clauses?.length || 0) > 5 && (
                                                <div style={{ fontSize: 10, color: "#333", textAlign: "center", marginTop: 2 }}>+{(analysis?.clauses?.length || 0) - 5} more clauses</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </>
                        );
                    })()}

                    {/* ── RECENT ACTIVITY ── */}
                    <div style={{ padding: "16px 18px 12px", borderBottom: "1px solid #0F1115" }}>
                        <div style={{ fontSize: 10, color: "#C49E6C", fontFamily: "IBM Plex Mono,monospace", letterSpacing: "0.12em", fontWeight: 600, marginBottom: 12 }}>RECENT ACTIVITY</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            {analysis && (
                                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: "1px solid #0F1115" }}>
                                    <div style={{ width: 30, height: 30, borderRadius: 7, background: analysis.riskLevel === "Critical" || analysis.riskLevel === "High" ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.10)", border: `1px solid ${analysis.riskLevel === "Critical" || analysis.riskLevel === "High" ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                        <svg width="12" height="12" fill="none" stroke={analysis.riskLevel === "Critical" || analysis.riskLevel === "High" ? "#ef4444" : "#22c55e"} strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 11, color: "#DDD", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{analysis.fileName}</div>
                                        <div style={{ fontSize: 10, color: "#444", marginTop: 1 }}>Just now</div>
                                    </div>
                                </div>
                            )}
                            {contractHistory.slice(0, analysis ? 2 : 3).map((c, i) => {
                                const diffMs = Date.now() - c.id;
                                const diffMin = Math.floor(diffMs / 60000);
                                const diffHr = Math.floor(diffMs / 3600000);
                                const timeStr = diffMin < 1 ? "Just now" : diffMin < 60 ? `${diffMin}m ago` : diffHr < 24 ? `${diffHr}h ago` : `${Math.floor(diffHr / 24)}d ago`;
                                const isHigh = c.riskLevel === "Critical" || c.riskLevel === "High";
                                return (
                                    <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: i < (analysis ? 1 : 2) ? "1px solid #0F1115" : "none", cursor: "pointer" }}
                                        onClick={() => { setAnalysis(c.analysis); setViewingContract(c); setActiveNav("Reports"); }}>
                                        <div style={{ width: 30, height: 30, borderRadius: 7, background: isHigh ? "rgba(239,68,68,0.10)" : "rgba(196,158,108,0.09)", border: `1px solid ${isHigh ? "rgba(239,68,68,0.18)" : "rgba(196,158,108,0.16)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                            <svg width="12" height="12" fill="none" stroke={isHigh ? "#ef4444" : "#C49E6C"} strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 11, color: "#BBB", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.fileName}</div>
                                            <div style={{ fontSize: 10, color: "#444", marginTop: 1 }}>{timeStr}</div>
                                        </div>
                                    </div>
                                );
                            })}
                            {contractHistory.length === 0 && !analysis && (
                                <div style={{ fontSize: 11, color: "#333", padding: "4px 0" }}>No contracts yet</div>
                            )}
                        </div>
                    </div>


                </aside >
                {/* ── END OF MAIN CONTENT AND RIGHT PANEL */}
            </div>
        </div >
    );
}
