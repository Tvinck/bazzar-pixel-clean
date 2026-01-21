import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Download, Share2, Globe, Sparkles, X, Check, Heart, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSound } from '../context/SoundContext';

const GenerationResult = ({ result, type = 'image', onClose, onRemix }) => {
    const { playClick } = useSound();
    const [isPublished, setIsPublished] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    const handleDownload = async () => {
        playClick();
        try {
            const response = await fetch(result.url);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `pixel-gen-${Date.now()}.${type === 'video' ? 'mp4' : 'png'}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (e) {
            console.error('Download failed', e);
            window.open(result.url, '_blank');
        }
    };

    const handleShare = () => {
        playClick();
        if (window.Telegram?.WebApp?.showPopup) {
            // Native Share URL
            const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(result.url)}&text=${encodeURIComponent('Сгенерировано в Pixel AI ✨')}`;
            window.Telegram.WebApp.openTelegramLink(shareUrl);
        } else {
            navigator.clipboard.writeText(result.url);
            alert('Ссылка скопирована!');
        }
    };

    const handlePublish = async () => {
        playClick();
        if (isPublished) return;
        setIsPublishing(true);

        try {
            const { error } = await supabase
                .from('generations')
                .update({ is_public: true })
                .eq('id', result.id);

            if (!error) {
                setIsPublished(true);
                if (window.Telegram?.WebApp?.HapticFeedback) {
                    window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsPublishing(false);
        }
    };

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || typeof document === 'undefined') return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999]">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-[#0f1014] flex flex-col items-center justify-between py-6 px-4"
            >
                {/* Header */}
                <div className="w-full flex justify-end">
                    <button onClick={onClose} className="p-2 bg-white/10 rounded-full text-white">
                        <X size={24} />
                    </button>
                </div>

                {/* Content Preview */}
                <div className="flex-1 w-full flex items-center justify-center py-4">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="relative w-full max-w-sm aspect-square rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/20 border border-white/10"
                    >
                        {type === 'video' ? (
                            <video
                                src={result.url}
                                controls
                                autoPlay
                                loop
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <img
                                src={result.url}
                                alt="Result"
                                className="w-full h-full object-cover"
                            />
                        )}

                        {/* Success Badge */}
                        <div className="absolute top-4 left-4 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                            <Sparkles size={10} /> CREATED
                        </div>
                    </motion.div>
                </div>

                {/* Actions Panel */}
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="w-full max-w-sm space-y-3"
                >
                    {/* Primary Action: Publish */}
                    <button
                        onClick={handlePublish}
                        disabled={isPublished || isPublishing}
                        className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${isPublished
                            ? 'bg-green-500/10 text-green-500 border border-green-500/50'
                            : 'bg-gradient-to-r from-indigo-500 to-fuchsia-600 text-white shadow-lg shadow-indigo-500/30'
                            }`}
                    >
                        {isPublished ? (
                            <>
                                <Check size={20} />
                                Опубликовано в Ленте
                            </>
                        ) : (
                            <>
                                <Globe size={20} />
                                {isPublishing ? 'Публикация...' : 'Опубликовать в Идеи'}
                            </>
                        )}
                    </button>

                    {/* Secondary Actions Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={handleShare}
                            className="bg-white/10 backdrop-blur-md text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                        >
                            <Share2 size={18} />
                            Поделиться
                        </button>
                        <button
                            onClick={handleDownload}
                            className="bg-white/10 backdrop-blur-md text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                        >
                            <Download size={18} />
                            Скачать
                        </button>
                    </div>

                    <div className="pt-2 text-center">
                        <button onClick={onRemix} className="text-slate-500 text-xs font-medium hover:text-white transition-colors">
                            Сгенерировать еще раз
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </div>,
        document.body
    );
};

export default GenerationResult;
