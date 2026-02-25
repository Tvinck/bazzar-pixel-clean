import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X, Check, Calendar, Sparkles } from 'lucide-react';
import { useSound } from '../context/SoundContext';
import { analytics } from '../lib/supabase';
import { useLanguage } from '../context/LanguageContext';
import AnimatedIcon from './ui/AnimatedIcon';

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
    const { playClick, playSuccess } = useSound();
    const { t } = useLanguage();
    const [currentDay, setCurrentDay] = useState(1);
    const [claimed, setClaimed] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const lastClaim = localStorage.getItem('last_bonus_claim');
            const streak = parseInt(localStorage.getItem('bonus_streak') || 0);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            // If last claim was NOT yesterday, reset streak (user missed a day)
            if (lastClaim && lastClaim !== yesterday.toDateString() && lastClaim !== today.toDateString()) {
                localStorage.setItem('bonus_streak', '0');
                setCurrentDay(1);
            } else {
                setCurrentDay(streak < 7 ? streak + 1 : 1);
            }
            setClaimed(false);
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
            playSuccess && playSuccess();

            localStorage.setItem('last_bonus_claim', new Date().toDateString());
            localStorage.setItem('bonus_streak', currentDay.toString());

            if (user) {
                await analytics.addCredits(user.id, STREAK_REWARDS[currentDay - 1].reward);
                await analytics.trackEvent(user.id, 'daily_bonus_claimed', {
                    day: currentDay,
                    reward: STREAK_REWARDS[currentDay - 1].reward
                });
            }

            setTimeout(() => {
                onClose();
            }, 2500);
        }, 1200);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    {/* Modal Card */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="w-full max-w-sm bg-[#1c1c1e] rounded-[32px] overflow-hidden relative z-10 border border-white/10 shadow-2xl"
                    >
                        {/* Decorative Glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-[#3390ec]/20 blur-[60px] pointer-events-none" />

                        <div className="relative p-6 text-center">
                            {/* Icon */}
                            <motion.div
                                className="w-20 h-20 mx-auto bg-[#3390ec]/10 rounded-full flex items-center justify-center mb-5 ring-1 ring-[#3390ec]/30 shadow-[0_0_30px_rgba(51,144,236,0.2)]"
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                            >
                                <AnimatedIcon icon={Sparkles} className="text-[#3390ec]" size={40} delay={0.2} />
                            </motion.div>

                            {/* Title */}
                            <h2 className="text-2xl font-black text-white mb-2 leading-tight">
                                ЕЖЕДНЕВНЫЙ<br />БОНУС
                            </h2>
                            <p className="text-[#3390ec] font-bold text-[13px] uppercase tracking-widest mb-8">
                                ЗАБИРАЙ ЗАРЯДЫ КАЖДЫЙ ДЕНЬ ⚡
                            </p>

                            {/* Streak Grid */}
                            <div className="grid grid-cols-4 gap-2 mb-8">
                                {STREAK_REWARDS.map((item, index) => {
                                    const isActive = index + 1 === currentDay;
                                    const isPast = index + 1 < currentDay;
                                    const isBig = item.big;

                                    return (
                                        <motion.div
                                            key={item.day}
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: isActive ? 1.05 : 1, opacity: 1 }}
                                            transition={{ delay: index * 0.05, type: 'spring' }}
                                            className={`
                                                relative flex flex-col items-center justify-center rounded-xl p-2 transition-all border
                                                ${isBig ? 'col-span-2 aspect-[2/1]' : 'aspect-square'}
                                                ${isActive
                                                    ? 'bg-[#3390ec] border-[#3390ec] shadow-[0_4px_12px_rgba(51,144,236,0.3)] z-10'
                                                    : isPast
                                                        ? 'bg-[#2c2c2e] border-[#3390ec]/30 opacity-60'
                                                        : 'bg-[#2c2c2e] border-white/5 opacity-40'}
                                            `}
                                        >
                                            {isPast ? (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                                                >
                                                    <Check size={20} className="text-[#3390ec]" strokeWidth={3} />
                                                </motion.div>
                                            ) : (
                                                <>
                                                    <span className={`text-[9px] font-bold uppercase mb-0.5 ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                                                        День {item.day}
                                                    </span>
                                                    <div className="flex items-center gap-0.5">
                                                        <span className={`font-black ${isBig ? 'text-xl' : 'text-base'} ${isActive ? 'text-white' : 'text-white'}`}>
                                                            {item.reward}
                                                        </span>
                                                        <AnimatedIcon
                                                            icon={Zap}
                                                            size={isBig ? 16 : 12}
                                                            className={isActive ? 'text-white fill-white' : 'text-gray-500 fill-gray-500'}
                                                            disableHover
                                                            disableTap
                                                            delay={0.1 + (index * 0.05)}
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Action Button */}
                            <motion.button
                                onClick={handleClaim}
                                disabled={claimed || loading}
                                animate={!claimed && !loading ? { scale: [1, 1.05, 1] } : {}}
                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                whileTap={{ scale: 0.95 }}
                                className={`
                                    w-full py-4 rounded-2xl font-bold text-base uppercase tracking-wider transition-all relative overflow-hidden
                                    ${claimed
                                        ? 'bg-green-500 text-white shadow-[0_4px_12px_rgba(34,197,94,0.3)]'
                                        : 'bg-white text-black hover:bg-white/90 shadow-[0_4px_12px_rgba(255,255,255,0.2)]'}
                                `}
                            >
                                <div className="relative z-10 flex items-center justify-center gap-2">
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                    ) : claimed ? (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring' }}
                                            className="flex items-center gap-2"
                                        >
                                            <Check size={20} strokeWidth={3} />
                                            <span>Получено</span>
                                        </motion.div>
                                    ) : (
                                        <motion.div className="flex items-center gap-2">
                                            <span>Забрать</span>
                                            <AnimatedIcon icon={Zap} size={18} className="fill-black" disableHover disableTap />
                                        </motion.div>
                                    )}
                                </div>
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default DailyBonusModal;
