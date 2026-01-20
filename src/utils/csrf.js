/**
 * CSRF (Cross-Site Request Forgery) Protection
 */
import React from 'react';

class CSRFProtection {
    constructor() {
        this.tokenKey = 'csrf_token';
        this.headerName = 'X-CSRF-Token';
    }

    /**
     * Генерация CSRF токена
     */
    generateToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');

        // Сохраняем в sessionStorage
        sessionStorage.setItem(this.tokenKey, token);

        return token;
    }

    /**
     * Получение текущего токена
     */
    getToken() {
        let token = sessionStorage.getItem(this.tokenKey);

        if (!token) {
            token = this.generateToken();
        }

        return token;
    }

    /**
     * Валидация токена
     */
    validateToken(token) {
        const storedToken = sessionStorage.getItem(this.tokenKey);
        return storedToken === token;
    }

    /**
     * Обновление токена (после каждого запроса)
     */
    rotateToken() {
        return this.generateToken();
    }

    /**
     * Добавление токена в headers запроса
     */
    addTokenToHeaders(headers = {}) {
        return {
            ...headers,
            [this.headerName]: this.getToken()
        };
    }

    /**
     * Middleware для fetch запросов
     */
    protectedFetch(url, options = {}) {
        const token = this.getToken();

        const protectedOptions = {
            ...options,
            headers: {
                ...options.headers,
                [this.headerName]: token
            },
            credentials: 'same-origin' // Важно для CSRF защиты
        };

        return fetch(url, protectedOptions).then(response => {
            // Ротация токена после успешного запроса
            if (response.ok) {
                this.rotateToken();
            }
            return response;
        });
    }
}

// Singleton instance
const csrfProtection = new CSRFProtection();

export default csrfProtection;

/**
 * React Hook для CSRF защиты
 */
export const useCSRF = () => {
    const [token, setToken] = React.useState(csrfProtection.getToken());

    React.useEffect(() => {
        // Генерируем новый токен при монтировании
        const newToken = csrfProtection.generateToken();
        setToken(newToken);
    }, []);

    const getToken = () => csrfProtection.getToken();
    const rotateToken = () => {
        const newToken = csrfProtection.rotateToken();
        setToken(newToken);
        return newToken;
    };

    return { token, getToken, rotateToken };
};

/**
 * HOC для защиты компонентов
 */
export const withCSRFProtection = (WrappedComponent) => {
    return function CSRFProtectedComponent(props) {
        const { token, getToken } = useCSRF();

        return React.createElement(WrappedComponent, {
            ...props,
            csrfToken: token,
            getCSRFToken: getToken
        });
    };
};

/**
 * Axios interceptor для автоматического добавления CSRF токена
 */
export const setupCSRFInterceptor = (axiosInstance) => {
    axiosInstance.interceptors.request.use(
        (config) => {
            const token = csrfProtection.getToken();
            config.headers[csrfProtection.headerName] = token;
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    axiosInstance.interceptors.response.use(
        (response) => {
            // Ротация токена после успешного запроса
            csrfProtection.rotateToken();
            return response;
        },
        (error) => {
            return Promise.reject(error);
        }
    );
};


