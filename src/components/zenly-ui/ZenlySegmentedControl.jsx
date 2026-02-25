import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const ZenlySegmentedControl = ({ options, activeId, onChange }) => {
    return (
        <div className="flex bg-white/50 backdrop-blur-md p-1.5 rounded-[24px] shadow-inner border border-white/60 relative w-full h-14">
            {options.map((opt) => {
                const isActive = activeId === opt.id;
                return (
                    <button
                        key={opt.id}
                        onClick={() => onChange(opt.id)}
                        className={`flex-1 relative z-10 font-bold text-sm tracking-wide transition-colors duration-200 ${isActive ? 'text-stone-900' : 'text-stone-400'}`}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="segment-pill"
                                className="absolute inset-0 bg-white rounded-[20px] shadow-[0_4px_10px_-2px_rgba(0,0,0,0.05)] border border-stone-100"
                                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                            />
                        )}
                        <span className="relative z-10">{opt.label}</span>
                    </button>
                )
            })}
        </div>
    );
};
