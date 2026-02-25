import React from 'react';
import { motion } from 'framer-motion';

// Refined Physics for "Soft Pillow" feel
const CARD_ENTRY = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { type: "spring", stiffness: 200, damping: 20 }
    }
};

export const ZenlyCard = ({ children, className = '', delay = 0, title, icon: Icon, color = "blue" }) => {

    // Color presets for the icon bubble
    const colorMap = {
        blue: "bg-blue-100 text-blue-600",
        purple: "bg-purple-100 text-purple-600",
        orange: "bg-orange-100 text-orange-600",
        pink: "bg-pink-100 text-pink-600",
        indigo: "bg-indigo-100 text-indigo-600"
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={CARD_ENTRY}
            transition={{ delay: delay }}
            className={`
        relative
        bg-white 
        rounded-[28px] 
        p-5
        shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05),_0_4px_10px_-2px_rgba(0,0,0,0.02)]
        border border-white/50
        flex flex-col
        ${className}
      `}
        >
            {/* Optional Header Row if Title/Icon provided */}
            {(title || Icon) && (
                <div className="flex items-center gap-3 mb-3">
                    {Icon && (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colorMap[color] || colorMap.blue}`}>
                            <Icon size={16} strokeWidth={2.5} />
                        </div>
                    )}
                    {title && <h3 className="font-bold text-stone-800 text-[15px] leading-tight">{title}</h3>}
                </div>
            )}

            <div className="relative z-10 text-stone-500 text-sm leading-relaxed font-medium">
                {children}
            </div>
        </motion.div>
    );
};
