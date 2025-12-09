'use client';

import { useCallback, useState } from 'react';

interface DialogState<T> {
  data: T | null;
  isOpen: boolean;
  open: (data: T) => void;
  close: () => void;
  setOpen: (open: boolean) => void;
}

export function useDialogState<T>(): DialogState<T> {
  const [data, setData] = useState<T | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback((newData: T) => {
    setData(newData);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setData(null);
  }, []);

  const setOpen = useCallback((open: boolean) => {
    setIsOpen(open);
    if (!open) setData(null);
  }, []);

  return {
    data,
    isOpen,
    open,
    close,
    setOpen,
  };
}
