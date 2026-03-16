import React from 'react';
import { motion } from 'framer-motion';

/**
 * AnimatedIcon Wrapper
 * Wraps any icon (Lucide or custom SVG) with beautiful spring/scale animations.
 * 
 * @param {Object} props
 * @param {React.ElementType} props.icon - The Lucide icon component or custom SVG component to render
 * @param {string} props.className - Additional classes for the wrapper
 * @param {number} props.delay - Optional delay for the entrance animation
 * @param {boolean} props.isActive - Whether the icon is currently in an active state (can trigger different animation styles)
 * @param {boolean} props.disableHover - If true, disables the hover effect
 * @param {boolean} props.disableTap - If true, disables the tap effect
 * @param {string} props.color - Color of the icon
 * @param {number|string} props.size - Size of the icon
 */
const AnimatedIcon = ({
// eslint-disable-next-line no-unused-vars
    icon: _Icon,
    className = '',
    delay = 0,
    isActive = false,
    disableHover = false,
    disableTap = false,
    glow = false,
    glowColor = 'rgba(51, 144, 236, 0.4)',
    glowIntensity = 'blur-md',
    color,
    size,
    ...props
}) => {
    // Entrance animation: Pop in
    const variants = {
        hidden: { scale: 0, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 450, // More snappy entrance
                damping: 25,
                delay: delay
            }
        },
        hover: disableHover ? {} : {
            scale: 1.1,
            rotate: [0, -4, 4, -4, 0], // tighter wiggle
            transition: {
                rotate: { repeat: Infinity, duration: 2.5, ease: "easeInOut" },
                scale: { type: 'spring', stiffness: 500, damping: 15 }
            }
        },
        tap: disableTap ? {} : {
            scale: 0.82,
            transition: { type: 'spring', stiffness: 600, damping: 15 } // Very snappy tap
        }
    };

    return (
        <div className={`relative inline-flex items-center justify-center ${className}`}>
            {glow && (
                <motion.div
                    className={`absolute inset-0 rounded-full ${glowIntensity}`}
                    style={{ backgroundColor: glowColor }}
                    variants={{
                        hidden: { opacity: 0, scale: 0.8 },
                        visible: { opacity: 1, scale: 1, transition: { delay } },
                        hover: disableHover ? {} : { opacity: 0.8, scale: 1.2 },
                        tap: disableTap ? {} : { opacity: 0.4, scale: 0.9 }
                    }}
                    initial="hidden"
                    animate={isActive ? "visible" : "hidden"}
                    whileHover="hover"
                    whileTap="tap"
                />
            )}
            <motion.div
                className="relative z-10 flex items-center justify-center"
                initial="hidden"
                animate={isActive ? "hover" : "visible"} // active icons pulse slightly
                whileHover="hover"
                whileTap="tap"
                variants={variants}
                {...props}
            >
                <_Icon color={color} size={size} className={isActive ? 'text-[#3390ec]' : ''} />
            </motion.div>
        </div>
    );
};

export default AnimatedIcon;
