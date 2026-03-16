import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Share2, Download, User as UserIcon, Calendar, Tag, ChevronLeft, ChevronRight, Instagram, Wand2, Maximize2, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { AnimatedButton } from './ui/AnimatedButtons';
import AnimatedIcon from './ui/AnimatedIcon';

const CreationModal = ({ creation, isOpen, onClose, onLike, onNext, onPrev, hasNext, hasPrev, onRemix, onUpscale }) => {
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    // Swipe Logic
    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe && hasNext) {
            onNext();
        } else if (isRightSwipe && hasPrev) {
            onPrev();
        }
    };

    const handleShareStory = async () => {
        if (window.Telegram?.WebApp?.showPopup) {
            window.Telegram.WebApp.showPopup({
                title: 'Share to Story',
                message: 'This feature will generate a beautiful story card with QR code. Implementing soon!',
                buttons: [{ type: 'ok' }]
            });
        }
    };

    if (!creation) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
                    />

                    {/* Telegram-style Bottom Sheet Modal Content */}
                    <div className="fixed inset-0 z-[70] flex flex-col justify-end pointer-events-none">
                        <motion.div
                            initial={{ y: "100%", opacity: 0.8 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: "100%", opacity: 0.8 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-[var(--tg-theme-bg-color)] rounded-t-[2.5rem] w-full max-h-[92vh] overflow-y-auto overflow-x-hidden flex flex-col shadow-2xl pointer-events-auto"
                            onTouchStart={onTouchStart}
                            onTouchMove={onTouchMove}
                            onTouchEnd={onTouchEnd}
                        >
                            {/* Drag Handle */}
                            <div className="absolute top-0 left-0 right-0 h-10 flex justify-center items-center z-20">
                                <div className="w-10 h-1.5 bg-white/30 backdrop-blur-md rounded-full shadow-sm" />
                            </div>

                            {/* Close Button Component */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 z-50 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                            >
                                <X size={18} />
                            </button>

                            {/* Image Container with telegram image viewer feel */}
                            <div className="relative w-full aspect-[4/5] bg-black flex items-center justify-center overflow-hidden group">
                                {(creation.type === 'video' || creation.image_url?.match(/\.(mp4|mov|webm)$/i)) ? (
                                    <motion.video
                                        key={creation.id}
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.4 }}
                                        src={creation.image_url}
                                        className="w-full h-full object-cover"
                                        controls
                                        autoPlay
                                        loop
                                        playsInline
                                    />
                                ) : (
                                    <motion.img
                                        key={creation.id}
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.4 }}
                                        src={creation.image_url || creation.thumbnail_url}
                                        alt={creation.title || 'Creation'}
                                        className="w-full h-full object-cover"
                                    />
                                )}

                                {/* Navigation Arrows */}
                                {hasPrev && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onPrev(); }}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/50 transition-all active:scale-95"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                )}
                                {hasNext && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onNext(); }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/50 transition-all active:scale-95"
                                    >
                                        <ChevronRight size={24} />
                                    </button>
                                )}

                                {/* Badge */}
                                {creation.type && (
                                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest shadow-lg">
                                        {creation.type}
                                    </div>
                                )}
                            </div>

                            {/* Details Content */}
                            <div className="p-6 bg-[var(--tg-theme-bg-color)] text-[var(--tg-theme-text-color)] flex-1 relative z-10">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-5">
                                    <div className="pr-4">
                                        <h2 className="text-2xl font-bold font-display mb-1.5 line-clamp-2 title-text">
                                            {creation.title || 'Untitled Creation'}
                                        </h2>
                                        <div className="flex items-center gap-2 text-[var(--tg-theme-hint-color)] text-sm font-medium">
                                            <div className="w-5 h-5 rounded-full bg-[var(--tg-theme-secondary-bg-color)] flex items-center justify-center overflow-hidden border border-white/10">
                                                {creation.user?.avatar_url ? (
                                                    <img src={creation.user.avatar_url} alt={creation.user.username} className="w-full h-full object-cover" />
                                                ) : (
                                                    <AnimatedIcon icon={UserIcon} size={12} delay={0.1} />
                                                )}
                                            </div>
                                            <span>@{creation.user?.username || 'anonymous'}</span>
                                        </div>
                                    </div>

                                    {/* Like Button */}
                                    <motion.button
                                        whileTap={{ scale: 0.8 }}
                                        onClick={() => onLike(creation.id)}
                                        className="flex flex-col items-center gap-1 transition-transform relative mt-1"
                                    >
                                        <AnimatedIcon
                                            icon={Heart}
                                            size={28}
                                            disableHover
                                            className={`transition-colors drop-shadow-sm ${creation.user_liked ? 'fill-red-500 text-red-500' : 'text-[var(--tg-theme-hint-color)]'}`}
                                        />
                                        <span className="text-xs font-bold text-[var(--tg-theme-hint-color)]">{creation.likes || 0}</span>
                                    </motion.button>
                                </div>

                                {/* Prompt */}
                                <div className="bg-[var(--tg-theme-secondary-bg-color)] border border-black/5 dark:border-white/5 rounded-2xl p-4 mb-6 shadow-sm">
                                    <p className="text-sm font-body leading-relaxed line-clamp-3 text-[var(--tg-theme-text-color)]/80 selection:bg-[var(--tg-theme-button-color)]/30">
                                        {creation.prompt}
                                    </p>
                                </div>

                                {/* Actions in Telegram Bottom Action Style */}
                                <div className="grid grid-cols-2 gap-3 pb-safe">
                                    {/* Remix Button */}
                                    <button
                                        onClick={() => {
                                            onClose();
                                            onRemix && onRemix(creation.prompt);
                                        }}
                                        className="col-span-2 flex items-center justify-center gap-2 bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] py-3.5 rounded-2xl font-semibold text-[15px] shadow-lg shadow-[var(--tg-theme-button-color)]/25 active:scale-[0.98] transition-all"
                                    >
                                        <Wand2 size={18} />
                                        Remix Style
                                    </button>

                                    {/* Upscale HD Button */}
                                    {creation.type !== 'video' && (
                                        <button
                                            onClick={() => {
                                                onClose();
                                                onUpscale && onUpscale(creation.id);
                                            }}
                                            className="col-span-2 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-2xl font-semibold text-[14px] shadow-lg shadow-purple-500/25 active:scale-[0.98] transition-all"
                                        >
                                            <Maximize2 size={16} />
                                            Upscale HD
                                            <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-[11px] font-bold">
                                                <Zap size={10} /> 10
                                            </span>
                                        </button>
                                    )}

                                    <button
                                        onClick={() => {
                                            const link = document.createElement('a');
                                            link.href = creation.image_url;
                                            link.download = `creation-${creation.id}.png`;
                                            link.click();
                                        }}
                                        className="flex items-center justify-center gap-2 bg-[var(--tg-theme-secondary-bg-color)] text-[var(--tg-theme-text-color)] py-3 rounded-xl font-medium text-sm active:bg-black/10 dark:active:bg-white/10 transition-colors"
                                    >
                                        <Download size={18} className="text-[var(--tg-theme-button-color)]" />
                                        Save
                                    </button>

                                    <button
                                        onClick={handleShareStory}
                                        className="flex items-center justify-center gap-2 bg-[var(--tg-theme-secondary-bg-color)] text-[var(--tg-theme-text-color)] py-3 rounded-xl font-medium text-sm active:bg-black/10 dark:active:bg-white/10 transition-colors"
                                    >
                                        <Instagram size={18} className="text-pink-500" />
                                        Story
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CreationModal;
