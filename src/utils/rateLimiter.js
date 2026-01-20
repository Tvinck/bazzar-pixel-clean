/**
 * Rate Limiter для защиты от спама и DDoS атак
 */

class RateLimiter {
    constructor() {
        this.requests = new Map();
        this.limits = {
            // API endpoints
            generation: { max: 10, window: 60000 }, // 10 запросов в минуту
            search: { max: 30, window: 60000 }, // 30 запросов в минуту
            upload: { max: 5, window: 60000 }, // 5 загрузок в минуту
            auth: { max: 5, window: 300000 }, // 5 попыток входа в 5 минут
            default: { max: 60, window: 60000 } // 60 запросов в минуту по умолчанию
        };
    }

    /**
     * Проверяет, можно ли выполнить запрос
     * @param {string} key - Уникальный ключ (userId, IP, endpoint)
     * @param {string} type - Тип запроса (generation, search, upload, etc.)
     * @returns {Object} { allowed: boolean, remaining: number, resetAt: number }
     */
    check(key, type = 'default') {
        const limit = this.limits[type] || this.limits.default;
        const now = Date.now();
        const userKey = `${key}:${type}`;

        if (!this.requests.has(userKey)) {
            this.requests.set(userKey, []);
        }

        const userRequests = this.requests.get(userKey);

        // Удаляем старые запросы за пределами окна
        const validRequests = userRequests.filter(
            timestamp => now - timestamp < limit.window
        );

        this.requests.set(userKey, validRequests);

        // Проверяем лимит
        if (validRequests.length >= limit.max) {
            const oldestRequest = Math.min(...validRequests);
            const resetAt = oldestRequest + limit.window;

            return {
                allowed: false,
                remaining: 0,
                resetAt,
                retryAfter: Math.ceil((resetAt - now) / 1000)
            };
        }

        // Добавляем новый запрос
        validRequests.push(now);
        this.requests.set(userKey, validRequests);

        return {
            allowed: true,
            remaining: limit.max - validRequests.length,
            resetAt: now + limit.window
        };
    }

    /**
     * Очистка старых записей (вызывать периодически)
     */
    cleanup() {
        const now = Date.now();
        for (const [key, requests] of this.requests.entries()) {
            const type = key.split(':')[1] || 'default';
            const limit = this.limits[type] || this.limits.default;

            const validRequests = requests.filter(
                timestamp => now - timestamp < limit.window
            );

            if (validRequests.length === 0) {
                this.requests.delete(key);
            } else {
                this.requests.set(key, validRequests);
            }
        }
    }

    /**
     * Сброс лимита для конкретного ключа
     */
    reset(key, type = 'default') {
        const userKey = `${key}:${type}`;
        this.requests.delete(userKey);
    }
}

// Singleton instance
const rateLimiter = new RateLimiter();

// Автоматическая очистка каждые 5 минут
setInterval(() => rateLimiter.cleanup(), 5 * 60 * 1000);

export default rateLimiter;

/**
 * React Hook для использования в компонентах
 */
export const useRateLimit = (userId, type = 'default') => {
    const checkLimit = () => {
        return rateLimiter.check(userId, type);
    };

    return { checkLimit };
};

/**
 * Middleware для API запросов
 */
export const rateLimitMiddleware = (userId, type = 'default') => {
    const result = rateLimiter.check(userId, type);

    if (!result.allowed) {
        const error = new Error('Rate limit exceeded');
        error.statusCode = 429;
        error.retryAfter = result.retryAfter;
        throw error;
    }

    return result;
};
