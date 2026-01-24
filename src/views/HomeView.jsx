import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; // Added useNavigate
import {
    Image as ImageIcon, Video, Music, Wand2, Zap, Sparkles, Layers, Box, Trophy, Smile, UserPlus, Eraser,
    Banana, Wind, Cloud, PenTool, LayoutTemplate, Search, Heart, User
} from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import AbstractCore from '../components/3d/AbstractCore';
import ToolCard from '../components/ui/ToolCard';
import LikeButton from '../components/ui/LikeButton';
import { useLanguage } from '../context/LanguageContext';
import ErrorBoundary from '../components/ErrorBoundary';
import OptimizedImage from '../components/ui/OptimizedImage';
import BannerCarousel from '../components/BannerCarousel';
import { usePublicCreations, useTemplates, useUserLikedIds } from '../hooks/useGallery';
import { useUser } from '../context/UserContext';

const triggerHaptic = (style = 'light') => {
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
    }
};

const SkeletonLoader = () => (
    <div className="space-y-8 animate-pulse">
        <div className="w-full h-64 bg-slate-200 dark:bg-slate-800 rounded-[2rem]"></div>
        <div className="flex gap-3">
            <div className="w-24 h-10 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
            <div className="w-24 h-10 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-[1.5rem]"></div>
            <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-[1.5rem]"></div>
        </div>
    </div>
);

const HomeView = ({ onLoadComplete, onOpenCreation, onOpenTemplate, onOpenLeaderboard }) => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { user } = useUser();

    // React Query usage
    const { data: creations, isLoading: isFeedLoading } = usePublicCreations({
        sortBy: 'trending',
        limit: 10
    });

    const { data: templates, isLoading: isTemplatesLoading } = useTemplates();
    const { data: likedIds } = useUserLikedIds(user?.id);

    const [feedItems, setFeedItems] = useState([]);
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const tools = [
        { id: 'image', label: t('toolsCard.image'), icon: ImageIcon, color: 'text-indigo-500 dark:text-indigo-400', action: () => onOpenCreation('image-gen') },
        { id: 'video', label: t('toolsCard.video'), icon: Video, color: 'text-rose-500 dark:text-rose-400', action: () => onOpenCreation('video-gen') },
        { id: 'avatar', label: 'AI Avatar', icon: User, color: 'text-cyan-500 dark:text-cyan-400', action: () => onOpenCreation('avatar-gen') },
        { id: 'banana', label: t('toolsCard.nanoBanana'), icon: ImageIcon, color: 'text-yellow-500 dark:text-yellow-400', special: true, action: () => onOpenCreation('image-gen', '', 'nano_banana_pro') },
        { id: 'kling', label: 'Kling 2.6\nMotion', icon: Wind, color: 'text-emerald-500 dark:text-emerald-400', action: () => onOpenCreation('video-gen', '', 'kling_motion_control') },
        { id: 'audio', label: t('toolsCard.audio'), icon: Music, color: 'text-blue-500 dark:text-blue-400', action: () => onOpenCreation('audio-gen') },
        { id: 'animate', label: t('toolsCard.animate'), icon: Wand2, color: 'text-purple-500 dark:text-purple-400', action: () => onOpenCreation('animate-photo') },
        { id: 'veo', label: 'Veo 3', icon: Layers, color: 'text-orange-500 dark:text-orange-400', action: () => onOpenCreation('video-gen', '', 'veo_3') },
        { id: 'sora', label: t('toolsCard.sora'), icon: Cloud, color: 'text-sky-500 dark:text-sky-400', action: () => onOpenCreation('video-gen', '', 'sora_2_pro_storyboard') },
        { id: 'tools', label: t('toolsCard.tools'), icon: PenTool, color: 'text-slate-500 dark:text-slate-400', action: () => onOpenCreation('tools') },
    ];

    useEffect(() => {
        if (!isFeedLoading && !isTemplatesLoading) {
            setFeedItems([...(templates || []), ...(creations || [])]);
            onLoadComplete && onLoadComplete();
        }
    }, [creations, templates, isFeedLoading, isTemplatesLoading, onLoadComplete]);

    // Removed blocking loader to show skeleton in-place
    // if (isFeedLoading) return <SkeletonLoader />;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8 pb-4"
        >
            {/* --- HERO BANNER --- */}
            <section className="px-6">
                <BannerCarousel />
            </section>

            {/* --- TOOLS CAROUSEL --- */}
            <section>
                <div className="px-6 mb-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Создать</h2>
                    <button className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors" onClick={() => onOpenCreation('Quick Gen')}>Все</button>
                </div>

                <div className="w-full">
                    <div className="flex overflow-x-auto px-6 gap-4 pb-4 no-scrollbar snap-x snap-mandatory">
                        {tools.map((tool) => (
                            <button
                                key={tool.id}
                                onClick={tool.action}
                                className="flex flex-col items-center gap-3 min-w-[80px] snap-start group"
                            >
                                {/* Icon Container */}
                                <div className="w-[80px] h-[80px] rounded-[1.8rem] bg-white dark:bg-[#1c1c1e] border border-slate-200 dark:border-white/5 flex items-center justify-center shadow-lg shadow-slate-200/50 dark:shadow-black/20 group-hover:scale-105 group-hover:bg-slate-50 dark:group-hover:bg-[#252528] group-hover:border-slate-300 dark:group-hover:border-white/20 transition-all duration-300 relative overflow-hidden">
                                    {/* Inner Glow */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <tool.icon
                                        size={32}
                                        strokeWidth={2}
                                        className={`${tool.color} opacity-90 group-hover:opacity-100 drop-shadow-sm transition-all`}
                                    />
                                </div>
                                {/* Label */}
                                <span className="text-[11px] font-medium text-slate-600 dark:text-white/60 text-center leading-tight whitespace-pre-line group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                    {tool.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- SEARCH & CATEGORIES (NEW) --- */}
            <section className="space-y-6">
                {/* Search */}
                <div className="px-6 relative">
                    <Search className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Поиск идей..."
                        className="w-full h-12 pl-12 pr-4 bg-white dark:bg-[#1c1c1e] rounded-2xl border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
                    />
                </div>

                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar px-6 pb-2">
                    {[
                        { id: 'all', label: t('gallery.all') },
                        { id: 'dances', label: t('categories.dances') },
                        { id: 'trends', label: t('categories.trends') },
                        { id: 'christmas', label: t('categories.christmas') },
                        { id: 'angels', label: t('categories.angels') },
                        { id: 'cars', label: 'Авто' },
                        { id: 'pets', label: 'Питомцы' },
                        { id: 'oldTrends', label: t('categories.oldTrends') }
                    ].map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => { setActiveCategory(cat.id); triggerHaptic('light'); }}
                            className={`px-6 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-300 border ${activeCategory === cat.id ? 'bg-slate-900 text-white dark:bg-white dark:text-black border-transparent shadow-md scale-105' : 'bg-white text-slate-600 border-slate-200 dark:bg-[#1c1c1e] dark:text-slate-400 dark:border-white/5'}`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </section>

            {/* --- DISCOVER --- */}
            <section>
                {/* DYNAMIC HEADER BASED ON CATEGORY */}
                <div className="px-6 mb-6 mt-4">
                    <h2 className="text-3xl font-black text-amber-500 uppercase tracking-wide mb-1">
                        {activeCategory === 'all' ? t('home.discover') :
                            activeCategory === 'dances' ? t('categories.dances') :
                                activeCategory === 'trends' ? t('categories.trends') :
                                    activeCategory === 'christmas' ? t('categories.christmas') :
                                        activeCategory === 'angels' ? t('categories.angels') :
                                            activeCategory === 'cars' ? 'АВТО' :
                                                activeCategory === 'pets' ? 'ПИТОМЦЫ' :
                                                    activeCategory === 'oldTrends' ? t('categories.oldTrends') : activeCategory}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                        {activeCategory === 'all' ? 'Популярные шаблоны' :
                            activeCategory === 'dances' ? 'Сгенерируй трендовые танцевальные видео!' :
                                activeCategory === 'trends' ? 'Самые популярные шаблоны этой недели' :
                                    'Тематические подборки'}
                    </p>
                </div>

                {/* MASONRY LAYOUT */}
                <div className="columns-2 gap-2 space-y-2 px-3">
                    {(isFeedLoading || isTemplatesLoading) && feedItems.length === 0 ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="break-inside-avoid relative rounded-[1.2rem] overflow-hidden bg-slate-200 dark:bg-slate-800 mb-2 border border-slate-100 dark:border-white/5 animate-pulse">
                                <div style={{ aspectRatio: i % 2 === 0 ? '3/4' : '1/1' }} className="w-full bg-slate-300 dark:bg-slate-700" />
                                <div className="absolute inset-x-0 bottom-0 p-3 space-y-2">
                                    <div className="h-3 w-2/3 bg-slate-400 dark:bg-slate-600 rounded-full" />
                                    <div className="h-2 w-1/2 bg-slate-400 dark:bg-slate-600 rounded-full" />
                                </div>
                            </div>
                        ))
                    ) : feedItems.filter(item => {
                        const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
                        const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.description?.toLowerCase().includes(searchQuery.toLowerCase());
                        return matchesCategory && matchesSearch;
                    }).map((item, i) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ delay: i * 0.1 }}
                            className="break-inside-avoid relative group rounded-[1.2rem] overflow-hidden bg-slate-900 cursor-pointer border border-slate-100 dark:border-white/10"
                            onClick={() => item.type === 'template' && onOpenTemplate(item)}
                        >
                            <div style={{ aspectRatio: item.type === 'template' ? '3/4' : '1/1' }} className="relative">
                                {item.type === 'template' ? (
                                    item.mediaType === 'image' ? (
                                        <OptimizedImage
                                            src={item.src}
                                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                                            alt={item.title}
                                        />
                                    ) : (
                                        <video
                                            src={item.src.includes('#') ? item.src : `${item.src}#t=0.1`}
                                            poster={item.thumbnail_url || item.image_url || item.cover_url}
                                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300 bg-black"
                                            autoPlay
                                            muted
                                            loop
                                            playsInline
                                            preload="metadata"
                                        />
                                    )
                                ) : (
                                    <OptimizedImage
                                        src={item.src || item.image_url || item.thumbnail_url}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                                        alt={item.title || "Inspiration"}
                                    />
                                )}

                                {/* Dark Gradient Overlay (Bottom) */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
                            </div>

                            {/* Top Left: User Avatar (for creations) or Type Icon (for templates) */}
                            <div className="absolute top-3 left-3 z-30">
                                {item.type === 'template' ? (
                                    <div className="text-white/80">
                                        {item.mediaType === 'video' ? <Video size={16} fill="currentColor" className="opacity-90" /> : <ImageIcon size={16} className="opacity-90" />}
                                    </div>
                                ) : (
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/user/${item.user_id}`);
                                        }}
                                        className="flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 pr-2 rounded-full p-0.5 hover:bg-black/60 transition-colors"
                                    >
                                        <div className="w-5 h-5 rounded-full bg-slate-700 overflow-hidden">
                                            {item.avatar_url ? (
                                                <img src={item.avatar_url} alt={item.username} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-white bg-indigo-500">
                                                    {item.username?.[0]?.toUpperCase() || 'U'}
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-[10px] font-bold text-white max-w-[60px] truncate">
                                            @{item.username || 'User'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Top Right Category Badge */}
                            <div className="absolute top-3 right-3">
                                <span className={`backdrop-blur-md border border-white/20 text-white text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm ${item.category === 'love' ? 'bg-pink-500/80 border-pink-300/50' : 'bg-black/40' // Special pink badge for Love
                                    }`}>
                                    {item.category === 'cars' ? 'АВТО' :
                                        item.category === 'christmas' ? 'НОВЫЙ ГОД' :
                                            item.category === 'angels' ? 'АНГЕЛЫ' :
                                                item.category === 'pets' ? 'ПИТОМЦЫ' :
                                                    item.category === 'oldTrends' ? 'РЕТРО' :
                                                        item.category === 'dances' ? 'ТАНЦЫ' :
                                                            item.category === 'love' ? '14 ФЕВРАЛЯ' : 'ТРЕНД'}
                                </span>
                            </div>

                            {/* Bottom Content & Like Button */}
                            <div className="absolute bottom-4 left-3 right-3 z-20 flex justify-between items-end gap-2">
                                <h4 className="text-white font-bold text-sm uppercase leading-tight tracking-wide drop-shadow-md flex-1">
                                    {item.title || item.prompt}
                                </h4>

                                <div onClick={(e) => e.stopPropagation()}>
                                    <LikeButton
                                        creationId={item.id}
                                        initialCount={item.likes_count || item.likes || 0}
                                        initialLiked={likedIds?.includes(item.id)}
                                        size="small"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>
        </motion.div >
    );
};

export default HomeView;
