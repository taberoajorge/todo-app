import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns';

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

export function isOverdue(deadline: string | undefined): boolean {
  if (!deadline) return false;
  return isPast(new Date(deadline));
}

/** Converts Date to datetime-local input format (yyyy-MM-ddTHH:mm). */
export function toDateTimeLocal(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm");
}
