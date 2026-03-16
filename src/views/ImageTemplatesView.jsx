import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, Sparkles, Heart, Star, Smile, Zap, Music, Box, Banana, Camera } from 'lucide-react';
import OptimizedImage from '../components/ui/OptimizedImage';
import LikeButton from '../components/ui/LikeButton';
import { useTemplates, useUserLikedIds } from '../hooks/useGallery';
import { useUser } from '../context/UserContext';

const CATEGORIES = [
    { id: 'all', label: 'Все', icon: Sparkles },
    { id: '14feb', label: 'Love', icon: Heart },
    { id: 'trends', label: 'Тренды', icon: Zap },
    { id: 'oldTrends', label: 'Ретро', icon: Camera },
    { id: 'pets', label: 'Pets', icon: Banana },
    { id: 'cars', label: 'Авто', icon: Box },
];

const SAMPLE_TEMPLATES = [
    { id: 't1', title: 'Cyberpunk Neon City', src: 'https://cdn.midjourney.com/5c960c18-9752-4740-9830-80252b4142d7/0_0.png', category: 'trends', likes_count: 1240 },
    { id: 't2', title: 'Professional Studio Portrait', src: 'https://cdn.midjourney.com/3d656834-8094-4422-9444-245c3619211c/0_0.png', category: 'all', likes_count: 850 },
    { id: 't3', title: 'Abstract 3D Shape', src: 'https://cdn.midjourney.com/97828062-8411-4648-968b-592d3348633e/0_0.png', category: 'trends', likes_count: 2100 },
    { id: 't4', title: 'Valentine Heart Balloon', src: 'https://cdn.midjourney.com/74384144-8848-4389-8064-074900139174/0_0.png', category: '14feb', likes_count: 5300 },
    { id: 't5', title: 'Cute Cat in Space Suit', src: 'https://cdn.midjourney.com/b8004169-2b73-45cb-866d-176375001362/0_0.png', category: 'pets', likes_count: 1420 },
    { id: 't6', title: 'Retro Vaporwave Car', src: 'https://cdn.midjourney.com/39322301-447e-40e1-9556-9472314a589e/0_0.png', category: 'cars', likes_count: 980 },
    { id: 't7', title: 'Golden Luxury Texture', src: 'https://cdn.midjourney.com/15294022-3868-450f-a63e-001007872658/0_0.png', category: 'trends', likes_count: 760 },
    { id: 't8', title: 'Pastel Dream Cloud', src: 'https://cdn.midjourney.com/83906323-2895-468e-99f2-01990424602f/0_0.png', category: 'oldTrends', likes_count: 1150 },
];

const ImageTemplatesView = ({ onOpenTemplate }) => {
    const navigate = useNavigate();
    const { user } = useUser();
    const { data: templates, isLoading } = useTemplates();
    const { data: likedIds } = useUserLikedIds(user?.id);

    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredItems, setFilteredItems] = useState([]);

    useEffect(() => {
        // Merge API templates with SAMPLES or just use SAMPLES if API empty
        const allItems = (templates && templates.length > 0) ? templates : SAMPLE_TEMPLATES;

        setFilteredItems(allItems.filter(item => {
            const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
            const matchesSearch = (item.title || '').toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        }));
    }, [templates, activeCategory, searchQuery]);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="min-h-screen bg-[#F0F2F8] dark:bg-[#0f1014] pb-24 font-sans"
        >
            {/* Background Gradients (Aurora Effect) */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[60%] bg-blue-300/60 dark:bg-blue-900/20 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen" />
                <div className="absolute top-[20%] right-[-20%] w-[70%] h-[70%] bg-purple-300/60 dark:bg-purple-900/20 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen" />
            </div>

            {/* Header */}
            <div className="sticky top-0 z-40 px-5 pt-6 pb-4 bg-[#F0F2F8]/80 dark:bg-[#0f1014]/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5">
                <div className="flex items-center gap-4 mb-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-full bg-white dark:bg-white/10 flex items-center justify-center shadow-sm text-stone-600 dark:text-white"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-2xl font-[900] text-stone-800 dark:text-white tracking-tight leading-none">
                        Шаблоны
                    </h1>
                </div>

                {/* Search */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-stone-400">
                        <Search size={18} strokeWidth={2.5} />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Найти стиль..."
                        className="w-full h-11 pl-11 pr-4 bg-white dark:bg-white/5 rounded-[18px] shadow-sm border border-stone-100 dark:border-white/10 text-stone-800 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                </div>
            </div>

            {/* Categories */}
            <div className="relative z-10 px-5 pt-4 pb-2">
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-card text-xs font-[800] whitespace-nowrap transition-all duration-300 border ${activeCategory === cat.id
                                ? 'bg-stone-800 text-white border-transparent shadow-lg scale-105'
                                : 'bg-white dark:bg-white/5 text-stone-500 dark:text-stone-400 border-stone-100 dark:border-white/10'
                                }`}
                        >
                            {cat.icon && <cat.icon size={12} strokeWidth={3} className={activeCategory === cat.id ? 'text-amber-400' : 'opacity-50'} />}
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="relative z-10 px-4 pb-20">
                <div className="columns-2 gap-3 space-y-3">
                    {isLoading ? (
                        Array.from({ length: 6 }).map((_unused, i) => (
                            <div key={i} className="break-inside-avoid relative rounded-card overflow-hidden bg-white dark:bg-white/5 h-48 animate-pulse" />
                        ))
                    ) : filteredItems.length > 0 ? (
                        filteredItems.map((item, i) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{
                                    delay: i * 0.1,
                                    type: "spring",
                                    stiffness: 100,
                                    damping: 20
                                }}
                                className="break-inside-avoid relative group rounded-card overflow-hidden bg-stone-900 cursor-pointer shadow-md mb-3"
                                onClick={() => onOpenTemplate && onOpenTemplate(item)}
                            >
                                <div className="relative aspect-[3/4] bg-stone-800">
                                    <OptimizedImage
                                        src={item.src || item.image_url}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ease-out"
                                        alt={item.title}
                                    />
                                    {/* Glassy Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

                                    <div className="absolute bottom-3 left-3 right-3 text-white">
                                        <motion.h3
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.2 + (i * 0.1) }}
                                            className="font-bold text-[13px] leading-tight mb-2 line-clamp-2 drop-shadow-md"
                                        >
                                            {item.title}
                                        </motion.h3>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 opacity-80">
                                                <div className="w-5 h-5 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-[9px] font-bold">
                                                    AI
                                                </div>
                                                <span className="text-[10px] font-medium">Bazzar</span>
                                            </div>

                                            <div onClick={(e) => e.stopPropagation()}>
                                                <LikeButton
                                                    creationId={item.id}
                                                    initialCount={item.likes_count || Math.floor(Math.random() * 500)}
                                                    initialLiked={likedIds?.includes(item.id)}
                                                    size="tiny"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-2 text-center py-20 text-stone-400 font-bold text-sm">
                            Ничего не найдено 😔
                        </div>
                    )}
                </div>
            </div>

        </motion.div>
    );
};

export default ImageTemplatesView;
