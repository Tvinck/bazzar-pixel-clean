// Gallery API functions for Supabase
import { supabase } from './supabase';

/**
 * API Галереи и Шаблонов (Supabase)
 * 
 * Отвечает за взаимодействие с базой данных для:
 * - Получения списка шаблонов (с нормализацией данных).
 * - Ленты публичных работ (Feed).
 * - Социальных функций (лайки, подписки, профили).
 */
export const galleryAPI = {
    // Получение публичных работ с фильтрацией и пагинацией
    async getPublicCreations({ sortBy = 'trending', filterType = 'all', page = 1, limit = 20 }) {
        try {
            let query;

            // Select from appropriate view based on sort
            const viewName = `public_gallery_${sortBy}`;

            query = supabase
                .from(viewName)
                .select('*');

            // Apply type filter
            if (filterType !== 'all') {
                query = query.eq('type', filterType);
            }

            // Pagination
            const from = (page - 1) * limit;
            const to = from + limit - 1;
            query = query.range(from, to);

            const { data, error, count } = await query;

            if (error) throw error;

            return {
                creations: data || [],
                hasMore: data && data.length === limit,
                total: count
            };
        } catch (error) {
            console.error('Error fetching public creations:', error);
            return { creations: [], hasMore: false, total: 0 };
        }
    },

    // Get templates (via Proxy to bypass CORS)
    async getTemplates(category = 'all') {
        try {
            const res = await fetch(`/api/templates?category=${category}`);
            if (!res.ok) throw new Error('Failed to fetch templates via proxy');
            const data = await res.json();

            // Map snake_case from DB to camelCase for frontend
            return (data || []).map(item => ({
                ...item,
                type: 'template',
                mediaType: item.media_type,
                isLocalVideo: item.is_local_video,
                requiredFilesCount: item.required_files_count
            }));
        } catch (error) {
            console.error('Error fetching templates:', error);
            return [];
        }
    },

    // Get single template
    async getTemplate(id) {
        try {
            const { data, error } = await supabase
                .from('templates')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            return {
                ...data,
                mediaType: data.media_type,
                isLocalVideo: data.is_local_video,
                requiredFilesCount: data.required_files_count
            };
        } catch (error) {
            console.error('Error fetching template:', error);
            return null;
        }
    },

    // Toggle Public Visibility
    async togglePublic(id, isPublic) {
        try {
            const { error } = await supabase
                .from('creations')
                .update({ is_public: isPublic })
                .eq('id', id);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error toggling visibility:', error);
            return { success: false, error: error.message };
        }
    },

    // Get single creation details
    async getCreation(creationId) {
        try {
            const { data, error } = await supabase
                .from('creations')
                .select(`
                    *,
                    user:users(
                        username,
                        first_name,
                        avatar_url
                    )
                `)
                .eq('id', creationId)
                .eq('is_public', true)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching creation:', error);
            return null;
        }
    },

    // Like a creation (Direct DB)
    async likeCreation(creationId, userId) {
        try {
            const { data, error } = await supabase
                .from('likes')
                .insert({ user_id: userId, creation_id: creationId })
                .select()
                .single();

            if (error) {
                // Unique violation (23505) means already liked
                if (error.code === '23505') return { success: false, error: 'Already liked' };
                throw error;
            }
            return { success: true, data };
        } catch (error) {
            console.error('Error liking creation:', error);
            return { success: false, error: error.message };
        }
    },

    // Unlike a creation (Direct DB)
    async unlikeCreation(creationId, userId) {
        try {
            const { error } = await supabase
                .from('likes')
                .delete()
                .match({ user_id: userId, creation_id: creationId });

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error unliking creation:', error);
            return { success: false, error: error.message };
        }
    },

    // Check if user liked creation (Direct DB)
    async checkUserLiked(creationId, userId) {
        try {
            const { data } = await supabase
                .from('likes')
                .select('id')
                .eq('user_id', userId)
                .eq('creation_id', creationId)
                .maybeSingle();

            return !!data;
        } catch (error) {
            return false;
        }
    },

    // Increment views
    async incrementViews(creationId) {
        try {
            const { error } = await supabase
                .rpc('increment_creation_views', {
                    p_creation_id: creationId
                });

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error incrementing views:', error);
            return { success: false };
        }
    },

    // Get IDs of creations liked by user
    async getUserLikedIds(userId) {
        try {
            const { data } = await supabase
                .from('likes')
                .select('creation_id')
                .eq('user_id', userId);

            return data ? data.map(l => l.creation_id) : [];
        } catch (error) {
            console.error('Error fetching liked IDs:', error);
            return [];
        }
    },

    // Get user's creations
    async getUserCreations(userId, includePrivate = false) {
        try {
            let query = supabase
                .from('creations')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (!includePrivate) {
                query = query.eq('is_public', true);
            }

            const { data, error } = await query;

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching user creations:', error);
            return [];
        }
    },

    // Create/save a creation
    async saveCreation(creation) {
        const payload = {
            user_id: creation.userId,
            generation_id: creation.generationId,
            title: creation.title,
            description: creation.description,
            image_url: creation.imageUrl,
            thumbnail_url: creation.thumbnailUrl,
            type: creation.type,
            prompt: creation.prompt,
            tags: creation.tags || [],
            is_public: creation.isPublic !== undefined ? creation.isPublic : false,
            blurhash: creation.blurhash
        };

        try {
            const { data, error } = await supabase
                .from('creations')
                .insert(payload)
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            // Case 0: Already Saved (Backend handled it)
            if (error.code === '23505' || error.status === 409) {
                console.log('✅ Creation already saved by backend (skipping duplicate).');
                return { success: true, alreadyExists: true };
            }

            // Case 1: FK Violation (Profile Missing)
            if (error.code === '23503') { // Foreign key violation
                console.warn('⚠️ User/Profile missing. Attempting auto-fix...');

                // Try to create profile for THIS user
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert({
                        id: creation.userId,
                        username: 'user_' + creation.userId.slice(0, 8),
                        full_name: 'User',
                        balance: 10, // Give free credits
                        role: 'user'
                    });

                if (profileError) {
                    console.error('❌ Failed to auto-create profile:', profileError);
                } else {
                    // Retry original insert
                    const { data: retryData, error: retryError } = await supabase
                        .from('creations')
                        .insert(payload)
                        .select()
                        .single();

                    if (!retryError) {
                        return { success: true, data: retryData };
                    }
                }
            }



            console.error('Error saving creation (Original):', error);
            return { success: false, error: error.message };
        }
    },

    // Update creation
    async updateCreation(creationId, updates) {
        try {
            const { data, error } = await supabase
                .from('creations')
                .update(updates)
                .eq('id', creationId)
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error updating creation:', error);
            return { success: false, error: error.message };
        }
    },

    // Delete creation
    async deleteCreation(creationId) {
        try {
            const { error } = await supabase
                .from('creations')
                .delete()
                .eq('id', creationId);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error deleting creation:', error);
            return { success: false, error: error.message };
        }
    },

    // Search creations
    async searchCreations(query, filters = {}) {
        try {
            let supabaseQuery = supabase
                .from('creations')
                .select(`
                    *,
                    user:users(
                        username,
                        first_name,
                        avatar_url
                    )
                `)
                .eq('is_public', true);

            // Search in title, description, and prompt
            if (query) {
                supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%,prompt.ilike.%${query}%`);
            }

            // Apply filters
            if (filters.type) {
                supabaseQuery = supabaseQuery.eq('type', filters.type);
            }

            if (filters.tags && filters.tags.length > 0) {
                supabaseQuery = supabaseQuery.contains('tags', filters.tags);
            }

            // Sort
            const sortBy = filters.sortBy || 'created_at';
            const sortOrder = filters.sortOrder || 'desc';
            supabaseQuery = supabaseQuery.order(sortBy, { ascending: sortOrder === 'asc' });

            // Limit
            const limit = filters.limit || 50;
            supabaseQuery = supabaseQuery.limit(limit);

            const { data, error } = await supabaseQuery;

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error searching creations:', error);
            return [];
        }
    },
    // --- SOCIAL & PROFILE API ---

    // Get public user profile with stats
    async getUserProfile(userId) {
        try {
            // Get basic user info
            const { data: user, error: userError } = await supabase
                .from('users')
                .select('id, username, first_name, avatar_url, created_at')
                .eq('id', userId)
                .single();

            if (userError) throw userError;

            // Get stats (creations count, followers, following)
            // Note: This could be optimized with a dedicated view or RPC
            const { count: creationsCount } = await supabase
                .from('creations')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('is_public', true);

            const { count: followersCount } = await supabase
                .from('follows')
                .select('follower_id', { count: 'exact', head: true })
                .eq('following_id', userId);

            const { count: followingCount } = await supabase
                .from('follows')
                .select('following_id', { count: 'exact', head: true })
                .eq('follower_id', userId);

            return {
                ...user,
                stats: {
                    creations: creationsCount || 0,
                    followers: followersCount || 0,
                    following: followingCount || 0
                }
            };
        } catch (error) {
            console.error('Error fetching user profile:', error);
            return null;
        }
    },

    // Follow a user
    async followUser(followerId, targetId) {
        try {
            const { error } = await supabase
                .from('follows')
                .insert({ follower_id: followerId, following_id: targetId });

            if (error) throw error;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Unfollow a user
    async unfollowUser(followerId, targetId) {
        try {
            const { error } = await supabase
                .from('follows')
                .delete()
                .eq('follower_id', followerId)
                .eq('following_id', targetId);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Check if following
    async checkIsFollowing(followerId, targetId) {
        try {
            const { data, error } = await supabase
                .from('follows')
                .select('created_at')
                .eq('follower_id', followerId)
                .eq('following_id', targetId)
                .single();

            if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows found"
            return !!data;
        } catch (error) {
            return false;
        }
    }
};

export default galleryAPI;
