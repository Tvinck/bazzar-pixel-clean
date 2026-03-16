import { useCallback, useRef, useEffect, useState, MutableRefObject } from 'react';

/**
 * Debounce hook for performance optimization
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
}

/**
 * Throttle hook for scroll/resize events
 */
export function useThrottle<T extends (...args: any[]) => void>(callback: T, delay: number = 100): (...args: Parameters<T>) => void {
    const lastRun = useRef<number>(Date.now());

    return useCallback((...args: Parameters<T>) => {
        const now = Date.now();
        if (now - lastRun.current >= delay) {
            callback(...args);
            lastRun.current = now;
        }
    }, [callback, delay]);
}

/**
 * Intersection Observer hook for lazy loading
 */
export function useIntersectionObserver(options: IntersectionObserverInit = {}): [MutableRefObject<Element | null>, boolean] {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const targetRef = useRef<Element | null>(null);

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
}

/**
 * Memoized callback that doesn't change on every render
 */
export function useStableCallback<T extends (...args: any[]) => any>(callback: T): (...args: Parameters<T>) => ReturnType<T> {
    const callbackRef = useRef<T>(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    return useCallback((...args: Parameters<T>) => {
        return callbackRef.current(...args);
    }, []);
}

/**
 * Previous value hook for comparison
 */
export function usePrevious<T>(value: T): T | undefined {
    const ref = useRef<T | undefined>(undefined);

    useEffect(() => {
        ref.current = value;
    }, [value]);

    return ref.current;
}

const performanceHooks = {
    useDebounce,
    useThrottle,
    useIntersectionObserver,
    useStableCallback,
    usePrevious
};

export default performanceHooks;
