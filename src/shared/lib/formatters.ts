import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns';

/**
 * Formats a deadline string for display
 */
export function formatDeadline(deadline: string | undefined): string | null {
  if (!deadline) return null;

  const date = new Date(deadline);

  // Check for overdue FIRST, before checking today/tomorrow
  // This ensures past deadlines always show as overdue
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

/**
 * Returns true if the deadline has passed
 */
export function isOverdue(deadline: string | undefined): boolean {
  if (!deadline) return false;
  return isPast(new Date(deadline));
}

/**
 * Formats deadline for datetime-local input
 */
export function toDateTimeLocal(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

