import type { KeyboardEvent, RefObject } from 'react';

type KeyboardHandler = (e: KeyboardEvent) => void;

export function createEnterHandler(nextRef: RefObject<HTMLElement | null>): KeyboardHandler {
  return (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      nextRef.current?.focus();
    }
  };
}
