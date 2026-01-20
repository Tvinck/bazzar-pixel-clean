import { useCallback, useMemo, useRef, useEffect } from 'react';

/**
 * Debounce hook for performance optimization
 */
export const useDebounce = (value, delay = 300) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
};

/**
 * Throttle hook for scroll/resize events
 */
export const useThrottle = (callback, delay = 100) => {
    const lastRun = useRef(Date.now());

    return useCallback((...args) => {
        const now = Date.now();
        if (now - lastRun.current >= delay) {
            callback(...args);
            lastRun.current = now;
        }
    }, [callback, delay]);
};

/**
 * Intersection Observer hook for lazy loading
 */
export const useIntersectionObserver = (options = {}) => {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const targetRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            setIsIntersecting(entry.isIntersecting);
        }, {
            threshold: 0.1,
            ...options
        });

        const currentTarget = targetRef.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [options]);

    return [targetRef, isIntersecting];
};

/**
 * Memoized callback that doesn't change on every render
 */
export const useStableCallback = (callback) => {
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    return useCallback((...args) => {
        return callbackRef.current(...args);
    }, []);
};

/**
 * Previous value hook for comparison
 */
export const usePrevious = (value) => {
    const ref = useRef();

    useEffect(() => {
        ref.current = value;
    }, [value]);

    return ref.current;
};

import { useState } from 'react';

export default {
    useDebounce,
    useThrottle,
    useIntersectionObserver,
    useStableCallback,
    usePrevious
};
