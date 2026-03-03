/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { KarrarLogo } from "../components/ui/logo";
import { LEGAL_ICONS, WmScales, WmSeal, WmQuill, WmPillar } from "../components/ui/icons";
import { AnimatedHeadline, FadeUp, StaggerContainer, StaggerChild, MotionCard } from "../components/ui/motion";
import { Counter } from "../components/ui/counter";
import { RiskBadge } from "../components/ui/risk-badge";
import { DashboardPreview } from "../components/sections/DashboardPreview";
import { useScrollProgress } from "../hooks/useScrollProgress";

export function Landing({ onLogin }) {
    const [scrolled, setScrolled] = useState(false);
    const [activeNav, setActiveNav] = useState("Home");
    const [mobileOpen, setMobileOpen] = useState(false);
    const dashRef = useRef(null);
    const dashProgress = useScrollProgress(dashRef);
    const [uploadState, setUploadState] = useState("idle");
    const [progress, setProgress] = useState(0);
    const [progressLabel, setProgressLabel] = useState("");
    const mouseX = useMotionValue(-999);
    const mouseY = useMotionValue(-999);
    const springConfig = { damping: 25, stiffness: 250, mass: 0.5 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    useEffect(() => {
        const onMove = (e) => {
            mouseX.set(e.clientX - 300);
            mouseY.set(e.clientY - 300);
        };
        window.addEventListener("mousemove", onMove);
        return () => window.removeEventListener("mousemove", onMove);
    }, [mouseX, mouseY]);

    useEffect(() => {
        const h = () => {
            setScrolled(window.scrollY > 40);
            // Scroll spy — update active nav based on which section is in view
            const sections = ["home", "how-it-works", "agents", "features", "pricing", "about"];
            const labelMap = {
                "home": "Home",
                "how-it-works": "How It Works",
                "agents": "Agents",
                "features": "Features",
                "pricing": "Pricing",
                "about": "About",
            };
            for (let i = sections.length - 1; i >= 0; i--) {
                const el = document.getElementById(sections[i]);
                if (el && el.getBoundingClientRect().top <= 100) {
                    setActiveNav(labelMap[sections[i]]);
                    break;
                }
            }
        };
        window.addEventListener("scroll", h);
        return () => window.removeEventListener("scroll", h);
    }, []);

    const triggerAnalysis = () => {
        setUploadState("analyzing");
        const steps = [[10, "Parsing PDF…"], [30, "Completeness Agent…"], [50, "Risk Scoring Agent…"], [65, "Negotiation Agent…"], [80, "Consistency Agent…"], [92, "Regulatory Agent…"], [100, "Analysis complete."]];
        let i = 0;
        const next = () => {
            if (i < steps.length) { setProgress(steps[i][0]); setProgressLabel(steps[i][1]); i++; setTimeout(next, i === steps.length ? 400 : 600); }
            else setTimeout(() => setUploadState("done"), 300);
        };
        next();
    };

    const NAV = ["Home", "How It Works", "Agents", "Features", "Pricing", "About"];

    const NAV_IDS = {
        "Home": "home",
        "How It Works": "how-it-works",
        "Agents": "agents",
        "Features": "features",
        "Pricing": "pricing",
        "About": "about",
    };

    const scrollToSection = (navLabel) => {
        setActiveNav(navLabel);
        const id = NAV_IDS[navLabel];
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    // Dashboard transform based on scroll progress
    const dashY = (1 - dashProgress) * 120;           // slides up from below
    const dashScale = 0.88 + dashProgress * 0.12;     // scales from 88% to 100%
    const dashOpacity = Math.min(1, dashProgress * 1.5);
    const glowOpacity = dashProgress * 0.6;

    return (
        <div style={{ fontFamily: "DM Sans, sans-serif", background: "#000000", color: "#FFFFFF", overflowX: "hidden", position: "relative" }}>
            {/* ── CURSOR GLOW ── follows mouse, gold radial */}
            <motion.div style={{
                position: "fixed", pointerEvents: "none", zIndex: 9999,
                left: 0, top: 0,
                x: springX, y: springY,
                width: 600, height: 600,
                background: "radial-gradient(circle, rgba(196,158,108,0.07) 0%, rgba(196,158,108,0.03) 35%, transparent 70%)",
                borderRadius: "50%",
            }} />
            {/* ── AMBIENT BACKGROUND GLOWS (static, scattered) ── */}
            <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
                <div style={{ position: "absolute", top: "15%", left: "10%", width: 500, height: 500, background: "radial-gradient(circle, rgba(196,158,108,0.04) 0%, transparent 65%)", borderRadius: "50%" }} />
                <div style={{ position: "absolute", top: "60%", right: "5%", width: 400, height: 400, background: "radial-gradient(circle, rgba(196,158,108,0.035) 0%, transparent 65%)", borderRadius: "50%" }} />
                <div style={{ position: "absolute", bottom: "10%", left: "30%", width: 350, height: 350, background: "radial-gradient(circle, rgba(196,158,108,0.03) 0%, transparent 65%)", borderRadius: "50%" }} />
            </div>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=DM+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }

        @keyframes float   { 0%,100%{transform:translateY(0)}   50%{transform:translateY(-16px)} }
        @keyframes float2  { 0%,100%{transform:translateY(0)}   50%{transform:translateY(-10px)} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse   { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.2)} }
        @keyframes spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        @keyframes goldBeam { 0%,100%{opacity:0} 50%{opacity:1} }
        @keyframes icFloat { 0%,100%{transform:translateY(0) rotate(var(--rot))} 50%{transform:translateY(-12px) rotate(var(--rot))} }
        @keyframes floatCard { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes borderGlow { 0%,100%{box-shadow:0 0 0 rgba(196,158,108,0)} 50%{box-shadow:0 0 32px rgba(196,158,108,0.15)} }
        @keyframes typewriter { from{width:0} to{width:100%} }
        @keyframes blink { 50%{opacity:0} }
        .dash-stat-card { animation: floatCard 4s ease-in-out infinite; }
        .dash-stat-card:nth-child(2) { animation-delay: 0.7s; }
        .dash-stat-card:nth-child(3) { animation-delay: 1.4s; }

        .fade-up-1 { animation: fadeUp 0.9s 0.05s ease both; }
        .fade-up-2 { animation: fadeUp 0.9s 0.18s ease both; }
        .fade-up-3 { animation: fadeUp 0.9s 0.30s ease both; }
        .fade-up-4 { animation: fadeUp 0.9s 0.44s ease both; }
        .fade-up-5 { animation: fadeUp 0.9s 0.58s ease both; }
        .fade-up-6 { animation: fadeUp 0.9s 0.72s ease both; }

        .btn-gold {
          background: linear-gradient(90deg,#C49E6C,#F5D08A);
          color: #000; border: none; border-radius: 999px;
          font-family:'DM Sans',sans-serif; font-weight: 700; font-size: 15px;
          cursor: pointer; transition: all 0.28s; letter-spacing: 0.02em;
        }
        .btn-gold:hover { transform: translateY(-3px) scale(1.04); box-shadow: 0 0 40px rgba(196,158,108,0.55), 0 12px 32px rgba(0,0,0,0.5); }

        .btn-ghost {
          background: transparent; color: #fff;
          border: 1.5px solid rgba(196,158,108,0.4);
          border-radius: 999px;
          font-family:'DM Sans',sans-serif; font-weight: 600; font-size: 15px;
          cursor: pointer; transition: all 0.25s;
        }
        .btn-ghost:hover { border-color: #C49E6C; color: #F5D08A; box-shadow: 0 0 24px rgba(196,158,108,0.2); transform: translateY(-1px); }

        .btn-dark {
          background: linear-gradient(90deg,#C49E6C,#F5D08A);
          color:#000; border:none; border-radius:999px;
          font-family:'DM Sans',sans-serif; font-weight:700; font-size:15px;
          cursor:pointer; transition:all 0.25s;
        }
        .btn-dark:hover { transform:translateY(-2px) scale(1.03); box-shadow:0 0 32px rgba(196,158,108,0.45); }
        .btn-outline {
          background:transparent; color:#fff; border:1.5px solid rgba(196,158,108,0.5);
          border-radius:999px; padding:13px 32px; font-family:'DM Sans',sans-serif;
          font-weight:600; font-size:15px; cursor:pointer; transition:all 0.25s;
        }
        .btn-outline:hover { border-color:#C49E6C; color:#F5D08A; transform:translateY(-1px); }

        .nav-link {
          color:#B5B5B5; text-decoration:none; font-size:14px; font-weight:500;
          padding:6px 0; position:relative; transition:color 0.2s; cursor:pointer;
        }
        .nav-link::after { content:''; position:absolute; bottom:-2px; left:0; width:0; height:1.5px; background:linear-gradient(90deg,#C49E6C,#F5D08A); transition:width 0.25s; }
        .nav-link:hover, .nav-link.active { color:#fff; }
        .nav-link:hover::after, .nav-link.active::after { width:100%; }

        .card-hover { transition: all 0.28s; }
        .card-hover:hover { transform: translateY(-6px); box-shadow: 0 24px 64px rgba(0,0,0,0.7), 0 0 40px rgba(196,158,108,0.08) !important; }
        .agent-card:hover { border-color: rgba(196,158,108,0.4) !important; box-shadow: 0 16px 48px rgba(196,158,108,0.1) !important; }

        .upload-zone {
          border: 1.5px dashed #1E2228; border-radius: 20px; padding: 56px 32px;
          text-align: center; transition: all 0.28s; cursor: pointer; background: #0F1115;
        }
        .upload-zone:hover { border-color: #C49E6C; background: rgba(196,158,108,0.03); box-shadow: 0 0 48px rgba(196,158,108,0.08); }

        /* Dashboard glow container */
        .dash-glow {
          position: absolute; inset: -40px;
          background: radial-gradient(ellipse 70% 40% at 50% 100%, rgba(196,158,108,0.25) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
          filter: blur(20px);
        }

        section { scroll-margin-top: 80px; }

        /* ── RESPONSIVE GRID CLASSES ── */
        .grid-steps    { display:grid; grid-template-columns:repeat(5,1fr); gap:20px; }
        .grid-agents   { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; }
        .grid-compare  { display:grid; grid-template-columns:1fr 1fr; gap:28px; }
        .grid-pricing  { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; }
        .grid-footer   { display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:48px; margin-bottom:48px; }
        .stats-row     { display:flex; gap:56px; justify-content:center; flex-wrap:wrap; padding:0 32px; }

        /* ── DESKTOP NAV ── */
        .nav-desktop   { flex:1; display:flex; justify-content:center; gap:36px; }
        .nav-cta       { display:flex; gap:10px; }
        .hamburger     { display:none; background:none; border:none; cursor:pointer; padding:4px; }
        .mobile-drawer { display:none; }

        /* ── MOBILE BREAKPOINT (768px) ── */
        @media (max-width: 768px) {
          .hamburger      { display:flex; align-items:center; justify-content:center; }
          .nav-desktop    { display:none !important; }
          .nav-cta        { display:none !important; }

          .mobile-drawer {
            display:flex; flex-direction:column;
            position:fixed; top:60px; left:0; right:0; bottom:0;
            background:rgba(0,0,0,0.95); backdrop-filter:blur(24px);
            -webkit-backdrop-filter:blur(24px);
            padding:32px 24px; gap:8px; z-index:199;
            animation: fadeUp 0.25s ease;
          }
          .mobile-drawer .nav-link {
            font-size:18px; padding:14px 0;
            border-bottom:1px solid rgba(30,34,40,0.4);
          }
          .mobile-drawer .nav-link::after { display:none; }
          .mobile-drawer .mobile-cta {
            display:flex; flex-direction:column; gap:10px; margin-top:20px;
          }

          .grid-steps    { grid-template-columns:repeat(2,1fr); gap:14px; }
          .grid-agents   { grid-template-columns:1fr; gap:16px; }
          .grid-compare  { grid-template-columns:1fr; gap:20px; }
          .grid-pricing  { grid-template-columns:1fr; gap:18px; }
          .grid-footer   { grid-template-columns:1fr; gap:32px; }
          .stats-row     { gap:24px; padding:0 16px; }

          .section-pad   { padding-left:16px !important; padding-right:16px !important; }
          .section-y     { padding-top:72px !important; padding-bottom:72px !important; }
          .upload-zone   { padding:36px 20px; }
        }

        /* ── SMALL MOBILE (480px) ── */
        @media (max-width: 480px) {
          .grid-steps  { grid-template-columns:1fr; gap:12px; }
          .stats-row   { gap:16px; flex-direction:column; align-items:center; }
        }
      `}</style>

            {/* ── NAVBAR ─────────────────────────────────────────── */}
            <nav style={{
                position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
                background: scrolled ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0.35)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                borderBottom: scrolled ? "1px solid rgba(30,34,40,0.6)" : "1px solid rgba(30,34,40,0.15)",
                transition: "all 0.3s", padding: "0 20px",
            }}>
                <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", height: 60, gap: 32 }}>
                    <KarrarLogo size={32} />
                    <div className="nav-desktop">
                        {NAV.map(n => <span key={n} className={`nav-link${activeNav === n ? " active" : ""}`} onClick={() => scrollToSection(n)}>{n}</span>)}
                    </div>
                    <div className="nav-cta">
                        <button className="btn-ghost" style={{ padding: "8px 20px", fontSize: 13 }} onClick={onLogin}>Login</button>
                        <button className="btn-gold" style={{ padding: "9px 22px", fontSize: 13 }} onClick={onLogin}>Try Free →</button>
                    </div>
                    {/* Hamburger */}
                    <button className="hamburger" onClick={() => setMobileOpen(!mobileOpen)} style={{ marginLeft: "auto" }}>
                        {mobileOpen ? (
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#C49E6C" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        ) : (
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#C49E6C" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
                        )}
                    </button>
                </div>
            </nav>
            {/* ── MOBILE DRAWER ── */}
            {mobileOpen && (
                <div className="mobile-drawer">
                    {NAV.map(n => <span key={n} className={`nav-link${activeNav === n ? " active" : ""}`} onClick={() => { scrollToSection(n); setMobileOpen(false); }}>{n}</span>)}
                    <div className="mobile-cta">
                        <button className="btn-ghost" style={{ padding: "12px 20px", fontSize: 15, width: "100%" }} onClick={() => { onLogin(); setMobileOpen(false); }}>Login</button>
                        <button className="btn-gold" style={{ padding: "13px 22px", fontSize: 15, width: "100%" }} onClick={() => { onLogin(); setMobileOpen(false); }}>Try Free →</button>
                    </div>
                </div>
            )}

            {/* ── HERO — Centered layout (like Image 1 but dark) ── */}
            <section id="home" style={{ minHeight: "100vh", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", paddingTop: 60, flexDirection: "column" }}>

                {/* Watermark icons */}
                {LEGAL_ICONS.map((ic, i) => (
                    <div key={i} style={{
                        position: "absolute", left: `${ic.x}%`, top: `${ic.y}%`,
                        opacity: 0.055, color: "#C49E6C",
                        transform: `rotate(${ic.rot}deg)`,
                        pointerEvents: "none",
                        animation: `icFloat ${5 + i * 0.4}s ease-in-out infinite`,
                        "--rot": `${ic.rot}deg`,
                    }}>
                        <ic.Ic size={ic.size} />
                    </div>
                ))}

                {/* Dot grid */}
                <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, #b5924c1a 1px, transparent 1px)", backgroundSize: "30px 30px", pointerEvents: "none" }} />
                {/* Gold glow center */}
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 55% at 50% 45%, rgba(196,158,108,0.14) 0%, rgba(196,158,108,0.05) 50%, transparent 75%)", pointerEvents: "none" }} />
                {/* Subtle horizontal beam */}
                <div style={{ position: "absolute", top: "42%", left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent 0%, rgba(196,158,108,0.15) 30%, rgba(245,208,138,0.3) 50%, rgba(196,158,108,0.15) 70%, transparent 100%)", pointerEvents: "none", animation: "goldBeam 6s ease-in-out infinite" }} />

                {/* Content — centered */}
                <div style={{ textAlign: "center", maxWidth: 946, padding: "0 35px", position: "relative", zIndex: 1 }}>

                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 22 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "rgba(196,158,108,0.08)", border: "1px solid rgba(196,158,108,0.22)", borderRadius: 22, padding: "7px 18px", marginBottom: 35 }}
                    >
                        <motion.span
                            animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.3, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            style={{ width: 7, height: 7, borderRadius: "50%", background: "linear-gradient(90deg,#C49E6C,#F5D08A)", display: "inline-block" }}
                        />
                        <span style={{ fontSize: 13, color: "#C49E6C", fontFamily: "IBM Plex Mono, monospace", letterSpacing: "0.07em" }}>India's First Multi-Agent Legal AI — Now Live</span>
                    </motion.div>

                    {/* Logo lockup */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                        style={{ display: "flex", justifyContent: "center", marginBottom: 31 }}
                    >
                        <KarrarLogo size={57} />
                    </motion.div>

                    {/* Headline */}
                    <AnimatedHeadline style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(62px, 8.8vw, 106px)", fontWeight: 900, lineHeight: 1.02, marginBottom: 31, textShadow: "0 0 100px rgba(196,158,108,0.12)", perspective: 600 }}>
                        {"Understand. "}
                        <span style={{ background: "linear-gradient(90deg,#C49E6C,#F5D08A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontStyle: "italic" }}>Negotiate.</span>
                        {" Sign."}
                    </AnimatedHeadline>

                    {/* Subhead */}
                    <motion.p
                        initial={{ opacity: 0, y: 22 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.7, ease: "easeOut" }}
                        style={{ fontSize: "clamp(18px, 2.2vw, 22px)", color: "#888", lineHeight: 1.75, marginBottom: 9 }}
                    >
                        <strong style={{ color: "#FFFFFF" }}>India's First Multi-Agent Legal AI.</strong>
                    </motion.p>
                    <motion.p
                        initial={{ opacity: 0, y: 22 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.85, ease: "easeOut" }}
                        style={{ fontSize: "clamp(15px, 1.8vw, 19px)", color: "#666", lineHeight: 1.75, marginBottom: 44 }}
                    >
                        Audit Contracts, Analyze Risks &amp; Draft Counter-Terms in Plain English,{" "}
                        <span style={{ background: "linear-gradient(90deg,#C49E6C,#F5D08A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: 600 }}>Under Indian Law.</span>
                    </motion.p>

                    {/* CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 26 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 1.0, ease: "easeOut" }}
                        style={{ display: "flex", gap: 15, justifyContent: "center", flexWrap: "wrap", marginBottom: 44 }}
                    >
                        <motion.button
                            whileHover={{ scale: 1.04, boxShadow: "0 8px 32px rgba(196,158,108,0.35)" }}
                            whileTap={{ scale: 0.97 }}
                            className="btn-gold" style={{ padding: "18px 40px", fontSize: 18, display: "flex", alignItems: "center", gap: 11 }}
                            onClick={onLogin}
                        >
                            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 14V4" /><polyline points="8,8 12,4 16,8" /><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></svg>
                            Upload a Contract — It's Free
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.04, borderColor: "rgba(196,158,108,0.5)" }}
                            whileTap={{ scale: 0.97 }}
                            className="btn-ghost" style={{ padding: "18px 31px", fontSize: 18 }}
                        >Watch Demo →</motion.button>
                    </motion.div>

                    {/* Trust badges */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.7, delay: 1.2 }}
                        style={{ display: "flex", gap: 31, justifyContent: "center", flexWrap: "wrap" }}
                    >
                        {[
                            { label: "End-to-End Encrypted" },
                            { label: "Indian Law Grounded" },
                            { label: "90-Second Analysis" },
                        ].map((t, i) => (
                            <span key={i} style={{ fontSize: 13, color: "#444", fontFamily: "IBM Plex Mono, monospace", display: "flex", alignItems: "center", gap: 7 }}>
                                <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "rgba(196,158,108,0.5)" }} />
                                {t.label}
                            </span>
                        ))}
                    </motion.div>

                    {/* Legal icon row */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.2, delay: 1.5 }}
                        style={{ display: "flex", gap: 26, justifyContent: "center", marginTop: 57, opacity: 0.25, color: "#C49E6C" }}
                    >
                        {[WmScales, WmSeal, WmQuill, WmPillar, WmScales].map((Ic, i) => <Ic key={i} size={31} />)}
                    </motion.div>
                </div>

                {/* Bottom fade into dashboard section */}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 120, background: "linear-gradient(transparent, #000000)", pointerEvents: "none" }} />
            </section>

            {/* ── DASHBOARD SCROLL-REVEAL SECTION ─────────────── */}
            <section ref={dashRef} style={{ padding: "80px 0 0", background: "#000000", position: "relative", overflow: "hidden" }}>
                {/* Section label */}
                <FadeUp style={{ textAlign: "center", marginBottom: 48, padding: "0 32px" }}>
                    <span style={{ fontSize: 11, color: "#C49E6C", fontFamily: "IBM Plex Mono, monospace", letterSpacing: "0.14em", display: "block", marginBottom: 12 }}>THE PLATFORM</span>
                    <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(36px,5vw,60px)", fontWeight: 900, color: "#FFFFFF", lineHeight: 1.1 }}>
                        Your Intelligent<br />
                        <span style={{ background: "linear-gradient(90deg,#C49E6C,#F5D08A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontStyle: "italic" }}>Contract Command Centre</span>
                    </h2>
                    <p style={{ color: "#555", fontSize: 16, marginTop: 16 }}>6 AI agents. Real-time risk scoring. Counter-terms in one click.</p>
                </FadeUp>

                {/* Scroll-driven dashboard reveal */}
                <div style={{ position: "relative", maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
                    {/* Ambient glow behind dashboard */}
                    <div style={{ position: "absolute", bottom: 0, left: "10%", right: "10%", height: 200, background: `radial-gradient(ellipse 80% 100% at 50% 100%, rgba(196,158,108,${glowOpacity}) 0%, transparent 70%)`, filter: "blur(30px)", pointerEvents: "none", transition: "opacity 0.1s" }} />
                    {/* Top fade so it emerges from darkness */}
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 80, background: "linear-gradient(#000000, transparent)", zIndex: 10, pointerEvents: "none" }} />

                    {/* The actual dashboard — transforms driven by scroll */}
                    <div style={{
                        transform: `translateY(${dashY}px) scale(${dashScale})`,
                        opacity: dashOpacity,
                        transformOrigin: "top center",
                        transition: "none",
                        willChange: "transform, opacity",
                        borderRadius: "20px 20px 0 0",
                        boxShadow: `0 -8px 80px rgba(196,158,108,${glowOpacity * 0.8}), 0 0 0 1px rgba(196,158,108,${glowOpacity * 0.3})`,
                    }}>
                        <DashboardPreview />
                    </div>
                </div>
            </section>

            {/* ── STATS BAR ─────────────────────────────────────── */}
            <div style={{ background: "#050505", padding: "28px 0", borderTop: "1px solid #1E2228", borderBottom: "1px solid #1E2228" }}>
                <StaggerContainer stagger={0.15} delay={0.1} className="stats-row">
                    {[
                        { label: "Contracts Analyzed", value: 12400, suffix: "+" },
                        { label: "Risk Clauses Flagged", value: 84000, suffix: "+" },
                        { label: "Counter-Terms Generated", value: 31000, suffix: "+" },
                        { label: "Compliance Rate", value: 98, suffix: "%" },
                    ].map(s => (
                        <StaggerChild key={s.label} style={{ textAlign: "center" }}>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontFamily: "Playfair Display, serif", fontSize: 38, fontWeight: 700, background: "linear-gradient(90deg,#C49E6C,#F5D08A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                                    <Counter target={s.value} suffix={s.suffix} />
                                </div>
                                <div style={{ fontSize: 11, color: "#444", marginTop: 6, fontFamily: "IBM Plex Mono, monospace", letterSpacing: "0.08em" }}>{s.label.toUpperCase()}</div>
                            </div>
                        </StaggerChild>
                    ))}
                </StaggerContainer>
            </div>

            {/* ── HOW IT WORKS ──────────────────────────────────── */}
            <section id="how-it-works" className="section-pad section-y" style={{ padding: "120px 32px", background: "#000000" }}>
                <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                    <FadeUp style={{ textAlign: "center", marginBottom: 64 }}>
                        <span style={{ fontSize: 11, color: "#C49E6C", fontFamily: "IBM Plex Mono, monospace", letterSpacing: "0.12em" }}>THE PROCESS</span>
                        <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(36px,5vw,56px)", fontWeight: 900, color: "#FFFFFF", marginTop: 10 }}>From Upload to Insight</h2>
                        <p style={{ color: "#666", fontSize: 16, marginTop: 12 }}>in under 90 seconds</p>
                    </FadeUp>
                    <div style={{ position: "relative" }}>
                        <div style={{ position: "absolute", top: 36, left: "8%", right: "8%", height: 1, background: "linear-gradient(90deg,transparent,rgba(196,158,108,0.4),transparent)" }} />
                        <StaggerContainer stagger={0.1} delay={0.1} className="grid-steps">
                            {[
                                { num: "01", title: "Upload", desc: "Drag & drop your PDF contract. No account needed." },
                                { num: "02", title: "Parallel Analysis", desc: "6 agents analyze simultaneously in under 90 seconds." },
                                { num: "03", title: "Risk Report", desc: "Every clause scored 0–100 and ranked by severity." },
                                { num: "04", title: "Counter-Terms", desc: "Copy-paste professional alternative clauses instantly." },
                                { num: "05", title: "Act", desc: "Sign with clarity, negotiate, or consult a lawyer." },
                            ].map((s, i) => (
                                <StaggerChild key={i}>
                                    <MotionCard color="#C49E6C" style={{ background: "#0A0B0E", border: "1px solid #1E2228", borderRadius: 16, padding: "28px 18px", textAlign: "center", height: "100%" }}>
                                        <div style={{ width: 52, height: 52, background: "rgba(196,158,108,0.06)", border: "1px solid rgba(196,158,108,0.12)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                                            <span style={{ fontFamily: "Playfair Display, serif", fontSize: 22, fontWeight: 900, background: "linear-gradient(135deg,#C49E6C,#F5D08A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{i + 1}</span>
                                        </div>
                                        <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 10, color: "#C49E6C", letterSpacing: "0.1em", marginBottom: 8 }}>{s.num}</div>
                                        <div style={{ fontFamily: "Playfair Display, serif", fontSize: 16, fontWeight: 700, color: "#FFFFFF", marginBottom: 8 }}>{s.title}</div>
                                        <div style={{ fontSize: 12, color: "#555", lineHeight: 1.65 }}>{s.desc}</div>
                                    </MotionCard>
                                </StaggerChild>
                            ))}
                        </StaggerContainer>
                    </div>
                </div>
            </section>

            {/* ── AGENTS ────────────────────────────────────────── */}
            <section id="agents" className="section-pad section-y" style={{ padding: "120px 32px", background: "#030303", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(196,158,108,0.06) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />
                <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative" }}>
                    <FadeUp style={{ textAlign: "center", marginBottom: 64 }}>
                        <span style={{ fontSize: 11, color: "#C49E6C", fontFamily: "IBM Plex Mono, monospace", letterSpacing: "0.12em" }}>THE TEAM</span>
                        <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(36px,5vw,56px)", fontWeight: 900, color: "#FFFFFF", marginTop: 10 }}>Meet Your Legal Team</h2>
                        <p style={{ color: "#666", fontSize: 16, marginTop: 12 }}>6 specialized AI agents working in parallel on every upload</p>
                    </FadeUp>
                    <StaggerContainer stagger={0.12} delay={0.1} className="grid-agents">
                        {[
                            { name: "Completeness Agent", role: "Finds missing annexures & schedules", color: "#3b82f6", num: "01", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="10" cy="10" r="6" /><line x1="14.5" y1="14.5" x2="20" y2="20" /><polyline points="8,10 10,12 13,8" /></svg> },
                            { name: "Risk & Red Flag Agent", role: "Scores every clause 0–100", color: "#ef4444", num: "02", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 2L4 6v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V6L12 2z" /><line x1="12" y1="8" x2="12" y2="13" /><circle cx="12" cy="16" r="0.8" fill="currentColor" /></svg> },
                            { name: "Negotiation Agent", role: "Generates copy-paste counter-terms", color: "#C49E6C", num: "03", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M7 16H3v-4" /><path d="M3 12c0-4.4 3.6-8 8-8s8 3.6 8 8" /><path d="M17 8h4v4" /><path d="M21 12c0 4.4-3.6 8-8 8s-8-3.6-8-8" /></svg> },
                            { name: "Draft Consistency Agent", role: "Catches internal contradictions", color: "#8b5cf6", num: "04", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="5" width="11" height="14" rx="1.5" /><rect x="10" y="3" width="11" height="14" rx="1.5" fill="#030303" /><line x1="13" y1="8" x2="18" y2="8" /><line x1="13" y1="11" x2="17" y2="11" /></svg> },
                            { name: "Regulatory Agent", role: "Cross-checks Indian Contract Act", color: "#22c55e", num: "05", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><line x1="3" y1="12" x2="21" y2="12" /><path d="M12 3a14 14 0 0 1 3 9 14 14 0 0 1-3 9 14 14 0 0 1-3-9 14 14 0 0 1 3-9z" /></svg> },
                            { name: "Explanation Agent", role: "Translates legalese to plain English", color: "#f59e0b", num: "06", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /><line x1="8" y1="10" x2="10" y2="10" /><line x1="13" y1="10" x2="16" y2="10" /><line x1="9" y1="13" x2="15" y2="13" /></svg> },
                        ].map((a, i) => (
                            <StaggerChild key={i}>
                                <MotionCard color={a.color} style={{ background: "#0A0B0E", border: "1px solid #1E2228", borderRadius: 20, padding: "28px" }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                                        <div style={{ width: 46, height: 46, background: a.color + "18", border: `1px solid ${a.color}30`, borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", color: a.color }}>
                                            {a.icon}
                                        </div>
                                        <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 22, fontWeight: 700, color: "#1A1A1A", transition: "color 0.2s" }}>{a.num}</span>
                                    </div>
                                    <div style={{ fontFamily: "Playfair Display, serif", fontSize: 17, fontWeight: 700, color: "#FFFFFF", marginBottom: 8 }}>{a.name}</div>
                                    <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}>{a.role}</div>
                                    <div style={{ marginTop: 16, height: 2, background: `linear-gradient(90deg,${a.color},transparent)`, borderRadius: 2 }} />
                                </MotionCard>
                            </StaggerChild>
                        ))}
                    </StaggerContainer>
                </div>
            </section>

            {/* ── BEFORE / AFTER ────────────────────────────────── */}
            <section id="features" className="section-pad section-y" style={{ padding: "120px 32px", background: "#000000" }}>
                <div style={{ maxWidth: 960, margin: "0 auto" }}>
                    <FadeUp style={{ textAlign: "center", marginBottom: 56 }}>
                        <span style={{ fontSize: 11, color: "#C49E6C", fontFamily: "IBM Plex Mono, monospace", letterSpacing: "0.12em" }}>REAL IMPACT</span>
                        <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(36px,5vw,56px)", fontWeight: 900, color: "#FFFFFF", marginTop: 10 }}>Before vs. After Karrar.ai</h2>
                    </FadeUp>
                    <StaggerContainer stagger={0.2} delay={0.1} className="grid-compare">
                        <StaggerChild><MotionCard color="#ef4444" style={{ background: "#0A0B0E", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 20, padding: 32 }}>
                            <div style={{ fontSize: 11, color: "#ef4444", fontFamily: "IBM Plex Mono, monospace", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                                BEFORE — The contract says:
                            </div>
                            <p style={{ fontFamily: "Georgia, serif", fontSize: 14, color: "#888", lineHeight: 1.8, fontStyle: "italic", borderLeft: "3px solid rgba(239,68,68,0.35)", paddingLeft: 16 }}>
                                "The Client may terminate this agreement at any time without prior notice and without liability for any work completed or in progress."
                            </p>
                            <div style={{ marginTop: 20, padding: "10px 14px", background: "rgba(239,68,68,0.05)", borderRadius: 10, fontSize: 13, color: "#666", border: "1px solid rgba(239,68,68,0.12)" }}>
                                You have no idea what this means for your income.
                            </div>
                        </MotionCard></StaggerChild>
                        <StaggerChild><MotionCard color="#22c55e" style={{ background: "#0A0B0E", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 20, padding: 32 }}>
                            <div style={{ fontSize: 11, color: "#22c55e", fontFamily: "IBM Plex Mono, monospace", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="8,12 11,15 16,9" /></svg>
                                AFTER — Karrar.ai shows you:
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                                <RiskBadge score={9.1} size="lg" />
                                <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11, color: "#ef4444", fontWeight: 700 }}>CRITICAL RISK</span>
                            </div>
                            <p style={{ fontSize: 13, color: "#888", lineHeight: 1.75, marginBottom: 16 }}>
                                The client can cancel <em>anytime, for any reason</em>, and owes you <strong style={{ color: "#fff" }}>₹0</strong> for completed work — even if you spent 3 weeks on it.
                            </p>
                            <div style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.18)", borderRadius: 10, padding: "12px 14px" }}>
                                <div style={{ fontSize: 10, color: "#22c55e", fontFamily: "IBM Plex Mono, monospace", marginBottom: 6 }}>✦ COUNTER-TERM GENERATED:</div>
                                <p style={{ fontSize: 13, color: "#888", fontFamily: "Georgia, serif", fontStyle: "italic", lineHeight: 1.65 }}>
                                    "Either party may terminate with 30 days written notice. Upon termination, Client shall pay for all work completed pro-rata at agreed rate."
                                </p>
                            </div>
                        </MotionCard></StaggerChild>
                    </StaggerContainer>
                </div>
            </section>

            {/* ── UPLOAD DEMO ───────────────────────────────────── */}
            <section className="section-pad section-y" style={{ padding: "120px 32px", background: "#030303" }}>
                <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
                    <FadeUp>
                        <span style={{ fontSize: 11, color: "#C49E6C", fontFamily: "IBM Plex Mono, monospace", letterSpacing: "0.12em" }}>TRY IT NOW</span>
                        <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(32px,4vw,52px)", fontWeight: 900, color: "#FFFFFF", marginTop: 10, marginBottom: 12 }}>Upload Your Contract</h2>
                        <p style={{ color: "#555", fontSize: 15, marginBottom: 40 }}>No account required. Results in under 90 seconds.</p>
                    </FadeUp>

                    {uploadState === "idle" && (
                        <div className="upload-zone" onClick={triggerAnalysis}>
                            <svg width="52" height="52" viewBox="0 0 48 48" fill="none" stroke="#C49E6C" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 20, opacity: 0.65 }}>
                                <path d="M28 4H12a4 4 0 0 0-4 4v32a4 4 0 0 0 4 4h24a4 4 0 0 0 4-4V20L28 4z" />
                                <polyline points="28,4 28,20 40,20" />
                                <line x1="16" y1="28" x2="32" y2="28" /><line x1="16" y1="34" x2="28" y2="34" />
                            </svg>
                            <div style={{ fontFamily: "Playfair Display, serif", fontSize: 20, fontWeight: 700, color: "#FFFFFF", marginBottom: 8 }}>Drag & drop your contract PDF</div>
                            <div style={{ color: "#444", fontSize: 14, marginBottom: 24 }}>or click to browse — supports PDF, DOCX</div>
                            <button className="btn-dark" style={{ fontSize: 14, padding: "12px 28px" }}>Choose File</button>
                        </div>
                    )}
                    {uploadState === "analyzing" && (
                        <div style={{ background: "#0A0B0E", border: "1px solid #1E2228", borderRadius: 20, padding: 40 }}>
                            <div style={{ animation: "spin 2s linear infinite", display: "inline-flex", marginBottom: 16 }}>
                                <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#C49E6C" strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                            </div>
                            <div style={{ fontFamily: "Playfair Display, serif", fontSize: 20, fontWeight: 700, color: "#FFFFFF", marginBottom: 8 }}>Analyzing Your Contract</div>
                            <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 12, color: "#C49E6C", marginBottom: 24 }}>{progressLabel}</div>
                            <div style={{ background: "#1E2228", borderRadius: 20, height: 8, overflow: "hidden" }}>
                                <div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg,#C49E6C,#F5D08A)", borderRadius: 20, transition: "width 0.5s ease" }} />
                            </div>
                            <div style={{ fontSize: 11, color: "#333", marginTop: 8 }}>{progress}% complete</div>
                        </div>
                    )}
                    {uploadState === "done" && (
                        <div style={{ background: "#0A0B0E", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 20, padding: 40, boxShadow: "0 0 48px rgba(34,197,94,0.05)" }}>
                            <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 16 }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22,4 12,14.01 9,11.01" /></svg>
                            <div style={{ fontFamily: "Playfair Display, serif", fontSize: 22, fontWeight: 700, color: "#FFFFFF", marginBottom: 8 }}>Analysis Complete!</div>
                            <div style={{ color: "#555", fontSize: 14, marginBottom: 28 }}>Your contract has been analyzed by all 6 agents.</div>
                            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 28, flexWrap: "wrap" }}>
                                {[{ val: "8.4", label: "OVERALL RISK", c: "#ef4444" }, { val: "7", label: "FLAGGED CLAUSES", c: "#f59e0b" }, { val: "4", label: "COUNTER-TERMS", c: "#22c55e" }].map((s, i) => (
                                    <div key={i} style={{ background: s.c + "0A", border: `1px solid ${s.c}25`, borderRadius: 12, padding: "12px 18px", textAlign: "center" }}>
                                        <div style={{ fontFamily: "Playfair Display, serif", fontSize: 30, fontWeight: 800, color: s.c }}>{s.val}</div>
                                        <div style={{ fontSize: 10, color: "#444", fontFamily: "IBM Plex Mono, monospace" }}>{s.label}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                                <button className="btn-dark" style={{ fontSize: 14, padding: "11px 24px" }}>View Full Report →</button>
                                <button className="btn-ghost" style={{ fontSize: 14, padding: "11px 20px" }} onClick={() => setUploadState("idle")}>Analyze Another</button>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* ── PRICING ───────────────────────────────────────── */}
            <section id="pricing" className="section-pad section-y" style={{ padding: "120px 32px", background: "#000000" }}>
                <div style={{ maxWidth: 980, margin: "0 auto" }}>
                    <FadeUp style={{ textAlign: "center", marginBottom: 64 }}>
                        <span style={{ fontSize: 11, color: "#C49E6C", fontFamily: "IBM Plex Mono, monospace", letterSpacing: "0.12em" }}>PRICING</span>
                        <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(36px,5vw,56px)", fontWeight: 900, color: "#FFFFFF", marginTop: 10 }}>Simple, Transparent Pricing</h2>
                        <p style={{ color: "#555", fontSize: 16, marginTop: 12 }}>Start free. Pay only when you need more.</p>
                    </FadeUp>
                    <StaggerContainer stagger={0.15} delay={0.15} className="grid-pricing">
                        {[
                            { name: "Free", price: "₹0", period: "forever", features: ["3 contracts/month", "Basic risk scoring", "Plain language summary", "Email support"], cta: "Get Started Free", featured: false },
                            { name: "Pro", price: "₹999", period: "/month", features: ["Unlimited contracts", "All 6 AI agents", "Counter-term generation", "Contract history", "Priority support", "Indian law database"], cta: "Start Pro", featured: true },
                            { name: "Enterprise", price: "Custom", period: "", features: ["Everything in Pro", "API access", "DigiLocker integration", "Custom agents", "Dedicated support", "SLA guarantee"], cta: "Contact Us", featured: false },
                        ].map((p, i) => (
                            <StaggerChild key={i}>
                                <MotionCard color={p.featured ? "#C49E6C" : "#444"} style={{ background: p.featured ? "#0F1115" : "#08090C", border: p.featured ? "1px solid rgba(196,158,108,0.45)" : "1px solid #1A1B1E", borderRadius: 22, padding: 32, position: "relative" }}>
                                    {p.featured && <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(90deg,#C49E6C,#F5D08A)", color: "#000", fontSize: 10, fontFamily: "IBM Plex Mono, monospace", padding: "4px 14px", borderRadius: 20, letterSpacing: "0.06em", whiteSpace: "nowrap", fontWeight: 700 }}>MOST POPULAR</div>}
                                    <div style={{ fontFamily: "Playfair Display, serif", fontSize: 22, fontWeight: 700, color: "#FFFFFF", marginBottom: 8 }}>{p.name}</div>
                                    <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 24 }}>
                                        <span style={{ fontFamily: "Playfair Display, serif", fontSize: 42, fontWeight: 800, color: p.featured ? "#C49E6C" : "#444" }}>{p.price}</span>
                                        <span style={{ fontSize: 14, color: "#444" }}>{p.period}</span>
                                    </div>
                                    {p.features.map((f, j) => (
                                        <div key={j} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 11 }}>
                                            <div style={{ width: 7, height: 7, background: "#C49E6C", borderRadius: 1, transform: "rotate(45deg)", flexShrink: 0 }} />
                                            <span style={{ fontSize: 13, color: "#777" }}>{f}</span>
                                        </div>
                                    ))}
                                    <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        className={p.featured ? "btn-gold" : "btn-dark"} style={{ width: "100%", marginTop: 24, fontSize: 14, padding: "13px" }}
                                        onClick={onLogin}
                                    >{p.cta}</motion.button>
                                </MotionCard>
                            </StaggerChild>
                        ))}
                    </StaggerContainer>
                </div>
            </section>

            {/* ── CTA ──────────────────────────────────────────────*/}
            <section id="about" className="section-pad section-y" style={{ padding: "120px 32px", background: "#030303", textAlign: "center", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(196,158,108,0.07) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 55% 45% at 50% 50%, rgba(196,158,108,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
                <div style={{ position: "relative" }}>
                    <KarrarLogo size={52} />
                    <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(40px,6vw,72px)", fontWeight: 900, color: "#FFFFFF", marginTop: 20, marginBottom: 16 }}>
                        Sign with{" "}
                        <span style={{ background: "linear-gradient(90deg,#C49E6C,#F5D08A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontStyle: "italic" }}>Clarity.</span>
                    </h2>
                    <p style={{ color: "#555", fontSize: 17, maxWidth: 480, margin: "0 auto 40px" }}>
                        Join thousands of Indians who negotiate contracts like professionals — for free.
                    </p>
                    <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
                        <motion.button whileHover={{ scale: 1.04, boxShadow: "0 8px 32px rgba(196,158,108,0.35)" }} whileTap={{ scale: 0.97 }} className="btn-gold" style={{ fontSize: 17, padding: "17px 40px" }} onClick={onLogin}>Upload a Contract — It's Free</motion.button>
                        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="btn-ghost" style={{ fontSize: 17, padding: "17px 40px" }} onClick={onLogin}>View Pricing</motion.button>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ────────────────────────────────────────── */}
            <footer className="section-pad" style={{ background: "#050505", padding: "72px 32px 36px", borderTop: "1px solid #1E2228" }}>
                <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                    <div className="grid-footer">
                        <div>
                            <KarrarLogo size={30} />
                            <p style={{ fontSize: 13, lineHeight: 1.75, color: "#444", maxWidth: 270, marginTop: 14 }}>India's first multi-agent legal AI for contracts. Built for freelancers, founders, and SMEs.</p>
                        </div>
                        {[
                            { title: "Product", links: ["How It Works", "Features", "Agents", "Pricing", "API"] },
                            { title: "Company", links: ["About", "Blog", "Careers", "Press", "Contact"] },
                            { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Disclaimer"] },
                        ].map(col => (
                            <div key={col.title}>
                                <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 10, color: "#C49E6C", letterSpacing: "0.1em", marginBottom: 16 }}>{col.title.toUpperCase()}</div>
                                {col.links.map(l => (
                                    <div key={l} style={{ fontSize: 13, color: "#444", marginBottom: 10, cursor: "pointer", transition: "color 0.2s" }}
                                        onMouseEnter={e => e.target.style.color = "#FFFFFF"} onMouseLeave={e => e.target.style.color = "#444"}>{l}</div>
                                ))}
                            </div>
                        ))}
                    </div>
                    <div style={{ borderTop: "1px solid #1A1B1E", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                        <div style={{ fontSize: 12, color: "#333" }}>© 2026 Karrar.ai · Built for India</div>
                        <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 10, color: "#555", letterSpacing: "0.06em" }}>
                            By <a href="https://www.linkedin.com/in/ayush-giri-b644612a5" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: 2 }}>Ayush Giri</a> and <a href="https://www.linkedin.com/in/ayush-redekar-508a2a363/" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: 2 }}>Ayush Redekar</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
