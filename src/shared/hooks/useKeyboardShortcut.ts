'use client';

import { useEffect } from 'react';

interface KeyboardShortcutOptions {
  /** Require Ctrl key (Windows/Linux) */
  ctrl?: boolean;
  /** Require Meta/Cmd key (macOS) */
  meta?: boolean;
  /** Require either Ctrl or Meta key */
  ctrlOrMeta?: boolean;
  /** Require Shift key */
  shift?: boolean;
  /** Require Alt key */
  alt?: boolean;
  /** Prevent default browser behavior */
  preventDefault?: boolean;
}

/**
 * Hook that registers a keyboard shortcut.
 * Automatically cleans up the event listener on unmount.
 *
 * @param key - The key to listen for (e.g., 'n', 'Enter', 'Escape')
 * @param callback - Function to call when the shortcut is triggered
 * @param options - Modifier key requirements
 */
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options: KeyboardShortcutOptions = {},
) {
  const {
    ctrl = false,
    meta = false,
    ctrlOrMeta = false,
    shift = false,
    alt = false,
    preventDefault = true,
  } = options;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== key.toLowerCase()) return;
      if (ctrlOrMeta && !e.ctrlKey && !e.metaKey) return;
      if (ctrl && !e.ctrlKey) return;
      if (meta && !e.metaKey) return;
      if (shift && !e.shiftKey) return;
      if (alt && !e.altKey) return;

      if (preventDefault) e.preventDefault();
      callback();
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, callback, ctrl, meta, ctrlOrMeta, shift, alt, preventDefault]);
}
