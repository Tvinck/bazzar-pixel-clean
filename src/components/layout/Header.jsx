import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';

const Header = ({ onTabChange, onOpenPayment, balance = 10, isDark }) => {
    const { t } = useLanguage();

    return (
        <header className="fixed top-0 left-0 right-0 z-40 transition-transform duration-300">
            {/* Added extra padding for Fullscreen Mode breathing room */}
            <div className="bg-white dark:bg-[#0f1014] border-b border-slate-200 dark:border-white/5 shadow-sm pt-[calc(env(safe-area-inset-top)+16px)] pb-3 transition-colors duration-300">
                <div className="max-w-screen-xl mx-auto px-5 h-14 flex items-center justify-between mt-1">

                    {/* Left: Logo */}
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => onTabChange('home')}>
                        <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-[12px] flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/10 transform rotate-3">
                            <span className="font-display font-black text-white text-xl translate-y-[1px]">P</span>
                        </div>
                        <div className="flex flex-col justify-center -space-y-1">
                            <span className="font-display font-extrabold text-2xl text-slate-900 dark:text-white tracking-tight leading-none">
                                pixel
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 dark:text-white/40 tracking-[0.2em] uppercase">
                                ai studio
                            </span>
                        </div>
                    </div>

                    {/* Right: Buy | Balance Pill */}
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={onOpenPayment}
                        className="flex items-center bg-slate-100 dark:bg-[#1A1B23] border border-slate-200 dark:border-white/10 rounded-full h-9 pl-4 pr-1 transition-all hover:bg-slate-200 dark:hover:bg-[#252630] group shadow-sm max-w-[160px]"
                    >
                        <div className="text-[10px] font-bold text-slate-500 dark:text-white/40 tracking-wider uppercase group-hover:text-slate-700 dark:group-hover:text-white/80 transition-colors mr-3">
                            КУПИТЬ
                        </div>
                        <div className="w-[1px] h-3 bg-slate-300 dark:bg-white/10 mr-3" />
                        <div className="flex items-center gap-2">
                            <span className="text-[15px] font-bold text-slate-900 dark:text-white tabular-nums transition-colors">{balance}</span>
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-sm ring-1 ring-white/50 dark:ring-white/5">
                                <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
                            </div>
                        </div>
                    </motion.button>

                </div>
            </div>
        </header>
    );
};

export default Header;
