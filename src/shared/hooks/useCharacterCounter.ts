'use client';

import { useCallback, useState } from 'react';

interface CharacterCounterState {
  count: number;
  setCount: (count: number) => void;
  isOverLimit: boolean;
  remaining: number;
  handleChange: (value: string) => void;
}

/**
 * Hook that manages character counting state for input fields.
 * Useful for showing character limits and validation.
 */
export function useCharacterCounter(
  initialValue: number,
  maxLength: number,
): CharacterCounterState {
  const [count, setCount] = useState(initialValue);

  const isOverLimit = count > maxLength;
  const remaining = maxLength - count;

  const handleChange = useCallback((value: string) => {
    setCount(value.length);
  }, []);

  return {
    count,
    setCount,
    isOverLimit,
    remaining,
    handleChange,
  };
}
