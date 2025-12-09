import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns';

export { isOverdue } from './date-utils';

export function formatDeadline(deadline: string | undefined): string | null {
  if (!deadline) return null;

  const date = new Date(deadline);

  if (isPast(date)) {
    return `Overdue (${formatDistanceToNow(date, { addSuffix: true })})`;
  }

  if (isToday(date)) {
    return `Today at ${format(date, 'h:mm a')}`;
  }

  if (isTomorrow(date)) {
    return `Tomorrow at ${format(date, 'h:mm a')}`;
  }

  return format(date, 'MMM d, yyyy h:mm a');
}

export function toDateTimeLocal(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

export function calculateTimeProgress(createdAt: string, deadline: string): number {
  const start = new Date(createdAt).getTime();
  const end = new Date(deadline).getTime();
  const now = Date.now();

  if (end <= start) return 0;

  if (now <= start) return 0;

  if (now >= end) return 100;

  const total = end - start;
  const elapsed = now - start;
  return Math.round((elapsed / total) * 100);
}
