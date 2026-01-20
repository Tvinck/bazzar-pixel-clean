import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X, Check, Calendar } from 'lucide-react';
import { useSound } from '../context/SoundContext';
import { analytics } from '../lib/supabase';

const STREAK_REWARDS = [
    { day: 1, reward: 1 },
    { day: 2, reward: 2 },
    { day: 3, reward: 5 },
    { day: 4, reward: 8 },
    { day: 5, reward: 12 },
    { day: 6, reward: 15 },
    { day: 7, reward: 50, big: true }, // Big reward
];

const DailyBonusModal = ({ isOpen, onClose, user }) => {
    const { playClick } = useSound();
    const [currentDay, setCurrentDay] = useState(1);
    const [claimed, setClaimed] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // In a real app, calculate streak from user data
            // For now, check localStorage mock
            const lastClaim = localStorage.getItem('last_bonus_claim');
            const streak = parseInt(localStorage.getItem('bonus_streak') || 0);

            // Logic to determine if ready to claim and what day
            // Simplified for demo: Always show Day 1 if no history, or next day
            setCurrentDay(streak < 7 ? streak + 1 : 1);
        }
    }, [isOpen]);

    const handleClaim = async () => {
        setLoading(true);
        playClick();

        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        }

        // Mock API delay
        setTimeout(async () => {
            setLoading(false);
            setClaimed(true);

            // Update local storage
            localStorage.setItem('last_bonus_claim', new Date().toISOString());
            localStorage.setItem('bonus_streak', currentDay.toString());

            // Track event & Add credits
            if (user) {
                await analytics.addCredits(user.id, STREAK_REWARDS[currentDay - 1].reward);
                await analytics.trackEvent(user.id, 'daily_bonus_claimed', {
                    day: currentDay,
                    reward: STREAK_REWARDS[currentDay - 1].reward
                });
            }

            // Close after delay
            setTimeout(() => {
                onClose();
            }, 2000);
        }, 1500);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md px-4"
                >
                    <motion.div
                        initial={{ scale: 0.8, y: 50 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.8, y: 50 }}
                        className="w-full max-w-sm bg-white dark:bg-[#1a1c22] rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden"
                    >
                        {/* Background Effects */}
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-xl" />

                        <div className="relative z-10 text-center">
                            <h2 className="text-2xl font-black font-display text-slate-900 dark:text-white mb-2">
                                Daily Bonus
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">
                                Заходи каждый день и получай награды!
                            </p>

                            {/* Streak Grid */}
                            <div className="grid grid-cols-4 gap-2 mb-8">
                                {STREAK_REWARDS.map((item, index) => {
                                    const isActive = index + 1 === currentDay;
                                    const isPast = index + 1 < currentDay;
                                    const isBig = item.big;

                                    return (
                                        <div
                                            key={item.day}
                                            className={`
                                                relative rounded-2xl flex flex-col items-center justify-center p-2 border-2 transition-all
                                                ${isBig ? 'col-span-2 aspect-[2/1]' : 'aspect-square'}
                                                ${isActive
                                                    ? 'bg-indigo-500 border-indigo-500 shadow-lg shadow-indigo-500/30 scale-105 z-10'
                                                    : isPast
                                                        ? 'bg-green-500/10 border-green-500 dark:border-green-400'
                                                        : 'bg-slate-100 dark:bg-slate-800 border-transparent opacity-50'}
                                            `}
                                        >
                                            {isPast ? (
                                                <Check size={isBig ? 32 : 20} className="text-green-500" strokeWidth={3} />
                                            ) : (
                                                <>
                                                    <span className={`text-[10px] font-bold uppercase mb-1 ${isActive ? 'text-white/70' : 'text-slate-400'}`}>
                                                        Day {item.day}
                                                    </span>
                                                    <div className="flex items-center gap-0.5">
                                                        <span className={`font-black ${isBig ? 'text-2xl' : 'text-lg'} ${isActive ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                                                            +{item.reward}
                                                        </span>
                                                        <Zap size={isBig ? 20 : 12} className={`${isActive ? 'text-amber-300 fill-amber-300' : 'text-amber-500 fill-amber-500'}`} />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Claim Button */}
                            <button
                                onClick={handleClaim}
                                disabled={claimed || loading}
                                className={`
                                    w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 text-lg shadow-xl transition-all active:scale-95
                                    ${claimed
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 text-white animate-pulse-slow'}
                                `}
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : claimed ? (
                                    <>
                                        <Check size={24} strokeWidth={3} />
                                        CLAIMED
                                    </>
                                ) : (
                                    <>
                                        CLAIM BONUS
                                        <Zap className="fill-white" />
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Close Button (only if not forcing) */}
                        {!claimed && (
                            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white p-2">
                                <X size={20} />
                            </button>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DailyBonusModal;
