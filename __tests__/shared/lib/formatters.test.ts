import { formatDeadline, toDateTimeLocal } from '@/shared/lib/formatters';

describe('formatDeadline', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-06-15T12:00:00'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should format today deadline', () => {
    const today = new Date('2024-06-15T14:30:00');
    const result = formatDeadline(today.toISOString());
    expect(result).toContain('Today at');
  });

  it('should format tomorrow deadline', () => {
    const tomorrow = new Date('2024-06-16T10:00:00');
    const result = formatDeadline(tomorrow.toISOString());
    expect(result).toContain('Tomorrow at');
  });

  it('should show overdue for past deadlines', () => {
    const past = new Date('2024-06-14T10:00:00');
    const result = formatDeadline(past.toISOString());
    expect(result).toContain('Overdue');
  });

  it('should format future deadline with date', () => {
    const future = new Date('2024-06-20T15:00:00');
    const result = formatDeadline(future.toISOString());
    expect(result).toContain('Jun 20, 2024');
  });
});

describe('toDateTimeLocal', () => {
  it('should format date for datetime-local input', () => {
    const date = new Date('2024-06-15T14:30:00');
    const result = toDateTimeLocal(date);
    expect(result).toBe('2024-06-15T14:30');
  });
});
