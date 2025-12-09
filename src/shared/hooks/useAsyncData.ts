'use client';

import { useCallback, useEffect, useState } from 'react';

interface UseAsyncDataOptions<T> {
  fetchFn: () => Promise<T>;
  onError?: (error: unknown) => void;
}

interface UseAsyncDataReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
}

/**
 * Hook for loading async data with loading and error states.
 * Fetches data on mount and provides a refetch function.
 */
export function useAsyncData<T>({
  fetchFn,
  onError,
}: UseAsyncDataOptions<T>): UseAsyncDataReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, onError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
    setData,
  };
}
