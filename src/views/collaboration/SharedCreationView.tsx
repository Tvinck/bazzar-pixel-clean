import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ChevronLeft, Heart, Share2, Copy, Zap,
    MessageCircle, Sparkles, ArrowRight, ExternalLink
} from 'lucide-react';
// @ts-ignore
import galleryAPI from '../../lib/galleryAPI';
import { useLanguage } from '../../context/LanguageContext';
import { useSound } from '../../context/SoundContext';
import { useUser } from '../../context/UserContext';
import { useToast } from '../../context/ToastContext';
// @ts-ignore
import CommentsSection from '../../components/CommentsSection';

const SharedCreationView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { playClick, playSuccess } = useSound();
    const { user: currentUser } = useUser();
    const toaster = useToast() as any;

    const [creation, setCreation] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);
    const [similar, setSimilar] = useState<any[]>([]);

    useEffect(() => {
        const fetchCreation = async () => {
            if (!id) return;
            try {
                // Try to get via local API first for speed, fallback to direct supabase
                const res = await fetch(`/api/generation/public/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setCreation(data);
                } else {
                    const data = await galleryAPI.getCreation(id);
                    setCreation(data);
                }
            } catch (err) {
                console.error('Failed to load creation:', err);
                toaster.error(t('common.error'));
            } finally {
                setIsLoading(false);
            }
        };
        fetchCreation();
    }, [id]);

    useEffect(() => {
        const fetchSimilar = async () => {
            try {
                // In a real app, this would be a recommendation API based on tags/author
                const res = await galleryAPI.getPublicCreations({ limit: 6 });
                if (Array.isArray(res)) {
                    setSimilar(res.filter((c: any) => c.id !== id).slice(0, 4));
                }
            } catch (e) {
                console.error('Failed to load similar:', e);
            }
        };
        fetchSimilar();
    }, [id]);

    useEffect(() => {
        if (creation && currentUser) {
            galleryAPI.checkUserLiked(creation.id, currentUser.id)
                .then(setIsLiked);
        }
    }, [creation, currentUser]);

    const handleLike = async () => {
        if (!currentUser || !creation) return;
        playClick();
        const success = isLiked
            ? await galleryAPI.unlikeCreation(creation.id, currentUser.id)
            : await galleryAPI.likeCreation(creation.id, currentUser.id);

        if (success) {
            setIsLiked(!isLiked);
            setCreation((prev: any) => ({
                ...prev,
                likes_count: isLiked ? prev.likes_count - 1 : prev.likes_count + 1
            }));
            if (!isLiked) playSuccess();
        }
    };

    const authorId = creation?.user?.id || 'unknown';
    const shareUrl = `https://t.me/bazzar_pixel_bot/app?startapp=c_${id}&utm_source=share&utm_medium=creation&utm_campaign=${authorId}`;
    const ctaUrl = `https://t.me/bazzar_pixel_bot/app?startapp=ref_${authorId}&utm_source=share&utm_medium=cta&utm_campaign=${authorId}`;

    const handleShare = () => {
        playClick();
        if ((window as any).Telegram?.WebApp) {
            (window as any).Telegram.WebApp.showPopup({
                title: t('common.share'),
                message: shareUrl,
                buttons: [{ type: 'default', text: t('common.copy'), id: 'copy' }]
            }, (btnId: string) => {
                if (btnId === 'copy') {
                    navigator.clipboard.writeText(shareUrl);
                    toaster.success(t('common.copied'));
                }
            });
        } else {
            navigator.clipboard.writeText(shareUrl);
            toaster.success(t('common.copied'));
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!creation) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mb-4">
                    <Zap size={40} className="text-gray-600" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">{t('creation.notFound')}</h1>
                <p className="text-gray-400 mb-6">{t('creation.notFoundDesc')}</p>
                <button
                    onClick={() => navigate('/')}
                    className="bg-blue-500 text-white px-8 py-3 rounded-xl font-semibold active:scale-95 transition-transform"
                >
                    {t('common.back')}
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white pb-24">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 h-14 bg-black/80 backdrop-blur-md flex items-center justify-between px-4 z-50">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-blue-500">
                    <ChevronLeft size={28} />
                </button>
                <div className="flex items-center gap-3" onClick={() => navigate(`/u/${creation.user?.username}`)}>
                    <div className="w-8 h-8 rounded-full bg-gray-800 overflow-hidden">
                        {creation.user?.avatar_url ? (
                            <img src={creation.user.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold bg-blue-600">
                                {creation.user?.username?.slice(0, 2).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <span className="font-semibold text-[15px]">{creation.user?.username || t('common.user')}</span>
                </div>
                <button onClick={handleShare} className="p-2 -mr-2 text-blue-500">
                    <Share2 size={24} />
                </button>
            </header>

            {/* Main Content */}
            <main className="pt-14">
                <div className="aspect-[4/5] w-full bg-gray-900 relative">
                    <img src={creation.image_url} alt="" className="w-full h-full object-contain" />
                    {/* Watermark */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/10">
                        <Sparkles size={12} className="text-blue-400" />
                        <span className="text-[11px] font-bold text-white/70 tracking-wide">Pixel AI</span>
                    </div>
                </div>

                <div className="p-4 space-y-6">
                    {/* Action Buttons */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={handleLike} className="flex flex-col items-center gap-1">
                                <Heart
                                    size={28}
                                    className={`${isLiked ? 'text-red-500 fill-current' : 'text-white'}`}
                                    strokeWidth={isLiked ? 2 : 1.5}
                                />
                                <span className="text-[12px] text-gray-400">{creation.likes_count || 0}</span>
                            </button>
                            <button className="flex flex-col items-center gap-1 opacity-50">
                                <MessageCircle size={28} />
                                <span className="text-[12px] text-gray-400">{creation.comment_count || 0}</span>
                            </button>
                        </div>
                        <button
                            onClick={() => navigate('/generate/image-gen', { state: { prompt: creation.prompt } })}
                            className="bg-blue-500 px-6 py-2.5 rounded-full font-bold flex items-center gap-2 active:scale-95 transition-transform"
                        >
                            <Zap size={18} fill="currentColor" />
                            {t('creation.copyStyle')}
                        </button>
                    </div>

                    {/* Metadata */}
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold tracking-tight">{creation.title || t('creation.untitled')}</h2>
                        <p className="text-gray-400 text-[15px] leading-relaxed">{creation.description}</p>
                    </div>

                    {/* Prompt Section */}
                    {creation.prompt && (
                        <div className="bg-bg-secondary p-4 rounded-xl border border-white/5">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider">Prompt</span>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(creation.prompt);
                                        toaster.success(t('common.copied'));
                                    }}
                                    className="text-blue-500 hover:text-blue-400"
                                >
                                    <Copy size={18} />
                                </button>
                            </div>
                            <p className="text-[14px] text-gray-300 font-mono leading-relaxed line-clamp-4">
                                {creation.prompt}
                            </p>
                        </div>
                    )}

                    {/* Footer Info */}
                    <div className="pt-4 border-t border-white/5 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-gray-500">
                        <span>Created {new Date(creation.created_at).toLocaleDateString()}</span>
                        <span>Model: {creation.tags?.[1] || 'Default'}</span>
                    </div>

                    {/* Referral Bonus Badge */}
                    <div className="mt-4 bg-bg-secondary rounded-xl p-3 border border-white/5 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
                            <Zap size={16} className="text-yellow-400" fill="currentColor" />
                        </div>
                        <p className="text-[12px] text-white/50 leading-snug">
                            Поделитесь — автор получит <span className="text-yellow-400 font-bold">25 ⚡</span> за каждого нового пользователя
                        </p>
                    </div>
                </div>

                {/* === COMMENTS === */}
                <CommentsSection creationId={id} />

                {/* === RELATED CREATIONS === */}
                {similar.length > 0 && (
                    <div className="px-4 py-8 border-t border-white/5">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Sparkles size={18} className="text-blue-400" />
                            {t('home.templates')} {/* Using existing key for 'Similar/Recommended' style content */}
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {similar.map((item) => (
                                <motion.div
                                    key={item.id}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => { playClick(); navigate(`/c/${item.id}`); window.scrollTo(0, 0); }}
                                    className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-900 border border-white/5 group"
                                >
                                    <img src={item.image_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-white">
                                            <Heart size={10} className="text-red-500 fill-current" />
                                            {item.likes_count}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* === VIRAL CTA BLOCK === */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="mx-4 mb-8 mt-2"
                >
                    <div className="bg-gradient-to-br from-[#3390ec]/20 via-[#1c1c1e] to-purple-500/20 rounded-[24px] p-5 border border-[#3390ec]/30 relative overflow-hidden">
                        {/* Glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-blue-500/15 rounded-full blur-[50px] -mt-20" />

                        <div className="relative z-10 text-center">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#3390ec] to-[#007aff] flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-blue-500/30">
                                <Sparkles size={32} className="text-white" />
                            </div>

                            <h3 className="text-[20px] font-[900] text-white tracking-tight mb-2">
                                Создай своё изображение
                            </h3>
                            <p className="text-[14px] text-white/50 mb-5 max-w-[260px] mx-auto leading-snug">
                                Генерируй с помощью нейросетей — фото, арты, стикеры и видео за секунды
                            </p>

                            <a
                                href={ctaUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-accent-blue text-white font-bold text-[15px] px-6 py-3.5 rounded-card shadow-lg shadow-blue-500/30 hover:brightness-110 active:scale-[0.97] transition-all"
                            >
                                Открыть Pixel AI
                                <ArrowRight size={18} />
                            </a>

                            <p className="text-[11px] text-white/30 mt-3 flex items-center justify-center gap-1">
                                <ExternalLink size={10} /> Бесплатный старт — 50 зарядов
                            </p>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default SharedCreationView;
