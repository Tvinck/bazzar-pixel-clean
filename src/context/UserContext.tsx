import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { analytics as dbAnalytics } from '../lib/supabase';
import { tracking } from '../lib/tracking';
import { aiService } from '../ai-client';
import galleryAPI from '../lib/galleryAPI';
import { useCloudStorage, CLOUD_STORAGE_KEYS } from '../hooks/useCloudStorage';

// --- TYPES ---

export interface User {
    id: string;
    telegram_id: number;
    username?: string;
    first_name?: string;
    [key: string]: any;
}

export interface UserStats {
    current_balance: number;
    total_generations: number;
    level: number;
    xp: number;
}

export interface UserProfile {
    id: string;
    [key: string]: any;
}

export interface GenerationTask {
    id: string;
    type: 'image' | 'video';
    mode: string;
    status: 'idle' | 'processing' | 'success' | 'error';
    estimatedTime: number;
    isMinimized: boolean;
    createdAt: number;
    prompt: string;
    model: string | null;
    result?: { imageUrl: string; id: string };
    error?: string;
}

export interface GlobalGenState {
    isOpen: boolean;
    type: 'image' | 'video';
    status: 'idle' | 'processing' | 'success' | 'error';
    result: any;
    cost: number;
}

interface UserContextType {
    user: User | null;
    profile: UserProfile | null;
    stats: UserStats;
    updateStats: (newStats: Partial<UserStats>) => void;
    isLoading: boolean;
    telegramId: number | null;
    refreshUser: () => Promise<void>;
    addBalance: (amount: number) => Promise<number | undefined>;
    pay: (cost: number, xpReward?: number, type?: string) => Promise<{ success: boolean; levelUp?: boolean; error?: string }>;
    activeGenerations: GenerationTask[];
    startBackgroundGeneration: (payload: any) => Promise<string>;
    minimizeTask: (id: string) => void;
    closeTask: (id: string) => void;
    recentPrompts: string[];
    favoriteTemplates: string[];
    addRecentPrompt: (prompt: string) => Promise<void>;
    toggleFavoriteTemplate: (templateId: string) => Promise<void>;
    isFavoriteTemplate: (templateId: string) => boolean;
    globalGen: GlobalGenState;
    startGlobalGen: (type?: 'image' | 'video', cost?: number) => void;
    closeGlobalGen: () => void;
    setGlobalGenResult: (result: any) => void;
}

// --- CONTEXT ---

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within UserProvider');
    }
    return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [stats, setStats] = useState<UserStats>({
        current_balance: 0,
        total_generations: 0,
        level: 1,
        xp: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [telegramId, setTelegramId] = useState<number | null>(null);

    const cloudStorage = useCloudStorage();
    const [recentPrompts, setRecentPrompts] = useState<string[]>([]);
    const [favoriteTemplates, setFavoriteTemplates] = useState<string[]>([]);
    const [activeGenerations, setActiveGenerations] = useState<GenerationTask[]>([]);

    // --- WEBSOCKET CONNECTION ---
    useEffect(() => {
        if (!user?.id || user.id === 'dev_user') return;

        let websocket: WebSocket;
        let reconnectTimer: any;

        const connectWs = () => {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            // Use same host if same-origin (production), else fallback to localhost:3000 (dev)
            const host = import.meta.env.MODE === 'production' ? window.location.host : 'localhost:3000';
            const wsUrl = `${protocol}//${host}/api/ws`;

            console.log('🔌 Connecting to WS:', wsUrl);
            websocket = new WebSocket(wsUrl);

            websocket.onopen = () => {
                websocket.send(JSON.stringify({ type: 'auth', userId: user.id }));
            };

            websocket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    if (data.type === 'generation_complete') {
                        setActiveGenerations(prev => prev.map(t =>
                            t.id === data.jobId ? { ...t, status: 'success', result: { imageUrl: data.imageUrl, id: data.jobId } } : t
                        ));
                        if ((window as any).Telegram?.WebApp?.HapticFeedback) {
                            (window as any).Telegram.WebApp.HapticFeedback.notificationOccurred('success');
                        }
                    } else if (data.type === 'generation_failed') {
                        setActiveGenerations(prev => prev.map(t =>
                            t.id === data.jobId ? { ...t, status: 'error', error: data.error || 'Generation failed' } : t
                        ));
                        if ((window as any).Telegram?.WebApp?.HapticFeedback) {
                            (window as any).Telegram.WebApp.HapticFeedback.notificationOccurred('error');
                        }
                    }
                } catch (e) {
                    console.error('WS Parse Error:', e);
                }
            };

            websocket.onclose = () => {
                console.log('🔌 WS Disconnected, reconnecting in 5s...');
                reconnectTimer = setTimeout(connectWs, 5000);
            };
        };

        connectWs();

        return () => {
            clearTimeout(reconnectTimer);
            if (websocket) websocket.close();
        };
    }, [user?.id]);

    useEffect(() => {
        const initUser = async () => {
            setIsLoading(true);
            try {
                // 1. Check for Telegram Native SDK
                const tgId = (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id;

                // 2. Check for Custom Web Browser Auth (injected by main.jsx)
                const webAuth = (window as any).__bazzar_auth__;

                const webToken = localStorage.getItem('bazzar_web_auth');

                // Path 1: Native Telegram Mini App
                if (tgId) {
                    setTelegramId(tgId);
                    const tgUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
                    tracking.identify(tgId.toString(), {
                        username: tgUser?.username,
                        language: tgUser?.language_code
                    });

                    // Start all DB calls in parallel for speed
                    const [userData, userStats, userProfile] = await Promise.all([
                        dbAnalytics.upsertUser(tgId, tgUser).catch(err => { console.error('Upsert failed', err); return null; }),
                        dbAnalytics.getUserStats(tgId).catch(err => { console.error('Stats failed', err); return null; }),
                        dbAnalytics.getUserProfile(tgId).catch(err => { console.error('Profile failed', err); return null; })
                    ]);

                    if (userData) setUser(userData);
                    if (userStats) setStats(userStats);
                    if (userProfile) setProfile(userProfile);
                }
                // Path 2: Browser Session with Web Login Widget Token
                else if (webAuth?.user?.id) {
                    console.log('🌐 Web Auth Token found via global ref, validating...');
                    try {
                        const payload = webAuth.user;
                        setTelegramId(payload.id);
                        setUser({ id: payload.id.toString(), telegram_id: payload.telegram_id || null, username: payload.username, first_name: payload.first_name });

                        const userStats = await dbAnalytics.getUserStats(payload.id);
                        if (userStats) setStats(userStats);

                        const userProfile = await dbAnalytics.getUserProfile(payload.id);
                        if (userProfile) setProfile(userProfile);
                    } catch (e) {
                        console.error('❌ Failed to parse web token state:', e);
                        localStorage.removeItem('bazzar_web_auth');
                    }
                }
                // Path 3: Legacy or Strict Web Token Fallback (if main.jsx injection failed)
                else if (webToken) {
                    console.log('🌐 Web Auth Token found in storage, processing directly...');
                    try {
                        const tokenPart = webToken.replace('web_auth:', '');
                        const payload = JSON.parse(atob(tokenPart.split('.')[1]));

                        setTelegramId(payload.id);
                        setUser({ id: payload.id.toString(), telegram_id: payload.telegram_id || null, username: payload.username, first_name: payload.first_name });

                        const userStats = await dbAnalytics.getUserStats(payload.id);
                        if (userStats) setStats(userStats);

                        const userProfile = await dbAnalytics.getUserProfile(payload.id);
                        if (userProfile) setProfile(userProfile);
                    } catch (e) {
                        console.error('❌ Failed to parse web token directly:', e);
                        localStorage.removeItem('bazzar_web_auth');
                    }
                }
                // Path 4: Dev Fallback (localhost bypass)
                else {
                    console.log('No Auth found - checking for Dev Override');
                    const isDevOverride = localStorage.getItem('bazzar_dev_override') === 'true';

                    if (isDevOverride || import.meta.env.MODE !== 'production') {
                        const devId = 603207436;
                        setTelegramId(devId);

                        try {
                            const devTgUser = {
                                id: devId,
                                first_name: 'Arty',
                                last_name: 'Dev',
                                username: 'artykosh',
                                language_code: 'ru'
                            };
                            const userData = await dbAnalytics.upsertUser(devId, devTgUser);
                            setUser(userData);

                            const realStats = await dbAnalytics.getUserStats(devId);
                            if (realStats) {
                                setStats(realStats);
                            } else {
                                // Создаём дефолтные stats если нет
                                setStats({ current_balance: 112500, total_generations: 10, level: 5, xp: 500 });
                            }

                            const userProfile = await dbAnalytics.getUserProfile(devId);
                            if (userProfile) setProfile(userProfile);
                        } catch (e) {
                            console.error('Failed to fully load Dev User from DB:', e);
                            setUser({ id: 'dev_user', telegram_id: devId, username: 'artykosh', first_name: 'Arty' });
                            setStats({ current_balance: 112500, total_generations: 10, level: 5, xp: 500 });
                        }
                    }
                }
            } catch (error) {
                console.error('User initialization error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initUser();
    }, []);

    useEffect(() => {
        const loadCloudData = async () => {
            if (!cloudStorage.isAvailable || isLoading) return;
            try {
                const savedPrompts = await cloudStorage.getItem(CLOUD_STORAGE_KEYS.RECENT_PROMPTS);
                if (savedPrompts && Array.isArray(savedPrompts)) setRecentPrompts(savedPrompts);

                const savedFavorites = await cloudStorage.getItem(CLOUD_STORAGE_KEYS.FAVORITE_TEMPLATES);
                if (savedFavorites && Array.isArray(savedFavorites)) setFavoriteTemplates(savedFavorites);
            } catch (error) {
                console.error('Error loading cloud data:', error);
            }
        };
        loadCloudData();
    }, [cloudStorage.isAvailable, isLoading]);

    const refreshUser = useCallback(async () => {
        if (!telegramId) return;
        try {
            const userStats = await dbAnalytics.getUserStats(telegramId);
            if (userStats) setStats(userStats);
        } catch (error) {
            console.error('Refresh user error:', error);
        }
    }, [telegramId]);

    const addBalance = useCallback(async (amount: number) => {
        if (!telegramId) {
            setStats(prev => ({ ...prev, current_balance: prev.current_balance + amount }));
            return stats.current_balance + amount;
        }
        const result = await dbAnalytics.addCredits(telegramId, amount);
        if (result) {
            setStats(prev => ({ ...prev, current_balance: result.current_balance }));
            return result.current_balance;
        }
    }, [telegramId, stats.current_balance]);

    const pay = useCallback(async (cost: number, xpReward = 10, type = 'generation') => {
        if (!user?.id || user.id === 'dev_user') {
            if (stats.current_balance >= cost) {
                setStats(prev => ({
                    ...prev,
                    current_balance: prev.current_balance - cost,
                    xp: prev.xp + xpReward,
                    total_generations: prev.total_generations + 1
                }));
                return { success: true };
            }
            return { success: false, error: 'Insufficient funds (Dev)' };
        }

        const result = await dbAnalytics.payForGeneration(user.id, cost, xpReward, type);
        if (result && result.success) {
            setStats(prev => ({
                ...prev,
                current_balance: result.new_balance,
                xp: result.new_xp,
                level: result.new_level,
                total_generations: prev.total_generations + 1
            }));
            return { success: true, levelUp: result.level_up };
        }
        return { success: false, error: result?.error || 'Payment failed' };
    }, [user, stats.current_balance]);

    const startBackgroundGeneration = useCallback(async (payload: any) => {
        const { mode, subType, estimatedTime, inputs, model, callbackData } = payload;
        if (activeGenerations.filter(g => g.status === 'processing').length >= 2) {
            throw new Error('Limit reached: 2 active tasks max.');
        }

        const newId = Date.now().toString();
        const newTask: GenerationTask = {
            id: newId,
            type: subType || 'image',
            mode,
            status: 'processing',
            estimatedTime,
            isMinimized: false,
            createdAt: Date.now(),
            prompt: inputs.prompt,
            model: model
        };

        setActiveGenerations(prev => [...prev, newTask]);

        (async () => {
            try {
                let result;
                if (['replace-object', 'remove-object', 'add-object'].includes(mode)) {
                    result = await (aiService as any).instructEdit(callbackData.base64Img, { ...inputs, mode });
                } else {
                    result = await aiService.generateImage(inputs.prompt, model, {
                        userId: user?.id,
                        telegramId: telegramId,
                        ...callbackData
                    });
                }

                if (result.success) {
                    let savedRecordId = result.id;
                    if (!savedRecordId) {
                        const savedRecord = await galleryAPI.saveCreation({
                            userId: user?.id || 'dev',
                            generationId: result.id || 'gen_' + Date.now(),
                            title: inputs['prompt'] ? inputs['prompt'].slice(0, 30) + '...' : 'Generated',
                            description: inputs['prompt'] || 'Generated Content',
                            imageUrl: result.imageUrl, thumbnailUrl: result.imageUrl,
                            type: subType || 'image',
                            prompt: inputs['prompt'], tags: [mode, (model as any)],
                            isPublic: callbackData.isPublic, aspectRatio: callbackData.aspectRatio
                        });
                        savedRecordId = (savedRecord as any)?.data?.id || (savedRecord as any)?.id;
                    }

                    setActiveGenerations(prev => prev.map(t =>
                        t.id === newId ? { ...t, status: 'success', result: { imageUrl: result.imageUrl, id: savedRecordId } } : t
                    ));

                    if ((window as any).Telegram?.WebApp?.HapticFeedback) {
                        (window as any).Telegram.WebApp.HapticFeedback.notificationOccurred('success');
                    }
                    if (result.newBalance !== undefined) setStats(prev => ({ ...prev, current_balance: result.newBalance }));
                } else {
                    throw new Error(result.error || 'Generation failed');
                }
            } catch (err: any) {
                console.error('Background Gen Error:', err);
                setActiveGenerations(prev => prev.map(t => t.id === newId ? { ...t, status: 'error', error: err.message } : t));
            }
        })();

        return newId;
    }, [activeGenerations, user, telegramId, stats]);

    const minimizeTask = useCallback((id: string) => {
        setActiveGenerations(prev => prev.map(t => t.id === id ? { ...t, isMinimized: true } : t));
    }, []);

    const closeTask = useCallback((id: string) => {
        setActiveGenerations(prev => prev.filter(t => t.id !== id));
    }, []);

    const updateStats = useCallback((newStats: Partial<UserStats>) => {
        setStats(prev => ({ ...prev, ...newStats }));
    }, []);

    const addRecentPrompt = useCallback(async (prompt: string) => {
        if (!prompt || typeof prompt !== 'string') return;
        const newPrompts = [prompt, ...recentPrompts.filter(p => p !== prompt)].slice(0, 20);
        setRecentPrompts(newPrompts);
        if (cloudStorage.isAvailable) await cloudStorage.setItem(CLOUD_STORAGE_KEYS.RECENT_PROMPTS, newPrompts);
    }, [recentPrompts, cloudStorage]);

    const toggleFavoriteTemplate = useCallback(async (templateId: string) => {
        const newFavorites = favoriteTemplates.includes(templateId)
            ? favoriteTemplates.filter(id => id !== templateId)
            : [...favoriteTemplates, templateId];
        setFavoriteTemplates(newFavorites);
        if (cloudStorage.isAvailable) {
            await cloudStorage.setItem(CLOUD_STORAGE_KEYS.FAVORITE_TEMPLATES, newFavorites);
            if ((window as any).Telegram?.WebApp?.HapticFeedback) {
                (window as any).Telegram.WebApp.HapticFeedback.notificationOccurred('success');
            }
        }
    }, [favoriteTemplates, cloudStorage]);

    const isFavoriteTemplate = useCallback((templateId: string) => favoriteTemplates.includes(templateId), [favoriteTemplates]);

    const [globalGen, setGlobalGen] = useState<GlobalGenState>({
        isOpen: false, type: 'image', status: 'idle', result: null, cost: 0
    });

    const startGlobalGen = useCallback((type: 'image' | 'video' = 'image', cost = 0) => {
        setGlobalGen({ isOpen: true, type, status: 'processing', result: null, cost });
    }, []);

    const setGlobalGenResult = useCallback((result: any) => {
        setGlobalGen(prev => ({ ...prev, status: 'success', result }));
    }, []);

    const closeGlobalGen = useCallback(() => {
        setGlobalGen(prev => ({ ...prev, isOpen: false, status: 'idle' }));
    }, []);

    const value: UserContextType = {
        user, profile, stats, updateStats, isLoading, telegramId, refreshUser,
        addBalance, pay, activeGenerations, startBackgroundGeneration, minimizeTask, closeTask,
        recentPrompts, favoriteTemplates, addRecentPrompt, toggleFavoriteTemplate, isFavoriteTemplate,
        globalGen, startGlobalGen, closeGlobalGen, setGlobalGenResult
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
