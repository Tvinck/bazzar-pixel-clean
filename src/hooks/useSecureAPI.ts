import { useState } from 'react';
import apiClient from '../utils/secureAPI';

// --- TYPES ---

export interface SecureAPIHook {
    loading: boolean;
    error: string | null;
    get: <T = any>(endpoint: string, options?: any) => Promise<T>;
    post: <T = any>(endpoint: string, data?: any, options?: any) => Promise<T>;
    put: <T = any>(endpoint: string, data?: any, options?: any) => Promise<T>;
    delete: <T = any>(endpoint: string, options?: any) => Promise<T>;
}

/**
 * React Hook for secure API requests
 */
export const useSecureAPI = (): SecureAPIHook => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const request = async (method: 'get' | 'post' | 'put' | 'delete', endpoint: string, data: any, options: any) => {
        setLoading(true);
        setError(null);

        try {
            const result = await (apiClient as any)[method](endpoint, data, options);
            return result;
        } catch (err: any) {
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
