import { useMemo } from 'react';
import { formatDeadline, isOverdue } from '@/shared/lib/formatters';

interface TaskDeadlineStatus {
  /** Formatted deadline string for display, null if no deadline */
  formattedDeadline: string | null;
  /** Whether the deadline has passed and task is not completed */
  isOverdue: boolean;
}

/**
 * Hook that computes deadline display status for a task.
 * Memoizes the computed values for performance.
 */
export function useTaskDeadlineStatus(
  deadline: string | undefined,
  completed: boolean,
): TaskDeadlineStatus {
  return useMemo(
    () => ({
      formattedDeadline: formatDeadline(deadline),
      isOverdue: isOverdue(deadline) && !completed,
    }),
    [deadline, completed],
  );
}
