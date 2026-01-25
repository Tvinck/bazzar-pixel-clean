import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';

const Header = ({ onTabChange, onOpenPayment, balance = 10, isDark }) => {
    const { t } = useLanguage();

    return (
        <header className="fixed top-32 left-2 right-2 z-50 transition-all duration-300">
            {/* Premium Floating Island Header */}
            <div className="bg-[#0f0f10]/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-[2rem] mx-auto max-w-screen-xl relative overflow-hidden">
                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] animate-[shimmer_8s_infinite]" />

                <div className="px-5 h-16 flex items-center justify-between relative z-10">

                    {/* Left: Premium Logo */}
                    <div className="flex items-center gap-3.5 cursor-pointer group" onClick={() => onTabChange('home')}>
                        <div className="relative">
                            <div className="absolute -inset-2 bg-indigo-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="w-10 h-10 bg-gradient-to-br from-[#1c1c1e] to-black rounded-[14px] flex items-center justify-center shadow-lg ring-1 ring-white/10 group-hover:scale-105 transition-transform duration-300 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <span className="font-display font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-purple-400 text-xl translate-y-[1px]">P</span>
                            </div>
                        </div>
                        <div className="flex flex-col justify-center -space-y-0.5">
                            <span className="font-display font-bold text-xl text-white tracking-tight leading-none group-hover:text-indigo-400 transition-colors">
                                Pixel
                            </span>
                            <span className="text-[9px] font-bold text-white/30 tracking-[0.3em] uppercase">
                                Studio
                            </span>
                        </div>
                    </div>

                    {/* Right: Premium Buy | Balance Pill */}
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={onOpenPayment}
                        className="relative flex items-center bg-[#1c1c1e] border border-white/10 rounded-full h-10 pl-1.5 pr-5 transition-all hover:bg-white/5 group overflow-hidden shadow-lg shadow-black/20"
                    >
                        {/* Coin Container */}
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-300 to-yellow-600 flex items-center justify-center shadow-sm relative z-10 box-content border-2 border-[#1c1c1e] group-hover:scale-110 transition-transform duration-300">
                            <div className="w-5 h-5 rounded-full border border-white/30 flex items-center justify-center">
                                <span className="text-[10px] font-black text-yellow-900">₽</span>
                            </div>
                        </div>

                        {/* Balance Text */}
                        <div className="flex flex-col items-start ml-2.5 mr-3 relative z-10">
                            <span className="text-[10px] font-bold text-white/40 uppercase leading-none mb-0.5 group-hover:text-white/60 transition-colors">Balance</span>
                            <span className="text-sm font-black text-white leading-none tabular-nums">{balance}</span>
                        </div>

                        {/* Animated Plus */}
                        <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center absolute right-1.5 group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-300">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-white/50 group-hover:text-white transition-colors">
                                <path d="M12 5v14M5 12h14" />
                            </svg>
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
