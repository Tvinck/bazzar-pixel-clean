import { useEffect, useRef, useCallback } from 'react';
import { useABTestContext } from '../context/ABTestContext';

const API_URL = (import.meta as any).env.VITE_API_URL || '';

export interface MarketingEventPayload {
    [key: string]: any;
}

export const useMarketing = (user: any) => {
    const hasTrackedStart = useRef(false);
    const { activeVariants } = useABTestContext();

    const trackEvent = useCallback(async (event: string, payload: MarketingEventPayload = {}) => {
        const initData = (window as any).Telegram?.WebApp?.initData;

        // Skip if no auth available (e.g. local browser without mock)
        if (!initData && process.env.NODE_ENV === 'production') return;

        try {
            fetch(`${API_URL}/api/user/marketing/track`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-TG-Data': initData
                },
                body: JSON.stringify({
                    userId: user?.id,
                    event,
                    timestamp: Date.now(),
                    ab_tests: activeVariants, // Automatically include active experiments
                    ...payload
                })
            }).catch(err => {
                if (process.env.NODE_ENV === 'development') console.warn('Marketing track failed:', err);
            });
        } catch (e) {
            // Ignore
        }
    }, [user, activeVariants]);

    /**
     * Track funnel progress
     */
    const trackFunnel = useCallback((funnelName: string, step: string, payload: MarketingEventPayload = {}) => {
        trackEvent(`funnel_${funnelName}`, {
            funnel: funnelName,
            step,
            ...payload
        });
    }, [trackEvent]);

    // Auto-track session start
    useEffect(() => {
        const tg = (window as any).Telegram?.WebApp;
        const telegramId = user?.telegram_id || tg?.initDataUnsafe?.user?.id;

        if (telegramId && !hasTrackedStart.current) {
            trackEvent('session_start', {
                platform: tg?.platform || 'unknown',
                startParam: tg?.initDataUnsafe?.start_param
            });
            hasTrackedStart.current = true;
        }
    }, [user, trackEvent]);

    return { trackEvent, trackFunnel };
};
