import { useState } from 'react';
import apiClient from '../utils/secureAPI';

/**
 * React Hook для безопасных API запросов
 */
export const useSecureAPI = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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
