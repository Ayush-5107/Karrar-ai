/* eslint-disable no-unused-vars */
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Analytics } from "@vercel/analytics/react";
import { Landing } from "./pages/Landing";
import { LoginPage } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";

export default function App() {
    const [page, setPage] = useState("landing");
    const [isSignUpMode, setIsSignUpMode] = useState(false);
    const [user] = useState({ name: "Ayush", email: "demo@karrar.ai", initials: "A" });

    return (
        <>
            <AnimatePresence mode="wait">
                {page === "landing" && (
                    <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                        <Landing onLogin={(isSignup) => { setIsSignUpMode(!!isSignup); setPage("login"); }} />
                    </motion.div>
                )}
                {page === "login" && (
                    <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                        <LoginPage initialIsSignUp={isSignUpMode} onBack={() => setPage("landing")} onSuccess={() => setPage("dashboard")} />
                    </motion.div>
                )}
                {page === "dashboard" && (
                    <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                        <Dashboard user={user} onLogout={() => setPage("landing")} />
                    </motion.div>
                )}
            </AnimatePresence>
            <Analytics />
        </>
    );
}
