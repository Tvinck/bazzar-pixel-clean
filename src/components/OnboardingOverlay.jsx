import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Check, Zap, Hand } from 'lucide-react';
import { useSound } from '../context/SoundContext';

const OnboardingOverlay = ({ isVisible, onComplete, onStepAction }) => {
    const { playSuccess, playClick } = useSound();
    const [step, setStep] = useState(0);

    // Steps configuration
    const steps = [
        {
            id: 'welcome',
            title: 'Добро пожаловать в Pixel AI! 🎨',
            desc: 'Здесь вы можете создавать изображения, видео и музыку с помощью искусственного интеллекта.',
            action: 'Далее'
        },
        {
            id: 'tools',
            title: 'Выберите инструмент',
            desc: 'Используйте "Генерация изображений", "Видео" или "Анимация" для воплощения ваших идей.',
            action: 'Далее'
        },
        {
            id: 'fake_gen',
            title: 'Мгновенная магия ✨',
            desc: 'Просто опишите словами то, что хотите увидеть, и AI создаст это за секунды.',
            action: 'Понятно'
        },
        {
            id: 'done',
            title: 'Вы готовы! 🚀',
            desc: 'Исследуйте инструменты, присоединяйтесь к таблице лидеров и творите!',
            action: 'Начать'
        }
    ];

    useEffect(() => {
        if (!isVisible) return;
    }, [isVisible, step]);

    // Listen for external step triggers (like when user clicks Create button)
    useEffect(() => {
        // This will be called from parent when user performs expected action
    }, []);

    const handleNext = () => {
        playClick();
        if (step < steps.length - 1) {
            setStep(step + 1);
            if (onStepAction) onStepAction(steps[step + 1].id);
        } else {
            playSuccess();
            onComplete();
        }
    };

    // Special handler for the "fake generation" step
    const handleFakeGen = () => {
        playClick();
        // Trigger the fake gen animation in the parent
        if (onStepAction) onStepAction('trigger_fake_gen');
        // Auto advance after a delay
        setTimeout(() => {
            setStep(step + 1);
        }, 3500);
    };

    // Simplified effect just for visibility
    useEffect(() => {
        // No external triggers needed for informational flow
    }, [isVisible]);

    if (!isVisible) return null;

    const currentStep = steps[step];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] pointer-events-none"
            >
                {/* Backdrop with hole logic is complex, simplified: Darken everything */}
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

                {/* Content Container */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto p-6">

                    <motion.div
                        key={step}
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: -20 }}
                        className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-2xl max-w-sm w-full text-center relative overflow-hidden"
                    >
                        {/* Background decoration */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl" />
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-fuchsia-500/20 rounded-full blur-3xl" />

                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-fuchsia-500 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-500/30">
                                {step === 0 && <Sparkles size={32} />}
                                {step === 1 && <Hand size={32} />}
                                {step === 2 && <Zap size={32} />}
                                {step === 3 && <Check size={32} />}
                            </div>

                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{currentStep.title}</h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                                {currentStep.desc}
                            </p>

                            {!currentStep.waitForAction && (
                                <button
                                    onClick={currentStep.isFakeGen ? handleFakeGen : handleNext}
                                    className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                >
                                    {currentStep.isFakeGen ? (
                                        <>Go! <Zap size={18} fill="currentColor" /></>
                                    ) : (
                                        <>{currentStep.action || 'Next'} <ArrowRight size={18} /></>
                                    )}
                                </button>
                            )}

                            {/* Dots */}
                            <div className="flex gap-2 mt-6">
                                {steps.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default OnboardingOverlay;
