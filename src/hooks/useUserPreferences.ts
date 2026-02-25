import { useState, useEffect, useCallback } from 'react';
import { useCloudStorage, CLOUD_STORAGE_KEYS } from './useCloudStorage';

// --- TYPES ---

export interface UserPreferences {
    theme: string;
    language: string;
    notifications: boolean;
    autoSave: boolean;
    hapticFeedback: boolean;
    soundEffects: boolean;
}

// --- HOOKS ---

/**
 * Hook for managing user preferences with Telegram Cloud Storage
 * Automatically syncs preferences across devices
 */
export const useUserPreferences = () => {
    const { isAvailable, setItem, getItem } = useCloudStorage();

    const [preferences, setPreferences] = useState<UserPreferences>({
        theme: 'dark',
        language: 'ru',
        notifications: true,
        autoSave: true,
        hapticFeedback: true,
        soundEffects: false
    });

    const [isLoading, setIsLoading] = useState(true);

    // Load preferences from cloud storage on mount
    useEffect(() => {
        const loadPreferences = async () => {
            if (!isAvailable) {
                setIsLoading(false);
                return;
            }

            try {
                const savedPrefs = await getItem(CLOUD_STORAGE_KEYS.USER_PREFERENCES);
                if (savedPrefs) {
                    setPreferences(prev => ({ ...prev, ...savedPrefs }));
                    console.log('✅ Loaded user preferences from cloud');
                }
            } catch (error) {
                console.error('Error loading preferences:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadPreferences();
    }, [isAvailable, getItem]);

    // Save preferences to cloud storage
    const savePreferences = useCallback(async (newPrefs: Partial<UserPreferences>) => {
        const updatedPrefs = { ...preferences, ...newPrefs };
        setPreferences(updatedPrefs);

        if (isAvailable) {
            await setItem(CLOUD_STORAGE_KEYS.USER_PREFERENCES, updatedPrefs);
        }
    }, [preferences, isAvailable, setItem]);

    // Update single preference
    const updatePreference = useCallback(async (key: keyof UserPreferences, value: any) => {
        await savePreferences({ [key]: value });
    }, [savePreferences]);

    return {
        preferences,
        isLoading,
        savePreferences,
        updatePreference
    };
};

/**
 * Hook for managing recent prompts with Cloud Storage
 */
export const useRecentPrompts = (maxPrompts = 20) => {
    const { isAvailable, setItem, getItem } = useCloudStorage();
    const [prompts, setPrompts] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadPrompts = async () => {
            if (!isAvailable) {
                setIsLoading(false);
                return;
            }

            try {
                const savedPrompts = await getItem(CLOUD_STORAGE_KEYS.RECENT_PROMPTS);
                if (savedPrompts && Array.isArray(savedPrompts)) {
                    setPrompts(savedPrompts);
                }
            } catch (error) {
                console.error('Error loading recent prompts:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadPrompts();
    }, [isAvailable, getItem]);

    const addPrompt = useCallback(async (prompt: string) => {
        if (!prompt || typeof prompt !== 'string') return;

        const newPrompts = [
            prompt,
            ...prompts.filter(p => p !== prompt)
        ].slice(0, maxPrompts);

        setPrompts(newPrompts);

        if (isAvailable) {
            await setItem(CLOUD_STORAGE_KEYS.RECENT_PROMPTS, newPrompts);
        }
    }, [prompts, maxPrompts, isAvailable, setItem]);

    const clearPrompts = useCallback(async () => {
        setPrompts([]);
        if (isAvailable) {
            await setItem(CLOUD_STORAGE_KEYS.RECENT_PROMPTS, []);
        }
    }, [isAvailable, setItem]);

    return {
        prompts,
        isLoading,
        addPrompt,
        clearPrompts
    };
};

/**
 * Hook for managing favorite templates with Cloud Storage
 */
export const useFavoriteTemplates = () => {
    const { isAvailable, setItem, getItem } = useCloudStorage();
    const [favorites, setFavorites] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadFavorites = async () => {
            if (!isAvailable) {
                setIsLoading(false);
                return;
            }

            try {
                const savedFavorites = await getItem(CLOUD_STORAGE_KEYS.FAVORITE_TEMPLATES);
                if (savedFavorites && Array.isArray(savedFavorites)) {
                    setFavorites(savedFavorites);
                }
            } catch (error) {
                console.error('Error loading favorite templates:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadFavorites();
    }, [isAvailable, getItem]);

    const toggleFavorite = useCallback(async (templateId: string) => {
        const newFavorites = favorites.includes(templateId)
            ? favorites.filter(id => id !== templateId)
            : [...favorites, templateId];

        setFavorites(newFavorites);

        if (isAvailable) {
            await setItem(CLOUD_STORAGE_KEYS.FAVORITE_TEMPLATES, newFavorites);
        }
    }, [favorites, isAvailable, setItem]);

    const isFavorite = useCallback((templateId: string) => {
        return favorites.includes(templateId);
    }, [favorites]);

    const clearFavorites = useCallback(async () => {
        setFavorites([]);
        if (isAvailable) {
            await setItem(CLOUD_STORAGE_KEYS.FAVORITE_TEMPLATES, []);
        }
    }, [isAvailable, setItem]);

    return {
        favorites,
        isLoading,
        toggleFavorite,
        isFavorite,
        clearFavorites
    };
};
