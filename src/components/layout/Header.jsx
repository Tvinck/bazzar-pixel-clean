import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import headerLogo from '../../assets/header-logo.png';
import headerCoin from '../../assets/header-coin.png';

const Header = ({ onTabChange, onOpenPayment, balance = 10, isDark }) => {
    const { t } = useLanguage();
    const [isCompact, setIsCompact] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            // Collapse when scrolled down more than 50px
            setIsCompact(scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const springConfig = { type: "spring", stiffness: 90, damping: 14, mass: 0.8 };

    return (
        <motion.header
            className="fixed left-0 right-0 z-50 flex justify-center"
            initial={false}
            animate={{
                top: isCompact ? 32 : 112, // 32px (~top-8) vs 112px (~top-28)
            }}
            transition={springConfig}
        >
            {/* Premium Floating Island Header */}
            <motion.div
                layout
                className={`bg-[#0f0f10]/90 backdrop-blur-2xl border border-white/10 shadow-2xl relative overflow-hidden ring-1 ring-white/5 mx-auto`}
                animate={{
                    width: isCompact ? 'auto' : '100%',
                    borderRadius: isCompact ? 9999 : 32, // Full vs 2rem
                    maxWidth: isCompact ? '600px' : '1280px',
                }}
                style={{
                    // Constrain max width for animation smoothness
                    maxWidth: '100vw',
                    margin: isCompact ? '0' : '0 12px'
                }}
                transition={springConfig}
            >
                {/* Shine Effect */}
                <AnimatePresence>
                    {!isCompact && (
                        <motion.div
                            key="shine-effect"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] animate-[shimmer_6s_infinite]"
                        />
                    )}
                </AnimatePresence>

                <motion.div
                    layout
                    className={`flex items-center justify-between relative z-10`}
                    animate={{
                        paddingLeft: isCompact ? 12 : 20,
                        paddingRight: isCompact ? 12 : 20,
                        height: isCompact ? 44 : 64, // 11 (2.75rem) vs 16 (4rem)
                        gap: isCompact ? 16 : 0,
                    }}
                    transition={springConfig}
                >

                    {/* Left: Premium Generated Logo */}
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onTabChange('home')}>
                        <motion.div
                            layout
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative"
                            animate={{
                                width: isCompact ? 32 : 44,
                                height: isCompact ? 32 : 44
                            }}
                            transition={springConfig}
                        >
                            <div className="absolute inset-0 bg-indigo-500/30 blur-lg rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
                            <img src={headerLogo} alt="Pixel AI" className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)] mix-blend-screen" />
                        </motion.div>

                        <motion.div layout className="flex flex-col justify-center gap-0.5 overflow-hidden">
                            <motion.span
                                layout
                                className="font-display font-black text-white tracking-tight leading-none group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-purple-400 transition-all whitespace-nowrap"
                                animate={{
                                    opacity: isCompact ? 0 : 1,
                                    height: isCompact ? 0 : 'auto',
                                    fontSize: isCompact ? 0 : 20
                                }}
                            >
                                Pixel
                            </motion.span>
                            <motion.span
                                layout
                                className="font-bold text-white/40 tracking-[0.3em] uppercase whitespace-nowrap"
                                animate={{
                                    opacity: isCompact ? 0 : 1,
                                    height: isCompact ? 0 : 'auto',
                                    fontSize: isCompact ? 0 : 9
                                }}
                            >
                                AI Studio
                            </motion.span>
                        </motion.div>
                    </div>

                    {/* Right: Premium Buy | Balance Pill */}
                    <motion.button
                        layout
                        whileTap={{ scale: 0.95 }}
                        onClick={onOpenPayment}
                        className={`relative flex items-center border rounded-full transition-all group overflow-hidden shadow-lg shadow-black/20`}
                        animate={{
                            backgroundColor: isCompact ? 'transparent' : '#1c1c1e',
                            borderColor: isCompact ? 'transparent' : 'rgba(255,255,255,0.1)',
                            height: isCompact ? 'auto' : 44,
                            paddingLeft: isCompact ? 0 : 8,
                            paddingRight: isCompact ? 0 : 20,
                        }}
                        transition={springConfig}
                    >
                        {/* Coin Container */}
                        <motion.div
                            layout
                            className="relative box-content group-hover:scale-110 transition-transform duration-300"
                            animate={{
                                width: isCompact ? 24 : 32,
                                height: isCompact ? 24 : 32,
                                marginRight: isCompact ? 6 : 12
                            }}
                            transition={springConfig}
                        >
                            <div className="absolute inset-0 bg-amber-500/20 blur-md rounded-full" />
                            <img src={headerCoin} alt="Credits" className="w-full h-full object-contain relative z-10 mix-blend-screen" />
                        </motion.div>

                        {/* Balance Text */}
                        <motion.div layout className={`flex flex-col items-start relative z-10`}>
                            <motion.span
                                layout
                                className="font-bold text-white/40 uppercase leading-none mb-0.5 group-hover:text-white/60 transition-colors tracking-wider whitespace-nowrap"
                                animate={{
                                    opacity: isCompact ? 0 : 1,
                                    height: isCompact ? 0 : 'auto',
                                    fontSize: isCompact ? 0 : 9,
                                    marginRight: isCompact ? 0 : 16
                                }}
                            >
                                БАЛАНС
                            </motion.span>
                            <motion.span
                                layout
                                className={`text-white leading-none tabular-nums tracking-wide drop-shadow-sm`}
                                animate={{
                                    fontWeight: isCompact ? 700 : 900,
                                    fontSize: isCompact ? 14 : 14
                                }}
                            >
                                {balance.toLocaleString()}
                            </motion.span>
                        </motion.div>

                        {/* Separator, Action Text, Shimmer  */}
                        <motion.div
                            layout
                            className="flex items-center overflow-hidden"
                            animate={{
                                width: isCompact ? 0 : 'auto',
                                opacity: isCompact ? 0 : 1
                            }}
                        >
                            {/* Vertical Separator */}
                            <div className="w-[1px] h-4 bg-white/10 mr-4 flex-shrink-0" />

                            {/* Animated Buy Text */}
                            <div className="relative overflow-hidden flex-shrink-0">
                                <span className="text-[10px] font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 animate-gradient-x whitespace-nowrap">
                                    КУПИТЬ
                                </span>
                            </div>

                            {/* Gradient Glow on Hover */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        </motion.div>

                        {/* Plus Button for Compact Mode */}
                        <motion.div
                            layout
                            className="rounded-full bg-white/10 flex items-center justify-center overflow-hidden"
                            animate={{
                                width: isCompact ? 20 : 0,
                                height: isCompact ? 20 : 0,
                                opacity: isCompact ? 1 : 0,
                                marginLeft: isCompact ? 8 : 0
                            }}
                        >
                            <span className="text-xs text-white leading-none mb-[1px]">+</span>
                        </motion.div>
                    </motion.button>

                </motion.div>
            </motion.div>
        </motion.header>
    );
};

export default Header;
