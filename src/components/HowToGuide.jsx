import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, LayoutTemplate, User, ArrowRight, Check, X, MessageSquare, GraduationCap } from 'lucide-react';
import { useSound } from '../context/SoundContext';

const HowToGuide = ({ isOpen, onClose }) => {
    const { playClick, playSuccess } = useSound();
    const [step, setStep] = useState(0);
    const [direction, setDirection] = useState(0);

    const slides = [
        {
            id: 'welcome',
            icon: <Sparkles size={56} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />,
            title: "Гид по Bazzar Pixel",
            desc: "Ваша студия в кармане. Узнайте, как создавать контент и общаться с AI.",
            bg: "from-[#4f46e5] to-[#7c3aed]", // Indigo
            buttonText: "Поехали"
        },
        {
            id: 'create',
            icon: <Zap size={56} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />,
            title: "Творите",
            desc: "Кнопка «Создать» (⚡) — ваш пульт управления. Генерируйте картинки, видео и анимации в один клик.",
            bg: "from-[#0ea5e9] to-[#2563eb]", // Blue
            buttonText: "Далее"
        },
        {
            id: 'templates',
            icon: <LayoutTemplate size={56} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />,
            title: "Шаблоны",
            desc: "Нет идей? Загляните в «Фото и видео». Сотни готовых стилей — просто добавьте своё фото.",
            bg: "from-[#ec4899] to-[#db2777]", // Pink
            buttonText: "Далее"
        },
        {
            id: 'chats',
            icon: <MessageSquare size={56} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />,
            title: "Умные Чаты",
            desc: "Общайтесь с нейросетями в разных режимах: от простого помощника до Kreator для роста соцсетей.",
            bg: "from-[#f59e0b] to-[#d97706]", // Amber
            buttonText: "Интересно"
        },
        {
            id: 'experts',
            icon: <GraduationCap size={56} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />,
            title: "Эксперты",
            desc: "Нужен узкий специалист? Маркетолог, юрист или таролог — выберите своего AI-эксперта в каталоге.",
            bg: "from-[#8b5cf6] to-[#6d28d9]", // Violet
            buttonText: "Полезно"
        },
        {
            id: 'profile',
            icon: <User size={56} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />,
            title: "Профиль",
            desc: "Все ваши работы и баланс кредитов хранятся в Профиле. Следите за историей там.",
            bg: "from-[#10b981] to-[#059669]", // Emerald
            buttonText: "Начать",
            isFinal: true
        }
    ];

    const handleNext = () => {
        playClick();
        if (step < slides.length - 1) {
            setDirection(1);
            setStep(step + 1);
        } else {
            handleClose();
        }
    };

    const handlePrev = () => {
        playClick();
        if (step > 0) {
            setDirection(-1);
            setStep(step - 1);
        }
    };

    const handleClose = () => {
        playSuccess();
        localStorage.setItem('pixel_guide_seen', 'true');
        onClose();
        setTimeout(() => {
            setStep(0);
            setDirection(0);
        }, 300);
    };

    const variants = {
        enter: (direction) => ({
            x: direction > 0 ? '100%' : '-100%',
            opacity: 0,
            scale: 0.95,
            zIndex: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? '100%' : '-100%',
            opacity: 0,
            scale: 0.95
        })
    };

    if (!isOpen) return null;

    const currentSlide = slides[step];

    return (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col h-[100dvh]">
            {/* 1. Top Bar with Progress & Close */}
            <div className="absolute top-0 left-0 right-0 z-50 pt-safe-top px-4 flex items-center justify-between gap-4 mt-6">
                <div className="flex-1 flex gap-1.5 h-1">
                    {slides.map((_, i) => (
                        <div key={i} className="h-full flex-1 bg-white/20 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                                initial={{ width: i < step ? "100%" : "0%" }}
                                animate={{ width: i <= step ? "100%" : "0%" }}
                                transition={{ duration: i === step ? 0.3 : 0 }}
                            />
                        </div>
                    ))}
                </div>
                <button
                    onClick={handleClose}
                    className="w-8 h-8 flex items-center justify-center text-white/80 hover:text-white bg-black/20 rounded-full backdrop-blur-md drop-shadow-md"
                >
                    <X size={20} />
                </button>
            </div>

            {/* 2. Content Area */}
            <div className="flex-1 relative overflow-hidden">
                <AnimatePresence initial={false} custom={direction} mode="popLayout">
                    <motion.div
                        key={step}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 }
                        }}
                        className="absolute inset-0 w-full h-full"
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(e, { offset }) => {
                            if (offset.x < -50) handleNext();
                            else if (offset.x > 50) handlePrev();
                        }}
                    >
                        {/* Gradient Background */}
                        <div className={`w-full h-full bg-gradient-to-br ${currentSlide.bg} flex flex-col relative`}>

                            {/* Texture/Decorations */}
                            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[40%] bg-white/10 blur-[80px] rounded-full animate-pulse-slow" />
                                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[50%] bg-black/10 blur-[80px] rounded-full" />
                            </div>

                            {/* Center Content: Icon + Text */}
                            <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 w-full max-w-sm mx-auto">

                                {/* Icon Container - Fixed Height to prevent jumping */}
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0, y: 20 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    transition={{ type: "spring", delay: 0.1 }}
                                    className="mb-10 relative" // Added margin bottom
                                >
                                    <div className="absolute inset-0 bg-white/30 blur-2xl rounded-full" />
                                    <div className="relative w-36 h-36 bg-white/10 backdrop-blur-md border border-white/20 rounded-[32px] flex items-center justify-center shadow-2xl">
                                        {currentSlide.icon}
                                    </div>
                                    {/* Float decoration */}
                                    <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center animate-bounce duration-[2000ms]">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                    </div>
                                </motion.div>

                                {/* Text Block */}
                                <div className="text-center w-full">
                                    <motion.h2
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-[28px] font-bold text-white mb-3 drop-shadow-sm leading-tight"
                                    >
                                        {currentSlide.title}
                                    </motion.h2>
                                    <motion.p
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-[16px] text-white/90 font-medium leading-relaxed drop-shadow-sm max-w-[280px] mx-auto"
                                    >
                                        {currentSlide.desc}
                                    </motion.p>
                                </div>
                            </div>

                            {/* Button Area - Stays at bottom but respects safe area */}
                            <div className="px-6 pb-8 pt-4 w-full relative z-20">
                                <motion.button
                                    whileTap={{ scale: 0.96 }}
                                    onClick={handleNext}
                                    className="w-full bg-white text-black font-bold text-[17px] py-[18px] rounded-card shadow-xl flex items-center justify-center gap-2 active:opacity-90"
                                >
                                    {currentSlide.buttonText}
                                    {currentSlide.isFinal ? <Check size={20} /> : <ArrowRight size={20} />}
                                </motion.button>
                            </div>

                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Invisible Touch Zones */}
                <div onClick={handlePrev} className="absolute inset-y-0 left-0 w-[20%] z-10" />
                <div onClick={handleNext} className="absolute inset-y-0 right-0 w-[20%] z-10" />
            </div>
        </div>
    );
};

export default HowToGuide;
