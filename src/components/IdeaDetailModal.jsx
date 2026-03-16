import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Share2, Link as LinkIcon, Sparkles } from 'lucide-react';
import OptimizedImage from './ui/OptimizedImage';

const IdeaDetailModal = ({ isOpen, onClose, creation, onRemix, onLike }) => {
    // Prevent rendering if not open
    // But we keep it mounted for AnimatePresence to work, so we check isOpen inside AP

    return (
        <AnimatePresence>
            {isOpen && creation && (
                <div className="fixed inset-0 z-[100] flex flex-col justify-end pointer-events-none">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md pointer-events-auto"
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="w-full bg-bg-secondary rounded-t-[32px] overflow-hidden relative z-10 pointer-events-auto max-h-[92vh] flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-white/10"
                    >
                        {/* Drag Handle Area */}
                        <div className="w-full flex justify-center pt-4 pb-2 shrink-0 cursor-grab active:cursor-grabbing" onClick={onClose}>
                            <div className="w-12 h-1.5 bg-white/20 rounded-full" />
                        </div>

                        {/* Valid Content Area with Scroll */}
                        <div className="flex-1 overflow-y-auto px-5 pb-8 no-scrollbar overscroll-contain">

                            {/* Image with 3D Pop */}
                            <div className="mt-2 mb-6 relative group">
                                <motion.div
                                    className="aspect-[3/4] w-full rounded-[28px] overflow-hidden shadow-2xl relative border border-white/10 bg-slate-800"
                                    layoutId={`image-${creation.id}`}
                                >
                                    <OptimizedImage
                                        src={creation.image_url || creation.thumbnail_url}
                                        className="w-full h-full object-cover"
                                        alt="Creation"
                                    />
                                    {/* Gradient overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                                </motion.div>

                                {/* Like Floating Button on Image (Zenly Style) */}
                                <motion.button
                                    whileTap={{ scale: 0.8 }}
                                    onClick={(e) => { e.stopPropagation(); onLike && onLike(creation.id); }}
                                    className={`absolute bottom-4 right-4 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-xl border border-white/10 transition-all active:scale-90 z-20 ${creation.user_liked ? 'bg-rose-500 text-white shadow-rose-500/30' : 'bg-black/30 text-white hover:bg-black/50'}`}
                                >
                                    <Heart size={26} className={creation.user_liked ? "fill-current" : ""} strokeWidth={2.5} />
                                </motion.button>

                                {/* Actions Top Right */}
                                <div className="absolute top-4 right-4 flex flex-col gap-3">
                                    <button className="w-10 h-10 rounded-xl bg-black/30 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80 active:scale-90 transition-transform">
                                        <Share2 size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Info Section */}
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 p-[2px]">
                                        <div className="w-full h-full rounded-full overflow-hidden bg-black/50">
                                            {creation.user_avatar ? (
                                                <img src={creation.user_avatar} className="w-full h-full object-cover" alt="avatar" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm bg-slate-800">
                                                    {creation.username?.[0]?.toUpperCase() || 'U'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-white font-black text-lg tracking-tight">{creation.username || 'User'}</div>
                                        <div className="text-white/40 text-xs font-bold uppercase tracking-widest">Creator</div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <div className="text-white font-black text-2xl tracking-tighter tabular-nums">{creation.likes || 0}</div>
                                    <div className="text-white/40 text-xs font-bold uppercase tracking-widest">Likes</div>
                                </div>
                            </div>

                            {/* Prompt Card */}
                            <div className="bg-white/5 rounded-3xl p-5 border border-white/5 mb-6">
                                <h3 className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Prompt</h3>
                                <p className="text-white/90 text-[15px] font-medium leading-relaxed font-display">
                                    {creation.prompt}
                                </p>
                            </div>

                        </div>

                        {/* Sticky Bottom Actions */}
                        <div className="p-4 px-5 bg-bg-secondary/90 backdrop-blur-xl border-t border-white/5 pb-8 shrink-0">
                            <div className="grid grid-cols-1 gap-3">
                                <motion.button
                                    onClick={() => {
                                        if (onRemix) onRemix(creation);
                                        onClose();
                                    }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full py-4 rounded-2xl bg-[#FFD700] text-black font-black text-lg uppercase tracking-wide shadow-[0_6px_0_#B29600,0_10px_20px_rgba(255,215,0,0.2)] active:shadow-none active:translate-y-[6px] transition-all relative overflow-hidden group"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        <Sparkles className="fill-black group-hover:rotate-12 transition-transform" size={24} />
                                        Remix Style
                                    </span>
                                </motion.button>
                            </div>
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default IdeaDetailModal;
