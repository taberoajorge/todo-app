'use client';

import { useCallback, useState } from 'react';

interface UseFormModalOptions<T> {
  onSubmit: (data: T) => Promise<void>;
  onClose?: () => void;
  confirmDiscard?: boolean;
}

interface UseFormModalReturn<T> {
  isSubmitting: boolean;
  error: string;
  setError: (error: string) => void;
  clearError: () => void;
  handleSubmit: (data: T) => Promise<boolean>;
  handleOpenChange: (open: boolean, hasChanges: boolean) => boolean;
  reset: () => void;
}

export function useFormModal<T>({
  onSubmit,
  onClose,
  confirmDiscard = true,
}: UseFormModalOptions<T>): UseFormModalReturn<T> {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const clearError = useCallback(() => setError(''), []);

  const reset = useCallback(() => {
    setIsSubmitting(false);
    setError('');
  }, []);

  const handleSubmit = useCallback(
    async (data: T): Promise<boolean> => {
      setIsSubmitting(true);
      setError('');

      try {
        await onSubmit(data);
        reset();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmit, reset],
  );

  const handleOpenChange = useCallback(
    (open: boolean, hasChanges: boolean): boolean => {
      if (!open && hasChanges && confirmDiscard) {
        if (!window.confirm('You have unsaved changes. Discard them?')) {
          return false;
        }
      }
      if (!open) {
        reset();
        onClose?.();
      }
      return true;
    },
    [confirmDiscard, reset, onClose],
  );

  return {
    isSubmitting,
    error,
    setError,
    clearError,
    handleSubmit,
    handleOpenChange,
    reset,
  };
}
