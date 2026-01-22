import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Cpu, Layers, Palette, Wand2, Clock } from 'lucide-react';

const STEPS = [
    { label: "В очереди", icon: Clock },
    { label: "Подготовка", icon: Layers },
    { label: "Генерация", icon: Palette },
    { label: "Улучшение", icon: Wand2 },
];

const LOADING_TIPS = [
    "✨ Совет: Добавьте 'cinematic lighting' для объема",
    "🎨 Совет: Стиль 'Studio Ghibli' делает фото мультяшным",
    "💡 Совет: Используйте '4k, detailed' для четкости",
    "🚀 Совет: Видео генерируется дольше, до 3-5 минут",
    "👁️ Совет: 'Close-up' сделает акцент на лице"
];

const GenerationLoader = ({ type = 'image', estimatedTime = 15 }) => {
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    const [tipIndex, setTipIndex] = useState(0);

    // Progress & Step Simulation
    useEffect(() => {
        const totalDuration = estimatedTime * 1000;
        const intervalTime = 100;
        const stepsCount = totalDuration / intervalTime;
        let step = 0;

        const interval = setInterval(() => {
            step++;
            const rawProgress = (step / stepsCount) * 100;

            // Non-linear progress (starts fast, slows down at 90%)
            let adjustedProgress = rawProgress;
            if (rawProgress > 80) adjustedProgress = 80 + (rawProgress - 80) * 0.2;
            if (adjustedProgress > 98) adjustedProgress = 98;

            setProgress(adjustedProgress);

            // Update Steps based on progress thresholds
            if (adjustedProgress < 10) setCurrentStep(0);
            else if (adjustedProgress < 30) setCurrentStep(1);
            else if (adjustedProgress < 80) setCurrentStep(2);
            else setCurrentStep(3);

        }, intervalTime);

        return () => clearInterval(interval);
    }, [estimatedTime]);

    // Tip Rotation
    useEffect(() => {
        const interval = setInterval(() => {
            setTipIndex(prev => (prev + 1) % LOADING_TIPS.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-[9999] bg-[#09090b] text-white flex flex-col font-sans">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
                {/* Central Visual */}
                <div className="relative mb-16">
                    {/* Ring 1 */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        className="w-32 h-32 rounded-full border border-indigo-500/30 border-t-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.3)]"
                    />
                    {/* Ring 2 */}
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-2 rounded-full border border-purple-500/30 border-b-purple-500"
                    />

                    {/* Core Icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="bg-gradient-to-br from-indigo-500 to-purple-500 p-4 rounded-2xl shadow-lg shadow-indigo-500/40"
                        >
                            {type === 'video' ? <Zap size={32} className="fill-white" /> : <Sparkles size={32} className="fill-white" />}
                        </motion.div>
                    </div>
                </div>

                {/* Status Text */}
                <div className="text-center mb-12 max-w-md">
                    <motion.h2
                        key={STEPS[currentStep].label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-black font-display mb-2 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent"
                    >
                        {STEPS[currentStep].label}...
                    </motion.h2>
                    <p className="text-slate-400 text-sm font-medium">
                        {Math.round(progress)}% завершено
                    </p>
                </div>

                {/* Step Indicators */}
                <div className="w-full max-w-xs flex justify-between items-center mb-12 relative">
                    {/* Connecting Line */}
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -z-10" />
                    <motion.div
                        className="absolute top-1/2 left-0 h-0.5 bg-indigo-500 -z-10"
                        initial={{ width: 0 }}
                        animate={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                    />

                    {STEPS.map((step, idx) => {
                        const isActive = idx <= currentStep;
                        const isCurrent = idx === currentStep;
                        return (
                            <div key={idx} className="flex flex-col items-center gap-2">
                                <motion.div
                                    initial={false}
                                    animate={{
                                        backgroundColor: isActive ? '#6366f1' : '#1e293b',
                                        scale: isCurrent ? 1.2 : 1
                                    }}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${isActive ? 'border-indigo-500' : 'border-slate-800'} z-10 transition-colors`}
                                >
                                    <step.icon size={14} className={isActive ? 'text-white' : 'text-slate-500'} />
                                </motion.div>
                            </div>
                        );
                    })}
                </div>

                {/* Tips Box */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 max-w-sm w-full">
                    <div className="h-12 flex items-center justify-center text-center">
                        <AnimatePresence mode='wait'>
                            <motion.p
                                key={tipIndex}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="text-sm font-medium text-slate-300"
                            >
                                {LOADING_TIPS[tipIndex]}
                            </motion.p>
                        </AnimatePresence>
                    </div>
                </div>

            </main>

            {/* Footer */}
            <footer className="p-6 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-full border border-slate-800 text-xs font-bold text-slate-500">
                    <Cpu size={14} />
                    <span>Neural Engine v2.4 Active</span>
                </div>
            </footer>
        </div>
    );
};

export default GenerationLoader;
