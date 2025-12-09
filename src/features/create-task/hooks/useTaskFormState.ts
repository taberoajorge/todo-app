'use client';

import { useActionState, useCallback, useEffect, useRef } from 'react';
import type { Task, TaskInput } from '@/shared/api';
import { TASK_LIMITS } from '@/shared/config/constants';
import { useCharacterCounter, useKeyboardShortcut } from '@/shared/hooks';

interface FormState {
  error: string | null;
  success: boolean;
}

type ValidationResult = { success: true; input: TaskInput } | { success: false; error: string };

function validateTaskInput(formData: FormData): ValidationResult {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;

  if (!title.trim()) {
    return { success: false, error: 'Title is required' };
  }

  if (title.length > TASK_LIMITS.TITLE_MAX) {
    return { success: false, error: `Title must be ${TASK_LIMITS.TITLE_MAX} characters or less` };
  }

  if (description && description.length > TASK_LIMITS.DESCRIPTION_MAX) {
    return {
      success: false,
      error: `Description must be ${TASK_LIMITS.DESCRIPTION_MAX} characters or less`,
    };
  }

  return {
    success: true,
    input: {
      title: title.trim(),
      description: description?.trim() || undefined,
      deadline: (formData.get('deadline') as string) || undefined,
    },
  };
}

interface UseTaskFormStateParams {
  editingTask?: Task | null;
  onSubmit: (input: TaskInput) => Promise<Task>;
}

/**
 * Hook that encapsulates all TaskForm state and logic.
 * Includes form validation, character counting, and keyboard shortcuts.
 */
export function useTaskFormState({ editingTask, onSubmit }: UseTaskFormStateParams) {
  const formRef = useRef<HTMLFormElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  // Character counters
  const titleCounter = useCharacterCounter(editingTask?.title?.length ?? 0, TASK_LIMITS.TITLE_MAX);
  const descCounter = useCharacterCounter(
    editingTask?.description?.length ?? 0,
    TASK_LIMITS.DESCRIPTION_MAX,
  );

  // Form action state
  const [state, formAction] = useActionState<FormState, FormData>(
    async (_prevState, formData) => {
      const validation = validateTaskInput(formData);

      if (!validation.success) {
        return { error: validation.error, success: false };
      }

      try {
        await onSubmit(validation.input);
        formRef.current?.reset();
        titleCounter.setCount(0);
        descCounter.setCount(0);
        return { error: null, success: true };
      } catch {
        return { error: 'Failed to save task', success: false };
      }
    },
    { error: null, success: false },
  );

  // Focus title input when editing starts
  useEffect(() => {
    if (editingTask) {
      titleRef.current?.focus();
    }
  }, [editingTask]);

  // Keyboard shortcut: Ctrl/Cmd + N to focus title input
  const focusTitle = useCallback(() => {
    titleRef.current?.focus();
  }, []);

  useKeyboardShortcut('n', focusTitle, { ctrlOrMeta: true });

  return {
    formRef,
    titleRef,
    state,
    formAction,
    titleCounter,
    descCounter,
  };
}
