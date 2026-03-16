import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Share2, Globe, Sparkles, X, Check, Heart, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSound } from '../context/SoundContext';

const GenerationResult = ({ result, type = 'image', onClose, onRemix }) => {
    const { playClick, playSuccess } = useSound();
    const [isPublished, setIsPublished] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    // Celebration particles
    const particles = [...Array(12)].map((_, i) => ({
        id: i,
        x: Math.random() * 200 - 100,
        y: Math.random() * -200 - 100,
        scale: Math.random() * 1.5 + 0.5,
        rotate: Math.random() * 360
    }));

    useEffect(() => {
        playSuccess && playSuccess();
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        }

        if (window.Telegram?.WebApp?.BackButton) {
            const backButton = window.Telegram.WebApp.BackButton;
            backButton.show();
            backButton.onClick(onClose);
            return () => {
                backButton.hide();
                backButton.offClick(onClose);
            };
        }
    }, [onClose, playSuccess]);

    const handleDownload = async () => {
        playClick();
        if (window.Telegram?.WebApp?.downloadFile) {
            try {
                window.Telegram.WebApp.downloadFile({ url: result.url, file_name: `pixel-${Date.now()}.${type === 'video' ? 'mp4' : 'png'}` });
                return;
            } catch (e) {
                console.warn('TG Download failed', e);
            }
        }

        try {
            const response = await fetch(result.url, { mode: 'cors' });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `pixel-gen-${Date.now()}.${type === 'video' ? 'mp4' : 'png'}`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch {
            window.open(result.url, '_blank');
        }
    };

    const handleShare = () => {
        playClick();
        const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(result.url)}&text=${encodeURIComponent('Сгенерировано в Pixel AI ⚡')}`;
        window.Telegram?.WebApp?.openTelegramLink(shareUrl) || window.open(shareUrl, '_blank');
    };

    const handlePublish = async () => {
        playClick();
        if (isPublished) return;
        setIsPublishing(true);

        try {
            const { error } = await supabase.from('creations').update({ is_public: true }).eq('id', result.id);
            if (!error) setIsPublished(true);
        } catch (e) {
            console.error(e);
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-bg-primary flex flex-col font-sans overflow-hidden"
        >
            {/* --- Zenly Ambient Glow --- */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], x: [-20, 20, -20], y: [-20, 20, -20] }}
                    transition={{ duration: 15, repeat: Infinity }}
                    className="absolute -top-[10%] -left-[10%] w-[80vh] h-[80vh] bg-indigo-500/20 rounded-full blur-[120px] mix-blend-screen"
                />
                <motion.div
                    animate={{ scale: [1, 1.3, 1], x: [20, -20, 20], y: [20, -20, 20] }}
                    transition={{ duration: 18, repeat: Infinity, delay: 2 }}
                    className="absolute top-[30%] -right-[10%] w-[60vh] h-[60vh] bg-fuchsia-500/20 rounded-full blur-[100px] mix-blend-screen"
                />
            </div>

            {/* --- Header Actions --- */}
            <div className="relative z-10 flex items-center justify-between px-6 pt-[calc(env(safe-area-inset-top)+16px)]">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                    <Sparkles size={14} className="text-amber-400 fill-amber-400" />
                    <span className="text-white text-[10px] font-black uppercase tracking-widest">Pixel Masterpiece</span>
                </div>
                <button onClick={onClose} className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white/60 hover:text-white transition-all active:scale-90 border border-white/10">
                    <X size={20} />
                </button>
            </div>

            {/* --- Main Content Showcase --- */}
            <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
                <div className="relative w-full max-w-sm">
                    {/* Celebration Particles */}
                    {particles.map((p) => (
                        <motion.div
                            key={p.id}
                            initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                            animate={{ x: p.x, y: p.y, opacity: 0, scale: p.scale, rotate: p.rotate }}
                            transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
                            className="absolute left-1/2 top-1/2 w-4 h-4 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-500 pointer-events-none z-20"
                        />
                    ))}

                    <motion.div
                        initial={{ scale: 0.8, y: 40, rotate: -2, opacity: 0 }}
                        animate={{ scale: 1, y: 0, rotate: 0, opacity: 1 }}
                        transition={{ type: "spring", damping: 20, stiffness: 200, delay: 0.2 }}
                        className="relative w-full aspect-[3/4] rounded-[40px] overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.5)] border border-white/10 bg-slate-800"
                    >
                        {type === 'video' ? (
                            <video src={result.url} controls autoPlay loop className="w-full h-full object-cover" />
                        ) : (
                            <img src={result.url} alt="Result" className="w-full h-full object-cover" />
                        )}

                        {/* Floater Badge */}
                        <div className="absolute bottom-6 left-6 flex items-center gap-3 bg-black/40 backdrop-blur-xl p-2 pr-6 rounded-2xl border border-white/20">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-lg">
                                <Zap fill="white" size={20} />
                            </div>
                            <div>
                                <div className="text-white font-black text-xs uppercase tracking-tight">Magically Generated</div>
                                <div className="text-white/50 text-[10px] font-bold">via Nano Banana v3</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>

            {/* --- Action Dock --- */}
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, type: "spring", damping: 25 }}
                className="relative z-20 px-6 pb-[calc(env(safe-area-inset-bottom)+24px)] space-y-4"
            >
                {/* Secondary Actions Row */}
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={handleShare} className="h-14 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center gap-3 text-white font-bold transition-all active:scale-95 hover:bg-white/10">
                        <Share2 size={20} /> Поделиться
                    </button>
                    <button onClick={handleDownload} className="h-14 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center gap-3 text-white font-bold transition-all active:scale-95 hover:bg-white/10">
                        <Download size={20} /> Скачать
                    </button>
                </div>

                {/* Main Action - Volumetric */}
                <button
                    onClick={handlePublish}
                    disabled={isPublished || isPublishing}
                    className={`
                        w-full h-18 rounded-[24px] font-black text-lg uppercase tracking-wider flex items-center justify-center gap-3 transition-all btn-pop
                        ${isPublished
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-gradient-to-r from-indigo-500 to-fuchsia-600 text-white border-indigo-700'}
                    `}
                >
                    {isPublished ? (
                        <><Check size={24} strokeWidth={3} /> В Ленте</>
                    ) : (
                        <><Globe size={24} /> {isPublishing ? 'Публикация...' : 'Опубликовать в Ленте'}</>
                    )}
                </button>

                {/* Footer Remix */}
                <button onClick={onRemix} className="w-full text-center text-white/40 text-xs font-bold uppercase tracking-widest pt-2 hover:text-white transition-colors active:scale-95">
                    Сгенерировать еще раз
                </button>
            </motion.div>
        </motion.div>
    );
};

export default GenerationResult;
