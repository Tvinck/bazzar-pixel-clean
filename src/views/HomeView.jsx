import React, { useState, useEffect } from 'react';
import { ListRow, Block } from '../components/ui';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Image as ImageIcon, Video, Send, User as UserIcon,
    Zap, Smile, ChevronRight, X, Search, Heart, Share, Plus, Sparkles, Star, Maximize2, Trophy
} from 'lucide-react';
import { usePublicCreations, useTemplates } from '../hooks/useGallery';
import SEO from '../components/SEO/SEO';
import { useUser } from '../context/UserContext';
import { templatesData } from '../data/templates';
import { SpringCounter } from '../components/SpringAnimations';
import { SkeletonListRow, SkeletonCard, SkeletonImageCard } from '../components/ui/Skeleton';
import AnimatedIcon from '../components/ui/AnimatedIcon';
import { useLanguage } from '../context/LanguageContext';
import { useABTest } from '../hooks/useABTest';
import { useMarketing } from '../hooks/useMarketing';
import { EXPERTS } from '../config/experts';

import { getCDNUrl } from '../hooks/useCDN';
const triggerHaptic = (style = 'light') => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
    }
};




const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.08 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 25 } }
};

const HomeView = ({ onLoadComplete, onOpenCreation, onOpenTemplate, onOpenPayment }) => {
    const navigate = useNavigate();
    const { user, stats } = useUser();
    const { t } = useLanguage();
    const { variant } = useABTest('home_hero_text');
    const { trackFunnel } = useMarketing(user);

    const { isLoading: isFeedLoading } = usePublicCreations({ sortBy: 'trending', limit: 10 });
    const { data: templates, isLoading: isTemplatesLoading } = useTemplates();
    const [searchQuery, setSearchQuery] = useState('');

    const experts = EXPERTS.slice(0, 5); // Show fewer experts on home initially to keep it clean
    const finalTemplates = templates?.length > 0 ? templates : (templatesData || []).slice(0, 10);

    useEffect(() => {
        if (!isFeedLoading && !isTemplatesLoading) {
            onLoadComplete && onLoadComplete();
            trackFunnel('onboarding', 'landing');
        }
    }, [isFeedLoading, isTemplatesLoading, onLoadComplete, trackFunnel]);

    const handleSearch = () => {
        if (searchQuery.trim()) {
            triggerHaptic('light');
            navigate('/chat/private', { state: { initialMessage: searchQuery.trim() } });
        }
    };

    return (
        <div className="min-h-screen bg-black text-white pb-24 relative overflow-y-auto overflow-x-hidden font-sans w-full selection:bg-accent-blue/30">
            <SEO 
                title="Bazzar Pixel — AI генерация"
                description="Создавай уникальный контент с помощью нейросетей"
            />

            {/* Premium Animated Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-[#3390ec]/5 to-transparent" />
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                        x: [0, 50, 0],
                        y: [0, 30, 0]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-accent-blue/10 blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.2, 0.4, 0.2],
                        x: [0, -40, 0],
                        y: [0, -50, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute top-[20%] -right-[20%] w-[60vw] h-[60vw] rounded-full bg-accent-purple/10 blur-[100px]"
                />
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="px-4 pt-2 max-w-5xl mx-auto flex flex-col gap-6 mt-4 relative z-10"
            >

                {/* header */}
                <motion.div variants={itemVariants} className="flex justify-between items-center px-1 mb-2">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => { triggerHaptic('light'); navigate('/profile'); }}
                            className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3390ec] to-blue-600 flex items-center justify-center text-white font-bold text-lg active:opacity-80 transition-opacity flex-shrink-0 shadow-sm"
                        >
                            {user?.first_name ? user.first_name.charAt(0).toUpperCase() : 'U'}
                        </button>
                        <div className="flex flex-col">
                            <span className="text-[13px] text-gray-400 font-medium leading-tight">{t('home.welcome')}</span>
                            <span className="text-[18px] font-bold text-white leading-tight tracking-[-0.01em]">{user?.first_name || t('profile.notSpecified')}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => { triggerHaptic('light'); onOpenPayment && onOpenPayment(); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-bg-secondary border border-white/10 shadow-sm active:bg-bg-elevated transition-colors"
                    >
                        <Zap size={14} className="text-[#3390ec] fill-current" />
                        <span className="text-white font-semibold text-[15px] tracking-tight">
                            <SpringCounter value={stats?.current_balance || 0} />
                        </span>
                    </button>
                </motion.div>

                {/* Search Bar matching iOS / Telegram style */}
                <motion.div variants={itemVariants} className="relative group flex items-center w-full">
                    <Search className="absolute left-3 text-gray-500 z-10" size={18} />
                    <input
                        type="text"
                        placeholder={t('home.searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="w-full bg-bg-secondary rounded-input pl-10 pr-12 py-2 text-[17px] text-white placeholder:text-gray-500 outline-none focus:ring-1 focus:ring-[#007aff] transition-shadow tracking-[-0.41px]"
                    />
                    {searchQuery ? (
                        <button
                            onClick={handleSearch}
                            className="absolute right-2 w-7 h-7 bg-accent-blue rounded-full flex items-center justify-center text-white active:scale-95 transition-transform z-10"
                        >
                            <Send size={12} className="translate-x-[1px]" />
                        </button>
                    ) : null}
                </motion.div>

                {/* Main Promoted Action */}
                <motion.button
                    variants={itemVariants}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { triggerHaptic('medium'); navigate('/guide'); }}
                    className="w-full bg-gradient-to-r from-blue-600 via-[#3390ec] to-blue-500 rounded-card p-5 relative overflow-hidden shadow-[0_8px_30px_rgba(51,144,236,0.25)] flex items-center justify-between group"
                >
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
                    <div className="relative z-10 text-left">
                        <h3 className="text-[19px] font-bold text-white mb-1 tracking-[-0.02em] leading-tight shadow-sm">
                            {variant === 'variant_a' ? "Unlock Your Creative Potential" : t('home.guideTitle')}
                        </h3>
                        <p className="text-[13px] text-blue-50 font-medium opacity-90">{t('home.guideDesc')}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-white/25 flex items-center justify-center flex-shrink-0 backdrop-blur-md shadow-inner border border-white/20">
                        <AnimatedIcon icon={Zap} size={24} className="text-white fill-white drop-shadow-md" disableHover disableTap />
                    </div>
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-2xl pointer-events-none" />
                </motion.button>

                {/* Challenges Section Banner */}
                <motion.div
                    variants={itemVariants}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { triggerHaptic('medium'); navigate('/challenges'); }}
                    className="w-full bg-gradient-to-br from-[#1c1c1e] to-[#252529] border border-blue-500/20 rounded-[24px] p-5 flex items-center gap-4 relative overflow-hidden group shadow-xl active:border-blue-500/40 transition-colors"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/20 transition-colors" />

                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 rotate-3 group-hover:rotate-0 transition-transform">
                        <Trophy size={28} className="text-white drop-shadow-md" />
                    </div>

                    <div className="flex-1 text-left relative z-10">
                        <div className="flex items-center gap-2 mb-0.5">
                            <h4 className="text-[17px] font-black text-white tracking-tight">{t('challenges.title')}</h4>
                            <div className="bg-red-500/90 px-1.5 py-0.5 rounded-md text-[9px] font-black text-white uppercase tracking-tighter shadow-sm animate-pulse">Live</div>
                        </div>
                        <p className="text-[13px] text-gray-400 font-medium leading-tight">
                            {t('challenges.joinDescription').split(' ').slice(0, 5).join(' ')}...
                        </p>
                        <div className="flex items-center gap-1.5 mt-2">
                            <span className="text-[11px] font-bold text-blue-400">Награда: 500 ⚡</span>
                            <div className="w-1 h-1 bg-white/20 rounded-full" />
                            <span className="text-[11px] font-bold text-white/40">2д 14ч</span>
                        </div>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors mr-1">
                        <ChevronRight size={18} className="text-white/30 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </div>
                </motion.div>

                {/* Action Blocks (Grid) */}
                <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <motion.button
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(44, 44, 46, 0.8)" }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => { triggerHaptic('medium'); onOpenCreation('image-gen'); }}
                        className="bg-bg-secondary/90 border border-white/5 backdrop-blur-md shadow-lg rounded-[18px] p-3.5 flex flex-col gap-2 items-start transition-all relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-[#3390ec]/0 to-[#3390ec]/0 group-hover:from-[#3390ec]/10 group-hover:to-transparent transition-all duration-500" />
                        <div className="w-10 h-10 rounded-input bg-accent-blue/20 flex items-center justify-center text-[#3390ec] shadow-inner relative z-10">
                            <ImageIcon size={22} className="drop-shadow-sm" />
                        </div>
                        <div className="text-left w-full mt-1 relative z-10">
                            <div className="text-[15px] font-bold text-white tracking-tight leading-tight">{t('creation.image')}</div>
                            <div className="text-[11px] text-gray-500 font-medium leading-tight mt-1">{t('home.art')}</div>
                        </div>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(44, 44, 46, 0.8)" }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => { triggerHaptic('medium'); onOpenCreation('video-gen'); }}
                        className="bg-bg-secondary/90 border border-white/5 backdrop-blur-md shadow-lg rounded-[18px] p-3.5 flex flex-col gap-2 items-start transition-all relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/10 group-hover:to-transparent transition-all duration-500" />
                        <div className="w-10 h-10 rounded-input bg-accent-purple/20 flex items-center justify-center text-purple-400 shadow-inner relative z-10">
                            <Video size={22} className="drop-shadow-sm" />
                        </div>
                        <div className="text-left w-full mt-1 relative z-10">
                            <div className="text-[15px] font-bold text-white tracking-tight leading-tight">{t('creation.video')}</div>
                            <div className="text-[11px] text-gray-500 font-medium leading-tight mt-1">{t('home.animatePhoto')}</div>
                        </div>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(44, 44, 46, 0.8)" }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => { triggerHaptic('light'); navigate('/stickers'); }}
                        className="bg-bg-secondary/90 border border-white/5 backdrop-blur-md shadow-lg rounded-[18px] p-3.5 flex flex-col gap-2 items-start transition-all relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/0 to-yellow-500/0 group-hover:from-yellow-500/10 group-hover:to-transparent transition-all duration-500" />
                        <div className="w-10 h-10 rounded-input bg-yellow-500/20 flex items-center justify-center text-yellow-400 shadow-inner relative z-10">
                            <Smile size={22} className="drop-shadow-sm" />
                        </div>
                        <div className="text-left w-full mt-1 relative z-10">
                            <div className="text-[15px] font-bold text-white tracking-tight leading-tight">{t('home.stickers')}</div>
                            <div className="text-[11px] text-gray-500 font-medium leading-tight mt-1">{t('home.inTelegram')}</div>
                        </div>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(44, 44, 46, 0.8)" }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => { triggerHaptic('light'); onOpenPayment && onOpenPayment(); }}
                        className="bg-bg-secondary/90 border border-white/5 backdrop-blur-md shadow-lg rounded-[18px] p-3.5 flex flex-col gap-2 items-start transition-all relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-green-500/0 group-hover:from-green-500/10 group-hover:to-transparent transition-all duration-500" />
                        <div className="w-10 h-10 rounded-input bg-green-500/20 flex items-center justify-center text-green-400 shadow-inner relative z-10">
                            <Zap size={22} className="fill-current drop-shadow-sm" />
                        </div>
                        <div className="text-left w-full mt-1 relative z-10">
                            <div className="text-[15px] font-bold text-white tracking-tight leading-tight">{t('home.recharge')}</div>
                            <div className="text-[11px] text-gray-500 font-medium leading-tight mt-1">{t('home.buyTokens')}</div>
                        </div>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(44, 44, 46, 0.8)" }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => { triggerHaptic('medium'); navigate('/greetings'); }}
                        className="bg-bg-secondary/90 border border-white/5 backdrop-blur-md shadow-lg rounded-[18px] p-3.5 flex flex-col gap-2 items-start transition-all relative overflow-hidden group"
                    >
                        <div className="absolute top-2 right-2 bg-gradient-to-r from-orange-400 to-red-500 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white uppercase tracking-wider shadow-sm">New</div>
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-500/0 group-hover:from-orange-500/10 group-hover:to-transparent transition-all duration-500" />
                        <div className="w-10 h-10 rounded-input bg-orange-500/20 flex items-center justify-center text-orange-400 shadow-inner relative z-10">
                            <Star size={22} className="fill-current drop-shadow-sm" />
                        </div>
                        <div className="text-left w-full mt-1 relative z-10">
                            <div className="text-[15px] font-bold text-white tracking-tight leading-tight">Поздравления</div>
                            <div className="text-[11px] text-gray-500 font-medium leading-tight mt-1">Видео от звёзд</div>
                        </div>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(44, 44, 46, 0.8)" }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => { triggerHaptic('light'); navigate('/history'); }}
                        className="bg-bg-secondary/90 border border-white/5 backdrop-blur-md shadow-lg rounded-[18px] p-3.5 flex flex-col gap-2 items-start transition-all relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-indigo-500/0 group-hover:from-indigo-500/10 group-hover:to-transparent transition-all duration-500" />
                        <div className="w-10 h-10 rounded-input bg-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner relative z-10">
                            <Maximize2 size={22} className="drop-shadow-sm" />
                        </div>
                        <div className="text-left w-full mt-1 relative z-10">
                            <div className="text-[15px] font-bold text-white tracking-tight leading-tight">Upscale HD</div>
                            <div className="text-[11px] text-gray-500 font-medium leading-tight mt-1">Улучшить качество</div>
                        </div>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => { triggerHaptic('medium'); navigate('/marketplace'); }}
                        className="bg-gradient-to-br from-[#1c1c1e] to-[#242c38] border border-[#3390ec]/30 shadow-[0_4px_20px_rgba(51,144,236,0.1)] rounded-[18px] p-4 flex flex-col gap-2 items-start transition-all col-span-2 group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-accent-blue/0 group-hover:bg-accent-blue/5 transition-colors duration-300" />
                        <div className="flex items-center justify-between w-full relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-input bg-accent-blue/20 flex items-center justify-center text-[#3390ec] shadow-inner">
                                    <Sparkles size={22} className="fill-current drop-shadow-md" />
                                </div>
                                <div className="text-left">
                                    <div className="text-[16px] font-bold text-white tracking-tight leading-tight drop-shadow-sm">{t('categories.promptMarket')}</div>
                                    <div className="text-[12px] text-blue-200/70 font-medium leading-tight mt-0.5">{t('creation.marketplaceSubtitle')}</div>
                                </div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                <ChevronRight size={18} className="text-white" />
                            </div>
                        </div>
                    </motion.button>
                </motion.div>

                {/* Templates Horizontal Scroll */}
                <motion.div variants={itemVariants} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between px-1">
                        <span className="text-[17px] font-bold text-white tracking-tight">{t('home.templates')}</span>
                        <button onClick={() => navigate('/gallery')} className="text-[14px] text-[#3390ec] font-bold active:opacity-70 flex items-center gap-0.5">
                            {t('home.seeAll')} <ChevronRight size={16} />
                        </button>
                    </div>
                    <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x pb-2 -mx-4 px-4 w-[calc(100%+2rem)] px-5">
                        {(isTemplatesLoading ? Array(5).fill({}) : finalTemplates?.slice(0, 10))?.map((item, i) => (
                            isTemplatesLoading ? (
                                <div key={`skeleton-${i}`} className="min-w-[120px] w-[120px] snap-start flex-shrink-0">
                                    <SkeletonImageCard />
                                </div>
                            ) : (
                                <motion.div
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.95 }}
                                    key={item.id || i}
                                    className="min-w-[120px] w-[120px] aspect-[4/5] rounded-[18px] overflow-hidden relative bg-bg-elevated snap-start cursor-pointer flex-shrink-0 shadow-lg border border-white/5"
                                    onClick={() => { triggerHaptic('medium'); item.id && onOpenTemplate(item); }}
                                >
                                    {item.src && (
                                        <img src={getCDNUrl(item.src)} loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" alt="" />
                                    )}
                                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
                                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex flex-col gap-0.5">
                                        <p className="text-[12px] font-bold text-white leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] line-clamp-2">
                                            {item.title || t('home.templates').slice(0, -1)}
                                        </p>
                                    </div>
                                    {item.isNew && (
                                        <div className="absolute top-2 right-2 bg-gradient-to-r from-green-400 to-green-600 px-1.5 py-0.5 rounded-[6px] text-[8px] font-bold text-white tracking-widest uppercase shadow-md">
                                            New
                                        </div>
                                    )}
                                </motion.div>
                            )
                        ))}
                    </div>
                </motion.div>

                {/* Services List Block */}
                <motion.div variants={itemVariants} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between px-1">
                        <span className="text-[17px] font-bold text-white tracking-tight">{t('home.services')}</span>
                    </div>
                    <Block>
                        <ListRow
                            icon={<span className="text-[18px]">🔒</span>}
                            iconColor="bg-gray-500/20"
                            label={t('home.privateMode')}
                            subtext={t('home.privateModeDesc')}
                            onClick={() => { triggerHaptic('light'); navigate('/chat/private'); }}
                        />
                        <ListRow
                            icon={<span className="text-[18px]">🤔</span>}
                            iconColor="bg-blue-500/20"
                            label={t('home.quiz')}
                            subtext={t('home.quizDesc')}
                            onClick={() => { triggerHaptic('light'); navigate('/onboarding'); }}
                        />
                        <ListRow
                            icon={<span className="text-[18px]">⭐</span>}
                            iconColor="bg-yellow-500/20"
                            label={t('home.forCreators')}
                            subtext={t('home.forCreatorsDesc')}
                            onClick={() => { triggerHaptic('light'); navigate('/chat/creator'); }}
                            isLast
                        />
                    </Block>
                </motion.div>

                {/* Experts List Block */}
                <motion.div variants={itemVariants} className="flex flex-col gap-2 mb-6">
                    <div className="flex items-center justify-between px-1">
                        <span className="text-[17px] font-bold text-white tracking-tight">{t('home.experts')}</span>
                        <button onClick={() => navigate('/experts')} className="text-[14px] text-[#3390ec] font-bold active:opacity-70 flex items-center gap-0.5">
                            {t('home.seeAll')} <ChevronRight size={16} />
                        </button>
                    </div>
                    {isTemplatesLoading ? (
                        <div className="space-y-1">
                            {[1, 2, 3, 4].map(i => (
                                <SkeletonListRow key={i} />
                            ))}
                        </div>
                    ) : (
                        <Block>
                            {experts.map((expert, i) => (
                                <ListRow
                                    key={expert.id}
                                    icon={<span className="text-[18px]">{expert.emoji || expert.icon}</span>}
                                    iconColor="bg-white/5"
                                    label={expert.name}
                                    subtext={expert.desc}
                                    onClick={() => { triggerHaptic('light'); navigate(`/experts/${expert.id}`); }}
                                    isLast={i === experts.length - 1}
                                />
                            ))}
                        </Block>
                    )}
                </motion.div>

            </motion.div>
        </div>
    );
};

export default HomeView;
