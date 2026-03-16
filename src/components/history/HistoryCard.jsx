import React from 'react';
import { motion } from 'framer-motion';

const VideoPlayBadge = () => (
    <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.2 }}
        className="absolute top-2.5 right-2.5 z-20 w-7 h-7 bg-black/60 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/10"
    >
        <svg width="10" height="12" viewBox="0 0 10 12" fill="white">
            <motion.path
                d="M1 1.5V10.5C1 10.87 1.41 11.09 1.72 10.88L9.23 6.38C9.52 6.2 9.52 5.8 9.23 5.62L1.72 1.12C1.41 0.91 1 1.13 1 1.5Z"
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
            />
        </svg>
    </motion.div>
);

const HistoryCard = ({ gen, index, isSelected, isSelectionMode, handleCardClick }) => {
    return (
        <motion.div
            layoutId={`card-${gen.id}`}
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: Math.min(index * 0.06, 0.6), type: 'spring', stiffness: 260, damping: 22 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleCardClick(gen)}
            className={`relative aspect-square rounded-card overflow-hidden bg-bg-elevated group cursor-pointer shadow-lg shadow-black/20 border-2 transition-colors ${isSelected ? 'border-accent-blue' : 'border-white/[0.06]'}`}
        >
            {/* Selection Checkbox */}
            {isSelectionMode && (
                <div className={`absolute top-2.5 left-2.5 z-30 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-accent-blue border-accent-blue' : 'border-white/50 bg-black/20 backdrop-blur-sm'}`}>
                    {isSelected && <svg width="12" height="9" viewBox="0 0 12 9" fill="none" className="translate-y-[0.5px]"><path d="M1 4.5L4.5 8L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                </div>
            )}

            {/* Video Badge */}
            {gen.type === 'video' && <VideoPlayBadge />}

            {/* Media */}
            {gen.status === 'pending' ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-bg-secondary gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full border-2 border-white/5 border-t-white/40 animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-6 h-6 rounded-full bg-white/5 animate-pulse" />
                        </div>
                    </div>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] animate-pulse">CREATING</span>
                </div>
            ) : gen.type === 'video' ? (
                <video
                    src={gen.image_url}
                    className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-all duration-500 group-hover:scale-[1.05]"
                    muted loop playsInline
                    onMouseOver={e => e.target.play()}
                    onMouseOut={e => e.target.pause()}
                />
            ) : (
                <img
                    src={gen.image_url}
                    loading="lazy"
                    alt={gen.prompt}
                    className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-all duration-500 group-hover:scale-[1.05]"
                />
            )}

            {/* Bottom gradient with prompt preview */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />

            {/* Public indicator glow dot */}
            {gen.is_public && (
                <motion.div
                    className="absolute top-2.5 left-2.5 z-20 w-2.5 h-2.5 rounded-full bg-accent-blue"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            )}

            {/* Prompt Preview */}
            <div className="absolute bottom-3 left-3 right-3 z-10 pointer-events-none">
                <p className="text-[10px] text-white/90 line-clamp-2 font-medium leading-snug drop-shadow-md bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg">
                    {gen.prompt}
                </p>
            </div>
        </motion.div>
    );
};

export default React.memo(HistoryCard);
