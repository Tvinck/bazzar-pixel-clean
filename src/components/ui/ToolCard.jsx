import React from 'react';
import { motion } from 'framer-motion';

const ToolCard = React.memo(({ icon, title, subtitle, color, bg = "bg-white dark:bg-slate-800", delay, onClick }) => {
    // Helper to generate 3D gradient based on color prop
    const getGradient = (colorClass) => {
        if (colorClass.includes('violet')) return 'from-violet-500 to-purple-600 shadow-violet-500/40';
        if (colorClass.includes('blue')) return 'from-blue-500 to-cyan-500 shadow-blue-500/40';
        if (colorClass.includes('emerald')) return 'from-emerald-500 to-teal-500 shadow-emerald-500/40';
        if (colorClass.includes('cyan')) return 'from-cyan-500 to-sky-500 shadow-cyan-500/40';
        if (colorClass.includes('indigo')) return 'from-indigo-500 to-blue-600 shadow-indigo-500/40';
        if (colorClass.includes('pink')) return 'from-pink-500 to-rose-500 shadow-pink-500/40';
        if (colorClass.includes('purple')) return 'from-purple-500 to-fuchsia-600 shadow-purple-500/40';
        if (colorClass.includes('amber')) return 'from-amber-400 to-orange-500 shadow-amber-500/40';
        return 'from-slate-500 to-slate-700 shadow-slate-500/40';
    };

    const gradientClass = getGradient(color || '');

    return (
        <motion.button
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.5, type: "spring" }}
            whileTap={{ scale: 0.95 }}
            whileHover={{ y: -4 }}
            onClick={onClick}
            className={`p-4 rounded-[1.8rem] ${bg} flex flex-col justify-center items-center gap-3 shadow-lg shadow-slate-200/50 dark:shadow-none border border-white dark:border-slate-700 hover:shadow-xl transition-all text-center group h-40 cursor-pointer relative overflow-hidden`}
        >
            {/* 3D Icon Container */}
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${gradientClass} shadow-lg text-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative z-10`}>
                <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                {React.cloneElement(icon, { size: 26, strokeWidth: 2, className: "drop-shadow-md" })}
            </div>

            <div className="relative z-10">
                <h4 className="font-display font-bold text-lg text-slate-800 dark:text-white leading-tight mb-1">{title}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight opacity-80">{subtitle}</p>
            </div>

            {/* Subtle background glow */}
            <div className={`absolute -bottom-4 -right-4 w-20 h-20 bg-gradient-to-br ${gradientClass} opacity-10 blur-2xl rounded-full pointer-events-none group-hover:opacity-20 transition-opacity`} />
        </motion.button>
    );
});

export default ToolCard;
