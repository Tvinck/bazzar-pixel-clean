// Gallery API functions for Supabase (Proxied via Backend Gateway)
import { supabase } from './supabase'; // Keep for real-time if needed, though we use proxy for REST

/**
 * API Галереи и Шаблонов (Proxied)
 * 
 * Взаимодействует с бэкенд-шлюзом (/api/gallery и /api/templates)
 * для обхода ограничений CORS и обеспечения безопасности.
 */
export const galleryAPI = {
    // Получение публичных работ
    async getPublicCreations({ sortBy = 'trending', filterType = 'all', page = 1, limit = 20 }) {
        try {
            const res = await fetch(`/api/gallery?sortBy=${sortBy}&filterType=${filterType}&page=${page}&limit=${limit}`);
            if (!res.ok) throw new Error('Gallery fetch failed');
            return await res.json();
        } catch (error) {
            console.error('Error fetching public creations:', error);
            return { creations: [], hasMore: false, total: 0 };
        }
    },

    // Get templates
    async getTemplates(category = 'all') {
        try {
            const res = await fetch(`/api/templates?category=${category}`);
            if (!res.ok) throw new Error('Templates fetch failed');
            const data = await res.json();
            return (data || []).map(item => ({
                ...item,
                type: 'template',
                mediaType: item.media_type,
                isLocalVideo: item.is_local_video,
                requiredFilesCount: item.required_files_count
            }));
        } catch (error) {
            console.error('API Templates Error:', error);
            return [];
        }
    },

    // Get all categories from DB
    async getCategories() {
        try {
            const res = await fetch('/api/gallery/categories');
            if (!res.ok) throw new Error('Categories fetch failed');
            return await res.json();
        } catch (error) {
            console.error('Error fetching categories:', error);
            return [];
        }
    },

    // Get single template
    async getTemplate(id) {
        try {
            const res = await fetch(`/api/templates/${id}`);
            if (!res.ok) throw new Error('Template fetch failed');
            const data = await res.json();
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
        return this.updateCreation(id, { is_public: isPublic });
    },

    // Get single creation details
    async getCreation(creationId) {
        try {
            const res = await fetch(`/api/gallery/creations/${creationId}`);
            if (!res.ok) throw new Error('Creation fetch failed');
            return await res.json();
        } catch (error) {
            console.error('Error fetching creation:', error);
            return null;
        }
    },

    // Like a creation (Via Proxy)
    async likeCreation(creationId, userId) {
        try {
            const initData = window.Telegram?.WebApp?.initData;
            const res = await fetch('/api/gallery/like', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-TG-Data': initData
                },
                body: JSON.stringify({ userId, creationId })
            });
            return await res.json();
        } catch (error) {
            console.error('Error liking creation:', error);
            return { success: false, error: error.message };
        }
    },

    // Unlike a creation (Via Proxy)
    async unlikeCreation(creationId, userId) {
        try {
            const initData = window.Telegram?.WebApp?.initData;
            const res = await fetch('/api/gallery/unlike', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-TG-Data': initData
                },
                body: JSON.stringify({ userId, creationId })
            });
            return await res.json();
        } catch (Err) {
            console.error('Error unliking creation:', Err);
            return { success: false, error: Err.message };
        }
    },

    // Check if user liked creation (Via Proxy)
    async checkUserLiked(creationId, userId) {
        try {
            const res = await fetch(`/api/gallery/is_liked?userId=${userId}&creationId=${creationId}`);
            if (!res.ok) return false;
            const data = await res.json();
            return data.liked;
        } catch {
            return false;
        }
    },

    // Increment views (We can keep RPC if CORS allows, or add to proxy)
    async incrementViews(creationId) {
        try {
            // Ideally should be a proxy route, but for now we try RPC via proxying RPC eventually
            // For now, let's keep it as is or mark as TODO if it fails
            const { error } = await supabase.rpc('increment_creation_views', { p_creation_id: creationId });
            if (error) throw error;
            return { success: true };
        } catch (error) {
            return { success: false };
        }
    },

    // Get IDs of creations liked by user (Via Proxy)
    async getUserLikedIds(userId) {
        try {
            const res = await fetch(`/api/gallery/liked?userId=${userId}`);
            if (!res.ok) return [];
            return await res.json() || [];
        } catch (error) {
            console.error('Error fetching liked IDs:', error);
            return [];
        }
    },

    // Get user's creations
    async getUserCreations(userId, includePrivate = false) {
        if (!userId) return [];
        try {
            const res = await fetch(`/api/gallery/creations/user/${userId}?includePrivate=${includePrivate}`);
            if (!res.ok) throw new Error('User creations fetch failed');
            return await res.json();
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
            const initData = window.Telegram?.WebApp?.initData;
            const res = await fetch('/api/gallery/creations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-TG-Data': initData
                },
                body: JSON.stringify(payload)
            });
            return await res.json();
        } catch (error) {
            console.error('Error saving creation:', error);
            return { success: false, error: error.message };
        }
    },

    // Update creation
    async updateCreation(creationId, updates) {
        try {
            const initData = window.Telegram?.WebApp?.initData;
            const res = await fetch(`/api/gallery/creations/${creationId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-TG-Data': initData
                },
                body: JSON.stringify(updates)
            });
            return await res.json();
        } catch (error) {
            console.error('Error updating creation:', error);
            return { success: false, error: error.message };
        }
    },

    // Delete creation
    async deleteCreation(creationId) {
        try {
            const initData = window.Telegram?.WebApp?.initData;
            const res = await fetch(`/api/gallery/creations/${creationId}`, {
                method: 'DELETE',
                headers: {
                    'X-TG-Data': initData
                }
            });
            return await res.json();
        } catch (error) {
            console.error('Error deleting creation:', error);
            return { success: false, error: error.message };
        }
    },

    // Search creations (Fallback to gallery fetch with query)
    async searchCreations(query, filters = {}) {
        try {
            // Reusing getPublicCreations with extra params if backend supported it,
            // or we could add a specific search route. For now, we'll use gallery proxy.
            const res = await fetch(`/api/gallery?search=${query}&type=${filters.type || 'all'}`);
            if (!res.ok) throw new Error('Search failed');
            const data = await res.json();
            return data.creations || [];
        } catch (error) {
            console.error('Error searching creations:', error);
            return [];
        }
    },

    // --- SOCIAL & PROFILE API (Proxied) ---

    // Get public user profile with stats
    async getUserProfile(userId) {
        try {
            const res = await fetch(`/api/user/profile/${userId}`); // We should add this route to users service
            if (res.ok) return await res.json();
            
            // Fallback to basic fetch if legacy
            console.warn('⚠️ User profile proxy failed, falling back...');
            return null;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            return null;
        }
    }
};

export default galleryAPI;
