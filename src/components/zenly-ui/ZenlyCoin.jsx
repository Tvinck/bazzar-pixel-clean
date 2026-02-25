import React from 'react';
import { motion } from 'framer-motion';

export const ZenlyCoin = ({ size = 32, className = '' }) => {
    return (
        <motion.div
            className={`relative inline-flex items-center justify-center ${className}`}
            style={{ width: size, height: size }}
            animate={{ y: [-1, 1, -1] }}
            transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut"
            }}
        >
            {/* Outer Rim (Gold/Orange Gradient) */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-amber-300 to-orange-500 shadow-[0_2px_4px_rgba(0,0,0,0.2)]"></div>

            {/* Inner Face (Lighter Gold) */}
            <div className="absolute inset-[10%] rounded-full bg-gradient-to-tr from-yellow-400 via-amber-200 to-yellow-500 shadow-inner overflow-hidden">
                {/* Shiny Highlight - Animated */}
                <motion.div
                    className="absolute top-[10%] -left-[100%] w-[50%] h-[150%] bg-white/40 blur-[4px] rotate-45 transform origin-center"
                    animate={{
                        left: ['-100%', '200%']
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        repeatDelay: 2,
                        ease: "easeInOut"
                    }}
                />
            </div>

            {/* Symbol (Star or Currency Sign) */}
            <motion.div
                className="absolute inset-0 flex items-center justify-center text-amber-700 drop-shadow-sm font-black text-sm"
                whileHover={{ scale: 1.1, rotate: 10 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
                <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" opacity="0.6" />
                    <path d="M12 4.5L14.1 8.7L18.6 9.4L15.4 12.6L16.2 17.1L12 15L7.8 17.1L8.6 12.6L5.4 9.4L9.9 8.7L12 4.5Z" fill="white" />
                </svg>
            </motion.div>
        </motion.div>
    );
};
