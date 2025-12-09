import { isToday as dateFnsIsToday, isPast } from 'date-fns';

export function isToday(dateString: string): boolean {
  return dateFnsIsToday(new Date(dateString));
}

export function isOverdue(dateString: string | undefined): boolean {
  if (!dateString) return false;
  return isPast(new Date(dateString));
}

export function filterByToday<T>(items: T[], getDate: (item: T) => string): T[] {
  return items.filter((item) => isToday(getDate(item)));
}
