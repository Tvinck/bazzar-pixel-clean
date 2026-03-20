import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, Maximize2, Download, Loader2, Zap,
    SlidersHorizontal, Check, AlertCircle, Sparkles
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

declare global {
    interface Window {
        Telegram?: {
            WebApp?: {
                initData?: string;
                HapticFeedback?: {
                    impactOccurred: (style: string) => void;
                    notificationOccurred: (type: string) => void;
                };
            };
        };
    }
}

interface UpscaleState {
    status: 'idle' | 'loading' | 'processing' | 'done' | 'error';
    originalUrl: string | null;
    upscaledUrl: string | null;
    error: string | null;
    jobId: string | null;
    newBalance: number | null;
}

const UPSCALE_COST = 10;

const SuperResolutionView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    useLanguage(); // reserved for future i18n
    const toaster = useToast();
    const sliderRef = useRef<HTMLDivElement>(null);

    const [state, setState] = useState<UpscaleState>({
        status: 'idle',
        originalUrl: null,
        upscaledUrl: null,
        error: null,
        jobId: null,
        newBalance: null,
    });
    const [sliderPos, setSliderPos] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const [scale, setScale] = useState<2 | 4>(4);

    // Fetch original creation
    useEffect(() => {
        if (!id) return;
        setState(prev => ({ ...prev, status: 'loading' }));

        const fetchCreation = async () => {
            try {
                const initData = window.Telegram?.WebApp?.initData || '';
                const res = await fetch(`/api/generation/jobs/${id}`, {
                    headers: { 'x-init-data': initData }
                });
                const data = await res.json();
                if (data.result?.image_url) {
                    setState(prev => ({
                        ...prev,
                        status: 'idle',
                        originalUrl: data.result.image_url
                    }));
                } else {
                    setState(prev => ({
                        ...prev,
                        status: 'error',
                        error: 'Creation not found'
                    }));
                }
            } catch {
                setState(prev => ({
                    ...prev,
                    status: 'error',
                    error: 'Failed to load creation'
                }));
            }
        };

        fetchCreation();
    }, [id]);

    // Start upscale
    const handleUpscale = useCallback(async () => {
        if (!id) return;
        setState(prev => ({ ...prev, status: 'processing', error: null }));
        window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('medium');

        try {
            const initData = window.Telegram?.WebApp?.initData || '';
            const res = await fetch('/api/generation/upscale', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-init-data': initData,
                },
                body: JSON.stringify({ creationId: id, options: { scale } }),
            });

            if (res.status === 402) {
                setState(prev => ({ ...prev, status: 'error', error: 'Insufficient credits' }));
                toaster.error('Недостаточно кредитов');
                return;
            }

            const data = await res.json();
            if (!data.success) {
                throw new Error(data.error || 'Upscale failed');
            }

            setState(prev => ({
                ...prev,
                jobId: data.jobId,
                newBalance: data.newBalance,
            }));

            // Poll for result
            pollForResult(data.jobId);
        } catch (err: any) {
            setState(prev => ({
                ...prev,
                status: 'error',
                error: err.message || 'Unknown error',
            }));
            toaster.error(err.message || 'Ошибка апскейла');
        }
    }, [id, scale, toaster]);

    // Poll job status
    const pollForResult = useCallback(async (jobId: string) => {
        const maxAttempts = 120;
        for (let i = 0; i < maxAttempts; i++) {
            await new Promise(r => setTimeout(r, 2000));

            try {
                const res = await fetch(`/api/generation/jobs/${jobId}`);
                const data = await res.json();

                if (data.status === 'completed' && data.result?.image_url) {
                    setState(prev => ({
                        ...prev,
                        status: 'done',
                        upscaledUrl: data.result.image_url,
                    }));
                    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
                    toaster.success('HD изображение готово! ✨');
                    return;
                }
            } catch {
                // Continue polling
            }
        }

        setState(prev => ({
            ...prev,
            status: 'error',
            error: 'Timeout — попробуйте позже',
        }));
    }, [toaster]);

    // Slider drag handling
    const handleSliderMove = useCallback(
        (clientX: number) => {
            if (!sliderRef.current || !isDragging) return;
            const rect = sliderRef.current.getBoundingClientRect();
            const x = clientX - rect.left;
            const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
            setSliderPos(pct);
        },
        [isDragging]
    );

    const handleMouseDown = () => setIsDragging(true);

    useEffect(() => {
        const onMove = (e: MouseEvent) => handleSliderMove(e.clientX);
        const onTouchMove = (e: TouchEvent) => handleSliderMove(e.touches[0].clientX);
        const onUp = () => setIsDragging(false);

        if (isDragging) {
            window.addEventListener('mousemove', onMove);
            window.addEventListener('touchmove', onTouchMove);
            window.addEventListener('mouseup', onUp);
            window.addEventListener('touchend', onUp);
        }

        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('mouseup', onUp);
            window.removeEventListener('touchend', onUp);
        };
    }, [isDragging, handleSliderMove]);

    // Download HD image
    const handleDownload = () => {
        if (!state.upscaledUrl) return;
        const link = document.createElement('a');
        link.href = state.upscaledUrl;
        link.download = `upscaled-${id}-${scale}x.png`;
        link.click();
        toaster.success('Скачивание начато');
    };

    return (
        <div className="min-h-screen bg-[var(--tg-theme-bg-color)] text-[var(--tg-theme-text-color)] md:max-w-3xl md:mx-auto">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-[var(--tg-theme-bg-color)]/95 backdrop-blur-xl border-b border-white/5">
                <div className="flex items-center justify-between px-4 py-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1 text-[var(--tg-theme-button-color)] text-[17px] font-medium"
                    >
                        <ChevronLeft size={24} />
                        <span>Назад</span>
                    </button>
                    <h1 className="text-[17px] font-semibold">Super Resolution</h1>
                    <div className="w-16" />
                </div>
            </div>

            {/* Main Content */}
            <div className="px-4 pt-4 pb-32">
                {/* Loading state */}
                {state.status === 'loading' && (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-[var(--tg-theme-button-color)]" />
                        <p className="text-[var(--tg-theme-hint-color)] text-sm">Загрузка...</p>
                    </div>
                )}

                {/* Error state */}
                {state.status === 'error' && (
                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                            <AlertCircle className="w-8 h-8 text-red-400" />
                        </div>
                        <p className="text-red-400 text-sm font-medium">{state.error}</p>
                        <button
                            onClick={() => navigate(-1)}
                            className="mt-2 px-6 py-2 bg-[var(--tg-theme-secondary-bg-color)] rounded-xl text-sm font-medium"
                        >
                            Вернуться
                        </button>
                    </div>
                )}

                {/* Idle — ready to upscale */}
                {(state.status === 'idle' || state.status === 'processing') && state.originalUrl && (
                    <>
                        {/* Preview Card */}
                        <div className="rounded-2xl overflow-hidden border border-white/5 bg-[var(--tg-theme-secondary-bg-color)] mb-6 shadow-lg">
                            <div className="relative aspect-square">
                                <img
                                    src={state.originalUrl}
                                    alt="Original"
                                    className="w-full h-full object-cover"
                                />
                                {/* Processing Overlay */}
                                <AnimatePresence>
                                    {state.status === 'processing' && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4"
                                        >
                                            <div className="relative">
                                                <div className="w-20 h-20 rounded-full border-4 border-white/10 border-t-[var(--tg-theme-button-color)] animate-spin" />
                                                <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-[var(--tg-theme-button-color)] animate-pulse" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-white font-semibold text-lg">Улучшаем качество...</p>
                                                <p className="text-white/60 text-sm mt-1">
                                                    AI анализирует и воссоздает детали
                                                </p>
                                            </div>

                                            {/* Animated Progress Dots */}
                                            <div className="flex gap-1.5">
                                                {[0, 1, 2, 3, 4].map(i => (
                                                    <motion.div
                                                        key={i}
                                                        className="w-2 h-2 rounded-full bg-[var(--tg-theme-button-color)]"
                                                        animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                                                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                                                    />
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Original Badge */}
                                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest">
                                    Оригинал
                                </div>
                            </div>
                        </div>

                        {/* Scale Selector */}
                        <div className="mb-6">
                            <p className="text-[var(--tg-theme-hint-color)] text-xs font-semibold uppercase tracking-wider mb-3">
                                Масштаб увеличения
                            </p>
                            <div className="flex gap-3">
                                {([2, 4] as const).map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setScale(s)}
                                        disabled={state.status === 'processing'}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-[15px] transition-all ${scale === s
                                            ? 'bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] shadow-lg shadow-[var(--tg-theme-button-color)]/25'
                                            : 'bg-[var(--tg-theme-secondary-bg-color)] text-[var(--tg-theme-text-color)] border border-white/5'
                                            } ${state.status === 'processing' ? 'opacity-50 pointer-events-none' : ''}`}
                                    >
                                        <Maximize2 size={16} />
                                        {s}x ({s === 2 ? 'HD' : 'Ultra HD'})
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Info Card */}
                        <div className="bg-[var(--tg-theme-secondary-bg-color)] border border-white/5 rounded-2xl p-4 mb-6">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                                    <SlidersHorizontal size={18} className="text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium mb-1">Как работает Super Resolution</p>
                                    <p className="text-[var(--tg-theme-hint-color)] text-xs leading-relaxed">
                                        AI анализирует каждый пиксель и воссоздаёт детали с помощью нейросети.
                                        Результат: чёткое изображение, готовое для печати и HD-использования.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Done — comparison slider */}
                {state.status === 'done' && state.originalUrl && state.upscaledUrl && (
                    <>
                        <div className="mb-4">
                            <p className="text-lg font-bold mb-1">Результат</p>
                            <p className="text-[var(--tg-theme-hint-color)] text-sm">
                                Перетащите ползунок для сравнения До / После
                            </p>
                        </div>

                        {/* Comparison Slider */}
                        <div
                            ref={sliderRef}
                            className="relative aspect-square rounded-2xl overflow-hidden border border-white/5 cursor-col-resize select-none mb-6 shadow-xl"
                            onMouseDown={handleMouseDown}
                            onTouchStart={handleMouseDown}
                        >
                            {/* After (Upscaled) — full background */}
                            <img
                                src={state.upscaledUrl}
                                alt="Upscaled"
                                className="absolute inset-0 w-full h-full object-cover"
                            />

                            {/* Before (Original) — clipped */}
                            <div
                                className="absolute inset-0 overflow-hidden"
                                style={{ width: `${sliderPos}%` }}
                            >
                                <img
                                    src={state.originalUrl}
                                    alt="Original"
                                    className="absolute inset-0 w-full h-full object-cover"
                                    style={{ width: `${100 / (sliderPos / 100)}%`, maxWidth: 'none' }}
                                />
                            </div>

                            {/* Slider Line */}
                            <div
                                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10"
                                style={{ left: `${sliderPos}%` }}
                            >
                                {/* Handle */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center">
                                    <SlidersHorizontal size={16} className="text-gray-800" />
                                </div>
                            </div>

                            {/* Labels */}
                            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest z-20">
                                До
                            </div>
                            <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-[var(--tg-theme-button-color)]/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest z-20">
                                После ✨
                            </div>
                        </div>

                        {/* Success Info */}
                        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <Check size={20} className="text-green-400" />
                                </div>
                                <div>
                                    <p className="text-green-400 font-semibold text-sm">Готово!</p>
                                    <p className="text-green-400/70 text-xs">
                                        Изображение увеличено в {scale}x с помощью AI
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-[var(--tg-theme-bg-color)]/95 backdrop-blur-xl border-t border-white/5 p-4 pb-safe z-50">
                {state.status === 'idle' && state.originalUrl && (
                    <button
                        onClick={handleUpscale}
                        className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-2xl font-semibold text-[16px] shadow-xl shadow-purple-500/25 active:scale-[0.98] transition-all"
                    >
                        <Sparkles size={20} />
                        Улучшить до {scale === 2 ? 'HD' : 'Ultra HD'}
                        <span className="flex items-center gap-1 bg-white/20 px-2.5 py-0.5 rounded-full text-xs font-bold">
                            <Zap size={12} /> {UPSCALE_COST}
                        </span>
                    </button>
                )}

                {state.status === 'processing' && (
                    <div className="w-full flex items-center justify-center gap-2 bg-[var(--tg-theme-secondary-bg-color)] text-[var(--tg-theme-hint-color)] py-4 rounded-2xl font-medium text-[15px]">
                        <Loader2 size={18} className="animate-spin" />
                        Обработка... Это займёт 30–60 сек
                    </div>
                )}

                {state.status === 'done' && (
                    <button
                        onClick={handleDownload}
                        className="w-full flex items-center justify-center gap-2.5 bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] py-4 rounded-2xl font-semibold text-[16px] shadow-lg shadow-[var(--tg-theme-button-color)]/25 active:scale-[0.98] transition-all"
                    >
                        <Download size={20} />
                        Скачать HD изображение
                    </button>
                )}
            </div>
        </div>
    );
};

export default SuperResolutionView;
