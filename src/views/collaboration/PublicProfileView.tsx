import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft, Share2, UserPlus, UserCheck,
    Grid, Heart, Link as LinkIcon, Info
} from 'lucide-react';
// @ts-ignore
import galleryAPI from '../../lib/galleryAPI';
import { useLanguage } from '../../context/LanguageContext';
import { useSound } from '../../context/SoundContext';
import { useUser } from '../../context/UserContext';
import { useToast } from '../../context/ToastContext';

const PublicProfileView = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { playClick, playSuccess } = useSound();
    const { user: currentUser } = useUser();
    const toaster = useToast() as any;

    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [creations, setCreations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [activeTab, setActiveTab] = useState('creations');

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!username) return;
            try {
                // 1. Fetch Basic Info & Profile
                const res = await fetch(`/api/user/public/${username}`);
                if (!res.ok) throw new Error('Not found');
                const { user: userData, profile: profileData } = await res.json();
                setUser(userData);
                setProfile(profileData);

                // 2. Fetch Stats & Creations
                const [statsRes, creationsData] = await Promise.all([
                    fetch(`/api/user/public/stats/${userData.id}`).then(r => r.json()),
                    galleryAPI.getUserCreations(userData.id, false)
                ]);

                setStats(statsRes);
                setCreations(creationsData);

                // 3. Check following status
                if (currentUser) {
                    const following = await galleryAPI.checkIsFollowing(currentUser.id, userData.id);
                    setIsFollowing(following);
                }
            } catch (err) {
                console.error('Failed to load profile:', err);
                toaster.error(t('profile.notFound') || 'Profile not found');
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfileData();
    }, [username, currentUser]);

    const handleFollow = async () => {
        if (!currentUser || !user) return;
        playClick();
        const success = isFollowing
            ? await galleryAPI.unfollowUser(currentUser.id, user.id)
            : await galleryAPI.followUser(currentUser.id, user.id);

        if (success) {
            setIsFollowing(!isFollowing);
            setStats((prev: any) => ({
                ...prev,
                followers_count: isFollowing ? prev.followers_count - 1 : prev.followers_count + 1
            }));
            if (!isFollowing) playSuccess();
        }
    };

    const handleShare = () => {
        playClick();
        const url = `https://t.me/bazzar_pixel_bot/app?startapp=u_${username}`;
        navigator.clipboard.writeText(url);
        toaster.success(t('common.copied'));
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mb-4 text-gray-600">
                    <Info size={40} />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">{t('profile.notFound')}</h1>
                <p className="text-gray-400 mb-6">{t('profile.privateDesc')}</p>
                <button onClick={() => navigate('/')} className="bg-blue-500 text-white px-8 py-3 rounded-xl font-semibold">{t('common.back')}</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white pb-20">
            {/* Header */}
            <header className="h-14 flex items-center justify-between px-4 sticky top-0 bg-black/80 backdrop-blur-md z-50">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-blue-500">
                    <ChevronLeft size={28} />
                </button>
                <span className="font-bold text-[17px]">@{user.username}</span>
                <button onClick={handleShare} className="p-2 -mr-2 text-blue-500">
                    <Share2 size={24} />
                </button>
            </header>

            {/* Profile Info */}
            <div className="px-6 pt-6 pb-4">
                <div className="flex items-start justify-between mb-6">
                    <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-blue-500 to-purple-600 p-1">
                        <div className="w-full h-full rounded-[28px] bg-black overflow-hidden flex items-center justify-center border-2 border-black">
                            {user.avatar_url ? (
                                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-3xl font-bold">{user.username?.slice(0, 1).toUpperCase()}</span>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 flex justify-around pl-4 pt-2">
                        <div className="text-center">
                            <div className="text-xl font-bold">{stats?.creations_count || 0}</div>
                            <div className="text-[12px] text-gray-500">{t('profile.works')}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold">{stats?.followers_count || 0}</div>
                            <div className="text-[12px] text-gray-500">{t('profile.followers')}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold">{stats?.total_likes || 0}</div>
                            <div className="text-[12px] text-gray-500">{t('profile.likes')}</div>
                        </div>
                    </div>
                </div>

                <div className="space-y-1 mb-6">
                    <h1 className="text-2xl font-black tracking-tight">{user.first_name}</h1>
                    {profile?.bio && <p className="text-[15px] text-gray-300 leading-relaxed font-medium">{profile.bio}</p>}
                    {profile?.website && (
                        <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-500 text-[14px] font-semibold py-1">
                            <LinkIcon size={14} />
                            {profile.website.replace(/^https?:\/\//, '')}
                        </a>
                    )}
                </div>

                {/* Follow Button */}
                {currentUser?.id !== user.id && (
                    <button
                        onClick={handleFollow}
                        className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${isFollowing
                            ? 'bg-bg-secondary text-white border border-white/10'
                            : 'bg-blue-500 text-white'
                            }`}
                    >
                        {isFollowing ? <UserCheck size={20} /> : <UserPlus size={20} />}
                        {isFollowing ? t('profile.unfollow') : t('profile.follow')}
                    </button>
                )}
            </div>

            {/* Tabs & Grid */}
            <div className="border-t border-white/5">
                <div className="flex bg-black sticky top-14 z-40">
                    <button
                        onClick={() => setActiveTab('creations')}
                        className={`flex-1 py-4 flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'creations' ? 'border-blue-500 text-white' : 'border-transparent text-gray-500'
                            }`}
                    >
                        <Grid size={20} />
                    </button>
                    <button
                        onClick={() => setActiveTab('likes')}
                        className={`flex-1 py-4 flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'likes' ? 'border-blue-500 text-white' : 'border-transparent text-gray-500'
                            }`}
                    >
                        <Heart size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-0.5 p-0.5">
                    {creations.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => navigate(`/c/${item.id}`)}
                            className="aspect-square bg-gray-900 overflow-hidden relative group active:scale-95 transition-transform"
                        >
                            <img src={item.thumbnail_url || item.image_url} alt="" className="w-full h-full object-cover" />
                            <div className="absolute bottom-1 right-1 bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded flex items-center gap-1 text-[10px] font-bold">
                                <Heart size={10} className="fill-current text-white" />
                                {item.likes_count || 0}
                            </div>
                        </div>
                    ))}
                    {creations.length === 0 && (
                        <div className="col-span-3 py-20 text-center text-gray-500">
                            <Grid size={40} className="mx-auto mb-2 opacity-20" />
                            <p>{t('profile.noWorks')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PublicProfileView;
