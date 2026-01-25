import React from 'react';
import { motion } from 'framer-motion';
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

    return (
        <motion.header
            className="fixed left-0 right-0 z-50 flex justify-center"
            initial={false}
            animate={{
                top: isCompact ? 32 : 112, // 32px (~top-8) vs 112px (~top-28)
            }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
            {/* Premium Floating Island Header */}
            <motion.div
                layout
                className={`bg-[#0f0f10]/90 backdrop-blur-2xl border border-white/10 shadow-2xl relative overflow-hidden ring-1 ring-white/5 ${isCompact ? 'rounded-full' : 'rounded-[2rem] w-full mx-2 max-w-screen-xl'}`}
                animate={{
                    width: isCompact ? 'auto' : '100%',
                }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
            >
                {/* Shine Effect */}
                {!isCompact && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] animate-[shimmer_6s_infinite]" />
                )}

                <motion.div
                    layout
                    className={`flex items-center justify-between relative z-10 transition-all ${isCompact ? 'px-3 h-11 bg-black/40 gap-4' : 'px-5 h-16'}`}
                >

                    {/* Left: Premium Generated Logo */}
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onTabChange('home')}>
                        <motion.div
                            layout
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                            className={`relative ${isCompact ? 'w-8 h-8' : 'w-11 h-11'}`}
                        >
                            <div className="absolute inset-0 bg-indigo-500/30 blur-lg rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
                            <img src={headerLogo} alt="Pixel AI" className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)] mix-blend-screen" />
                        </motion.div>

                        {!isCompact && (
                            <motion.div
                                initial={{ opacity: 1, width: 'auto' }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                className="flex flex-col justify-center gap-0.5"
                            >
                                <span className="font-display font-black text-xl text-white tracking-tight leading-none group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-purple-400 transition-all">
                                    Pixel
                                </span>
                                <span className="text-[9px] font-bold text-white/40 tracking-[0.3em] uppercase">
                                    AI Studio
                                </span>
                            </motion.div>
                        )}
                    </div>

                    {/* Right: Premium Buy | Balance Pill */}
                    <motion.button
                        layout
                        whileTap={{ scale: 0.95 }}
                        onClick={onOpenPayment}
                        className={`relative flex items-center border border-white/10 rounded-full transition-all hover:bg-white/5 group overflow-hidden shadow-lg shadow-black/20 ${isCompact ? 'bg-transparent border-0 pl-0 h-auto' : 'bg-[#1c1c1e] h-11 pl-2 pr-5'}`}
                    >
                        {/* Coin Container */}
                        <motion.div
                            layout
                            className={`relative box-content group-hover:scale-110 transition-transform duration-300 ${isCompact ? 'w-6 h-6 mr-1.5' : 'w-8 h-8 mr-3'}`}
                        >
                            <div className="absolute inset-0 bg-amber-500/20 blur-md rounded-full" />
                            <img src={headerCoin} alt="Credits" className="w-full h-full object-contain relative z-10 mix-blend-screen" />
                        </motion.div>

                        {/* Balance Text */}
                        <motion.div layout className={`flex flex-col items-start relative z-10 ${isCompact ? 'mr-1' : 'mr-4'}`}>
                            {!isCompact && (
                                <span className="text-[9px] font-bold text-white/40 uppercase leading-none mb-0.5 group-hover:text-white/60 transition-colors tracking-wider">
                                    БАЛАНС
                                </span>
                            )}
                            <span className={`${isCompact ? 'text-sm font-bold' : 'text-sm font-black'} text-white leading-none tabular-nums tracking-wide drop-shadow-sm`}>
                                {balance.toLocaleString()}
                            </span>
                        </motion.div>

                        {!isCompact && (
                            <>
                                {/* Vertical Separator */}
                                <div className="w-[1px] h-4 bg-white/10 mr-4" />

                                {/* Animated Buy Text */}
                                <div className="relative overflow-hidden">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 animate-gradient-x">
                                        КУПИТЬ
                                    </span>
                                </div>

                                {/* Gradient Glow on Hover */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                            </>
                        )}

                        {isCompact && (
                            <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center ml-2">
                                <span className="text-xs text-white leading-none mb-[1px]">+</span>
                            </div>
                        )}
                    </motion.button>

                </motion.div>
            </motion.div>
        </motion.header>
    );
};

export default Header;
