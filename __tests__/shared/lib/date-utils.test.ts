import { filterByToday, getTodayBoundaries, isToday } from '@/shared/lib/date-utils';

describe('date-utils', () => {
  describe('getTodayBoundaries', () => {
    it('should return start of today at midnight', () => {
      const { start } = getTodayBoundaries();

      expect(start.getHours()).toBe(0);
      expect(start.getMinutes()).toBe(0);
      expect(start.getSeconds()).toBe(0);
      expect(start.getMilliseconds()).toBe(0);
    });

    it('should return end as start of tomorrow', () => {
      const { start, end } = getTodayBoundaries();

      const expectedEnd = new Date(start);
      expectedEnd.setDate(expectedEnd.getDate() + 1);

      expect(end.getTime()).toBe(expectedEnd.getTime());
    });

    it('should have end exactly 24 hours after start', () => {
      const { start, end } = getTodayBoundaries();
      const diff = end.getTime() - start.getTime();
      const oneDayMs = 24 * 60 * 60 * 1000;

      expect(diff).toBe(oneDayMs);
    });
  });

  describe('isToday', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-06-15T12:00:00'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return true for dates today', () => {
      expect(isToday('2024-06-15T00:00:00')).toBe(true);
      expect(isToday('2024-06-15T12:00:00')).toBe(true);
      expect(isToday('2024-06-15T23:59:59')).toBe(true);
    });

    it('should return false for dates yesterday', () => {
      expect(isToday('2024-06-14T23:59:59')).toBe(false);
      expect(isToday('2024-06-14T12:00:00')).toBe(false);
    });

    it('should return false for dates tomorrow', () => {
      expect(isToday('2024-06-16T00:00:00')).toBe(false);
      expect(isToday('2024-06-16T12:00:00')).toBe(false);
    });

    it('should return false for dates far in the past', () => {
      expect(isToday('2020-01-01T12:00:00')).toBe(false);
    });

    it('should return false for dates far in the future', () => {
      expect(isToday('2030-12-31T12:00:00')).toBe(false);
    });
  });

  describe('filterByToday', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-06-15T12:00:00'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    interface TestItem {
      id: string;
      date: string;
    }

    const getDate = (item: TestItem) => item.date;

    it('should return empty array for empty input', () => {
      const result = filterByToday<TestItem>([], getDate);
      expect(result).toEqual([]);
    });

    it('should filter items to only those with today dates', () => {
      const items: TestItem[] = [
        { id: '1', date: '2024-06-14T12:00:00' }, // yesterday
        { id: '2', date: '2024-06-15T08:00:00' }, // today
        { id: '3', date: '2024-06-15T18:00:00' }, // today
        { id: '4', date: '2024-06-16T12:00:00' }, // tomorrow
      ];

      const result = filterByToday(items, getDate);

      expect(result).toHaveLength(2);
      expect(result.map((i) => i.id)).toEqual(['2', '3']);
    });

    it('should return all items if all are today', () => {
      const items: TestItem[] = [
        { id: '1', date: '2024-06-15T00:00:00' },
        { id: '2', date: '2024-06-15T12:00:00' },
        { id: '3', date: '2024-06-15T23:59:59' },
      ];

      const result = filterByToday(items, getDate);

      expect(result).toHaveLength(3);
    });

    it('should return empty array if no items are today', () => {
      const items: TestItem[] = [
        { id: '1', date: '2024-06-14T12:00:00' },
        { id: '2', date: '2024-06-16T12:00:00' },
      ];

      const result = filterByToday(items, getDate);

      expect(result).toHaveLength(0);
    });

    it('should preserve original order', () => {
      const items: TestItem[] = [
        { id: 'c', date: '2024-06-15T18:00:00' },
        { id: 'a', date: '2024-06-15T06:00:00' },
        { id: 'b', date: '2024-06-15T12:00:00' },
      ];

      const result = filterByToday(items, getDate);

      expect(result.map((i) => i.id)).toEqual(['c', 'a', 'b']);
    });

    it('should not mutate original array', () => {
      const items: TestItem[] = [
        { id: '1', date: '2024-06-15T12:00:00' },
        { id: '2', date: '2024-06-14T12:00:00' },
      ];
      const originalLength = items.length;

      filterByToday(items, getDate);

      expect(items).toHaveLength(originalLength);
    });
  });
});
