import { useState, useCallback } from 'react';

export const useLoadingState = (initialState = false) => {
  const [isLoading, setIsLoading] = useState(initialState);
  const [error, setError] = useState(null);

  const withLoading = useCallback(async (fn) => {
    try {
      setIsLoading(true);
      setError(null);
      return await fn();
    } catch (err) {
      setError(err.message || 'Что-то пошло не так');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, error, withLoading };
};
