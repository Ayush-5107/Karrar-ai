/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";

export function UpgradeModal({ onClose }) {
    const plans = [
        { name: "Starter", price: "₹499", period: "/month", analyses: "3 analyses/month", features: ["Full risk report", "Counter proposals", "Plain language", "Email support"], color: "#3b82f6" },
        { name: "Professional", price: "₹1,499", period: "/month", analyses: "Unlimited analyses", features: ["Everything in Starter", "Contract history", "Priority processing", "Download reports", "Lawyer referral"], color: "#C49E6C", popular: true },
        { name: "Enterprise", price: "Custom", period: "", analyses: "Unlimited + API access", features: ["Everything in Pro", "API integration", "Team accounts", "Custom Indian law KB", "Dedicated support"], color: "#8b5cf6" },
    ];
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", backdropFilter: "blur(12px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <motion.div initial={{ scale: 0.94, y: 20 }} animate={{ scale: 1, y: 0 }} style={{ background: "#0D0F13", border: "1px solid rgba(196,158,108,0.2)", borderRadius: 20, padding: "32px 28px", maxWidth: 720, width: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div>
                        <div style={{ fontFamily: "Playfair Display,serif", fontSize: 22, fontWeight: 700 }}>Upgrade Your Plan</div>
                        <div style={{ fontSize: 12, color: "#555", marginTop: 3 }}>You've used your free analyses this month</div>
                    </div>
                    <button onClick={onClose} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: 18 }}>✕</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginTop: 20 }}>
                    {plans.map(p => (
                        <div key={p.name} style={{ background: "#0A0B0E", border: `1px solid ${p.popular ? "rgba(196,158,108,0.35)" : "#1A1D22"}`, borderRadius: 14, padding: "18px 16px", position: "relative" }}>
                            {p.popular && <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg,#C49E6C,#F5D08A)", color: "#000", fontSize: 10, fontWeight: 700, padding: "3px 12px", borderRadius: 20 }}>MOST POPULAR</div>}
                            <div style={{ fontSize: 13, fontWeight: 600, color: p.color, marginBottom: 6 }}>{p.name}</div>
                            <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "Playfair Display,serif", color: "#FFF" }}>{p.price}<span style={{ fontSize: 12, color: "#444", fontFamily: "DM Sans,sans-serif" }}>{p.period}</span></div>
                            <div style={{ fontSize: 11, color: "#C49E6C", marginBottom: 12, marginTop: 2 }}>{p.analyses}</div>
                            {p.features.map(f => (
                                <div key={f} style={{ display: "flex", gap: 7, alignItems: "flex-start", marginBottom: 7 }}>
                                    <svg width="10" height="10" fill="none" stroke="#22c55e" strokeWidth="2.5" viewBox="0 0 24 24" style={{ marginTop: 2, flexShrink: 0 }}><polyline points="20 6 9 17 4 12" /></svg>
                                    <span style={{ fontSize: 11, color: "#777" }}>{f}</span>
                                </div>
                            ))}
                            <motion.button whileHover={{ scale: 1.03 }} style={{ marginTop: 14, width: "100%", padding: "9px", borderRadius: 9, border: `1px solid ${p.color}44`, background: `${p.color}12`, color: p.color, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "DM Sans,sans-serif" }}>
                                {p.name === "Enterprise" ? "Contact Sales" : "Continue →"}
                            </motion.button>
                        </div>
                    ))}
                </div>
                <div style={{ textAlign: "center", marginTop: 14, fontSize: 11, color: "#333", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <img src="https://razorpay.com/favicon.ico" width="14" height="14" style={{ opacity: 0.4 }} onError={e => e.target.style.display = "none"} />
                    <span>Secured by Razorpay · Cancel anytime · No hidden fees</span>
                </div>
            </motion.div>
        </motion.div>
    );
}
