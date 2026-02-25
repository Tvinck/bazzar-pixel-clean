import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft, Heart, Share2, Copy, Zap,
    MessageCircle
} from 'lucide-react';
// @ts-ignore
import galleryAPI from '../../lib/galleryAPI';
import { useLanguage } from '../../context/LanguageContext';
import { useSound } from '../../context/SoundContext';
import { useUser } from '../../context/UserContext';
import { useToast } from '../../context/ToastContext';

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

    const handleShare = () => {
        playClick();
        const url = `https://t.me/bazzar_pixel_bot/app?startapp=c_${id}`;
        if ((window as any).Telegram?.WebApp) {
            (window as any).Telegram.WebApp.showPopup({
                title: t('common.share'),
                message: url,
                buttons: [{ type: 'default', text: t('common.copy'), id: 'copy' }]
            }, (btnId: string) => {
                if (btnId === 'copy') {
                    navigator.clipboard.writeText(url);
                    toaster.success(t('common.copied'));
                }
            });
        } else {
            navigator.clipboard.writeText(url);
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
                        <div className="bg-[#1c1c1e] p-4 rounded-xl border border-white/5">
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
                </div>
            </main>
        </div>
    );
};

export default SharedCreationView;
