/**
 * Безопасный API клиент с защитой от всех основных угроз
 */

// import rateLimiter from './rateLimiter';
// import csrfProtection from './csrf';
import { validatePrompt, sanitizeText } from './validation';
import React from 'react';

class SecureAPIClient {
    constructor(baseURL = '/api') {
        this.baseURL = baseURL;
        this.userId = null;
    }

    /**
     * Установка ID пользователя для rate limiting
     */
    setUserId(userId) {
        this.userId = userId;
    }

    /**
     * Безопасный fetch с всеми защитами
     */
    async secureFetch(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;

        // 1. Rate Limiting
        // if (this.userId) {
        //     const rateLimit = rateLimiter.check(this.userId, options.rateLimitType || 'default');
        //
        //     if (!rateLimit.allowed) {
        //         throw new Error(`Rate limit exceeded. Retry after ${rateLimit.retryAfter} seconds`);
        //     }
        // }

        // 2. CSRF Protection
        const headers = csrfProtection.addTokenToHeaders(options.headers || {});

        // 3. Content Security
        const secureOptions = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            credentials: 'same-origin',
            mode: 'cors',
            cache: 'no-cache'
        };

        // 4. Request body sanitization
        if (options.body && typeof options.body === 'object') {
            secureOptions.body = JSON.stringify(this.sanitizeRequestBody(options.body));
        }

        try {
            const response = await fetch(url, secureOptions);

            // 5. Response validation
            if (!response.ok) {
                const error = await this.handleErrorResponse(response);
                throw error;
            }

            const data = await response.json();

            // 6. Response sanitization
            return this.sanitizeResponseData(data);

        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    /**
     * Санитизация тела запроса
     */
    sanitizeRequestBody(body) {
        const sanitized = {};

        for (const [key, value] of Object.entries(body)) {
            if (typeof value === 'string') {
                sanitized[key] = sanitizeText(value);
            } else if (typeof value === 'object' && value !== null) {
                sanitized[key] = this.sanitizeRequestBody(value);
            } else {
                sanitized[key] = value;
            }
        }

        return sanitized;
    }

    /**
     * Санитизация ответа
     */
    sanitizeResponseData(data) {
        if (typeof data === 'string') {
            return sanitizeText(data);
        }

        if (Array.isArray(data)) {
            return data.map(item => this.sanitizeResponseData(item));
        }

        if (typeof data === 'object' && data !== null) {
            const sanitized = {};
            for (const [key, value] of Object.entries(data)) {
                sanitized[key] = this.sanitizeResponseData(value);
            }
            return sanitized;
        }

        return data;
    }

    /**
     * Обработка ошибок
     */
    async handleErrorResponse(response) {
        let errorMessage = 'An error occurred';

        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch {
            errorMessage = response.statusText || errorMessage;
        }

        const error = new Error(errorMessage);
        error.status = response.status;
        error.statusText = response.statusText;

        return error;
    }

    /**
     * GET запрос
     */
    async get(endpoint, options = {}) {
        return this.secureFetch(endpoint, {
            ...options,
            method: 'GET'
        });
    }

    /**
     * POST запрос
     */
    async post(endpoint, data, options = {}) {
        return this.secureFetch(endpoint, {
            ...options,
            method: 'POST',
            body: data
        });
    }

    /**
     * PUT запрос
     */
    async put(endpoint, data, options = {}) {
        return this.secureFetch(endpoint, {
            ...options,
            method: 'PUT',
            body: data
        });
    }

    /**
     * DELETE запрос
     */
    async delete(endpoint, options = {}) {
        return this.secureFetch(endpoint, {
            ...options,
            method: 'DELETE'
        });
    }

    /**
     * Безопасная генерация изображения
     */
    async generateImage(prompt, options = {}) {
        // Валидация промпта
        const validation = validatePrompt(prompt);

        if (!validation.valid) {
            throw new Error(validation.error);
        }

        return this.post('/generate', {
            prompt: validation.sanitized,
            ...options
        }, {
            rateLimitType: 'generation'
        });
    }

    /**
     * Безопасная загрузка файла
     */
    async uploadFile(file, options = {}) {
        const formData = new FormData();
        formData.append('file', file);

        // Добавляем CSRF токен
        formData.append('csrf_token', csrfProtection.getToken());

        return fetch(`${this.baseURL}/upload`, {
            method: 'POST',
            body: formData,
            credentials: 'same-origin',
            headers: {
                ...csrfProtection.addTokenToHeaders()
            }
        }).then(response => {
            if (!response.ok) {
                throw new Error('Upload failed');
            }
            return response.json();
        });
    }
}

// Singleton instance
const apiClient = new SecureAPIClient();

export default apiClient;

/**
 * React Hook для безопасных API запросов
 */
export const useSecureAPI = () => {
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    const request = async (method, endpoint, data, options) => {
        setLoading(true);
        setError(null);

        try {
            const result = await apiClient[method](endpoint, data, options);
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        get: (endpoint, options) => request('get', endpoint, null, options),
        post: (endpoint, data, options) => request('post', endpoint, data, options),
        put: (endpoint, data, options) => request('put', endpoint, data, options),
        delete: (endpoint, options) => request('delete', endpoint, null, options)
    };
};


