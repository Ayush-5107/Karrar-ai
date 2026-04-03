/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { KarrarLogo } from "../components/ui/logo";

export function LoginPage({ onBack, onSuccess, initialIsSignUp }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [remember, setRemember] = useState(false);
    const [isSignUp, setIsSignUp] = useState(initialIsSignUp || false);
    const [mouse, setMouse] = useState({ x: -999, y: -999 });

    useEffect(() => {
        const onMove = (e) => setMouse({ x: e.clientX, y: e.clientY });
        window.addEventListener("mousemove", onMove);
        return () => window.removeEventListener("mousemove", onMove);
    }, []);

    return (
        <div style={{
            minHeight: "100vh", background: "#000000", display: "flex",
            flexDirection: "column", alignItems: "center", justifyContent: "center",
            fontFamily: "Inter, sans-serif", color: "#FFFFFF", position: "relative", overflow: "hidden",
        }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .li { width:100%; background:#050505; border:1px solid #1E2228; border-radius:12px; padding:15px 18px; color:#FFFFFF; font-size:14px; font-family:"Inter",sans-serif; outline:none; transition:border-color 0.2s,box-shadow 0.2s; }
        .li::placeholder { color:#4A4F5E; }
        .li:focus { border-color:rgba(196,158,108,0.6); box-shadow:0 0 0 4px rgba(196,158,108,0.08); background:#0A0B0E; }
        .li:hover:not(:focus) { border-color:#2A2D3A; }
        .lgbtn { width:100%; background:linear-gradient(90deg,#C49E6C 0%,#F5D08A 100%); color:#000000; font-weight:700; font-size:15px; border:none; border-radius:12px; padding:15px; cursor:pointer; font-family:"Inter",sans-serif; transition:all 0.25s; box-shadow:0 8px 24px rgba(0,0,0,0.5); }
        .lgbtn:hover { box-shadow:0 0 40px rgba(196,158,108,0.4),0 12px 32px rgba(0,0,0,0.5); transform:translateY(-2px); }
        .lgbtn:active { transform:translateY(0); }
        .ggbtn { width:100%; background:#050505; color:#E0E0E0; font-size:14px; border:1px solid #1E2228; border-radius:12px; padding:14px; cursor:pointer; font-family:"Inter",sans-serif; font-weight:500; display:flex; align-items:center; justify-content:center; gap:12px; transition:all 0.2s; }
        .ggbtn:hover { border-color:rgba(196,158,108,0.35); background:#0A0B0E; color:#FFFFFF; }
        .lnk { color:#C49E6C; cursor:pointer; font-weight:600; transition:color 0.15s; }
        .lnk:hover { color:#F5D08A; }
        .lchk { width:16px; height:16px; accent-color:#C49E6C; cursor:pointer; background:#050505; border:1px solid #1E2228; border-radius: 4px; }
        @keyframes gridPulse { 0%,100%{opacity:0.35} 50%{opacity:0.55} }
      `}</style>

            {/* Cursor glow */}
            <div style={{ position: "fixed", pointerEvents: "none", zIndex: 9999, left: mouse.x - 300, top: mouse.y - 300, width: 600, height: 600, background: "radial-gradient(circle, rgba(196,158,108,0.08) 0%, rgba(196,158,108,0.03) 35%, transparent 70%)", borderRadius: "50%", transition: "left 0.08s ease-out, top 0.08s ease-out" }} />

            {/* Dot grid */}
            <div style={{ position: "fixed", inset: 0, backgroundImage: "radial-gradient(circle, #b5924c1a 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none", zIndex: 0, animation: "gridPulse 6s ease-in-out infinite" }} />

            {/* Radial ambient glow */}
            <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 700, height: 700, background: "radial-gradient(circle, rgba(196,158,108,0.055) 0%, transparent 60%)", borderRadius: "50%", pointerEvents: "none", zIndex: 0 }} />
            <div style={{ position: "fixed", top: "-10%", right: "-5%", width: 400, height: 400, background: "radial-gradient(circle, rgba(196,158,108,0.025) 0%, transparent 60%)", borderRadius: "50%", pointerEvents: "none", zIndex: 0 }} />

            {/* Back button */}
            <motion.button
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}
                onClick={onBack}
                style={{ position: "fixed", top: 24, left: 28, background: "rgba(10,11,14,0.8)", backdropFilter: "blur(8px)", border: "1px solid #1E2228", borderRadius: 8, color: "#888", fontSize: 13, padding: "7px 15px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, zIndex: 100, fontFamily: "Inter, sans-serif" }}
                whileHover={{ borderColor: "rgba(196,158,108,0.35)", color: "#C49E6C" }}
                whileTap={{ scale: 0.97 }}
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
                Back
            </motion.button>

            {/* Card */}
            <motion.div
                initial={{ opacity: 0, y: 36, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                style={{
                    position: "relative", zIndex: 10,
                    width: "100%", maxWidth: 420, margin: "0 16px",
                    background: "#0A0B0E",
                    border: "1px solid #1E2228",
                    borderRadius: 24,
                    padding: "36px 36px 28px",
                    boxShadow: "0 40px 100px rgba(0,0,0,0.85), 0 0 0 0.5px rgba(196,158,108,0.08), 0 0 80px rgba(196,158,108,0.03)",
                }}
            >
                {/* Top shimmer line */}
                <div style={{ position: "absolute", top: 0, left: "15%", right: "15%", height: 1, background: "linear-gradient(90deg, transparent, rgba(196,158,108,0.6), transparent)", borderRadius: 1 }} />
                {/* Bottom faint line */}
                <div style={{ position: "absolute", bottom: 0, left: "30%", right: "30%", height: 1, background: "linear-gradient(90deg, transparent, rgba(196,158,108,0.15), transparent)", borderRadius: 1 }} />

                {/* Logo lockup */}
                <motion.div
                    initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
                    style={{ textAlign: "center", marginBottom: 2 }}
                >
                    <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 4 }}>
                        <KarrarLogo size={42} wordmark={true} />
                    </div>
                    <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: "#C49E6C", letterSpacing: "0.12em", fontWeight: 600, marginTop: 4 }}>MULTI-AGENT LEGAL INTELLIGENCE</div>
                </motion.div>

                {/* Divider */}
                <div style={{ margin: "20px 0 20px", height: 1, background: "linear-gradient(90deg, transparent, #1E2228 20%, #1E2228 80%, transparent)" }} />

                {/* Heading */}
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.25 }}
                    style={{ textAlign: "center", marginBottom: 24 }}
                >
                    <h2 style={{ fontSize: 26, fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.03em", marginBottom: 4 }}>
                        {isSignUp ? "Create Account" : "Welcome Back"}
                    </h2>
                    <p style={{ fontSize: 14, color: "#666", fontWeight: 400 }}>
                        {isSignUp ? "Start reviewing contracts with AI today" : "Sign in to your Karrar.ai account"}
                    </p>
                </motion.div>

                {/* Form */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
                    style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                    {isSignUp && (
                        <input className="li" type="text" placeholder="Full Name" />
                    )}

                    <input
                        className="li" type="email" placeholder="Email Address"
                        value={email} onChange={e => setEmail(e.target.value)}
                    />

                    <div style={{ position: "relative" }}>
                        <input
                            className="li" type={showPass ? "text" : "password"} placeholder="Password"
                            value={password} onChange={e => setPassword(e.target.value)}
                            style={{ paddingRight: 46 }}
                        />
                        <button
                            onClick={() => setShowPass(!showPass)}
                            style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: showPass ? "#C49E6C" : "#555", padding: 0, display: "flex", alignItems: "center", transition: "color 0.2s" }}
                        >
                            {showPass ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                            )}
                        </button>
                    </div>

                    {/* Remember + Forgot */}
                    {!isSignUp && (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4, marginBottom: 2 }}>
                            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "#666" }}>
                                <input type="checkbox" className="lchk" checked={remember} onChange={e => setRemember(e.target.checked)} />
                                Remember me
                            </label>
                            <span className="lnk" style={{ fontSize: 13, fontWeight: 500 }}>Forgot Password?</span>
                        </div>
                    )}

                    {/* Primary CTA */}
                    <motion.button
                        className="lgbtn"
                        whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.98 }}
                        style={{ marginTop: 8 }}
                        onClick={onSuccess}
                    >
                        {isSignUp ? "Create Account →" : "Login →"}
                    </motion.button>

                    {/* Divider */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "6px 0" }}>
                        <div style={{ flex: 1, height: 1, background: "#1E2228" }} />
                        <span style={{ fontSize: 12, color: "#555", fontFamily: "JetBrains Mono, monospace" }}>OR</span>
                        <div style={{ flex: 1, height: 1, background: "#1E2228" }} />
                    </div>

                    {/* Google */}
                    <motion.button className="ggbtn" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={onSuccess}>
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </motion.button>

                    {/* Demo credentials */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "6px 0" }}>
                        <div style={{ flex: 1, height: 1, background: "#1E2228" }} />
                        <span style={{ fontSize: 11, color: "#555", fontFamily: "JetBrains Mono, monospace" }}>DEMO</span>
                        <div style={{ flex: 1, height: 1, background: "#1E2228" }} />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.01, borderColor: "rgba(196,158,108,0.5)", background: "rgba(196,158,108,0.06)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => { setEmail("demo@karrar.ai"); setPassword("Demo@1234"); setIsSignUp(false); setTimeout(onSuccess, 400); }}
                        style={{
                            width: "100%", background: "rgba(196,158,108,0.03)", border: "1px dashed rgba(196,158,108,0.25)",
                            borderRadius: 12, padding: "13px 16px", cursor: "pointer",
                            fontFamily: "Inter, sans-serif", color: "#C49E6C", fontSize: 13, fontWeight: 500,
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                            transition: "all 0.2s",
                        }}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                        </svg>
                        Use Demo Credentials
                    </motion.button>
                </motion.div>

                {/* Trust badges */}
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }}
                    style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 8 }}
                >
                    {["Contracts are end-to-end encrypted", "Contracts are never used for training", "Compliant with Indian DPDP Act"].map((t, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(196,158,108,0.6)" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                            <span style={{ fontSize: 12, color: "#666" }}>{t}</span>
                        </div>
                    ))}
                </motion.div>

                {/* Bottom switch */}
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.55 }}
                    style={{ marginTop: 28, textAlign: "center", fontSize: 13, color: "#666", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                    {isSignUp ? (
                        <span>Already have an account? <span className="lnk" onClick={() => setIsSignUp(false)}>Login</span></span>
                    ) : (
                        <span>No account? <span className="lnk" onClick={() => setIsSignUp(true)}>Sign up ›</span></span>
                    )}
                </motion.div>
            </motion.div>
        </div>
    );
}
