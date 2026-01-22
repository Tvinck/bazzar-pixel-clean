import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LoadingSpinner } from '../components/ui/Progress';
import { Heart, Box, Gift, HeartHandshake, Users, Sparkles } from 'lucide-react';
import galleryAPI from '../lib/galleryAPI';
import IdeaDetailModal from '../components/IdeaDetailModal';
import { useInfiniteCreations } from '../hooks/useGallery';
import OptimizedImage from '../components/ui/OptimizedImage';

const GalleryView = ({ onRemix }) => {
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
        const userId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 'test-user-id';
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

                {/* Row 1: Main Filters (Pills) */}
                <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar scroll-smooth">
                    {['all', 'new', 'liked'].map((tab) => {
                        const labels = { all: 'В популярном', new: 'Свежее', liked: 'Избранное' };
                        const isActive = activeTab === tab;
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 ${isActive
                                    ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-lg shadow-black/5 dark:shadow-white/10 scale-105'
                                    : 'bg-white text-slate-500 hover:bg-slate-100 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10'
                                    }`}
                            >
                                {labels[tab]}
                            </button>
                        );
                    })}
                </div>

                {/* Row 2: Categories (Horizontal Scroll) */}
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 mask-linear-fade">
                    {[
                        { icon: Box, label: 'Все' },
                        { icon: Sparkles, label: 'Аниме' },
                        { icon: HeartHandshake, label: 'Пары' },
                        { icon: Gift, label: 'Арты' },
                        { icon: Users, label: 'Люди' }
                    ].map((cat, i) => (
                        <button key={i} className="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold bg-white/50 border border-slate-200/50 text-slate-600 dark:bg-white/5 dark:border-white/5 dark:text-slate-300 hover:scale-105 transition-transform whitespace-nowrap">
                            <cat.icon size={14} className={i === 0 ? "text-indigo-500" : "opacity-70"} /> {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Masonry Grid */}
            <div className="px-2 pt-2">
                <div className="columns-2 gap-2 space-y-2">
                    {creations.map((item, i) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="break-inside-avoid relative rounded-[1rem] overflow-hidden cursor-pointer group mb-2 bg-slate-200 dark:bg-[#121212]"
                            onClick={() => setSelectedCreation(item)}
                        >
                            <OptimizedImage
                                src={item.image_url || item.thumbnail_url}
                                className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                            />
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Load More */}
            {hasNextPage && (
                <div className="flex justify-center mt-8 mb-8">
                    <button
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                        className="w-10 h-10 rounded-full bg-slate-200 text-slate-500 dark:bg-white/10 dark:text-white flex items-center justify-center animate-pulse"
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
