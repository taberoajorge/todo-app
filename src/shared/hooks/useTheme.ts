'use client';

import { useTheme as useNextTheme } from 'next-themes';

/**
 * Hook for managing dark/light theme
 * Wraps next-themes for consistent API
 */
export function useTheme() {
  const { theme, setTheme, resolvedTheme, systemTheme } = useNextTheme();

  const isDark = resolvedTheme === 'dark';
  const isLight = resolvedTheme === 'light';
  const isSystem = theme === 'system';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return {
    theme,
    setTheme,
    resolvedTheme,
    systemTheme,
    isDark,
    isLight,
    isSystem,
    toggleTheme,
  };
}

