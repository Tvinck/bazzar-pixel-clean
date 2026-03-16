import { motion, useSpring, useTransform, useMotionValue, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

/**
 * Telegram-style smooth animations and transitions
 * Based on Telegram's design principles
 */

// ========================================
// TELEGRAM ANIMATION PRESETS
// ========================================

export const telegramAnimations = {
    // Fade in from bottom (like Telegram messages)
    fadeInUp: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 30
        }
    },

    // Scale pop (like Telegram stickers)
    scalePop: {
        initial: { scale: 0.8, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0.8, opacity: 0 },
        transition: {
            type: 'spring',
            stiffness: 400,
            damping: 25
        }
    },

    // Slide from right (like Telegram chat opening)
    slideFromRight: {
        initial: { x: '100%', opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: '100%', opacity: 0 },
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 30
        }
    },

    // Slide from bottom (like Telegram bottom sheets)
    slideFromBottom: {
        initial: { y: '100%' },
        animate: { y: 0 },
        exit: { y: '100%' },
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 30
        }
    },

    // Smooth fade (like Telegram overlays)
    smoothFade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: {
            duration: 0.2,
            ease: 'easeInOut'
        }
    },

    // Bounce (like Telegram reactions)
    bounce: {
        initial: { scale: 0 },
        animate: { scale: [0, 1.2, 1] },
        transition: {
            duration: 0.5,
            times: [0, 0.6, 1],
            ease: 'easeOut'
        }
    },

    // Ripple effect (like Telegram button press)
    ripple: {
        whileTap: { scale: 0.95 },
        transition: { duration: 0.1 }
    }
};

// ========================================
// ANIMATED COMPONENTS
// ========================================

/**
 * Telegram-style Card with hover and tap animations
 */
export const TelegramCard = ({ children, onClick, className = '' }) => {
    return (
        <motion.div
            className={className}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            transition={{
                type: 'spring',
                stiffness: 400,
                damping: 25
            }}
        >
            {children}
        </motion.div>
    );
};

/**
 * Telegram-style Button with ripple effect
 */
export const TelegramButton = ({ children, onClick, variant = 'primary', className = '' }) => {
    const baseClass = 'px-6 py-3 rounded-xl font-semibold transition-all';
    const variantClass = variant === 'primary'
        ? 'bg-accent-blue text-white hover:bg-[#2b7fd1]'
        : 'bg-white/10 text-white hover:bg-white/20';

    return (
        <motion.button
            className={`${baseClass} ${variantClass} ${className}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            transition={{
                type: 'spring',
                stiffness: 400,
                damping: 17
            }}
        >
            {children}
        </motion.button>
    );
};

/**
 * Telegram-style List Item with slide animation
 */
export const TelegramListItem = ({ children, delay = 0, onClick }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
                delay
            }}
            whileTap={{ scale: 0.98, x: 5 }}
            onClick={onClick}
            className="cursor-pointer"
        >
            {children}
        </motion.div>
    );
};

/**
 * Telegram-style Modal/Drawer
 */
/**
 * Telegram-style Modal/Drawer
 */
export const TelegramModal = ({ isOpen, onClose, children, fromBottom = true, className = '' }) => {
    const animation = fromBottom ? telegramAnimations.slideFromBottom : telegramAnimations.fadeInUp;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                        onClick={onClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        className={`fixed inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center md:bg-transparent md:pointer-events-none z-[70] ${className}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <motion.div
                            className={`bg-bg-secondary w-full md:w-[480px] rounded-t-[32px] md:rounded-[32px] max-h-[95vh] md:max-h-[85vh] flex flex-col shadow-2xl md:pointer-events-auto`}
                            {...animation}
                        >
                            {/* Drag Handle Area */}
                            <div className="w-full flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing" onClick={onClose}>
                                <div className="w-10 h-1 bg-white/20 rounded-full" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto no-scrollbar">
                                {children}
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

/**
 * Telegram-style Floating Action Button
 */
export const TelegramFAB = ({ icon, onClick, className = '' }) => {
    return (
        <motion.button
            className={`fixed bottom-20 right-6 w-14 h-14 rounded-full bg-accent-blue text-white shadow-2xl flex items-center justify-center z-40 ${className}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClick}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20
            }}
        >
            {icon}
        </motion.button>
    );
};

/**
 * Telegram-style Skeleton Loader
 */
export const TelegramSkeleton = ({ width = '100%', height = '20px', className = '' }) => {
    return (
        <motion.div
            className={`bg-white/10 rounded-lg ${className}`}
            style={{ width, height }}
            animate={{
                opacity: [0.5, 1, 0.5]
            }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut'
            }}
        />
    );
};

/**
 * Telegram-style Notification Badge
 */
export const TelegramBadge = ({ count, className = '' }) => {
    if (!count || count === 0) return null;

    return (
        <motion.div
            className={`absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-accent-blue text-white text-xs font-bold flex items-center justify-center ${className}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{
                type: 'spring',
                stiffness: 500,
                damping: 30
            }}
        >
            {count > 99 ? '99+' : count}
        </motion.div>
    );
};

/**
 * Telegram-style Swipeable Card
 */
export const TelegramSwipeCard = ({ children, onSwipeLeft, onSwipeRight, className = '' }) => {
    const x = useMotionValue(0);
    const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5]);
    const rotate = useTransform(x, [-200, 0, 200], [-10, 0, 10]);

    return (
        <motion.div
            className={className}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            style={{ x, opacity, rotate }}
            onDragEnd={(e, { offset, velocity }) => {
                const swipe = Math.abs(offset.x) * velocity.x;

                if (swipe < -10000) {
                    onSwipeLeft?.();
                } else if (swipe > 10000) {
                    onSwipeRight?.();
                }
            }}
        >
            {children}
        </motion.div>
    );
};

/**
 * Telegram-style Progress Bar
 */
export const TelegramProgress = ({ progress = 0, className = '' }) => {
    return (
        <div className={`w-full h-1 bg-white/10 rounded-full overflow-hidden ${className}`}>
            <motion.div
                className="h-full bg-accent-blue rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{
                    type: 'spring',
                    stiffness: 100,
                    damping: 20
                }}
            />
        </div>
    );
};

/**
 * Telegram-style Typing Indicator
 */
export const TelegramTyping = () => {
    return (
        <div className="flex gap-1 items-center">
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className="w-2 h-2 bg-white/40 rounded-full"
                    animate={{
                        y: [0, -8, 0],
                        opacity: [0.4, 1, 0.4]
                    }}
                    transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.15
                    }}
                />
            ))}
        </div>
    );
};

/**
 * Telegram-style Shimmer Effect
 */
export const TelegramShimmer = ({ children, className = '' }) => {
    return (
        <div className={`relative overflow-hidden ${className}`}>
            {children}
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{
                    x: ['-100%', '100%']
                }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'linear'
                }}
            />
        </div>
    );
};

// ========================================
// CUSTOM HOOKS
// ========================================

/**
 * Hook for parallax effect
 */
export const useParallax = (value, distance = 50) => {
    return useTransform(value, [0, 1], [-distance, distance]);
};

/**
 * Hook for smooth scroll animation
 */
export const useSmoothScroll = () => {
    const scrollY = useMotionValue(0);

    useEffect(() => {
        const handleScroll = () => {
            scrollY.set(window.scrollY);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [scrollY]);

    return scrollY;
};
