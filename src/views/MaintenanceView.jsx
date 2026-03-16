import React from 'react';
import { motion } from 'framer-motion';

const MaintenanceView = () => {
    return (
        <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">

            {/* Background Glows */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                    className="absolute w-full h-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{
                        background: "radial-gradient(circle, rgba(51, 144, 236, 0.15) 0%, rgba(15, 15, 15, 0.0) 70%)",
                        filter: "blur(60px)",
                    }}
                />
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center max-w-md w-full">

                {/* Animated Clock/Update SVG */}
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20, duration: 1 }}
                    className="relative mb-8"
                >
                    <div className="absolute inset-0 bg-blue-500/30 blur-2xl rounded-full" />
                    <svg className="w-32 h-32 text-blue-500 relative z-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <motion.path
                            d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 2, ease: "easeInOut" }}
                        />
                        <motion.path
                            d="M12 6V12L16 16"
                            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
                        />

                        {/* Sparkles */}
                        <motion.path
                            d="M21 5L20 4M3 5L4 4M21 19L20 20M3 19L4 20"
                            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                        />
                    </svg>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-bold text-white mb-4 tracking-tight"
                >
                    Готовим для вас <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                        глобальное обновление
                    </span>
                </motion.h1>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 backdrop-blur-md w-full mb-6 relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <p className="text-zinc-300 text-lg mb-4 leading-relaxed relative z-10">
                        Приложение будет доступно <br />
                        <span className="text-white font-bold text-xl block mt-2">
                            25.02.2026 в 23:00
                        </span>
                    </p>

                    <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-700 to-transparent my-4 relative z-10" />

                    <p className="text-zinc-400 text-sm relative z-10">
                        Приносим свои извинения за неудобства, но это того стоит! 🚀
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="flex space-x-2 items-center text-blue-500"
                >
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                    </span>
                    <span className="text-sm font-medium">Bazzar AI Core System</span>
                </motion.div>

            </div>
        </div>
    );
};

export default MaintenanceView;
