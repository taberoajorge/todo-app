import { useMemo } from 'react';
import { formatDeadline, isOverdue } from '@/shared/lib/formatters';

interface TaskDeadlineStatus {
  formattedDeadline: string | null;
  isOverdue: boolean;
}

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
