import * as Sentry from "@sentry/react";
import { onCLS, onINP, onLCP, onTTFB, onFCP } from 'web-vitals';

// Получаем версию приложения из package.json (если доступно) или хардкодим
const APP_VERSION = '1.0.0';

/**
 * Инициализация системы мониторинга
 */
export const initMonitoring = () => {
    const dsn = import.meta.env.VITE_SENTRY_DSN;

    if (dsn) {
        // Get Telegram user info for Sentry context
        const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user || window.__bazzar_auth__?.user;

        Sentry.init({
            dsn: dsn,
            integrations: [
                Sentry.browserTracingIntegration(),
                Sentry.replayIntegration(),
            ],
            // Performance Monitoring — 10% sampling in production
            tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
            tracePropagationTargets: ["localhost", /^\/api\//],

            // Session Replay
            replaysSessionSampleRate: 0.1,
            replaysOnErrorSampleRate: 1.0,

            release: `pixel-app@${APP_VERSION}`,
            environment: import.meta.env.MODE,

            // Filter noisy errors
            ignoreErrors: [
                'ResizeObserver loop',
                'Non-Error promise rejection',
                'Network request failed',
            ],
        });

        // Set user context for Sentry
        if (tgUser) {
            Sentry.setUser({
                id: String(tgUser.id),
                username: tgUser.username || undefined,
            });
        }

        console.log('✅ Sentry Initialized');
    } else {
        console.warn('⚠️ Sentry DSN not found. Monitoring is disabled.');
    }

    // Запуск сбора Web Vitals
    reportWebVitals();
};

/**
 * Отправка Web Vitals метрик
 */
const reportWebVitals = () => {
    const sendToAnalytics = ({ name, delta, id }) => {
        // В консоль для дебага
        if (import.meta.env.DEV) {
            console.log(`[Web Vitals] ${name}: ${delta.toFixed(2)}ms (ID: ${id})`);
        }

        // В Sentry как транзакцию или тег
        // Sentry автоматически собирает Vitals, но можно добавить кастомные метрики

        // Можно отправить в GA4 или другую систему аналитики здесь
    };

    onCLS(sendToAnalytics);
    onINP(sendToAnalytics);
    onFCP(sendToAnalytics);
    onLCP(sendToAnalytics);
    onTTFB(sendToAnalytics);
};

/**
 * Ручной захват ошибки
 */
export const captureError = (error, context = {}) => {
    console.error('[App Error]', error, context);
    Sentry.withScope(scope => {
        Object.keys(context).forEach(key => {
            scope.setExtra(key, context[key]);
        });
        Sentry.captureException(error);
    });
};

/**
 * Измерение производительности (Custom Transaction)
 */
export const measurePerformance = async (name, operation) => {
    const start = performance.now();
    try {
        const result = await operation();
        return result;
    } finally {
        const duration = performance.now() - start;
        if (import.meta.env.DEV) {
            console.log(`[Perf] ${name}: ${duration.toFixed(2)}ms`);
        }
        // Можно отправить кастомную метрику в Sentry
    }
};
