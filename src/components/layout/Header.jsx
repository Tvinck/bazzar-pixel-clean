import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import headerLogo from '../../assets/header-logo.png';
import headerCoin from '../../assets/header-coin.png';

const Header = ({ onTabChange, onOpenPayment, balance = 10, isDark }) => {
    const { t } = useLanguage();

    return (
        <header className="fixed top-28 left-2 right-2 z-50 transition-all duration-300">
            {/* Premium Floating Island Header */}
            <div className="bg-[#0f0f10]/90 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-[2rem] mx-auto max-w-screen-xl relative overflow-hidden ring-1 ring-white/5">
                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] animate-[shimmer_6s_infinite]" />

                <div className="px-5 h-16 flex items-center justify-between relative z-10">

                    {/* Left: Premium Generated Logo */}
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onTabChange('home')}>
                        <motion.div
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative w-11 h-11"
                        >
                            <div className="absolute inset-0 bg-indigo-500/30 blur-lg rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
                            <img src={headerLogo} alt="Pixel AI" className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                        </motion.div>
                        <div className="flex flex-col justify-center gap-0.5">
                            <span className="font-display font-black text-xl text-white tracking-tight leading-none group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-purple-400 transition-all">
                                Pixel
                            </span>
                            <span className="text-[9px] font-bold text-white/40 tracking-[0.3em] uppercase">
                                AI Studio
                            </span>
                        </div>
                    </div>

                    {/* Right: Premium Buy | Balance Pill */}
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={onOpenPayment}
                        className="relative flex items-center bg-[#1c1c1e] border border-white/10 rounded-full h-11 pl-2 pr-5 transition-all hover:bg-white/5 group overflow-hidden shadow-lg shadow-black/20"
                    >
                        {/* Coin Container (Generated 3D Icon) */}
                        <div className="w-8 h-8 relative box-content group-hover:scale-110 transition-transform duration-300 mr-3">
                            <div className="absolute inset-0 bg-amber-500/20 blur-md rounded-full" />
                            <img src={headerCoin} alt="Credits" className="w-full h-full object-contain relative z-10" />
                        </div>

                        {/* Balance Text */}
                        <div className="flex flex-col items-start mr-4 relative z-10">
                            <span className="text-[9px] font-bold text-white/40 uppercase leading-none mb-0.5 group-hover:text-white/60 transition-colors tracking-wider">
                                БАЛАНС
                            </span>
                            <span className="text-sm font-black text-white leading-none tabular-nums tracking-wide drop-shadow-sm">
                                {balance.toLocaleString()}
                            </span>
                        </div>

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
                    </motion.button>

                </div>
            </div>
        </header>
    );
};

export default Header;
