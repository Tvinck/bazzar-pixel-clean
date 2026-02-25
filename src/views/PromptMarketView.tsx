import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Sparkles, ChevronLeft, Zap,
    Image as ImageIcon, Camera, Palette, Box, Film, Tv
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSound } from '../context/SoundContext';
import { useToast } from '../context/ToastContext';

interface PromptItem {
    id: string;
    title_ru: string;
    title_en?: string;
    description_ru?: string;
    description_en?: string;
    prompt: string;
    preview_url?: string;
    category: string;
    is_featured?: boolean;
    usage_count?: number;
}

const CATEGORIES = [
    { id: 'all', label: 'gallery.all', icon: <Sparkles size={16} /> },
    { id: 'photo', label: 'categories.photo', icon: <Camera size={16} /> },
    { id: 'art', label: 'categories.art', icon: <Palette size={16} /> },
    { id: '3d', label: 'categories.threeD', icon: <Box size={16} /> },
    { id: 'anime', label: 'categories.anime', icon: <Tv size={16} /> },
    { id: 'cinematic', label: 'categories.cinematic', icon: <Film size={16} /> },
];

const PromptCard = ({ item, onSelect }: { item: PromptItem, onSelect: (item: PromptItem) => void }) => {
    const { lang, t } = useLanguage();
    const title = lang === 'ru' ? item.title_ru : (item.title_en || item.title_ru);
    const description = lang === 'ru' ? item.description_ru : (item.description_en || item.description_ru);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1c1c1e] rounded-[16px] overflow-hidden border border-white/5 flex flex-col group active:scale-[0.98] transition-transform"
        >
            <div className="aspect-square relative overflow-hidden bg-[#2c2c2e]">
                {item.preview_url ? (
                    <img
                        src={item.preview_url}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <ImageIcon size={40} />
                    </div>
                )}
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1">
                    <Zap size={10} className="fill-[#ffcc00] text-[#ffcc00]" />
                    <span className="text-[11px] font-bold text-white">{item.usage_count || 0}</span>
                </div>
                {item.is_featured && (
                    <div className="absolute top-2 left-2 bg-[#007aff] px-2 py-1 rounded-full">
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Top</span>
                    </div>
                )}
            </div>

            <div className="p-3 flex flex-col flex-1">
                <h3 className="text-[15px] font-bold text-white leading-tight mb-1 truncate">{title}</h3>
                <p className="text-[12px] text-gray-400 line-clamp-2 mb-3 h-8 leading-normal">{description || 'Best settings for professional results'}</p>

                <button
                    onClick={() => onSelect(item)}
                    className="mt-auto w-full bg-[#2c2c2e] hover:bg-[#3a3a3c] text-white text-[13px] font-semibold py-2 rounded-[10px] transition-colors flex items-center justify-center gap-1.5"
                >
                    <Sparkles size={14} className="text-[#007aff]" />
                    {t('creation.usePrompt')}
                </button>
            </div>
        </motion.div>
    );
};

const PromptMarketView = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { playClick, playSuccess } = useSound();

    const [prompts, setPrompts] = useState<PromptItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');

    useEffect(() => {
        fetchPrompts();
    }, [activeCategory]);

    const fetchPrompts = async () => {
        try {
            setLoading(true);
            const url = activeCategory === 'all'
                ? '/api/generation/marketplace'
                : `/api/generation/marketplace?category=${activeCategory}`;

            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setPrompts(data || []);
            }
        } catch (e) {
            console.error('Marketplace fetch error', e);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPrompt = async (item: PromptItem) => {
        playSuccess();
        try {
            // Track usage (fire & forget)
            fetch(`/api/generation/marketplace/${item.id}/track`, { method: 'POST' });

            // Navigate to generator with pre-filled prompt
            navigate('/generate', {
                state: {
                    prompt: item.prompt,
                    model: item.category === 'video' ? 'sora_2' : 'nano_banana'
                }
            });
        } catch (e) {
            console.error('Tracking error', e);
        }
    };

    const filteredPrompts = prompts.filter(p => {
        const query = searchQuery.toLowerCase();
        return (p.title_ru?.toLowerCase().includes(query) ||
            p.title_en?.toLowerCase().includes(query) ||
            p.prompt?.toLowerCase().includes(query));
    });

    return (
        <div className="min-h-screen bg-black text-white flex flex-col pb-20 md:max-w-5xl md:mx-auto">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-black/95 backdrop-blur-xl pt-[calc(env(safe-area-inset-top)+10px)] px-4 pb-3 border-b border-white/5">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center -ml-2 active:opacity-60">
                        <ChevronLeft size={28} className="text-[#007aff]" />
                    </button>
                    <h1 className="text-[17px] font-bold tracking-tight text-center flex-1 mr-8">
                        {t('creation.marketplaceTitle')}
                    </h1>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder={t('creation.searchPrompts')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#1c1c1e] rounded-[12px] py-2.5 pl-10 pr-4 text-[15px] outline-none focus:ring-1 focus:ring-[#007aff]/30 transition-shadow"
                    />
                </div>
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 py-4">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => { setActiveCategory(cat.id); playClick(); }}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap transition-all
                            ${activeCategory === cat.id
                                ? 'bg-[#007aff] text-white'
                                : 'bg-[#1c1c1e] text-[#8e8e93] active:scale-95'
                            }`}
                    >
                        {cat.icon}
                        {t(cat.label)}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 px-4">
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[1, 2, 4, 5].map(i => (
                            <div key={i} className="aspect-[3/4] bg-[#1c1c1e] rounded-[16px] animate-pulse" />
                        ))}
                    </div>
                ) : filteredPrompts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <AnimatePresence mode="popLayout">
                            {filteredPrompts.map(item => (
                                <PromptCard
                                    key={item.id}
                                    item={item}
                                    onSelect={handleSelectPrompt}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 bg-[#1c1c1e] rounded-full flex items-center justify-center text-gray-600 mb-4">
                            <Search size={32} />
                        </div>
                        <h3 className="text-[17px] font-semibold text-white mb-1">{t('gallery.nothingFound')}</h3>
                        <p className="text-[14px] text-gray-500">{t('gallery.emptyDesc')}</p>
                    </div>
                )}
            </div>

            {/* Featured Banner at Bottom */}
            {!loading && filteredPrompts.length > 0 && (
                <div className="px-4 mt-8 mb-4">
                    <div className="bg-gradient-to-br from-[#007aff]/20 to-purple-600/20 border border-[#007aff]/20 rounded-[16px] p-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#007aff] rounded-[12px] flex items-center justify-center shadow-lg shadow-[#007aff]/30">
                            <Sparkles className="text-white fill-current" size={24} />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-[15px] font-bold text-white mb-0.5">{t('creation.marketplaceTitle')}</h4>
                            <p className="text-[12px] text-gray-400 leading-tight">{t('creation.marketplaceSubtitle')}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PromptMarketView;
