import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Stars, Palette, Wand2, ChevronDown } from 'lucide-react';

const STEPS = [
    { label: "Смешиваем магию", icon: Zap },
    { label: "Ловим вдохновение", icon: Stars },
    { label: "Рисуем шедевр", icon: Palette },
    { label: "Добавляем блеск", icon: Wand2 },
];

const LOADING_TIPS = [
    "✨ Совет: Попробуйте стиль '3D Render' для объема",
    "🎨 Совет: 'Neon Lights' добавит ярких красок",
    "💡 Совет: Чем детальнее промпт, тем круче результат",
    "🚀 Совет: Видео может создаваться дольше, магия требует времени",
    "👁️ Совет: 'Close-up' сделает акцент на деталях"
];

const GenerationLoader = ({ type = 'image', status, result, estimatedTime = 15, onMinimize }) => {
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    const [tipIndex, setTipIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(estimatedTime);

    // Progress Dashboard array for stages
    const stages = React.useMemo(() => [
        { label: 'Ставим в очередь', pctToWait: 15 },
        { label: `Генерируем (${type === 'video' ? 'может долго' : 'почти всё'})`, pctToWait: 85 },
        { label: 'Финализируем', pctToWait: 100 },
    ], [type]);

    // Progress Simulation
    useEffect(() => {
        const totalDuration = estimatedTime * 1000;
        const intervalTime = 100;
        const stepsCount = totalDuration / intervalTime;
        let step = 0;

        const interval = setInterval(() => {
            step++;
            const rawProgress = (step / stepsCount) * 100;

            // Organic progress curve
            let adjustedProgress = rawProgress;
            if (rawProgress > 80) adjustedProgress = 80 + (rawProgress - 80) * 0.2;
            if (adjustedProgress > 99) adjustedProgress = 99;

            setProgress(adjustedProgress);

            if (adjustedProgress < stages[0].pctToWait) setCurrentStep(0);
            else if (adjustedProgress < stages[1].pctToWait) setCurrentStep(1);
            else setCurrentStep(2);

            // Timer update (countdown)
            const passedSeconds = (step * intervalTime) / 1000;
            const remaining = Math.max(0, Math.ceil(estimatedTime - passedSeconds));
            setTimeLeft(remaining);

        }, intervalTime);

        return () => clearInterval(interval);
    }, [estimatedTime, stages]);

    // Tip Rotation
    useEffect(() => {
        const interval = setInterval(() => {
            setTipIndex(prev => (prev + 1) % LOADING_TIPS.length);
        }, 3500);
        return () => clearInterval(interval);
    }, []);

    // Success State
    if (status === 'success') {
        return (
            <div className="fixed inset-0 z-[9999] bg-bg-primary flex flex-col items-center justify-center p-6 text-center">
                <div className="absolute inset-0 overflow-hidden">
                    <img
                        src={result?.imageUrl || result?.image_url}
                        className="w-full h-full object-cover opacity-40 blur-lg"
                        alt="Background"
                    />
                    <div className="absolute inset-0 bg-black/60" />
                </div>

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative z-10 w-full max-w-sm bg-zinc-900/80 backdrop-blur-xl p-6 rounded-[32px] border border-white/10 flex flex-col items-center"
                >
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                        <Sparkles className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-display font-bold text-white mb-2">Готово!</h2>
                    <p className="text-zinc-400 text-sm mb-1">Результат отправлен в бота и сохранён в истории</p>
                    <p className="text-zinc-500 text-xs mb-6">Срок хранения в истории — 10 дней</p>

                    <div className="w-full aspect-square rounded-2xl overflow-hidden mb-6 bg-black border border-white/10 relative group">
                        {type === 'video' ? (
                            <video
                                src={result?.imageUrl || result?.image_url}
                                className="w-full h-full object-cover"
                                controls autoPlay loop playsInline
                            />
                        ) : (
                            <img
                                src={result?.imageUrl || result?.image_url}
                                className="w-full h-full object-cover"
                                alt="Result"
                            />
                        )}
                    </div>

                    <div className="w-full flex gap-3">
                        <button
                            onClick={onMinimize}
                            className="flex-1 h-14 bg-bg-elevated text-white rounded-2xl font-bold active:scale-95 transition-all"
                        >
                            Назад
                        </button>
                        <button
                            onClick={onMinimize}
                            className="flex-[2] h-14 bg-accent-blue rounded-2xl font-bold active:scale-95 transition-all shadow-lg shadow-blue-500/20"
                        >
                            Отлично
                        </button>
                    </div>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-[9999] bg-bg-primary text-white flex flex-col font-sans overflow-hidden">
            {/* MINIMIZE BUTTON & TIMER AREA */}
            <div className="absolute top-[calc(env(safe-area-inset-top)+16px)] left-0 right-0 px-4 flex justify-between items-center z-50">
                <AnimatePresence>
                    {timeLeft > 0 && status !== 'success' && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            className="bg-black/40 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full flex items-center gap-2"
                        >
                            <div className="w-2 h-2 bg-[#ff2d55] rounded-full animate-pulse" />
                            <span className="text-white/80 text-sm font-medium tabular-nums">
                                ≈ {timeLeft} сек.
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {onMinimize && (
                    <button
                        onClick={onMinimize}
                        className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all active:scale-95 border border-white/10 ml-auto"
                    >
                        <ChevronDown size={24} />
                    </button>
                )}
            </div>

            {/* --- Deep Space Ambient Background --- */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, -50, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-[20%] -left-[10%] w-[80vh] h-[80vh] bg-violet-900/40 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{ scale: [1, 1.3, 1], x: [0, -30, 0], y: [0, 50, 0] }}
                    transition={{ duration: 18, repeat: Infinity, delay: 1, ease: "easeInOut" }}
                    className="absolute top-[10%] right-[-20%] w-[70vh] h-[70vh] bg-indigo-900/30 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{ scale: [1, 1.1, 1], y: [0, 30, 0] }}
                    transition={{ duration: 20, repeat: Infinity, delay: 2, ease: "easeInOut" }}
                    className="absolute -bottom-[10%] left-[10%] w-[90vh] h-[90vh] bg-fuchsia-900/30 rounded-full blur-[140px]"
                />
            </div>

            <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
                {/* --- Enhanced Liquid Crystal Orb --- */}
                <div className="relative mb-24">
                    <div className="relative w-64 h-64 flex items-center justify-center">
                        {/* Outer Glow */}
                        <motion.div
                            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"
                        />

                        {/* Blob 1 */}
                        <motion.div
                            animate={{
                                rotate: 360,
                                borderRadius: ["40% 60% 70% 30% / 40% 40% 60% 50%", "60% 40% 30% 70% / 60% 30% 70% 40%", "40% 60% 70% 30% / 40% 40% 60% 50%"]
                            }}
                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 bg-gradient-to-tr from-violet-600 via-indigo-600 to-blue-600 opacity-90 blur-2xl mix-blend-screen"
                        />
                        {/* Blob 2 (Core) */}
                        <motion.div
                            animate={{
                                rotate: -360,
                                borderRadius: ["60% 40% 30% 70% / 60% 30% 70% 40%", "40% 60% 70% 30% / 40% 40% 60% 50%", "60% 40% 30% 70% / 60% 30% 70% 40%"]
                            }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-4 bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500 blur-xl mix-blend-screen"
                        />

                        {/* Floating Icon */}
                        <motion.div
                            animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                        >
                            <Sparkles size={64} className="text-white fill-white/20" />
                        </motion.div>

                        {/* Orbiting Particles */}
                        {[...Array(3)].map((_, i) => (
                            <motion.div
                                key={i}
                                animate={{ rotate: 360 }}
                                transition={{ duration: 4 + i, repeat: Infinity, ease: "linear", delay: i * 0.5 }}
                                className="absolute w-full h-full inset-0"
                            >
                                <div className="absolute top-0 left-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_15px_white] -translate-x-1/2 -translate-y-8" />
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* --- Typography & Progress --- */}
                <div className="text-center mb-16 max-w-xs relative w-full">
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={stages[currentStep].label}
                            initial={{ y: 20, opacity: 0, scale: 0.95 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: -20, opacity: 0, scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                            <h2 className="text-2xl font-display font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 mb-4 px-2">
                                {stages[currentStep].label}
                            </h2>
                        </motion.div>
                    </AnimatePresence>

                    <div className="flex flex-col items-center justify-center gap-2 px-6">
                        <div className="w-full max-w-[200px] h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                            <motion.div
                                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-[0_0_15px_rgba(236,72,153,0.5)]"
                                initial={{ width: '0%' }}
                                animate={{ width: `${progress}%` }}
                            />
                        </div>
                        <span className="text-xs font-semibold text-white/50 tabular-nums uppercase tracking-widest mt-1">
                            {Math.round(progress)}% ГОТОВО
                        </span>
                    </div>
                </div>

                {/* --- Glassy Tips Box --- */}
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="absolute bottom-12 px-6 w-full max-w-sm"
                >
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-[24px] shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center flex-shrink-0 border border-indigo-500/30">
                                <Sparkles size={16} />
                            </div>
                            <div className="min-h-[3rem] flex items-center">
                                <AnimatePresence mode='wait'>
                                    <motion.p
                                        key={tipIndex}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="text-sm font-medium text-zinc-300 leading-relaxed"
                                    >
                                        {LOADING_TIPS[tipIndex]}
                                    </motion.p>
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </motion.div>

            </main>
        </div>
    );
};

export default GenerationLoader;
