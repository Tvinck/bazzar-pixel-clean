/**
 * Tracking System (Frontend Analytics)
 * Единая точка входа для всей аналитики поведения в приложении.
 * Позволяет легко подключать GA4, PostHog, Amplitude, LogRocket и т.д.
 */

class TrackingService {
    constructor() {
        this.initialized = false;
        this.userId = null;
        this.userTraits = {};
    }

    init() {
        if (this.initialized) return;
        this.initialized = true;
        console.log('📊 Tracking Service Initialized');
    }

    identify(userId, traits = {}) {
        this.userId = userId;
        this.userTraits = traits;
        console.log(`[Tracking] Identify: ${userId}`, traits);

        if (window.Sentry) {
            window.Sentry.setUser({ id: userId, ...traits });
        }
    }

    track(eventName, properties = {}) {
        try {
            const eventData = {
                timestamp: new Date().toISOString(),
                ...properties
            };

            if (import.meta.env.DEV) {
                console.log(`[Tracking] Track: ${eventName}`, eventData);
            }

            if (window.Sentry) {
                window.Sentry.addBreadcrumb({
                    category: 'user-action',
                    message: eventName,
                    data: properties,
                    level: 'info',
                });
            }
        } catch (error) {
            console.warn('[Tracking] Failed to track event:', eventName, error);
        }
    }

    pageView(pageName, properties = {}) {
        this.track('page_view', { page: pageName, ...properties });
    }

    reset() {
        this.userId = null;
        this.userTraits = {};
        if (window.Sentry) {
            window.Sentry.configureScope(scope => scope.setUser(null));
        }
    }
}

export const tracking = new TrackingService();

export const EVENTS = {
    LOGIN_SUCCESS: 'auth_login_success',
    LOGIN_ERROR: 'auth_login_error',
    SIGNUP_START: 'auth_signup_start',
    GENERATION_STARTED: 'gen_started',
    GENERATION_COMPLETED: 'gen_completed',
    GENERATION_FAILED: 'gen_failed',
    GENERATION_CANCELED: 'gen_canceled',
    TAB_CHANGED: 'ui_tab_changed',
    THEME_CHANGED: 'ui_theme_changed',
    MODAL_OPENED: 'ui_modal_opened',
    BUTTON_CLICKED: 'ui_button_clicked',
    TRAINING_STARTED: 'feature_training_started',
    FACESWAP_STARTED: 'feature_faceswap_started',
};

import { useEffect } from 'react';

export const useTracking = () => {
    return {
        track: (name, props) => tracking.track(name, props),
        identify: (id, traits) => tracking.identify(id, traits),
        events: EVENTS
    };
};
