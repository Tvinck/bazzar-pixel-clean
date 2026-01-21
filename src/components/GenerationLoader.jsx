import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Cpu, Palette } from 'lucide-react';

const LOADING_TIPS = [
    "Разогреваем графические процессоры...",
    "Смешиваем цвета и стили...",
    "Нейросеть ищет вдохновение...",
    "Почти готово, добавляем детали...",
    "Финальная обработка пикселей...",
    "ИИ рисует ваш шедевр..."
];

const GenerationLoader = ({ type = 'image', estimatedTime = 15 }) => {
    const [progress, setProgress] = useState(0);
    const [tipIndex, setTipIndex] = useState(0);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // ... progress interval ...
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 95) return 95; // Wait for real completion
                // Slow down as it gets closer
                const increment = prev < 50 ? 2 : prev < 80 ? 1 : 0.2;
                return prev + increment;
            });
        }, 200);

        return () => clearInterval(interval);
    }, []);

    // Rotate tips
    useEffect(() => {
        const interval = setInterval(() => {
            setTipIndex(prev => (prev + 1) % LOADING_TIPS.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    if (!mounted || typeof document === 'undefined') return null;

    return createPortal(
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[9999] bg-[#0f1014] flex flex-col items-center justify-center p-6 text-center"
        >

            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-fuchsia-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="relative z-10 w-full max-w-sm">
                {/* Central Animation */}
                <div className="mb-12 relative flex justify-center">
                    <div className="w-24 h-24 relative">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 rounded-full border-t-2 border-l-2 border-indigo-500"
                        />
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-2 rounded-full border-b-2 border-r-2 border-fuchsia-500"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            {type === 'video' ? <Zap className="text-white animate-pulse" /> : <Sparkles className="text-white animate-pulse" />}
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden mb-2">
                        <motion.div
                            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                            border-radius="999px"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-xs font-medium text-slate-500">
                        <span>Генерация...</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                </div>

                {/* Interactive Text */}
                <div className="h-16 flex items-center justify-center">
                    <motion.p
                        key={tipIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-white font-medium text-lg"
                    >
                        {LOADING_TIPS[tipIndex]}
                    </motion.p>
                </div>

                <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-500 bg-white/5 py-2 px-4 rounded-full w-max mx-auto">
                    <Cpu size={14} />
                    <span>Среднее время: {estimatedTime} сек</span>
                </div>
            </div>
        </motion.div>,
        document.body
    );
};

export default GenerationLoader;
