import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, analytics as dbAnalytics } from '../lib/supabase';
import { tracking } from '../lib/tracking';

const UserContext = createContext();

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within UserProvider');
    }
    return context;
};

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        current_balance: 0,
        total_generations: 0,
        level: 1,
        xp: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [telegramId, setTelegramId] = useState(null);

    // Global Generation State for UI stability (Preventing React Error #310)
    const [activeGeneration, setActiveGeneration] = useState({
        showLoader: false,
        resultData: null,
        type: 'image',
        estimatedTime: 15
    });

    // Initial load
    useEffect(() => {
        const initUser = async () => {
            setIsLoading(true);
            try {
                // Get Telegram ID
                const tgId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;

                if (tgId) {
                    setTelegramId(tgId);

                    // Identify in tracking system
                    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
                    tracking.identify(tgId.toString(), {
                        username: tgUser?.username,
                        language: tgUser?.language_code
                    });

                    // Init user in DB (upsert)
                    const userData = await dbAnalytics.upsertUser(tgId, tgUser);
                    setUser(userData);

                    // Load stats
                    const userStats = await dbAnalytics.getUserStats(tgId);
                    if (userStats) {
                        setStats(userStats);
                    }
                } else {
                    console.log('No Telegram user found - using LOCAL TEST MODE');
                    // LOCAL TEST MODE - immediate mock data
                    const devId = 603207436;
                    setTelegramId(devId);

                    // Mock user object
                    setUser({
                        id: '668d4825-99d9-43c2-ad8d-71b569e29548', // ArtyKosh UUID
                        telegram_id: devId,
                        username: 'artykosh',
                        first_name: 'Arty'
                    });

                    // Mock stats
                    setStats({
                        current_balance: 112500,
                        total_generations: 10,
                        level: 5,
                        xp: 500
                    });
                }
            } catch (error) {
                console.error('User initialization error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initUser();
    }, []);

    // Refresh function to call after actions (e.g. generation)
    const refreshUser = useCallback(async () => {
        if (!telegramId) return;

        try {
            const userStats = await dbAnalytics.getUserStats(telegramId);
            if (userStats) {
                setStats(userStats);
            }
        } catch (error) {
            console.error('Refresh user error:', error);
        }
    }, [telegramId]);

    const addBalance = useCallback(async (amount) => {
        if (!telegramId) {
            // Dev mode simulation
            setStats(prev => ({ ...prev, current_balance: prev.current_balance + amount }));
            return;
        }

        const result = await dbAnalytics.addCredits(telegramId, amount);
        if (result) {
            setStats(prev => ({ ...prev, current_balance: result.current_balance }));
            return result.current_balance;
        }
    }, [telegramId]);

    const pay = useCallback(async (cost, xpReward = 10, type = 'generation') => {
        if (!user?.id) {
            // Dev mode fallback
            if (stats.current_balance >= cost) {
                setStats(prev => ({
                    ...prev,
                    current_balance: prev.current_balance - cost,
                    xp: prev.xp + xpReward,
                    total_generations: prev.total_generations + 1
                }));
                return { success: true };
            } else {
                return { success: false, error: 'Insufficient funds (Dev)' };
            }
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
        } else {
            return { success: false, error: result?.error || 'Payment failed' };
        }
    }, [user, stats.current_balance]);

    // Generation State Control
    const startGlobalGen = useCallback((type, estimatedTime) => {
        setActiveGeneration({
            showLoader: true,
            resultData: null,
            type: type || 'image',
            estimatedTime: estimatedTime || 15
        });
    }, []);

    const setGlobalGenResult = useCallback((result) => {
        setActiveGeneration(prev => ({
            ...prev,
            showLoader: false,
            resultData: result
        }));
    }, []);

    const closeGlobalGen = useCallback(() => {
        setActiveGeneration({
            showLoader: false,
            resultData: null,
            type: 'image',
            estimatedTime: 15
        });
    }, []);

    const value = {
        user,
        stats,
        isLoading,
        telegramId,
        refreshUser,
        addBalance,
        pay,
        activeGeneration,
        startGlobalGen,
        setGlobalGenResult,
        closeGlobalGen
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};
