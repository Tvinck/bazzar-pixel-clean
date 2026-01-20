import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import galleryAPI from '../lib/galleryAPI';

export const usePublicCreations = ({ sortBy = 'trending', limit = 20, enabled = true } = {}) => {
    return useQuery({
        queryKey: ['publicCreations', sortBy, limit],
        queryFn: async () => {
            const data = await galleryAPI.getPublicCreations({ sortBy, limit });
            return data.creations;
        },
        enabled,
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
};

export const useInfiniteCreations = ({ sortBy = 'trending', filterType = 'all', limit = 10 } = {}) => {
    return useInfiniteQuery({
        queryKey: ['infiniteCreations', sortBy, filterType],
        queryFn: async ({ pageParam = 0 }) => {
            const data = await galleryAPI.getPublicCreations({
                sortBy,
                filterType,
                limit,
                offset: pageParam * limit
            });
            return data.creations;
        },
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.length === limit ? allPages.length : undefined;
        }
    });
};

export const useUserCreations = (userId) => {
    return useQuery({
        queryKey: ['userCreations', userId],
        queryFn: async () => {
            if (!userId) return [];
            const data = await galleryAPI.getUserCreations(userId);
            return data;
        },
        enabled: !!userId,
    });
};

export const useTemplates = (category = 'all') => {
    return useQuery({
        queryKey: ['templates', category],
        queryFn: async () => {
            const data = await galleryAPI.getTemplates(category);
            return data;
        },
        staleTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useUserLikedIds = (userId) => {
    return useQuery({
        queryKey: ['userLikedIds', userId],
        queryFn: async () => {
            if (!userId) return [];
            return await galleryAPI.getUserLikedIds(userId);
        },
        enabled: !!userId,
        staleTime: 1000 * 60 * 5, // 5 mins
    });
};

// Get Public User Profile
export const useUserProfile = (userId) => {
    return useQuery({
        queryKey: ['userProfile', userId],
        queryFn: () => galleryAPI.getUserProfile(userId),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5 // 5 minutes
    });
};

// Get User's Public Creations
export const useUserPublicCreations = (userId) => {
    return useQuery({
        queryKey: ['userPublicCreations', userId],
        queryFn: () => galleryAPI.getUserCreations(userId, false), // false = public only
        enabled: !!userId,
    });
};
