/* eslint-disable no-unused-vars */
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export const FadeUp = ({ children, delay = 0, duration = 0.7, y = 40, style = {}, className = "" }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-60px" });
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
            style={style}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export const ScaleIn = ({ children, delay = 0, style = {} }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-40px" });
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, scale: 0.88 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
            style={style}
        >
            {children}
        </motion.div>
    );
};

export const StaggerContainer = ({ children, stagger = 0.1, delay = 0, style = {}, className }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-60px" });
    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={{ visible: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
            style={style}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export const StaggerChild = ({ children, y = 30, style = {} }) => (
    <motion.div
        variants={{
            hidden: { opacity: 0, y },
            visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
        }}
        style={style}
    >
        {children}
    </motion.div>
);

// Dramatic headline — each WORD slides up with stagger + blur
export const AnimatedHeadline = ({ children, style = {} }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-80px" });
    const segments = Array.isArray(children) ? children : [children];
    let globalIdx = 0;
    return (
        <motion.h1 ref={ref} style={{ ...style, overflow: "visible" }}>
            {segments.map((seg, si) => {
                if (typeof seg !== "string") {
                    // Animated span element (e.g. italic gold text)
                    const idx = globalIdx++;
                    return (
                        <motion.span
                            key={si}
                            initial={{ opacity: 0, y: 60, filter: "blur(12px)" }}
                            animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
                            transition={{ duration: 0.85, delay: idx * 0.14, ease: [0.22, 1, 0.36, 1] }}
                            style={{ display: "inline-block" }}
                        >
                            {seg}
                        </motion.span>
                    );
                }
                return seg.split(" ").filter(Boolean).map((word, wi) => {
                    const idx = globalIdx++;
                    return (
                        <motion.span
                            key={`${si}-${wi}`}
                            initial={{ opacity: 0, y: 60, filter: "blur(12px)" }}
                            animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
                            transition={{ duration: 0.85, delay: idx * 0.14, ease: [0.22, 1, 0.36, 1] }}
                            style={{ display: "inline-block", marginRight: "0.28em", transformOrigin: "bottom center" }}
                        >
                            {word}
                        </motion.span>
                    );
                });
            })}
        </motion.h1>
    );
};

// Animated floating badge
export const FloatingBadge = ({ children, style = {} }) => (
    <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        style={style}
    >
        {children}
    </motion.div>
);

// Motion card wrapper with lift + glow on hover
export const MotionCard = ({ children, color = "#C49E6C", style = {}, ...rest }) => (
    <motion.div
        whileHover={{ y: -6, boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 50px ${color}28, inset 0 1px 0 ${color}20`, borderColor: `${color}60`, scale: 1.01 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        style={{ cursor: "default", ...style }}
        {...rest}
    >
        {children}
    </motion.div>
);
