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
        { id: 'image', label: t('toolsCard.image'), icon: ImageIcon, color: 'text-indigo-500', bgColor: 'bg-indigo-500/10', action: () => onOpenCreation('image-gen') },
        { id: 'video', label: t('toolsCard.video'), icon: Video, color: 'text-rose-500', bgColor: 'bg-rose-500/10', action: () => onOpenCreation('video-gen') },
        { id: 'avatar', label: 'AI Avatar', icon: User, color: 'text-cyan-500', bgColor: 'bg-cyan-500/10', action: () => onOpenCreation('avatar-gen') },
        { id: 'banana', label: t('toolsCard.nanoBanana'), icon: Zap, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10', special: true, action: () => onOpenCreation('image-gen', '', 'nano_banana_pro') },
        { id: 'kling', label: 'Kling 2.6\nMotion', icon: Wind, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', action: () => onOpenCreation('video-gen', '', 'kling_motion_control') },
        { id: 'audio', label: t('toolsCard.audio'), icon: Music, color: 'text-blue-500', bgColor: 'bg-blue-500/10', action: () => onOpenCreation('audio-gen') },
        { id: 'animate', label: t('toolsCard.animate'), icon: Wand2, color: 'text-purple-500', bgColor: 'bg-purple-500/10', action: () => onOpenCreation('animate-photo') },
        { id: 'veo', label: 'Veo 3', icon: Layers, color: 'text-orange-500', bgColor: 'bg-orange-500/10', action: () => onOpenCreation('video-gen', '', 'veo_3') },
        { id: 'sora', label: t('toolsCard.sora'), icon: Cloud, color: 'text-sky-500', bgColor: 'bg-sky-500/10', action: () => onOpenCreation('video-gen', '', 'sora_2_pro_storyboard') },
        { id: 'tools', label: t('toolsCard.tools'), icon: PenTool, color: 'text-slate-500', bgColor: 'bg-slate-500/10', action: () => onOpenCreation('tools') },
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

            {/* --- TOOLS CAROUSEL (Premium Glassy) --- */}
            <section>
                <div className="px-6 mb-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Создать</h2>
                    <button className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors" onClick={() => onOpenCreation('Quick Gen')}>Все</button>
                </div>

                <div className="w-full">
                    <div className="flex overflow-x-auto px-6 gap-3 pb-4 no-scrollbar snap-x snap-mandatory">
                        {tools.map((tool) => (
                            <button
                                key={tool.id}
                                onClick={tool.action}
                                className="flex flex-col items-center gap-2 min-w-[76px] snap-start group"
                            >
                                {/* Glassy Icon Container */}
                                <div className={`w-[76px] h-[76px] rounded-[1.8rem] bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center group-active:scale-95 transition-all duration-300 relative overflow-hidden shadow-lg shadow-black/5`}>
                                    {/* Inner Color Glow */}
                                    <div className={`absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity bg-current ${tool.color}`} />

                                    {/* Icon */}
                                    <tool.icon
                                        size={30}
                                        strokeWidth={2}
                                        className={`${tool.color} drop-shadow-lg transition-transform group-hover:scale-110 duration-300`}
                                    />
                                </div>
                                {/* Label */}
                                <span className="text-[10px] font-semibold text-slate-600 dark:text-white/60 text-center leading-tight whitespace-pre-line group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                    {tool.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- SEARCH & CATEGORIES (Glassy) --- */}
            <section className="space-y-6">
                {/* Search */}
                <div className="px-6 relative">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-full flex items-center justify-center pointer-events-none">
                        <Search className="text-slate-400 dark:text-white/30" size={18} />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Поиск идей..."
                        className="w-full h-12 pl-12 pr-4 bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-medium placeholder:text-slate-400 dark:placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50 focus:bg-white/80 dark:focus:bg-white/10 transition-all shadow-sm"
                    />
                </div>

                {/* Glassy Categories */}
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
                            className={`px-5 py-2.5 rounded-[1rem] text-xs font-bold whitespace-nowrap transition-all duration-300 border backdrop-blur-md ${activeCategory === cat.id
                                    ? 'bg-slate-900 text-white dark:bg-white dark:text-black border-transparent shadow-lg shadow-black/10 scale-105'
                                    : 'bg-white/50 dark:bg-white/5 text-slate-600 dark:text-white/60 border-slate-200 dark:border-white/5 hover:bg-white dark:hover:bg-white/10'
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </section>

            {/* --- DISCOVER (Premium Masonry) --- */}
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
                    <p className="text-slate-500 dark:text-white/40 text-sm font-medium">
                        {activeCategory === 'all' ? 'Популярные шаблоны' :
                            activeCategory === 'dances' ? 'Сгенерируй трендовые танцевальные видео!' :
                                activeCategory === 'trends' ? 'Самые популярные шаблоны этой недели' :
                                    'Тематические подборки'}
                    </p>
                </div>

                {/* MASONRY LAYOUT */}
                <div className="columns-2 gap-3 space-y-3 px-4">
                    {(isFeedLoading || isTemplatesLoading) && feedItems.length === 0 ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="break-inside-avoid relative rounded-[1.5rem] overflow-hidden bg-white/5 border border-white/5 animate-pulse">
                                <div style={{ aspectRatio: i % 2 === 0 ? '3/4' : '1/1' }} className="w-full bg-white/5" />
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
                            transition={{ delay: i * 0.05 }}
                            className="break-inside-avoid relative group rounded-[1.5rem] overflow-hidden bg-slate-900 cursor-pointer border border-white/10 shadow-lg shadow-black/20"
                            onClick={() => item.type === 'template' && onOpenTemplate(item)}
                        >
                            <div style={{ aspectRatio: item.type === 'template' ? '3/4' : '1/1' }} className="relative">
                                {item.type === 'template' ? (
                                    item.mediaType === 'image' ? (
                                        <OptimizedImage
                                            src={item.src}
                                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-105 transition-transform"
                                            alt={item.title}
                                        />
                                    ) : (
                                        <video
                                            src={item.src.includes('#') ? item.src : `${item.src}#t=0.1`}
                                            poster={item.thumbnail_url || item.image_url || item.cover_url}
                                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500 bg-black group-hover:scale-105 transition-transform"
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
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                                        alt={item.title || "Inspiration"}
                                    />
                                )}

                                {/* Premium Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 pointer-events-none" />
                            </div>

                            {/* Top Left: User Avatar or Type Icon */}
                            <div className="absolute top-3 left-3 z-30">
                                {item.type === 'template' ? (
                                    <div className="text-white/80 bg-black/30 backdrop-blur-md rounded-full p-1.5 border border-white/10">
                                        {item.mediaType === 'video' ? <Video size={12} fill="currentColor" className="opacity-90" /> : <ImageIcon size={12} className="opacity-90" />}
                                    </div>
                                ) : (
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/user/${item.user_id}`);
                                        }}
                                        className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md border border-white/10 pr-2 rounded-full p-0.5 hover:bg-black/60 transition-colors"
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
                                        <span className="text-[10px] font-bold text-white/90 max-w-[60px] truncate">
                                            @{item.username || 'User'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Top Right Category Badge */}
                            <div className="absolute top-3 right-3 z-30">
                                {item.category && item.category !== 'all' && (
                                    <span className={`backdrop-blur-xl border border-white/10 text-white text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm ${item.category === 'love' ? 'bg-pink-500/80' : 'bg-black/40' // Special pink badge for Love
                                        }`}>
                                        {item.categories?.[0] || item.category}
                                    </span>
                                )}
                            </div>

                            {/* Bottom Content */}
                            <div className="absolute bottom-4 left-3 right-3 z-20 flex justify-between items-end gap-2">
                                <h4 className="text-white/90 font-bold text-[13px] leading-tight flex-1 line-clamp-2 drop-shadow-sm">
                                    {item.title || item.prompt}
                                </h4>

                                <div onClick={(e) => e.stopPropagation()} className="scale-90 origin-bottom-right">
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
