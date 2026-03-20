import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, UserPlus, UserCheck, Grid, Heart, Video, Image as ImageIcon } from 'lucide-react';
import { useUserProfile, useUserPublicCreations } from '../hooks/useGallery';
import { useUser } from '../context/UserContext';
import OptimizedImage from '../components/ui/OptimizedImage';
import LikeButton from '../components/ui/LikeButton';
import galleryAPI from '../lib/galleryAPI';
import { useToast } from '../context/ToastContext';
import { SkeletonImageCard } from '../components/ui/Skeleton';

const UserProfileView = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useUser();
    const { toast } = useToast();

    // Data Fetching
    const { data: profile, isLoading: isProfileLoading } = useUserProfile(userId);
    const { data: creations, isLoading: isCreationsLoading } = useUserPublicCreations(userId);

    // Local State
    const [isFollowing, setIsFollowing] = useState(false);
    const [isFollowLoading, setIsFollowLoading] = useState(false);

    // Initial follow check
    useEffect(() => {
        const checkFollowStatus = async () => {
            if (currentUser && userId && currentUser.id !== userId) {
                const following = await galleryAPI.checkIsFollowing(currentUser.id, userId);
                setIsFollowing(following);
            }
        };
        checkFollowStatus();
    }, [currentUser, userId]);

    // Handle Follow/Unfollow
    const handleFollowToggle = async () => {
        if (!currentUser) {
            toast.error("Please log in to follow users");
            return;
        }

        setIsFollowLoading(true);
        try {
            if (isFollowing) {
                const { success } = await galleryAPI.unfollowUser(currentUser.id, userId);
                if (success) setIsFollowing(false);
                else toast.error("Failed to unfollow");
            } else {
                const { success } = await galleryAPI.followUser(currentUser.id, userId);
                if (success) setIsFollowing(true);
                else toast.error("Failed to follow");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
        } finally {
            setIsFollowLoading(false);
        }
    };

    if (isProfileLoading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-bg-primary flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-bg-primary flex flex-col items-center justify-center p-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">User not found</h2>
                <button onClick={() => navigate(-1)} className="text-indigo-500 font-medium">Go Back</button>
            </div>
        );
    }

    const isOwnProfile = currentUser?.id === userId;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="min-h-screen bg-black text-white pb-24"
        >
            {/* Header (Glassy) */}
            <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-xl border-b border-white/5 px-4 py-4 pt-[calc(env(safe-area-inset-top)+10px)] flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-full bg-transparent flex items-center justify-center text-accent-blue hover:bg-white/10 transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <div className="flex-1 truncate">
                    <h1 className="text-[17px] font-semibold tracking-tight text-center mr-10 relative">
                        @{profile.username || 'User'}
                    </h1>
                </div>
            </div>

            {/* Profile Info */}
            <div className="px-6 mt-4 mb-8">
                <div className="flex flex-col items-center">
                    {/* Avatar */}
                    <div className="relative group mb-3">
                        <div className="relative w-28 h-28 rounded-full overflow-hidden bg-bg-secondary">
                            {profile.avatar_url ? (
                                <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[40px] font-semibold text-white bg-gradient-to-br from-blue-500 to-indigo-600">
                                    {profile.first_name?.[0] || profile.username?.[0] || '?'}
                                </div>
                            )}
                        </div>
                    </div>

                    <h2 className="text-[22px] font-bold mb-1 tracking-tight text-center text-white">{profile.first_name} {profile.last_name}</h2>
                    {profile.username && <p className="text-text-secondary font-medium text-[15px] mb-6">@{profile.username}</p>}

                    {/* Stats */}
                    <div className="flex items-center gap-6 mb-8 px-6 py-4 bg-bg-secondary rounded-input shadow-sm">
                        <div className="text-center group cursor-default min-w-[70px]">
                            <div className="text-[17px] font-semibold text-white">{profile.stats?.creations || 0}</div>
                            <div className="text-[13px] text-text-secondary font-medium mt-0.5">Создания</div>
                        </div>
                        <div className="w-px h-8 bg-bg-elevated" />
                        <div className="text-center group cursor-default min-w-[70px]">
                            <div className="text-[17px] font-semibold text-white">{profile.stats?.followers || 0}</div>
                            <div className="text-[13px] text-text-secondary font-medium mt-0.5">Подписчиков</div>
                        </div>
                        <div className="w-px h-8 bg-bg-elevated" />
                        <div className="text-center group cursor-default min-w-[70px]">
                            <div className="text-[17px] font-semibold text-white">{profile.stats?.following || 0}</div>
                            <div className="text-[13px] text-text-secondary font-medium mt-0.5">Подписок</div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {!isOwnProfile && (
                        <div className="w-full max-w-[200px] flex gap-3">
                            <button
                                onClick={handleFollowToggle}
                                disabled={isFollowLoading}
                                className={`flex-1 h-[44px] rounded-input font-semibold text-[17px] flex items-center justify-center gap-2 transition-all active:scale-95 ${isFollowing
                                    ? 'bg-bg-elevated text-[#ff3b30]'
                                    : 'bg-accent-blue text-white hover:bg-accent-blue'
                                    }`}
                            >
                                {isFollowing ? 'Отписаться' : 'Подписаться'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Content Tabs (Glassy) */}
            <div className="px-4 mb-4">
                <div className="bg-bg-secondary p-1 rounded-input flex items-center justify-center">
                    <button className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-[8px] bg-[#636366] text-white font-medium text-[13px] shadow-sm">
                        Публичная Галерея
                    </button>
                </div>
            </div>

            {/* Grid (iOS Photos app style) */}
            <div className="px-0.5 md:px-4">
                <div className="grid grid-cols-3 gap-0.5 md:gap-4 border-t border-white/5 pt-0.5">
                    {isCreationsLoading ? (
                        // Skeleton
                        [1, 2, 3, 4, 5, 6].map(i => (
                            <SkeletonImageCard key={i} />
                        ))
                    ) : (
                        creations?.map((item, i) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="relative aspect-square bg-bg-secondary overflow-hidden group border-none shadow-none cursor-pointer"
                                onClick={() => navigate(`/gallery`)} // Or open detail
                            >
                                <OptimizedImage
                                    src={item.thumbnail_url || item.image_url}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    alt={item.prompt}
                                />

                                {/* Type Indicator */}
                                <div className="absolute top-1 right-1 text-white bg-black/40 backdrop-blur-md p-1 rounded-full">
                                    {item.type?.includes('video') ? <Video size={10} /> : null}
                                </div>

                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {!isCreationsLoading && creations?.length === 0 && (
                <div className="py-20 text-center text-text-secondary flex flex-col items-center">
                    <Grid size={48} className="mb-4 opacity-50" />
                    <p className="font-medium text-[15px]">Нет публичных работ</p>
                </div>
            )}
        </motion.div>
    );
};

export default UserProfileView;
