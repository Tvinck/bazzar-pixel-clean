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
            <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] flex flex-col items-center justify-center p-4">
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
            className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-white pb-24"
        >
            {/* Header (Glassy) */}
            <div className="sticky top-0 z-40 bg-slate-50/80 dark:bg-[#09090b]/80 backdrop-blur-xl border-b border-white/5 px-4 py-4 pt-[calc(env(safe-area-inset-top)+10px)] flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-full bg-white/50 dark:bg-white/5 flex items-center justify-center text-slate-700 dark:text-white/70 hover:bg-white/10 transition-colors border border-transparent dark:border-white/5"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex-1 truncate">
                    <h1 className="text-lg font-black tracking-tight">@{profile.username || 'User'}</h1>
                </div>
            </div>

            {/* Profile Info */}
            <div className="px-6 mt-4 mb-8">
                <div className="flex flex-col items-center">
                    {/* Avatar (Premium) */}
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 via-purple-500 to-amber-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 animate-tilt"></div>
                        <div className="relative w-28 h-28 rounded-full border-4 border-slate-50 dark:border-[#09090b] overflow-hidden bg-slate-200 dark:bg-slate-800 shadow-2xl">
                            {profile.avatar_url ? (
                                <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-slate-500 bg-white/5">
                                    {profile.first_name?.[0] || '?'}
                                </div>
                            )}
                        </div>
                    </div>

                    <h2 className="text-3xl font-black mt-4 mb-1 tracking-tight text-center bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">{profile.first_name} {profile.last_name}</h2>
                    {profile.username && <p className="text-slate-500 dark:text-white/40 font-medium text-sm mb-8">@{profile.username}</p>}

                    {/* Stats */}
                    <div className="flex items-center gap-10 mb-8 px-8 py-4 bg-white/5 rounded-3xl backdrop-blur-sm border border-white/5 shadow-inner">
                        <div className="text-center group cursor-default">
                            <div className="text-2xl font-black text-white group-hover:text-indigo-400 transition-colors">{profile.stats?.creations || 0}</div>
                            <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Creations</div>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div className="text-center group cursor-default">
                            <div className="text-2xl font-black text-white group-hover:text-purple-400 transition-colors">{profile.stats?.followers || 0}</div>
                            <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Followers</div>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div className="text-center group cursor-default">
                            <div className="text-2xl font-black text-white group-hover:text-amber-400 transition-colors">{profile.stats?.following || 0}</div>
                            <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Following</div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {!isOwnProfile && (
                        <div className="w-full max-w-[200px] flex gap-3">
                            <button
                                onClick={handleFollowToggle}
                                disabled={isFollowLoading}
                                className={`flex-1 h-12 rounded-2xl font-black text-sm uppercase tracking-wide flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg ${isFollowing
                                    ? 'bg-white/10 border border-white/10 text-white hover:bg-white/20'
                                    : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-indigo-500/25'
                                    }`}
                            >
                                {isFollowing ? (
                                    <>
                                        <UserCheck size={18} /> Following
                                    </>
                                ) : (
                                    <>
                                        <UserPlus size={18} /> Follow
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Content Tabs (Glassy) */}
            <div className="px-6 mb-4">
                <div className="bg-white/5 p-1 rounded-2xl flex items-center justify-center border border-white/5">
                    <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/10 shadow-sm text-white transition-all">
                        <Grid size={16} />
                        <span className="font-bold text-xs tracking-wider">PUBLIC GALLERY</span>
                    </button>
                </div>
            </div>

            {/* Grid (Masonry) */}
            <div className="px-2">
                <div className="grid grid-cols-2 gap-2">
                    {isCreationsLoading ? (
                        // Skeleton
                        [1, 2, 3, 4].map(i => (
                            <div key={i} className="aspect-square bg-white/5 rounded-2xl animate-pulse border border-white/5" />
                        ))
                    ) : (
                        creations?.map((item, i) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="relative aspect-square bg-slate-900 rounded-[1.2rem] overflow-hidden group border border-white/5 shadow-md cursor-pointer"
                                onClick={() => navigate(`/gallery`)} // Or open detail
                            >
                                <OptimizedImage
                                    src={item.thumbnail_url || item.image_url}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    alt={item.prompt}
                                />
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                                {/* Type Indicator */}
                                <div className="absolute top-2 right-2 text-white/80 bg-black/40 backdrop-blur-md p-1.5 rounded-full border border-white/10">
                                    {item.type?.includes('video') ? <Video size={12} /> : <ImageIcon size={12} />}
                                </div>

                                {/* Like Overlay */}
                                <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full border border-white/10">
                                    <Heart size={12} className="text-white fill-white/50" />
                                    <span className="text-white text-[10px] font-bold">{item.likes_count || 0}</span>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {!isCreationsLoading && creations?.length === 0 && (
                <div className="py-20 text-center text-white/30 flex flex-col items-center">
                    <Grid size={48} className="mb-4 opacity-50" />
                    <p className="font-medium">No public creations yet.</p>
                </div>
            )}
        </motion.div>
    );
};

export default UserProfileView;
