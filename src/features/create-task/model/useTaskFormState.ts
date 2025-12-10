'use client';

import { addHours, startOfDay } from 'date-fns';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Task } from '@/shared/api';
import { DEFAULTS } from '@/shared/config/constants';

interface UseTaskFormStateOptions {
  initialTask?: Task | null;
  isOpen?: boolean;
}

export function useTaskFormState(options?: UseTaskFormStateOptions) {
  const { initialTask, isOpen } = options ?? {};

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState<Date | undefined>();

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description || '');
      setDeadline(new Date(initialTask.deadline));
    }
  }, [initialTask]);

  useEffect(() => {
    if (isOpen && !deadline && !initialTask) {
      setDeadline(addHours(startOfDay(new Date()), DEFAULTS.DEADLINE_HOUR));
    }
  }, [isOpen, deadline, initialTask]);

  const hasChanges = useMemo(() => {
    if (initialTask) {
      return (
        title !== initialTask.title ||
        description !== (initialTask.description || '') ||
        deadline?.toISOString() !== initialTask.deadline
      );
    }
    return title.length > 0 || description.length > 0;
  }, [title, description, deadline, initialTask]);

  const validate = useCallback((): string | null => {
    if (!deadline) return 'Deadline is required';
    return null;
  }, [deadline]);

  const reset = useCallback(() => {
    setTitle('');
    setDescription('');
    setDeadline(undefined);
  }, []);

  const getData = useCallback(() => {
    return {
      title: title.trim() || DEFAULTS.TASK_TITLE,
      description: description.trim() || undefined,
      deadline: deadline?.toISOString() ?? '',
    };
  }, [title, description, deadline]);

  return {
    title,
    setTitle,
    description,
    setDescription,
    deadline,
    setDeadline,
    hasChanges,
    validate,
    reset,
    getData,
  };
}

export type TaskFormState = ReturnType<typeof useTaskFormState>;
