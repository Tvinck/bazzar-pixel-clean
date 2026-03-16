import React from 'react';
import { motion } from 'framer-motion';

const LoadingScreen = () => {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg-primary text-white">
            {/* Dynamic Background Glow */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute w-[300px] h-[300px] rounded-full bg-blue-500/20 blur-[100px]"
            />

            {/* Logo Container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10"
            >
                <motion.div
                    animate={{
                        y: [0, -10, 0],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="relative"
                >
                    {/* Main Logo Image */}
                    <div className="w-32 h-32 rounded-[2rem] overflow-hidden shadow-2xl shadow-blue-500/20 relative">
                        <img
                            src="/loading_logo.jpg"
                            alt="Loading..."
                            className="w-full h-full object-cover"
                        />

                        {/* Shimmer Overlay */}
                        <motion.div
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "linear",
                                repeatDelay: 0.5
                            }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                        />
                    </div>

                    {/* Reflection/Shadow */}
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-20 h-2 bg-black/50 blur-md rounded-full" />
                </motion.div>
            </motion.div>

            {/* Loading Text & Dots */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-8 relative z-10 flex flex-col items-center gap-3"
            >
                <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="w-2 h-2 rounded-full bg-blue-500"
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.5, 1, 0.5],
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.2,
                            }}
                        />
                    ))}
                </div>
                <p className="text-white/40 text-sm font-medium tracking-widest uppercase">
                    Loading
                </p>
            </motion.div>
        </div>
    );
};

export default LoadingScreen;
