import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Share2, Link as LinkIcon, Sparkles } from 'lucide-react';
import OptimizedImage from './ui/OptimizedImage';

const IdeaDetailModal = ({ isOpen, onClose, creation, onRemix, onLike }) => {
    if (!isOpen || !creation) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] bg-black/95 overflow-y-auto overflow-x-hidden custom-scrollbar overscroll-contain"
                >
                    <div className="min-h-full flex flex-col relative">
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="fixed top-6 right-4 z-50 w-10 h-10 flex items-center justify-center text-white/60 hover:text-white bg-black/40 backdrop-blur-md rounded-full border border-white/10"
                        >
                            <X size={20} />
                        </button>

                        {/* Main Image Container */}
                        <div className="w-full flex-shrink-0 p-4 pt-16 flex items-center justify-center mb-[-2rem] relative z-0">
                            <motion.div
                                layoutId={`image-${creation.id}`}
                                className="relative w-full max-w-lg aspect-[3/4] rounded-[2rem] overflow-hidden shadow-2xl border border-white/5"
                            >
                                <OptimizedImage
                                    src={creation.image_url || creation.thumbnail_url}
                                    className="w-full h-full object-cover"
                                    alt={creation.prompt}
                                />

                                {/* "Revive" Badge on Image */}
                                <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-md border border-white/20 text-white px-3 py-1.5 rounded-xl flex items-center gap-2">
                                    <Sparkles size={14} />
                                    <span className="text-sm font-medium">Оживить</span>
                                </div>
                            </motion.div>
                        </div>

                        {/* Bottom Sheet Content */}
                        <div className="flex-1 bg-[#121212] rounded-t-[2.5rem] p-6 pb-24 relative z-10 border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">

                            <div className="flex items-start justify-between mb-6">
                                {/* User Info */}
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden ring-1 ring-white/10">
                                        {creation.user_avatar ? (
                                            <img src={creation.user_avatar} className="w-full h-full object-cover" alt="avatar" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-tr from-slate-700 to-slate-600">
                                                {creation.username?.[0]?.toUpperCase() || 'T'}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-white font-bold text-sm">{creation.username || 'User'}</div>
                                        <div className="bg-white/10 text-white/60 text-[10px] px-1.5 py-0.5 rounded w-fit mt-1">
                                            NanoBanana
                                        </div>
                                    </div>
                                </div>

                                {/* Likes */}
                                <div className="flex flex-col items-center gap-1">
                                    <button onClick={() => onLike(creation.id)} className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${creation.user_liked ? 'bg-[#FFF0E6] text-red-500' : 'bg-white/5 text-white'}`}>
                                        <Heart size={22} fill={creation.user_liked ? "currentColor" : "none"} />
                                    </button>
                                    <span className="text-xs text-white/40 font-medium">{creation.likes || 29}</span>
                                </div>
                            </div>

                            {/* Prompt Section */}
                            <div className="mb-8 relative">
                                {/* Actions Floating Right */}
                                <div className="absolute right-0 top-0 flex flex-col gap-4">
                                    <button className="text-white/40 hover:text-white"><Share2 size={20} /></button>
                                    <button className="text-white/40 hover:text-white"><LinkIcon size={20} /></button>
                                </div>

                                <h4 className="text-white font-bold text-sm mb-2">Запрос</h4>
                                <p className="text-white/70 text-sm leading-relaxed pr-10">
                                    {creation.prompt || "No prompt provided for this creation."}
                                </p>
                            </div>

                            {/* Remixer Button */}
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onRemix(creation)}
                                className="w-full h-14 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                            >
                                <Sparkles size={20} className="text-[#321805]" strokeWidth={2.5} />
                                <span className="text-[#321805] font-bold text-base">Повторить</span>
                            </motion.button>

                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default IdeaDetailModal;
