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
            {/* Header */}
            <div className="sticky top-0 z-40 bg-slate-50/80 dark:bg-[#09090b]/80 backdrop-blur-md px-4 py-4 pt-[calc(env(safe-area-inset-top)+10px)] flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-full bg-white/50 dark:bg-white/5 flex items-center justify-center text-slate-700 dark:text-slate-200"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-lg font-bold flex-1 truncate">@{profile.username || 'User'}</h1>
            </div>

            {/* Profile Info */}
            <div className="px-6 mt-2 mb-8">
                <div className="flex flex-col items-center">
                    {/* Avatar */}
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[3px] mb-4 shadow-xl">
                        <div className="w-full h-full rounded-full border-4 border-slate-50 dark:border-[#09090b] overflow-hidden bg-slate-200 dark:bg-slate-800">
                            {profile.avatar_url ? (
                                <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-slate-500">
                                    {profile.first_name?.[0] || '?'}
                                </div>
                            )}
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold mb-1">{profile.first_name} {profile.last_name}</h2>
                    {profile.username && <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mb-6">@{profile.username}</p>}

                    {/* Stats */}
                    <div className="flex items-center gap-8 mb-8">
                        <div className="text-center">
                            <div className="text-xl font-bold">{profile.stats?.creations || 0}</div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Creations</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold">{profile.stats?.followers || 0}</div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Followers</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold">{profile.stats?.following || 0}</div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Following</div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {!isOwnProfile && (
                        <div className="w-full max-w-xs flex gap-3">
                            <button
                                onClick={handleFollowToggle}
                                disabled={isFollowLoading}
                                className={`flex-1 h-12 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${isFollowing ? 'bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white' : 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                                    }`}
                            >
                                {isFollowing ? (
                                    <>
                                        <UserCheck size={20} /> Following
                                    </>
                                ) : (
                                    <>
                                        <UserPlus size={20} /> Follow
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Content Tabs */}
            <div className="border-t border-slate-200 dark:border-white/5">
                <div className="flex items-center justify-center h-14 gap-2">
                    <Grid size={20} className="text-slate-900 dark:text-white" />
                    <span className="font-bold text-sm">PUBLIC WORKS</span>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 gap-1 px-1">
                {isCreationsLoading ? (
                    // Skeleton
                    [1, 2, 3, 4].map(i => (
                        <div key={i} className="aspect-square bg-slate-200 dark:bg-white/5 rounded-lg animate-pulse" />
                    ))
                ) : (
                    creations?.map((item) => (
                        <div key={item.id} className="relative aspect-square bg-slate-100 dark:bg-white/5 rounded-lg overflow-hidden group">
                            <OptimizedImage
                                src={item.thumbnail_url || item.image_url}
                                className="w-full h-full object-cover"
                                alt={item.prompt}
                            />
                            {/* Type Indicator */}
                            <div className="absolute top-2 right-2 text-white drop-shadow-md">
                                {item.type?.includes('video') ? <Video size={16} /> : <ImageIcon size={16} />}
                            </div>

                            {/* Like Overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <Heart size={20} className="text-white fill-white" />
                                <span className="text-white font-bold">{item.likes_count || 0}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {!isCreationsLoading && creations?.length === 0 && (
                <div className="py-20 text-center text-slate-400">
                    <p>No public creations yet.</p>
                </div>
            )}

        </motion.div>
    );
};

export default UserProfileView;
