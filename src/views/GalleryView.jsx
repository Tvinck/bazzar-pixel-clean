import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LoadingSpinner } from '../components/ui/Progress';
import { Heart, Box, Gift, HeartHandshake, Users, Sparkles, Star, Shield, Crown } from 'lucide-react';
import galleryAPI from '../lib/galleryAPI';
import IdeaDetailModal from '../components/IdeaDetailModal';
import { useInfiniteCreations } from '../hooks/useGallery';
import { useUser } from '../context/UserContext';
import OptimizedImage from '../components/ui/OptimizedImage';

const GalleryView = ({ onRemix }) => {
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState('all');
    const [selectedCreation, setSelectedCreation] = useState(null);

    const sortBy = activeTab === 'Новые' ? 'recent' : 'trending';

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading
    } = useInfiniteCreations({
        sortBy: sortBy,
        limit: 20
    });

    const creations = data ? data.pages.flat() : [];

    const handleLike = async (creationId) => {
        const userId = user?.id; // Authenticated User ID
        if (!userId) {
            console.error("Cannot like: Missing User ID");
            return;
        }

        const creation = creations.find(c => c.id === creationId);

        if (!creation) return;

        // Optimistic Update for UI (including Modal)
        const isLiked = creation.user_liked;
        const newLikes = isLiked ? (creation.likes - 1) : (creation.likes + 1);

        // 1. Update Selected Creation (if open)
        if (selectedCreation && selectedCreation.id === creationId) {
            setSelectedCreation(prev => ({ ...prev, user_liked: !isLiked, likes: newLikes }));
        }

        // 2. Perform API Call
        try {
            if (isLiked) {
                await galleryAPI.unlikeCreation(creationId, userId);
            } else {
                await galleryAPI.likeCreation(creationId, userId);
            }
        } catch (error) {
            console.error('Like failed:', error);
            // Revert on error (optional, but good practice)
        }
    };

    if (isLoading && !creations.length) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-black flex justify-center items-center">
                <LoadingSpinner size={40} color="violet" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white pb-24 transition-colors duration-300">
            {/* Header Section */}
            <div className="pt-safe-top px-4 pb-4 bg-slate-50/80 dark:bg-[#0f1014]/80 backdrop-blur-xl sticky top-0 z-30 transition-colors duration-300">
                <div className="flex items-center justify-between mb-4 mt-2">
                    <h1 className="text-2xl font-black font-display tracking-tight">Галерея</h1>
                </div>

                {/* Row 1: Main Filters (Glassy Pills) */}
                <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar scroll-smooth">
                    {['all', 'new', 'liked'].map((tab) => {
                        const labels = { all: 'В популярном', new: 'Свежее', liked: 'Избранное' };
                        const isActive = activeTab === tab;
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-5 py-2.5 rounded-[1rem] text-xs font-bold whitespace-nowrap transition-all duration-300 border backdrop-blur-md ${isActive
                                    ? 'bg-slate-900 text-white dark:bg-white dark:text-black border-transparent shadow-lg shadow-black/10 scale-105'
                                    : 'bg-white/50 text-slate-500 hover:bg-white dark:bg-white/5 dark:text-white/60 dark:border-white/5 dark:hover:bg-white/10'
                                    }`}
                            >
                                {labels[tab]}
                            </button>
                        );
                    })}
                </div>

                {/* Row 2: Categories (Glassy) */}
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 mask-linear-fade">
                    {[
                        { icon: Box, label: 'Все', color: 'text-indigo-500' },
                        { icon: Heart, label: '14 февраля', color: 'text-pink-500 fill-pink-500/20' },
                        { icon: Shield, label: '23 февраля', color: 'text-emerald-500 fill-emerald-500/20' },
                        { icon: Crown, label: '8 марта', color: 'text-fuchsia-500 fill-fuchsia-500/20' },
                        { icon: Sparkles, label: 'Аниме', color: 'text-amber-400' },
                        { icon: HeartHandshake, label: 'Пары', color: 'text-rose-400' },
                        { icon: Gift, label: 'Арты', color: 'text-cyan-400' },
                        { icon: Users, label: 'Люди', color: 'text-blue-400' }
                    ].map((cat, i) => (
                        <button key={i} className="flex items-center gap-2 px-4 py-2 rounded-[0.8rem] text-xs font-bold bg-white/50 backdrop-blur-md border border-slate-200/50 text-slate-600 dark:bg-white/5 dark:border-white/10 dark:text-white/70 hover:scale-105 transition-transform whitespace-nowrap shadow-sm">
                            <cat.icon size={14} className={cat.color || "opacity-70"} /> {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Masonry Grid (Glassy) */}
            <div className="px-3 pt-2">
                <div className="columns-2 gap-3 space-y-3">
                    {creations.map((item, i) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="break-inside-avoid relative rounded-[1.5rem] overflow-hidden cursor-pointer group mb-3 bg-white/5 border border-white/10 shadow-lg shadow-black/5"
                            onClick={() => setSelectedCreation(item)}
                        >
                            <OptimizedImage
                                src={item.image_url || item.thumbnail_url}
                                className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300 group-hover:scale-105 transition-transform"
                            />

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Load More (Glassy) */}
            {hasNextPage && (
                <div className="flex justify-center mt-8 mb-8">
                    <button
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                        className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-lg border border-white/10 text-slate-500 dark:text-white flex items-center justify-center animate-pulse shadow-xl"
                    >
                        {isFetchingNextPage ? <LoadingSpinner size={20} color="currentColor" /> : <div className="w-2 h-2 bg-current rounded-full" />}
                    </button>
                </div>
            )}

            {/* Detail Modal */}
            <IdeaDetailModal
                isOpen={!!selectedCreation}
                creation={selectedCreation}
                onClose={() => setSelectedCreation(null)}
                onRemix={onRemix}
                onLike={handleLike}
            />
        </div>
    );
};

export default GalleryView;
