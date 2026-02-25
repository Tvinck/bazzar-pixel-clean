import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Sparkles, Zap, Image, Video, Music, Trophy, Gift, ArrowRight, Check } from 'lucide-react';
import { useSound } from '../context/SoundContext';

const Onboarding = ({ onComplete }) => {
    const { playClick, playSuccess } = useSound();
    const [step, setStep] = useState(0);

    const slides = [
        {
            id: 'welcome',
            icon: <Sparkles size={48} className="text-amber-400" />,
            title: "Добро пожаловать!",
            desc: "Pixel AI — ваша творческая студия в кармане. Создавайте шедевры за секунды.",
            bg: "from-indigo-500 to-purple-600",
            buttonText: "Начать",
            showSkip: true
        },
        {
            id: 'features',
            icon: <Zap size={48} className="text-blue-400" />,
            title: "Всё в одном",
            desc: "Генерация изображений, видео, музыки и анимации. Никаких границ для фантазии.",
            bg: "from-blue-500 to-cyan-500",
            content: (
                <div className="grid grid-cols-3 gap-2 w-full py-2">
                    {[
                        { icon: <Image size={24} />, label: "Арт", color: "text-violet-500", bg: "bg-violet-500/10" },
                        { icon: <Video size={24} />, label: "Видео", color: "text-pink-500", bg: "bg-pink-500/10" },
                        { icon: <Music size={24} />, label: "Звук", color: "text-amber-500", bg: "bg-amber-500/10" }
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`flex flex-col items-center gap-2 p-3 rounded-2xl ${item.bg} border-2 border-transparent hover:border-${item.color.split('-')[1]}-200 transition-colors`}
                        >
                            <div className={`${item.color}`}>
                                {item.icon}
                            </div>
                            <span className="text-[11px] font-bold opacity-70">{item.label}</span>
                        </motion.div>
                    ))}
                </div>
            ),
            buttonText: "Далее"
        },
        {
            id: 'rewards',
            icon: <Trophy size={48} className="text-amber-400" />,
            title: "Играй и Получай",
            desc: "Выполняйте задания, повышайте уровень и получайте бесплатные кредиты каждый день.",
            bg: "from-amber-500 to-orange-500",
            buttonText: "Круто!"
        },
        {
            id: 'gift',
            icon: <Gift size={48} className="text-emerald-400" />,
            title: "Ваш подарок",
            desc: "Мы начислили вам стартовый бонус для первых экспериментов.",
            bg: "from-emerald-500 to-teal-500",
            buttonText: "Забрать 20 кредитов",
            isFinal: true
        }
    ];

    const handleNext = () => {
        playClick();
        if (step < slides.length - 1) {
            setStep(step + 1);
        } else {
            completeOnboarding();
        }
    };

    const completeOnboarding = () => {
        playSuccess();
        localStorage.setItem('pixel_onboarding_complete', 'true');
        onComplete();
    };

    const currentSlide = slides[step];

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4">
            {/* Backdrop / Wallpaper */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity duration-500" />

            {/* Interactive Card */}
            <motion.div
                key={step} // Key change triggers animation
                initial={{ y: "100%", opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: "-10%", opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full max-w-md bg-white dark:bg-[#1c1c1e] rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
                {/* Drag Handle (Mobile Visual) */}
                <div className="absolute top-0 left-0 right-0 h-6 flex justify-center items-center z-20 sm:hidden pointer-events-none">
                    <div className="w-10 h-1 bg-white/30 rounded-full backdrop-blur-md shadow-sm" />
                </div>

                {/* Decorative Gradient Header */}
                <div className={`h-32 bg-gradient-to-br ${currentSlide.bg} relative overflow-hidden flex items-center justify-center transition-colors duration-500`}>
                    <div className="absolute inset-0 bg-white/10 pattern-dots opacity-30" />

                    {/* Animated Icon */}
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", damping: 15 }}
                        className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg border border-white/20"
                    >
                        {currentSlide.icon}
                    </motion.div>

                    {/* Skip Button */}
                    {currentSlide.showSkip && (
                        <button
                            onClick={completeOnboarding}
                            className="absolute top-4 right-4 text-white/70 hover:text-white text-xs font-bold uppercase tracking-wider px-3 py-1 bg-black/10 rounded-full backdrop-blur-sm transition-colors"
                        >
                            Skip
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="p-8 flex flex-col items-center text-center space-y-4 flex-1">
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        delay={0.1}
                        className="text-2xl font-display font-bold text-slate-900 dark:text-white"
                    >
                        {currentSlide.title}
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        delay={0.2}
                        className="text-slate-500 dark:text-slate-400 text-base leading-relaxed"
                    >
                        {currentSlide.desc}
                    </motion.p>

                    {/* Custom Content (Features Grid etc) */}
                    {currentSlide.content && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            delay={0.3}
                            className="w-full"
                        >
                            {currentSlide.content}
                        </motion.div>
                    )}

                    <div className="flex-1" /> {/* Spacer */}

                    {/* Indicators */}
                    <div className="flex gap-1.5 mb-6">
                        {slides.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 rounded-full transition-all duration-300 ${i === step
                                    ? `w-6 bg-gradient-to-r ${currentSlide.bg}`
                                    : 'w-1.5 bg-slate-200 dark:bg-slate-700'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Action Button */}
                    <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={handleNext}
                        className={`w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all bg-gradient-to-r ${currentSlide.bg}`}
                    >
                        {currentSlide.buttonText}
                        {currentSlide.isFinal ? <Check size={20} /> : <ArrowRight size={20} />}
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
};

export default Onboarding;
