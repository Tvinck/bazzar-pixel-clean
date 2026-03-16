import React from 'react';
import { motion } from 'framer-motion';

// eslint-disable-next-line no-unused-vars
export const ZenlyListRow = ({ title, subtitle, icon: _Icon, gradient, delay = 0, onClick }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay, type: "spring", stiffness: 300, damping: 24 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClick}
            className="group relative w-full bg-white rounded-[28px] p-2.5 flex items-center pr-6 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.05)] border border-white/60 mb-3 cursor-pointer overflow-hidden"
        >
            {/* Hover Highlight */}
            <div className="absolute inset-0 bg-stone-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Big Gradient Icon Wrapper */}
            <div className={`relative z-10 w-14 h-14 rounded-[22px] ${gradient} flex items-center justify-center text-white shadow-md shrink-0 mr-4`}>
                <_Icon size={24} strokeWidth={2.5} />
            </div>

            {/* Text Content */}
            <div className="relative z-10 flex flex-col items-start min-w-0">
                <h3 className="font-[800] text-[15px] text-stone-900 leading-tight mb-0.5 truncate w-full">{title}</h3>
                <p className="text-[12px] font-semibold text-stone-400 leading-tight truncate w-full">{subtitle}</p>
            </div>

            {/* Arrow (Optional decoration) */}
            {/* <div className="ml-auto text-stone-300">
             <ChevronRight size={20} />
        </div> */}
        </motion.div>
    );
};
