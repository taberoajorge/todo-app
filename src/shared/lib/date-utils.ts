export function getTodayBoundaries(): { start: Date; end: Date } {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
}

export function isToday(dateString: string): boolean {
  const { start, end } = getTodayBoundaries();
  const date = new Date(dateString);
  return date >= start && date < end;
}

export function filterByToday<T>(items: T[], getDate: (item: T) => string): T[] {
  const { start, end } = getTodayBoundaries();

  return items.filter((item) => {
    const date = new Date(getDate(item));
    return date >= start && date < end;
  });
}
