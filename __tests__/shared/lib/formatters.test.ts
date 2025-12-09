import { calculateTimeProgress, formatDeadline, toDateTimeLocal } from '@/shared/lib/formatters';

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

describe('calculateTimeProgress', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return 0 when at creation time', () => {
    const createdAt = '2024-06-15T10:00:00';
    const deadline = '2024-06-15T20:00:00';
    jest.setSystemTime(new Date('2024-06-15T10:00:00'));

    const result = calculateTimeProgress(createdAt, deadline);
    expect(result).toBe(0);
  });

  it('should return 50 at midpoint', () => {
    const createdAt = '2024-06-15T10:00:00';
    const deadline = '2024-06-15T20:00:00';
    // Midpoint is 15:00
    jest.setSystemTime(new Date('2024-06-15T15:00:00'));

    const result = calculateTimeProgress(createdAt, deadline);
    expect(result).toBe(50);
  });

  it('should return 100 when deadline has passed', () => {
    const createdAt = '2024-06-15T10:00:00';
    const deadline = '2024-06-15T20:00:00';
    jest.setSystemTime(new Date('2024-06-16T00:00:00'));

    const result = calculateTimeProgress(createdAt, deadline);
    expect(result).toBe(100);
  });

  it('should return 0 when before creation time', () => {
    const createdAt = '2024-06-15T10:00:00';
    const deadline = '2024-06-15T20:00:00';
    jest.setSystemTime(new Date('2024-06-15T08:00:00'));

    const result = calculateTimeProgress(createdAt, deadline);
    expect(result).toBe(0);
  });

  it('should return 0 when deadline is before creation (invalid)', () => {
    const createdAt = '2024-06-15T20:00:00';
    const deadline = '2024-06-15T10:00:00';
    jest.setSystemTime(new Date('2024-06-15T15:00:00'));

    const result = calculateTimeProgress(createdAt, deadline);
    expect(result).toBe(0);
  });

  it('should round to nearest integer', () => {
    const createdAt = '2024-06-15T10:00:00';
    const deadline = '2024-06-15T20:00:00';
    // 3 hours out of 10 = 30%
    jest.setSystemTime(new Date('2024-06-15T13:00:00'));

    const result = calculateTimeProgress(createdAt, deadline);
    expect(result).toBe(30);
  });
});
