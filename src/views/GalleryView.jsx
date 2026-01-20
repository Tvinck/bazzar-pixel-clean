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
        if (creation) {
            if (creation.user_liked) {
                await galleryAPI.unlikeCreation(creationId, userId);
            } else {
                await galleryAPI.likeCreation(creationId, userId);
            }
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
            <div className="pt-safe-top px-4 pb-2 bg-slate-50/95 dark:bg-black/95 backdrop-blur-sm sticky top-0 z-30 border-b border-slate-200 dark:border-white/5 transition-colors duration-300">
                <h1 className="text-3xl font-bold mb-4 mt-2">Галерея</h1>

                {/* Row 1: Main Filters (Pills) */}
                <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors border ${activeTab === 'all' ? 'bg-slate-900 text-white dark:bg-[#FFF0E6] dark:text-black border-transparent' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-white/10 dark:text-white dark:border-transparent dark:hover:bg-white/20'}`}
                    >
                        Все
                    </button>
                    <button
                        onClick={() => setActiveTab('new')}
                        className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors border ${activeTab === 'new' ? 'bg-slate-900 text-white dark:bg-[#FFF0E6] dark:text-black border-transparent' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-white/10 dark:text-white dark:border-transparent dark:hover:bg-white/20'}`}
                    >
                        Новые
                    </button>
                    <button
                        onClick={() => setActiveTab('liked')}
                        className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors border ${activeTab === 'liked' ? 'bg-slate-900 text-white dark:bg-[#FFF0E6] dark:text-black border-transparent' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-white/10 dark:text-white dark:border-transparent dark:hover:bg-white/20'}`}
                    >
                        Мои лайки
                    </button>
                </div>

                {/* Row 2: Categories (Horizontal Scroll) */}
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-white border border-slate-200 text-slate-700 dark:bg-white/10 dark:border-white/20 dark:text-white whitespace-nowrap transition-colors">
                        <Box size={14} /> Все
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:border-white/5 dark:bg-white/5 dark:text-white/60 dark:hover:text-white dark:hover:bg-white/10 whitespace-nowrap transition-colors">
                        <Gift size={14} /> Новый год
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:border-white/5 dark:bg-white/5 dark:text-white/60 dark:hover:text-white dark:hover:bg-white/10 whitespace-nowrap transition-colors">
                        <HeartHandshake size={14} /> Для двоих
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:border-white/5 dark:bg-white/5 dark:text-white/60 dark:hover:text-white dark:hover:bg-white/10 whitespace-nowrap transition-colors">
                        <Users size={14} /> Семейные
                    </button>
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
