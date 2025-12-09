'use client';

import { useCallback, useState } from 'react';

type DialogName = string;

interface UseDialogsReturn<T extends DialogName> {
  openDialog: T | null;
  isOpen: (name: T) => boolean;
  open: (name: T) => void;
  close: () => void;
  toggle: (name: T) => void;
}

export function useDialogs<T extends DialogName>(): UseDialogsReturn<T> {
  const [openDialog, setOpenDialog] = useState<T | null>(null);

  const isOpen = useCallback((name: T) => openDialog === name, [openDialog]);

  const open = useCallback((name: T) => setOpenDialog(name), []);

  const close = useCallback(() => setOpenDialog(null), []);

  const toggle = useCallback(
    (name: T) => setOpenDialog((prev) => (prev === name ? null : name)),
    [],
  );

  return {
    openDialog,
    isOpen,
    open,
    close,
    toggle,
  };
}
