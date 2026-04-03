/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";

export function LawyerWarningModal({ analysis, onContinue, onLawyer }) {
    const critical = analysis.clauses.filter(c => c.riskLevel === "Critical" || c.riskLevel === "High").slice(0, 2);
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "fixed", inset: 0, background: "rgba(3,4,6,0.6)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} style={{ background: "rgba(13, 15, 19, 0.65)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 20, padding: "34px", maxWidth: 520, width: "100%", position: "relative", overflow: "hidden", boxShadow: "0 30px 60px rgba(0,0,0,0.6), 0 0 100px rgba(239,68,68,0.08)" }}>
                
                {/* Red warning mesh behind the modal content */}
                <div style={{ position: "absolute", top: "-50%", left: "-20%", width: "150%", height: "150%", background: "radial-gradient(circle at top right, rgba(239,68,68,0.08), transparent 50%)", pointerEvents: "none" }} />
                
                <div style={{ position: "relative", zIndex: 2 }}>
                    <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 20 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444", flexShrink: 0, boxShadow: "0 0 20px rgba(239,68,68,0.15)" }}>
                            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                        </div>
                        <div>
                            <div style={{ fontFamily: "Outfit, sans-serif", fontSize: 22, fontWeight: 700, color: "#FFF", marginBottom: 4, letterSpacing: "-0.01em" }}>High Risk Contract Detected</div>
                            <div style={{ fontSize: 13, color: "#ef4444", fontWeight: 600 }}>Overall Risk Score: {analysis.overallScore}/10 — {analysis.riskLevel}</div>
                        </div>
                    </div>
                    
                    <div style={{ fontSize: 14, color: "#999", marginBottom: 20, lineHeight: 1.7 }}>
                        Our system has identified <strong style={{ color: "#ef4444", fontWeight: 600 }}>{analysis.agentOutputs.risk.critical} critical</strong> and <strong style={{ color: "#f59e0b", fontWeight: 600 }}>{analysis.agentOutputs.risk.high} high-risk</strong> clauses. We strongly recommend consulting a lawyer before signing.
                    </div>
                    
                    <div style={{ marginBottom: 24 }}>
                        {critical.map(c => (
                            <div key={c.id} style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 12, padding: "14px", marginBottom: 10 }}>
                                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: "#FFF", letterSpacing: "0.01em" }}>{c.title}</span>
                                    <span style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 12, padding: "2px 8px", fontSize: 11, fontWeight: 700, color: "#ef4444", fontFamily: "JetBrains Mono, monospace" }}>{c.riskScore}/100</span>
                                </div>
                                <div style={{ fontSize: 13, color: "#888", lineHeight: 1.6 }}>{c.plain}</div>
                            </div>
                        ))}
                    </div>
                    
                    <div style={{ display: "flex", gap: 12 }}>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onLawyer} style={{ flex: 1, padding: "14px", background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 10, color: "#d8b4fe", cursor: "pointer", fontSize: 14, fontWeight: 700, fontFamily: "DM Sans,sans-serif", display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" /></svg>
                                Consult a Lawyer First
                            </div>
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(196,158,108,0.2)" }} whileTap={{ scale: 0.98 }} onClick={onContinue} style={{ flex: 1, padding: "14px", background: "linear-gradient(135deg,#C49E6C,#F5D08A)", border: "none", borderRadius: 10, color: "#000", cursor: "pointer", fontSize: 14, fontWeight: 700, fontFamily: "DM Sans,sans-serif" }}>
                            View Full Report →
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
