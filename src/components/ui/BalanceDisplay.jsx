import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Plus, TrendingUp } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useUser } from '../../context/UserContext'; // Added

const BalanceDisplay = ({ balance: propBalance, onClick }) => {
    const { t } = useLanguage();
    const { stats } = useUser();

    // Use prop if provided (for demos), otherwise real stats
    const balance = propBalance !== undefined ? propBalance : (stats?.current_balance || 0);

    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative group overflow-hidden rounded-2xl focus:outline-none"
        >
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 opacity-100 group-hover:opacity-100 animate-gradient-xy" />

            {/* Shine Effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </div>

            {/* Content Container */}
            <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-900 dark:to-slate-800 rounded-2xl px-3 py-1.5 flex items-center gap-2 border border-amber-200/50 dark:border-amber-500/20 shadow-lg shadow-amber-500/10">
                {/* Balance Part */}
                <div className="flex items-center gap-1.5">
                    <div className="relative">
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                repeatDelay: 3
                            }}
                        >
                            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                        </motion.div>
                        <div className="absolute inset-0 bg-amber-400 blur-md opacity-50 animate-pulse" />
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="font-black text-base leading-none bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
                            {balance.toLocaleString()}
                        </span>
                        <span className="text-[8px] text-amber-600/70 dark:text-amber-400/70 font-bold uppercase tracking-wider leading-none">Credits</span>
                    </div>
                </div>

                {/* Divider */}
                <div className="w-px h-5 bg-gradient-to-b from-transparent via-amber-300 dark:via-amber-600 to-transparent" />

                {/* Buy Action */}
                <div className="flex items-center gap-1 group-hover:gap-1.5 transition-all">
                    <div className="flex flex-col items-start">
                        <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wide leading-none">
                            {t?.balance?.buy || 'Top Up'}
                        </span>
                        <div className="flex items-center gap-0.5 text-[7px] text-emerald-600 dark:text-emerald-400 font-bold">
                            <TrendingUp size={8} />
                            <span>+50% Bonus</span>
                        </div>
                    </div>
                    <motion.div
                        className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-1 shadow-md"
                        whileHover={{ rotate: 90 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Plus size={10} className="text-white" strokeWidth={3} />
                    </motion.div>
                </div>
            </div>
        </motion.button>
    );
};

export default BalanceDisplay;
