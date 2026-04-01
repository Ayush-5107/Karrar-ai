/* eslint-disable no-unused-vars */

/**
 * ComingSoon wrapper — blurs/disables non-MVP content
 * and shows a golden "Coming Soon" badge.
 */
export function ComingSoon({ children, label = "Coming Soon", style = {} }) {
    return (
        <div style={{ position: "relative", ...style }}>
            <div
                style={{
                    opacity: 0.4,
                    pointerEvents: "none",
                    userSelect: "none",
                    filter: "blur(2px)",
                }}
            >
                {children}
            </div>
            <span
                style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    fontSize: 10,
                    borderRadius: 9999,
                    background: "rgba(234,179,8,0.15)",
                    color: "#facc15",
                    padding: "2px 8px",
                    fontFamily: "IBM Plex Mono, monospace",
                    fontWeight: 600,
                    letterSpacing: "0.03em",
                    zIndex: 10,
                    whiteSpace: "nowrap",
                }}
            >
                {label}
            </span>
        </div>
    );
}

/**
 * Lock icon (12×12) used next to blurred nav items and tabs.
 */
export function LockIcon({ size = 12, color = "#eab308" }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0 }}
        >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    );
}
