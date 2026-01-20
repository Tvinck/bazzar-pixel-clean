import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Sparkles, Zap, Users, Image, Video, Music, Trophy, Gift } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Onboarding = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const { t } = useLanguage();

    const slides = [
        {
            id: 0,
            icon: <Sparkles size={64} className="text-amber-400" />,
            title: t.onboarding.slide1.title,
            desc: t.onboarding.slide1.desc,
            bg: "from-indigo-500 to-purple-600",
            example: "✨ Создавайте уникальный контент"
        },
        {
            id: 1,
            icon: <Image size={64} className="text-violet-400" />,
            title: t.onboarding.slide2.title,
            desc: t.onboarding.slide2.desc,
            bg: "from-violet-500 to-purple-500",
            example: "🎨 Фото → Фото: Измените стиль, добавьте объекты"
        },
        {
            id: 2,
            icon: <Video size={64} className="text-blue-400" />,
            title: t.onboarding.slide3.title,
            desc: t.onboarding.slide3.desc,
            bg: "from-blue-500 to-cyan-500",
            example: "🎬 Фото → Видео: Оживите изображения"
        },
        {
            id: 3,
            icon: <Music size={64} className="text-pink-400" />,
            title: t.onboarding.slide4.title,
            desc: t.onboarding.slide4.desc,
            bg: "from-pink-500 to-rose-500",
            example: "🎵 Текст → Музыка: Создайте саундтрек"
        },
        {
            id: 4,
            icon: <Trophy size={64} className="text-amber-400" />,
            title: t.onboarding.slide5.title,
            desc: t.onboarding.slide5.desc,
            bg: "from-amber-500 to-orange-500",
            example: "🏆 Зарабатывайте уровни и достижения"
        },
        {
            id: 5,
            icon: <Gift size={64} className="text-emerald-400" />,
            title: t.onboarding.slide6.title,
            desc: t.onboarding.slide6.desc,
            bg: "from-emerald-500 to-teal-500",
            example: "🎁 100 кредитов в подарок при регистрации!"
        }
    ];

    const handleNext = () => {
        if (step < slides.length - 1) {
            setStep(step + 1);
        } else {
            localStorage.setItem('pixel_onboarding_complete', 'true');
            onComplete();
        }
    };

    const handleSkip = () => {
        localStorage.setItem('pixel_onboarding_complete', 'true');
        onComplete();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col items-center justify-between p-6 overflow-hidden"
        >
            {/* Animated Background Orbs */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 90, 0]
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "linear"
                }}
                className={`absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-gradient-to-br ${slides[step].bg} rounded-full blur-[120px] opacity-20`}
            />
            <motion.div
                animate={{
                    scale: [1.2, 1, 1.2],
                    rotate: [90, 0, 90]
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "linear"
                }}
                className={`absolute bottom-[-20%] right-[-20%] w-[500px] h-[500px] bg-gradient-to-tl ${slides[step].bg} rounded-full blur-[120px] opacity-20`}
            />

            {/* Skip Button */}
            <div className="w-full flex justify-end relative z-10 pt-4">
                <button
                    onClick={handleSkip}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-bold text-sm transition-colors"
                >
                    {t.onboarding.skip}
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="flex flex-col items-center text-center space-y-6"
                    >
                        {/* Icon Container with Animation */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                                type: "spring",
                                stiffness: 260,
                                damping: 20,
                                delay: 0.1
                            }}
                            className="relative"
                        >
                            <div className="w-40 h-40 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-center shadow-2xl border border-white/40 dark:border-slate-700/40">
                                {slides[step].icon}
                            </div>
                            {/* Pulse Ring */}
                            <motion.div
                                animate={{
                                    scale: [1, 1.3, 1],
                                    opacity: [0.5, 0, 0.5]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className={`absolute inset-0 rounded-[2.5rem] bg-gradient-to-br ${slides[step].bg} -z-10`}
                            />
                        </motion.div>

                        {/* Text Content */}
                        <div className="space-y-4 max-w-sm px-4">
                            <motion.h2
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-3xl font-display font-bold text-slate-900 dark:text-white"
                            >
                                {slides[step].title}
                            </motion.h2>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed text-base"
                            >
                                {slides[step].desc}
                            </motion.p>

                            {/* Example Badge */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="inline-block mt-4 px-4 py-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-full border border-slate-200/50 dark:border-slate-700/50"
                            >
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    {slides[step].example}
                                </p>
                            </motion.div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="w-full relative z-10 pb-8 flex flex-col items-center gap-6">
                {/* Progress Indicators */}
                <div className="flex gap-2">
                    {slides.map((_, i) => (
                        <motion.div
                            key={i}
                            initial={false}
                            animate={{
                                width: i === step ? 32 : 8,
                                backgroundColor: i === step
                                    ? 'rgb(99, 102, 241)'
                                    : i < step
                                        ? 'rgb(203, 213, 225)'
                                        : 'rgb(226, 232, 240)'
                            }}
                            className="h-2 rounded-full transition-all duration-300"
                        />
                    ))}
                </div>

                {/* Step Counter */}
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {step + 1} / {slides.length}
                </p>

                {/* Next/Start Button */}
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNext}
                    className={`w-full py-4 bg-gradient-to-r ${slides[step].bg} text-white rounded-2xl font-bold text-lg shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2`}
                >
                    {step === slides.length - 1 ? (
                        <>
                            {t.onboarding.start}
                            <Sparkles size={20} />
                        </>
                    ) : (
                        <>
                            {t.onboarding.next}
                            <ChevronRight size={20} />
                        </>
                    )}
                </motion.button>

                {/* Back Button (except first slide) */}
                {step > 0 && (
                    <button
                        onClick={() => setStep(step - 1)}
                        className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                    >
                        ← {t.onboarding.back || 'Назад'}
                    </button>
                )}
            </div>
        </motion.div>
    );
};

export default Onboarding;
