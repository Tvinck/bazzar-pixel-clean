import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export const MagicOrb = () => {
    const ref = useRef(null);

    // Mouse interaction states
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
    const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

    const handleMouseMove = (e) => {
        const rect = ref.current?.getBoundingClientRect();
        if (rect) {
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            x.set((e.clientX - centerX) / 5);
            y.set((e.clientY - centerY) / 5);
        }
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 1.5 }}
            className="relative w-64 h-64 flex items-center justify-center cursor-pointer perspective-1000"
        >
            {/* --- Living Aura (Outer Glow) --- */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                    rotate: [0, 90, 0]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-gradient-to-tr from-indigo-500/40 via-purple-500/40 to-blue-500/40 blur-[50px] rounded-full"
            />
            {/* Second aura layer for complexity */}
            <motion.div
                animate={{
                    scale: [1.1, 1, 1.1],
                    opacity: [0.2, 0.4, 0.2],
                    rotate: [0, -45, 0]
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute inset-4 bg-gradient-to-bl from-cyan-400/30 to-pink-500/30 blur-[40px] rounded-full mix-blend-screen"
            />

            {/* --- THE CORE SPHERE --- */}
            <motion.div
                animate={{
                    y: [-8, 8, -8],
                    rotateX: [5, -5, 5],
                    rotateZ: [2, -2, 2]
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                style={{
                    rotateX: mouseY,
                    rotateY: mouseX,
                }}
                className="relative w-40 h-40 rounded-full shadow-[inset_-12px_-12px_24px_rgba(255,255,255,0.2),_inset_8px_8px_16px_rgba(0,0,0,0.1),_0_20px_50px_rgba(0,0,0,0.3)] z-10 overflow-hidden bg-[#e0e5ec]"
            >
                {/* 1. Fluid Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-white to-purple-100" />

                {/* 2. Moving Liquid Gradients (Lava Lamp Effect) */}
                <motion.div
                    animate={{ rotate: 360, scale: [1, 1.3, 1] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0deg,#a78bfa_120deg,transparent_180deg,#60a5fa_300deg)] opacity-60 blur-2xl mix-blend-multiply"
                />
                <motion.div
                    animate={{ rotate: -360, scale: [1.2, 1, 1.2] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[conic-gradient(from_180deg,transparent_0deg,#f472b6_140deg,transparent_220deg,#22d3ee_340deg)] opacity-60 blur-2xl mix-blend-multiply"
                />

                {/* 3. Glass Highlights (Specular) */}
                <div className="absolute top-2 left-4 w-24 h-12 bg-gradient-to-b from-white to-transparent opacity-90 blur-md rounded-full rotate-[-45deg]" />
                <div className="absolute bottom-4 right-6 w-16 h-8 bg-gradient-to-t from-white to-transparent opacity-60 blur-md rounded-full rotate-[-45deg]" />

                {/* 4. Rim Light */}
                <div className="absolute inset-0 rounded-full shadow-[inset_4px_4px_20px_rgba(255,255,255,1),inset_-4px_-4px_20px_rgba(0,0,0,0.1)] pointer-events-none" />
            </motion.div>

            {/* --- ORBITING PARTICLES --- */}
            {/* Ring 1 */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-20px] rounded-full border border-white/20 border-t-white/80 border-r-transparent border-b-transparent border-l-transparent pointer-events-none opacity-40"
            />
            {/* Ring 2 (Counter) */}
            <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-40px] rounded-full border-[0.5px] border-white/10 border-b-white/50 border-t-transparent pointer-events-none opacity-30"
            />

            {/* Floating Satellites */}
            <motion.div
                className="absolute w-full h-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
                <div className="absolute top-0 left-1/2 w-3 h-3 bg-white rounded-full blur-[1px] shadow-[0_0_10px_white]" />
            </motion.div>

            <motion.div
                className="absolute w-[120%] h-[120%]"
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            >
                <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-indigo-300 rounded-full blur-[1px] shadow-[0_0_10px_#a5b4fc]" />
            </motion.div>

        </motion.div>
    );
};

