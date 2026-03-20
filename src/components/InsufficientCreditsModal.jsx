import React from 'react';
import { motion } from 'framer-motion';
import BottomSheet from './ui/BottomSheet';
import { X, Zap, ArrowRight, Gift } from 'lucide-react';
import { useSound } from '../context/SoundContext';
import { PACKS } from './PaymentDrawer';

// Custom Animated Battery Component
const AnimatedBattery = () => {
    return (
        <div className="relative w-[100px] h-[160px] mx-auto mb-8 group cursor-pointer">
            {/* Energy Aura */}
            <div className="absolute inset-0 bg-red-500/20 blur-[40px] rounded-full animate-pulse" />

            {/* Battery Body (Glass) */}
            <div className="absolute inset-0 rounded-[28px] border-[6px] border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm z-10 overflow-hidden shadow-2xl">
                {/* Reflections */}
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent opacity-50" />

                {/* Liquid Energy Level */}
                <motion.div
                    animate={{
                        height: ["12%", "15%", "12%"],
                        background: ["linear-gradient(to top, #ef4444, #f87171)", "linear-gradient(to top, #dc2626, #ef4444)"]
                    }}
                    transition={{ duration: 2, repeat: Infinity, type: "tween", ease: "easeInOut" }}
                    className="absolute bottom-0 left-1 right-1 rounded-b-[20px] rounded-t-[4px] shadow-[0_0_30px_rgba(220,38,38,0.6)]"
                >
                    {/* Bubbles */}
                    {[1, 2, 3].map(i => (
                        <motion.div
                            key={i}
                            animate={{ y: -60, opacity: [0, 1, 0], x: (i % 2 === 0 ? 10 : -10) }}
                            transition={{ duration: 2 + i, repeat: Infinity, delay: i * 0.5 }}
                            className="absolute bottom-2 left-1/2 w-1.5 h-1.5 bg-white/50 rounded-full"
                        />
                    ))}
                    {/* Surface Wave */}
                    <motion.div
                        animate={{ x: [-20, 0, -20] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -top-1 left-[-50%] right-[-50%] h-3 bg-red-400 opacity-50 blur-[2px] rounded-full"
                    />
                </motion.div>

                {/* Warning Icon Overlay */}
                <div className="absolute inset-0 flex items-center justify-center z-20">
                    <motion.div
                        animate={{ opacity: [0.4, 1, 0.4], scale: [0.95, 1, 0.95] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        <Zap size={40} className="text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]" fill="currentColor" />
                    </motion.div>
                </div>
            </div>

            {/* Battery Cap */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-6 bg-white/10 rounded-t-[12px] border-t-[6px] border-l-[6px] border-r-[6px] border-white/10 z-0" />

            {/* Electric Arcs */}
            <motion.div
                className="absolute -right-6 top-1/2"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3 }}
            >
                <Zap size={20} className="text-white fill-white rotate-90" />
            </motion.div>
        </div>
    );
};

const InsufficientCreditsModal = ({ isOpen, onClose, onTopUp }) => {
    const { playClick } = useSound();

    // Select Best Offer
    const promoPack = PACKS.find(p => p.promo) || PACKS[0];

    const handleSubscribe = () => {
        playClick();
        window.open('https://t.me/pixel_imagess', '_blank');
        onClose();
    };

    const handleTopUp = () => {
        playClick();
        onTopUp();
        onClose();
    };

    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={onClose}
            title="Недостаточно кредитов"
            className="shadow-[0_-10px_60px_-15px_rgba(220,38,38,0.3)]"
        >
            <div className="relative">
                {/* --- BATTERY ANIMATION --- */}
                <AnimatedBattery />

                {/* Message */}
                <div className="text-center mb-8">
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[28px] font-black text-white mb-2 leading-tight tracking-tight"
                    >
                        КРИТИЧЕСКИЙ<br />
                        <span className="text-red-500 text-3xl drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">РАЗРЯД 12%</span>
                    </motion.h2>
                    <p className="text-white/40 text-sm font-medium">
                        Система не может продолжить генерацию.
                        Требуется источник питания.
                    </p>
                </div>

                {/* Flash Charge Offer */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    onClick={handleTopUp}
                    className="mb-4 bg-bg-secondary rounded-[28px] p-1.5 border border-white/5 cursor-pointer group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="flex items-center gap-4 bg-bg-secondary rounded-[24px] p-4 border border-white/5 relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-bg-elevated flex items-center justify-center text-green-400 shadow-[0_0_15px_rgba(74,222,128,0.2)]">
                            <Zap size={24} fill="currentColor" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="text-white font-black text-lg">FAST CHARGE</span>
                                <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded animate-pulse">
                                    -{Math.round((1 - promoPack.price / promoPack.originalPrice) * 100)}%
                                </span>
                            </div>
                            <div className="text-white/50 text-xs font-bold">
                                Мгновенное пополнение {promoPack.credits} CR
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-black text-white">{promoPack.price}₽</div>
                            <div className="text-[10px] text-white/30 line-through font-bold">{promoPack.originalPrice}₽</div>
                        </div>
                    </div>
                </motion.div>

                {/* Main Action */}
                <button
                    onClick={handleTopUp}
                    className="w-full h-16 rounded-[24px] relative overflow-hidden group shadow-[0_0_40px_rgba(34,197,94,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                    {/* Scanning line effect */}
                    <div className="absolute top-0 bottom-0 left-[-100%] w-[50%] bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-[shimmer_1s_infinite]" />

                    <span className="relative z-10 flex items-center justify-center gap-2 text-white font-black text-lg tracking-wide">
                        ПОДКЛЮЧИТЬ ПИТАНИЕ
                        <ArrowRight size={20} strokeWidth={3} />
                    </span>
                </button>

                {/* Secondary Action */}
                <button
                    onClick={handleSubscribe}
                    className="w-full mt-3 py-3 text-white/30 text-xs font-bold hover:text-white transition-colors flex items-center justify-center gap-2 group"
                >
                    <Gift size={14} className="group-hover:text-amber-400 transition-colors" />
                    Или получить +10 CR бесплатно
                </button>
            </div>
        </BottomSheet>
    );
};

export default InsufficientCreditsModal;
