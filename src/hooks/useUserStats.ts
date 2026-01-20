import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analytics } from '../lib/supabase';

// Define the shape of UserStats
export interface UserStats {
    current_balance: number;
    total_generations?: number;
    total_likes_received?: number;
    // Add other fields as we discover them
    [key: string]: any;
}

export const useUserStats = (userId: string | number | undefined) => {
    return useQuery<UserStats | null>({
        queryKey: ['userStats', userId],
        queryFn: async () => {
            if (!userId) return null;
            const data = await analytics.getUserStats(userId);
            return data as UserStats;
        },
        enabled: !!userId,
    });
};

export const useAddCredits = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ userId, amount }: { userId: string | number; amount: number }) => {
            return await analytics.addCredits(userId, amount);
        },
        onSuccess: (data, variables) => {
            // Update the cache immediately
            queryClient.setQueryData<UserStats>(['userStats', variables.userId], (old) => {
                if (!old) return old;
                return { ...old, current_balance: (old.current_balance || 0) + variables.amount };
            });
        },
    });
};
