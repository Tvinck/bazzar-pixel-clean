import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Share2, Download, User as UserIcon, Calendar, Tag, ChevronLeft, ChevronRight, Instagram, Wand2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { AnimatedButton } from './ui/AnimatedButtons';

const CreationModal = ({ creation, isOpen, onClose, onLike, onNext, onPrev, hasNext, hasPrev, onRemix }) => {
    const { t } = useLanguage();
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
        // Mock generation of story image (in real app, use html2canvas or canvas API)
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
                        className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-0 md:p-4"
                    >
                        {/* Close Button (Fixed Top Right) */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-[80] w-10 h-10 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </motion.div>

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed z-[70] w-full md:max-w-lg h-full md:h-auto md:max-h-[90vh] bg-black md:bg-white md:dark:bg-slate-900 md:rounded-[2rem] overflow-hidden flex flex-col"
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                    >
                        {/* Image Container */}
                        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden group">
                            <motion.img
                                key={creation.id} // Re-animate on change
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                src={creation.image_url || creation.thumbnail_url}
                                alt={creation.title || 'Creation'}
                                className="w-full h-full object-contain"
                            />

                            {/* Navigation Arrows (Desktop / Visible on tap) */}
                            {hasPrev && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onPrev(); }}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/50 transition-all active:scale-90 md:opacity-0 md:group-hover:opacity-100"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                            )}
                            {hasNext && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onNext(); }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/50 transition-all active:scale-90 md:opacity-0 md:group-hover:opacity-100"
                                >
                                    <ChevronRight size={24} />
                                </button>
                            )}

                            {/* Badge */}
                            {creation.type && (
                                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wider">
                                    {creation.type}
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="p-6 bg-white dark:bg-slate-900 rounded-t-[2rem] md:rounded-none relative -mt-6 md:mt-0 z-10">
                            {/* Drag Handle for Mobile */}
                            <div className="w-12 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-4 md:hidden" />

                            {/* Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white mb-1 line-clamp-1">
                                        {creation.title || 'Untitled Creation'}
                                    </h2>
                                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                                        <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                                            {creation.user?.avatar_url ? (
                                                <img src={creation.user.avatar_url} alt={creation.user.username} className="w-full h-full object-cover" />
                                            ) : (
                                                <UserIcon size={12} />
                                            )}
                                        </div>
                                        <span className="font-medium">@{creation.user?.username || 'anonymous'}</span>
                                    </div>
                                </div>

                                {/* Like Button */}
                                <button
                                    onClick={() => onLike(creation.id)}
                                    className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
                                >
                                    <Heart
                                        size={28}
                                        className={`transition-colors ${creation.user_liked ? 'fill-pink-500 text-pink-500' : 'text-slate-400 dark:text-slate-600'}`}
                                    />
                                    <span className="text-xs font-bold text-slate-500">{creation.likes || 0}</span>
                                </button>
                            </div>

                            {/* Prompt (Collapsed by default maybe? For now full) */}
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 mb-6">
                                <p className="text-xs text-slate-600 dark:text-slate-300 font-mono line-clamp-3">
                                    {creation.prompt}
                                </p>
                            </div>

                            {/* Actions */}
                            {/* Actions */}
                            <div className="grid grid-cols-2 gap-3">
                                {/* Remix Button (New) */}
                                <AnimatedButton
                                    variant="primary"
                                    icon={<Wand2 size={20} />} // Ensure Wand2 is imported
                                    onClick={() => {
                                        onClose();
                                        onRemix && onRemix(creation.prompt);
                                    }}
                                    className="col-span-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                                >
                                    Remix this Style
                                </AnimatedButton>

                                <AnimatedButton
                                    variant="secondary"
                                    icon={<Download size={20} />}
                                    onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = creation.image_url;
                                        link.download = `creation-${creation.id}.png`;
                                        link.click();
                                    }}
                                >
                                    Save
                                </AnimatedButton>
                                <AnimatedButton
                                    variant="secondary"
                                    icon={<Instagram size={20} />}
                                    onClick={handleShareStory}
                                    className="text-pink-600 bg-pink-50 dark:bg-pink-900/20"
                                >
                                    Story
                                </AnimatedButton>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CreationModal;
