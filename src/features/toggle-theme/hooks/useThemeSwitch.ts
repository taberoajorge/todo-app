'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

interface ThemeSwitchState {
  /** Whether the component has mounted (for hydration safety) */
  mounted: boolean;
  /** Whether the current theme is dark */
  isDark: boolean;
  /** Toggle between light and dark themes */
  toggle: () => void;
}

/**
 * Hook that encapsulates theme switching logic.
 * Handles hydration safety and provides a simple interface for theme toggling.
 */
export function useThemeSwitch(): ThemeSwitchState {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === 'dark';

  const toggle = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return {
    mounted,
    isDark,
    toggle,
  };
}
