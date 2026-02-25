import React from 'react';
import { motion } from 'framer-motion';

const JELLY_TRANSITION = { type: "spring", stiffness: 450, damping: 15 };

export const ZenlyButton = ({
    children,
    onClick,
    variant = 'primary',
    className = '',
    disabled = false
}) => {

    const triggerHaptic = () => {
        window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('medium');
    };

    const styles = {
        // Primary: The "Input Field" look from the reference, or a primary action
        primary: 'bg-white text-stone-800 shadow-[0_8px_20px_-8px_rgba(0,0,0,0.1)] border border-stone-100',
        // Action: The blue microphone/send button style
        action: 'bg-gradient-to-tr from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30',
        // Glass: For overlays
        glass: 'bg-white/40 backdrop-blur-md text-stone-700'
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            transition={JELLY_TRANSITION}
            onClick={(e) => { !disabled && triggerHaptic(); onClick && onClick(e); }}
            className={`
        relative overflow-hidden
        py-4 px-6 rounded-[24px] 
        font-bold text-[15px] tracking-wide
        flex items-center justify-center gap-3
        disabled:opacity-50
        ${styles[variant] || styles.primary}
        ${className}
      `}
        >
            {children}
        </motion.button>
    );
};
