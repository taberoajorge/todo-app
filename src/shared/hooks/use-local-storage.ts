'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Generic hook for syncing state with localStorage
 * Handles SSR hydration mismatch safely
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, boolean] {
  const [isLoaded, setIsLoaded] = useState(false);
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Load from localStorage on mount (client only)
  useEffect(() => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
    setIsLoaded(true);
  }, [key]);

  // Persist to localStorage
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const newValue = value instanceof Function ? value(prev) : value;
        try {
          localStorage.setItem(key, JSON.stringify(newValue));
        } catch (error) {
          console.warn(`Error setting localStorage key "${key}":`, error);
        }
        return newValue;
      });
    },
    [key]
  );

  return [storedValue, setValue, isLoaded];
}

