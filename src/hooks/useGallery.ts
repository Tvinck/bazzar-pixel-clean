import { useQuery, useInfiniteQuery, UseQueryResult, UseInfiniteQueryResult } from '@tanstack/react-query';
import galleryAPI from '../lib/galleryAPI';

// --- TYPES ---

export interface Creation {
    id: string;
    imageUrl: string;
    thumbnailUrl?: string;
    title?: string;
    description?: string;
    prompt?: string;
    type: 'image' | 'video';
    likes_count?: number;
    userId: string;
    [key: string]: any;
}

export interface Category {
    id: string;
    label: string;
    icon: string;
    slug: string;
}

export interface Template {
    id: string;
    title: string;
    imageUrl: string;
    category: string;
    [key: string]: any;
}

// --- HOOKS ---

export const usePublicCreations = ({ sortBy = 'trending', limit = 20, enabled = true } = {}): UseQueryResult<Creation[]> => {
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

export const useInfiniteCreations = ({ sortBy = 'trending', filterType = 'all', limit = 10 } = {}): UseInfiniteQueryResult<Creation[]> => {
    return useInfiniteQuery({
        queryKey: ['infiniteCreations', sortBy, filterType],
        queryFn: async ({ pageParam = 0 }) => {
            const data = await galleryAPI.getPublicCreations({
                sortBy,
                filterType,
                limit,
                offset: (pageParam as number) * limit
            } as any);
            return data.creations;
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage: any[], allPages: any[]) => {
            return lastPage.length === limit ? allPages.length : undefined;
        }
    });
};

export const useUserCreations = (userId: string | number | undefined): UseQueryResult<Creation[]> => {
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

export const useCategories = (): UseQueryResult<Category[]> => {
    return useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const data = await galleryAPI.getCategories();
            if (!data || data.length === 0) {
                // Fallback to default if DB empty
                return [
                    { id: 'trends', label: 'Тренды', icon: '🔥', slug: 'trends' },
                    { id: 'dances', label: 'Танцы', icon: '💃', slug: 'dances' },
                    { id: 'effects', label: 'Эффекты', icon: '✨', slug: 'effects' },
                    { id: 'photo', label: 'Фото', icon: '📸', slug: 'photo' },
                    { id: 'video', label: 'Видео', icon: '🎥', slug: 'video' },
                ];
            }
            return data;
        },
        staleTime: 1000 * 60 * 30, // 30 mins
    });
};

export const useTemplates = (category = 'all'): UseQueryResult<Template[]> => {
    return useQuery({
        queryKey: ['templates', category],
        queryFn: async () => {
            const data = await galleryAPI.getTemplates(category);
            return data;
        },
        staleTime: 0, // Force refresh to fix caching issues
        refetchOnWindowFocus: true,
    });
};

export const useUserLikedIds = (userId: string | number | undefined): UseQueryResult<string[]> => {
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
export const useUserProfile = (userId: string | number | undefined): UseQueryResult<any> => {
    return useQuery({
        queryKey: ['userProfile', userId],
        queryFn: () => galleryAPI.getUserProfile(userId),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5 // 5 minutes
    });
};

// Get User's Public Creations
export const useUserPublicCreations = (userId: string | number | undefined): UseQueryResult<Creation[]> => {
    return useQuery({
        queryKey: ['userPublicCreations', userId],
        queryFn: () => galleryAPI.getUserCreations(userId, false), // false = public only
        enabled: !!userId,
    });
};
