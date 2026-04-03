import { KarrarLogo } from "../ui/logo";
/* eslint-disable no-unused-vars */
import { RiskBadge } from "../ui/risk-badge";

export function DashboardPreview() {
    const risks = [
        { title: "High Financial Liability", sub: "Indemnification Clause", score: 8.4, icon: <svg width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg> },
        { title: "Unfair Non-Compete Term", sub: "Non-Compete Agreement", score: 7.6, icon: <svg width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg> },
        { title: "Unclear Jurisdiction", sub: "Governing Law Clause", score: 6.9, icon: <svg width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg> },
    ];
    const recent = [
        { name: "MSA_Company_X.pdf", time: "13 min ago", tags: ["3.4+", "11"] },
        { name: "Freelancer_NDA.docx", time: "1 hour ago", tags: [] },
        { name: "SBA_India_Company.pdf", time: "5 hrs ago", tags: [] },
    ];

    return (
        <div style={{ width: "100%", background: "#0A0B0E", borderRadius: "20px 20px 0 0", border: "1px solid #1E2228", borderBottom: "none", overflow: "hidden", fontFamily: "DM Sans, sans-serif", userSelect: "none" }}>
            {/* Top bar */}
            <div style={{ background: "#0F1115", borderBottom: "1px solid #1E2228", padding: "12px 20px", display: "flex", alignItems: "center", gap: 16 }}>
                <KarrarLogo size={28} wordmark={true} />
                <div style={{ flex: 1, display: "flex", gap: 24, marginLeft: 16 }}>
                    {["Home", "Contracts", "Agents", "Reports"].map((n, i) => (
                        <span key={n} style={{ fontSize: 13, color: i === 0 ? "#C49E6C" : "#555", cursor: "pointer", fontWeight: i === 0 ? 600 : 400, borderBottom: i === 0 ? "1.5px solid #C49E6C" : "none", paddingBottom: 2 }}>{n}</span>
                    ))}
                </div>
                <div style={{ background: "#1E2228", borderRadius: 8, padding: "6px 12px", fontSize: 12, color: "#555", display: "flex", alignItems: "center", gap: 6, width: 200 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    Search contracts...
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ position: "relative" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                        <span style={{ position: "absolute", top: -4, right: -4, background: "#ef4444", borderRadius: "50%", width: 10, height: 10, fontSize: 7, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>3</span>
                    </div>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#C49E6C,#F5D08A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#000" }}>JS</div>
                    <span style={{ fontSize: 12, color: "#888" }}>Ayush</span>
                </div>
            </div>

            {/* Body */}
            <div style={{ display: "flex", height: 520 }}>
                {/* Sidebar */}
                <div style={{ width: 180, borderRight: "1px solid #1E2228", padding: "20px 12px", flexShrink: 0 }}>
                    {[
                        { label: "Home", active: true, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9,22 9,12 15,12 15,22" /></svg> },
                        { label: "Contracts", active: false, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14,2 14,8 20,8" /></svg> },
                        { label: "Agents", active: false, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="5" r="2" /><circle cx="5" cy="19" r="2" /><circle cx="19" cy="19" r="2" /><line x1="12" y1="7" x2="5" y2="17" /><line x1="12" y1="7" x2="19" y2="17" /><line x1="7" y1="19" x2="17" y2="19" /></svg> },
                        { label: "Reports", active: false, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="12" width="4" height="9" /><rect x="10" y="7" width="4" height="14" /><rect x="17" y="3" width="4" height="18" /><line x1="2" y1="21" x2="22" y2="21" /></svg> },
                    ].map((item) => (
                        <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, marginBottom: 4, background: item.active ? "rgba(196,158,108,0.1)" : "transparent", color: item.active ? "#C49E6C" : "#555" }}>
                            {item.icon}
                            <span style={{ fontSize: 13, fontWeight: item.active ? 600 : 400 }}>{item.label}</span>
                        </div>
                    ))}
                    <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid #1E2228" }}>
                        <div style={{ fontSize: 10, color: "#333", fontFamily: "IBM Plex Mono, monospace", letterSpacing: "0.08em", marginBottom: 10 }}>FAVORITES</div>
                        {["NDA_Startup.d...", "Rental Agreement", "SBA_India_Comp..."].map((f, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 6, marginBottom: 2 }}>
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /></svg>
                                <span style={{ fontSize: 11, color: "#444" }}>{f}</span>
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: 16 }}>
                        <div style={{ fontSize: 10, color: "#333", fontFamily: "IBM Plex Mono, monospace", letterSpacing: "0.08em", marginBottom: 10 }}>TOP ENTITIES</div>
                        {[{ flag: "🇮🇳", name: "Indian Ministries" }, { flag: "🇮🇳", name: "Freelancer Y" }].map((e, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 8px", borderRadius: 6, marginBottom: 2 }}>
                                <span style={{ fontSize: 10 }}>{e.flag}</span>
                                <span style={{ fontSize: 11, color: "#444" }}>{e.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main content */}
                <div style={{ flex: 1, padding: "24px", overflowY: "hidden" }}>
                    <div style={{ marginBottom: 20 }}>
                        <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: 26, fontWeight: 800, color: "#FFFFFF", marginBottom: 4 }}>Ayush's Karrarnamas</h2>
                        <p style={{ fontSize: 13, color: "#555" }}>Audit, analyze, and negotiate your contracts effortlessly.</p>
                    </div>

                    {/* Stats */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 16 }}>
                        {[
                            { label: "Total Contracts", val: "3,468", color: "#FFFFFF" },
                            { label: "High Risks", val: "312", color: "#ef4444", icon: true },
                            { label: "Flagged Terms", val: "564", color: "#f59e0b" },
                        ].map((s, i) => (
                            <div key={i} className="dash-stat-card" style={{ background: "#0F1115", border: "1px solid #1E2228", borderRadius: 12, padding: "14px 16px" }}>
                                <div style={{ fontFamily: "Playfair Display, serif", fontSize: 28, fontWeight: 800, color: s.color, display: "flex", alignItems: "center", gap: 6 }}>
                                    {s.icon && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2L4 6v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V6L12 2z" /></svg>}
                                    {s.val}
                                </div>
                                <div style={{ fontSize: 11, color: "#555", marginTop: 2, fontFamily: "IBM Plex Mono, monospace" }}>{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Alert */}
                    <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                            <span style={{ fontSize: 12, color: "#f59e0b" }}>Alert: Contract <strong>MSA_Company_X.pdf</strong> has 1 high risk &amp; 3 moderate risks</span>
                        </div>
                        <span style={{ fontSize: 11, color: "#C49E6C", cursor: "pointer", fontFamily: "IBM Plex Mono, monospace", borderBottom: "1px solid rgba(196,158,108,0.4)" }}>View Analysis</span>
                    </div>

                    {/* Risk cards */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {risks.map((r, i) => (
                            <div key={i} style={{ background: "#0F1115", border: `1px solid ${r.score >= 8 ? "rgba(239,68,68,0.2)" : r.score >= 7 ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.06)"}`, borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 8, background: r.score >= 8 ? "rgba(239,68,68,0.12)" : r.score >= 7 ? "rgba(245,158,11,0.12)" : "rgba(107,114,128,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
                                        {i === 0 ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                                            : i === 1 ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2L4 6v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V6L12 2z" /></svg>
                                                : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: "#FFFFFF", marginBottom: 2 }}>{r.title}</div>
                                        <div style={{ fontSize: 11, color: "#555", fontFamily: "IBM Plex Mono, monospace" }}>{r.sub}</div>
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <RiskBadge score={r.score} />
                                    <div style={{ background: "rgba(196,158,108,0.08)", border: "1px solid rgba(196,158,108,0.2)", borderRadius: 6, padding: "4px 10px", fontSize: 11, color: "#C49E6C", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontFamily: "IBM Plex Mono, monospace" }}>
                                        Suggest Counter Proposals
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#C49E6C" strokeWidth="2.5" strokeLinecap="round"><polyline points="9,18 15,12 9,6" /></svg>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right panel */}
                <div style={{ width: 220, borderLeft: "1px solid #1E2228", padding: "20px 16px", flexShrink: 0 }}>
                    {/* Donut chart */}
                    <div style={{ marginBottom: 20 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#FFFFFF", marginBottom: 12, fontFamily: "IBM Plex Mono, monospace", letterSpacing: "0.06em" }}>RISK BREAKDOWN</div>
                        <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto 12px" }}>
                            <svg width="80" height="80" viewBox="0 0 80 80">
                                <circle cx="40" cy="40" r="28" fill="none" stroke="#1E2228" strokeWidth="10" />
                                <circle cx="40" cy="40" r="28" fill="none" stroke="#ef4444" strokeWidth="10"
                                    strokeDasharray={`${2 * Math.PI * 28 * 0.01} ${2 * Math.PI * 28 * 0.99}`}
                                    strokeDashoffset={2 * Math.PI * 28 * 0.25} strokeLinecap="round" />
                                <circle cx="40" cy="40" r="28" fill="none" stroke="#f59e0b" strokeWidth="10"
                                    strokeDasharray={`${2 * Math.PI * 28 * 0.17} ${2 * Math.PI * 28 * 0.83}`}
                                    strokeDashoffset={2 * Math.PI * 28 * 0.24} strokeLinecap="round" />
                                <circle cx="40" cy="40" r="28" fill="none" stroke="#22c55e" strokeWidth="10"
                                    strokeDasharray={`${2 * Math.PI * 28 * 0.70} ${2 * Math.PI * 28 * 0.30}`}
                                    strokeDashoffset={2 * Math.PI * 28 * 0.07} strokeLinecap="round" />
                                <text x="40" y="44" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="800" fontFamily="Georgia, serif">70%</text>
                            </svg>
                        </div>
                        {[{ label: "High Risk", pct: "1%", color: "#ef4444" }, { label: "Med Risk", pct: "17%", color: "#f59e0b" }, { label: "Low Risk", pct: "70%", color: "#22c55e" }].map((r, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: r.color }} />
                                    <span style={{ fontSize: 11, color: "#888" }}>{r.label}</span>
                                </div>
                                <span style={{ fontSize: 11, color: r.color, fontFamily: "IBM Plex Mono, monospace", fontWeight: 700 }}>{r.pct}</span>
                            </div>
                        ))}
                    </div>

                    {/* Recent Activity */}
                    <div style={{ borderTop: "1px solid #1E2228", paddingTop: 16 }}>
                        <div style={{ fontSize: 10, color: "#333", fontFamily: "IBM Plex Mono, monospace", letterSpacing: "0.08em", marginBottom: 10 }}>RECENT ACTIVITY</div>
                        {[
                            { name: "MSA_Company_X.pdf", time: "13 min ago", color: "#ef4444" },
                            { name: "Freelancer_NDA.docx", time: "1 hour ago", color: "#C49E6C" },
                            { name: "SBA_India_Company.pdf", time: "5 hrs ago", color: "#3b82f6" },
                        ].map((item, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10 }}>
                                <div style={{ width: 24, height: 24, borderRadius: 6, background: item.color + "18", border: `1px solid ${item.color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={item.color} strokeWidth="2.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /></svg>
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, color: "#CCCCCC", fontWeight: 500, lineHeight: 1.3 }}>{item.name}</div>
                                    <div style={{ fontSize: 10, color: "#444", marginTop: 1, fontFamily: "IBM Plex Mono, monospace" }}>{item.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Top Entities */}
                    <div style={{ borderTop: "1px solid #1E2228", paddingTop: 14, marginTop: 4 }}>
                        <div style={{ fontSize: 10, color: "#333", fontFamily: "IBM Plex Mono, monospace", letterSpacing: "0.08em", marginBottom: 10 }}>TOP ENTITIES</div>
                        {[{ name: "Company.X", sub: "The jundientee claes", time: "13 min ago" }, { name: "Freelancer Y", sub: "Frequent Mentioins", time: "1 hour ago" }].map((e, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                <span style={{ fontSize: 13 }}>🇮🇳</span>
                                <div>
                                    <div style={{ fontSize: 11, color: "#CCCCCC", fontWeight: 600 }}>{e.name}</div>
                                    <div style={{ fontSize: 10, color: "#444" }}>{e.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
