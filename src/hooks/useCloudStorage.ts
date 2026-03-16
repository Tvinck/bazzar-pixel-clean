import { useState, useEffect, useCallback } from 'react';

export interface CloudStorageHook {
    isAvailable: boolean;
    setItem: (key: string, value: any) => Promise<boolean>;
    getItem: (key: string, parseJSON?: boolean) => Promise<any>;
    getItems: (keys: string[]) => Promise<Record<string, any>>;
    removeItem: (key: string) => Promise<boolean>;
    removeItems: (keys: string[]) => Promise<boolean>;
    getKeys: () => Promise<string[]>;
}

/**
 * Hook for working with Telegram Cloud Storage
 * Provides methods to save and retrieve data from Telegram's cloud storage
 */
export const useCloudStorage = (): CloudStorageHook => {
    const [isAvailable, setIsAvailable] = useState(false);

    useEffect(() => {
        const tg = (window as any).Telegram?.WebApp;
        if (tg?.CloudStorage && tg.isVersionAtLeast && tg.isVersionAtLeast('6.9')) {
            setIsAvailable(true);
            console.log('✅ Telegram Cloud Storage available');
        } else {
            console.warn('⚠️ Telegram Cloud Storage not available (Requires v6.9+)');
            setIsAvailable(false);
        }
    }, []);

    const setItem = useCallback(async (key: string, value: any): Promise<boolean> => {
        if (!isAvailable) {
            console.warn('Cloud Storage not available');
            return false;
        }

        try {
            const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

            return new Promise((resolve) => {
                (window as any).Telegram.WebApp.CloudStorage.setItem(key, stringValue, (error: any, _success: boolean) => {
                    if (error) {
                        console.error(`❌ Failed to save ${key}:`, error);
                        resolve(false);
                    } else {
                        console.log(`✅ Saved to cloud: ${key}`);
                        resolve(true);
                    }
                });
            });
        } catch (error) {
            console.error('Error saving to cloud storage:', error);
            return false;
        }
    }, [isAvailable]);

    const getItem = useCallback(async (key: string, parseJSON = true): Promise<any> => {
        if (!isAvailable) {
            console.warn('Cloud Storage not available');
            return null;
        }

        try {
            return new Promise((resolve) => {
                (window as any).Telegram.WebApp.CloudStorage.getItem(key, (error: any, value: string) => {
                    if (error) {
                        console.error(`❌ Failed to get ${key}:`, error);
                        resolve(null);
                    } else if (!value) {
                        resolve(null);
                    } else {
                        try {
                            const parsedValue = parseJSON ? JSON.parse(value) : value;
                            resolve(parsedValue);
                        } catch (parseError) {
                            console.error(`❌ Failed to parse ${key}:`, parseError);
                            resolve(value);
                        }
                    }
                });
            });
        } catch (error) {
            console.error('Error getting from cloud storage:', error);
            return null;
        }
    }, [isAvailable]);

    const getItems = useCallback(async (keys: string[]): Promise<Record<string, any>> => {
        if (!isAvailable) {
            console.warn('Cloud Storage not available');
            return {};
        }

        try {
            return new Promise((resolve) => {
                (window as any).Telegram.WebApp.CloudStorage.getItems(keys, (error: any, values: Record<string, string>) => {
                    if (error) {
                        console.error('❌ Failed to get items:', error);
                        resolve({});
                    } else {
                        const parsedValues: Record<string, any> = {};
                        Object.keys(values).forEach(key => {
                            try {
                                parsedValues[key] = JSON.parse(values[key]);
                            } catch {
                                parsedValues[key] = values[key];
                            }
                        });
                        resolve(parsedValues);
                    }
                });
            });
        } catch (error) {
            console.error('Error getting items from cloud storage:', error);
            return {};
        }
    }, [isAvailable]);

    const removeItem = useCallback(async (key: string): Promise<boolean> => {
        if (!isAvailable) {
            console.warn('Cloud Storage not available');
            return false;
        }

        try {
            return new Promise((resolve) => {
                (window as any).Telegram.WebApp.CloudStorage.removeItem(key, (error: any, _success: boolean) => {
                    if (error) {
                        console.error(`❌ Failed to remove ${key}:`, error);
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                });
            });
        } catch (error) {
            console.error('Error removing from cloud storage:', error);
            return false;
        }
    }, [isAvailable]);

    const removeItems = useCallback(async (keys: string[]): Promise<boolean> => {
        if (!isAvailable) {
            console.warn('Cloud Storage not available');
            return false;
        }

        try {
            return new Promise((resolve) => {
                (window as any).Telegram.WebApp.CloudStorage.removeItems(keys, (error: any, _success: boolean) => {
                    if (error) {
                        console.error('❌ Failed to remove items:', error);
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                });
            });
        } catch (error) {
            console.error('Error removing items from cloud storage:', error);
            return false;
        }
    }, [isAvailable]);

    const getKeys = useCallback(async (): Promise<string[]> => {
        if (!isAvailable) {
            console.warn('Cloud Storage not available');
            return [];
        }

        try {
            return new Promise((resolve) => {
                (window as any).Telegram.WebApp.CloudStorage.getKeys((error: any, keys: string[]) => {
                    if (error) {
                        console.error('❌ Failed to get keys:', error);
                        resolve([]);
                    } else {
                        resolve(keys);
                    }
                });
            });
        } catch (error) {
            console.error('Error getting keys from cloud storage:', error);
            return [];
        }
    }, [isAvailable]);

    return {
        isAvailable,
        setItem,
        getItem,
        getItems,
        removeItem,
        removeItems,
        getKeys
    };
};

export const CLOUD_STORAGE_KEYS = {
    USER_PREFERENCES: 'user_preferences',
    RECENT_PROMPTS: 'recent_prompts',
    FAVORITE_TEMPLATES: 'favorite_templates',
    GENERATION_HISTORY: 'generation_history',
    THEME_SETTINGS: 'theme_settings',
    LANGUAGE: 'language',
    NOTIFICATIONS: 'notifications'
};
