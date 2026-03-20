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
        const tgWebApp = (window as any).Telegram?.WebApp;
        const initData = tgWebApp?.initData;
        const initDataUnsafe = tgWebApp?.initDataUnsafe;

        // Skip if no auth available (e.g. local browser without mock)
        if (!initData && import.meta.env.MODE === 'production') return;

        try {
            const dataUrl = `https://api.bazzar.pixel/marketing/track`;
            const requestBody = {
                eventType: event,
                eventData: {
                    ...payload,
                    ab_tests: activeVariants, // Automatically include active experiments
                    timestamp: Date.now(),
                    userId: user?.id,
                },
                telegramId: user?.telegram_id || initDataUnsafe?.user?.id,
                initData: initData || ''
            };

            fetch(dataUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            }).catch(err => {
                if (import.meta.env.MODE === 'development') console.warn('Marketing track failed:', err);
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
