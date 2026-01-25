import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Share2, Globe, Sparkles, X, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSound } from '../context/SoundContext';

const GenerationResult = ({ result, type = 'image', onClose, onRemix }) => {
    const { playClick } = useSound();
    const [isPublished, setIsPublished] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    // Telegram Mini App Back Button
    useEffect(() => {
        if (window.Telegram?.WebApp?.BackButton) {
            const backButton = window.Telegram.WebApp.BackButton;
            backButton.show();
            backButton.onClick(onClose);

            return () => {
                backButton.hide();
                backButton.offClick(onClose);
            };
        }
    }, [onClose]);

    const handleDownload = async () => {
        playClick();

        // 1. Try Telegram Native Download (Best for Mobile)
        if (window.Telegram?.WebApp?.downloadFile) {
            try {
                window.Telegram.WebApp.downloadFile({ url: result.url, file_name: `pixel-${Date.now()}.${type === 'video' ? 'mp4' : 'png'}` });
                return;
            } catch (e) {
                console.warn('TG Download failed, falling back', e);
            }
        }

        // 2. Try Browser Blob Download (Desktop/Android Web)
        try {
            const response = await fetch(result.url, { mode: 'cors' });
            if (!response.ok) throw new Error('Network error');
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
            // 3. Last Resort: Open Link
            if (window.Telegram?.WebApp?.openLink) {
                window.Telegram.WebApp.openLink(result.url, { try_instant_view: false });
            } else {
                window.open(result.url, '_blank');
            }
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

    return (
        <div className="fixed inset-0 z-[9999] bg-[#0f1014] flex flex-col items-center justify-between py-6 px-4 touch-none">
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

                {/* Bottom Actions */}
                <div className="flex items-center justify-between pt-2">
                    <button onClick={onRemix} className="text-slate-500 text-xs font-medium hover:text-white transition-colors">
                        Сгенерировать еще раз
                    </button>

                    {/* Close Button - Moved to Bottom */}
                    <button
                        onClick={onClose}
                        className="p-2 bg-white/10 rounded-full text-white/60 hover:text-white hover:bg-white/20 active:scale-95 transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default GenerationResult;
