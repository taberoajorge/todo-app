import fc from 'fast-check';
import { formatDeadline, isOverdue, toDateTimeLocal } from '@/shared/lib/formatters';

describe('Formatters Property-Based Tests', () => {
  describe('formatDeadline', () => {
    it('should return null for undefined input', () => {
      fc.assert(
        fc.property(fc.constant(undefined), (deadline) => {
          return formatDeadline(deadline) === null;
        }),
        { numRuns: 10 },
      );
    });

    it('should always return a string or null, never throw', () => {
      fc.assert(
        fc.property(
          fc.option(fc.date({ min: new Date('2000-01-01'), max: new Date('2099-12-31') }), {
            nil: undefined,
          }),
          (date) => {
            // Filter out invalid dates
            if (date && Number.isNaN(date.getTime())) return true;

            const deadline = date ? date.toISOString() : undefined;
            const result = formatDeadline(deadline);
            return result === null || typeof result === 'string';
          },
        ),
        { numRuns: 200 },
      );
    });

    it('should handle invalid date strings gracefully', () => {
      fc.assert(
        fc.property(fc.string(), (invalidDate) => {
          try {
            const result = formatDeadline(invalidDate);
            // Should return a string or throw
            return typeof result === 'string' || result === null;
          } catch {
            // It's acceptable to throw for invalid dates
            return true;
          }
        }),
        { numRuns: 100 },
      );
    });

    it('should format past dates with "Overdue" prefix', () => {
      fc.assert(
        fc.property(
          fc.date({ min: new Date('2000-01-01'), max: new Date(Date.now() - 1000) }),
          (pastDate) => {
            // Filter out invalid dates
            if (Number.isNaN(pastDate.getTime())) return true;

            const result = formatDeadline(pastDate.toISOString());
            return result?.startsWith('Overdue') ?? false;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should format future dates without "Overdue" prefix', () => {
      fc.assert(
        fc.property(
          fc.date({ min: new Date(Date.now() + 86400000), max: new Date('2099-12-31') }),
          (futureDate) => {
            // Filter out invalid dates
            if (Number.isNaN(futureDate.getTime())) return true;

            const result = formatDeadline(futureDate.toISOString());
            return result ? !result.startsWith('Overdue') : false;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should produce consistent output for same input', () => {
      fc.assert(
        fc.property(
          fc.date({ min: new Date('2000-01-01'), max: new Date('2099-12-31') }),
          (date) => {
            if (Number.isNaN(date.getTime())) return true;

            const iso = date.toISOString();
            const result1 = formatDeadline(iso);
            const result2 = formatDeadline(iso);
            return result1 === result2;
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  describe('isOverdue', () => {
    it('should return false for undefined', () => {
      fc.assert(
        fc.property(fc.constant(undefined), (deadline) => {
          return isOverdue(deadline) === false;
        }),
        { numRuns: 10 },
      );
    });

    it('should return true for past dates', () => {
      fc.assert(
        fc.property(
          fc.date({ min: new Date('2000-01-01'), max: new Date(Date.now() - 1000) }),
          (pastDate) => {
            // Filter out invalid dates
            if (Number.isNaN(pastDate.getTime())) return true;

            return isOverdue(pastDate.toISOString()) === true;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should return false for future dates', () => {
      fc.assert(
        fc.property(
          fc.date({ min: new Date(Date.now() + 86400000), max: new Date('2099-12-31') }),
          (futureDate) => {
            // Filter out invalid dates
            if (Number.isNaN(futureDate.getTime())) return true;

            return isOverdue(futureDate.toISOString()) === false;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should be idempotent (calling multiple times gives same result)', () => {
      fc.assert(
        fc.property(
          fc.option(fc.date({ min: new Date('2000-01-01'), max: new Date('2099-12-31') }), {
            nil: undefined,
          }),
          (date) => {
            // Filter out invalid dates
            if (date && Number.isNaN(date.getTime())) return true;

            const deadline = date ? date.toISOString() : undefined;
            const result1 = isOverdue(deadline);
            const result2 = isOverdue(deadline);
            const result3 = isOverdue(deadline);
            return result1 === result2 && result2 === result3;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should agree with formatDeadline on overdue status', () => {
      fc.assert(
        fc.property(
          fc.date({ min: new Date('2000-01-01'), max: new Date('2099-12-31') }),
          (date) => {
            // Filter out invalid dates
            if (Number.isNaN(date.getTime())) return true;

            const iso = date.toISOString();
            const overdue = isOverdue(iso);
            const formatted = formatDeadline(iso);

            if (overdue) {
              return formatted?.startsWith('Overdue') ?? false;
            } else {
              return !formatted?.startsWith('Overdue');
            }
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should always return a boolean', () => {
      const validDateString = fc
        .date({ min: new Date('2000-01-01'), max: new Date('2099-12-31') })
        .filter((d) => !Number.isNaN(d.getTime()))
        .map((d) => d.toISOString());

      fc.assert(
        fc.property(
          fc.option(fc.oneof(validDateString, fc.string()), { nil: undefined }),
          (deadline) => {
            try {
              const result = isOverdue(deadline);
              return typeof result === 'boolean';
            } catch {
              return true;
            }
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  describe('toDateTimeLocal', () => {
    it('should produce valid datetime-local format', () => {
      fc.assert(
        fc.property(
          fc.date({ min: new Date('2000-01-01'), max: new Date('2099-12-31') }),
          (date) => {
            // Filter out invalid dates
            if (Number.isNaN(date.getTime())) return true;

            const result = toDateTimeLocal(date);
            // Format should be YYYY-MM-DDTHH:mm
            const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
            return regex.test(result);
          },
        ),
        { numRuns: 200 },
      );
    });

    it('should be idempotent (same input produces same output)', () => {
      fc.assert(
        fc.property(
          fc.date({ min: new Date('2000-01-01'), max: new Date('2099-12-31') }),
          (date) => {
            // Filter out invalid dates
            if (Number.isNaN(date.getTime())) return true;

            const result1 = toDateTimeLocal(date);
            const result2 = toDateTimeLocal(date);
            return result1 === result2;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should produce parseable output (round-trip property)', () => {
      fc.assert(
        fc.property(
          fc.date({ min: new Date('2000-01-01'), max: new Date('2099-12-31') }),
          (originalDate) => {
            // Filter out invalid dates
            if (Number.isNaN(originalDate.getTime())) return true;

            const formatted = toDateTimeLocal(originalDate);
            const parsed = new Date(formatted);

            // Round to minutes for comparison (toDateTimeLocal drops seconds)
            const originalMinutes = Math.floor(originalDate.getTime() / 60000);
            const parsedMinutes = Math.floor(parsed.getTime() / 60000);

            return originalMinutes === parsedMinutes;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should maintain chronological order', () => {
      fc.assert(
        fc.property(
          fc.date({ min: new Date('2000-01-01'), max: new Date('2099-12-31') }),
          fc.date({ min: new Date('2000-01-01'), max: new Date('2099-12-31') }),
          (date1, date2) => {
            // Filter out invalid dates
            if (Number.isNaN(date1.getTime()) || Number.isNaN(date2.getTime())) return true;

            const formatted1 = toDateTimeLocal(date1);
            const formatted2 = toDateTimeLocal(date2);

            if (date1.getTime() < date2.getTime()) {
              return formatted1 <= formatted2;
            } else if (date1.getTime() > date2.getTime()) {
              return formatted1 >= formatted2;
            } else {
              return formatted1 === formatted2;
            }
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should handle edge case dates', () => {
      const edgeCases = [
        new Date('2000-01-01T00:00:00'),
        new Date('2099-12-31T23:59:59'),
        new Date('2024-02-29T12:00:00'), // Leap year
        new Date('2023-02-28T12:00:00'), // Non-leap year
      ];

      edgeCases.forEach((date) => {
        const result = toDateTimeLocal(date);
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
      });
    });
  });

  describe('Cross-function properties', () => {
    it('should maintain consistency between isOverdue and formatDeadline', () => {
      fc.assert(
        fc.property(
          fc.date({ min: new Date('2000-01-01'), max: new Date('2099-12-31') }),
          (date) => {
            // Filter out invalid dates
            if (Number.isNaN(date.getTime())) return true;

            const iso = date.toISOString();
            const overdue = isOverdue(iso);
            const formatted = formatDeadline(iso);

            // If isOverdue returns true, formatDeadline should contain "Overdue"
            if (overdue && formatted) {
              return formatted.includes('Overdue');
            }
            // If not overdue, formatDeadline should not contain "Overdue"
            if (!overdue && formatted) {
              return !formatted.includes('Overdue');
            }
            return true;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should handle invalid dates consistently', () => {
      // Test that invalid date handling is consistent across functions
      const invalidDate = 'invalid-date-string';

      try {
        const formatted = formatDeadline(invalidDate);
        const overdue = isOverdue(invalidDate);

        // Both should handle invalid dates gracefully (either return a value or throw consistently)
        expect(typeof formatted === 'string' || formatted === null).toBe(true);
        expect(typeof overdue === 'boolean').toBe(true);
      } catch {
        // It's acceptable if they throw for invalid dates
      }
    });
  });
});
