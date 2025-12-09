'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'todo-app-swipe-hint-seen';

interface UseSwipeHintReturn {
  showSwipeHint: boolean;
  dismissSwipeHint: () => void;
}

export function useSwipeHint(): UseSwipeHintReturn {
  const [showSwipeHint, setShowSwipeHint] = useState(false);

  useEffect(() => {
    const hasSeenHint = localStorage.getItem(STORAGE_KEY);
    if (!hasSeenHint) {
      setShowSwipeHint(true);
    }
  }, []);

  const dismissSwipeHint = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setShowSwipeHint(false);
  };

  return {
    showSwipeHint,
    dismissSwipeHint,
  };
}
