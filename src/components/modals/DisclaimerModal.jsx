import { useState } from "react";
/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";

export function DisclaimerModal({ onAccept }) {
    const [dontShow, setDontShow] = useState(false);
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "fixed", inset: 0, background: "rgba(3,4,6,0.6)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} style={{ background: "rgba(13, 15, 19, 0.65)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "34px", maxWidth: 520, width: "100%", position: "relative", overflow: "hidden", boxShadow: "0 30px 60px rgba(0,0,0,0.6), 0 0 100px rgba(196,158,108,0.05)" }}>
                
                {/* Glow behind the modal content */}
                <div style={{ position: "absolute", top: "-50%", left: "-20%", width: "150%", height: "150%", background: "radial-gradient(circle at top left, rgba(196,158,108,0.06), transparent 50%)", pointerEvents: "none" }} />
                
                <div style={{ position: "relative", zIndex: 2 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(196,158,108,0.12)", border: "1px solid rgba(196,158,108,0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "#C49E6C", marginBottom: 20, boxShadow: "0 0 20px rgba(196,158,108,0.15)" }}>
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" /></svg>
                    </div>
                    <div style={{ fontFamily: "Outfit, sans-serif", fontSize: 26, fontWeight: 700, marginBottom: 14, letterSpacing: "-0.01em", color: "#FFF" }}>Before You Read This Report</div>
                    <div style={{ fontSize: 14, color: "#999", lineHeight: 1.7, marginBottom: 24 }}>
                        Karrar.ai provides <strong style={{ color: "#FFF", fontWeight: 600 }}>AI-generated legal intelligence</strong>, not legal advice. We are not a law firm and this output does not constitute legal advice under the Advocates Act, 1961.<br /><br />
                        All findings should be <strong style={{ color: "#FFF", fontWeight: 600 }}>verified with a licensed advocate</strong> for critical decisions. Analysis is grounded in Indian law but may not reflect the most recent amendments or case law.<br /><br />
                        <span style={{ color: "#C49E6C", fontWeight: 700, letterSpacing: "0.02em" }}>Confidence scores</span> are shown on every clause — treat lower-confidence findings with additional caution.
                    </div>
                    
                    <div style={{ padding: "0 0 24px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 24 }}>
                        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", width: "max-content" }}>
                            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <input type="checkbox" checked={dontShow} onChange={e => setDontShow(e.target.checked)} style={{ width: 18, height: 18, opacity: 0, position: "absolute", cursor: "pointer", zIndex: 10 }} />
                                <div style={{ width: 18, height: 18, borderRadius: 5, border: dontShow ? "1px solid #C49E6C" : "1px solid rgba(255,255,255,0.2)", background: dontShow ? "#C49E6C" : "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                                    {dontShow && <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} width="12" height="12" fill="none" stroke="#000" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></motion.svg>}
                                </div>
                            </div>
                            <span style={{ fontSize: 13, color: "#AAA", fontWeight: 500, userSelect: "none" }}>Don't show this again</span>
                        </label>
                    </div>
                    
                    <motion.button whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(196,158,108,0.2)" }} whileTap={{ scale: 0.98 }} onClick={() => onAccept(dontShow)}
                        style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg,#C49E6C,#F5D08A)", color: "#000", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "DM Sans,sans-serif", display: "flex", justifyContent: "center", alignItems: "center" }}>
                        I Understand — Show My Report
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
}
