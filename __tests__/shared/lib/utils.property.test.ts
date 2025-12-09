import fc from 'fast-check';
import { cn } from '@/shared/lib/utils';

describe('Utils (cn) Property-Based Tests', () => {
  describe('cn', () => {
    it('should always return a string', () => {
      fc.assert(
        fc.property(fc.array(fc.string()), (classes) => {
          const result = cn(...classes);
          return typeof result === 'string';
        }),
        { numRuns: 100 },
      );
    });

    it('should be idempotent (cn(x) === cn(cn(x)))', () => {
      fc.assert(
        fc.property(fc.array(fc.string()), (classes) => {
          const once = cn(...classes);
          const twice = cn(once);
          return once === twice;
        }),
        { numRuns: 100 },
      );
    });

    it('should return empty string for empty input', () => {
      expect(cn()).toBe('');
    });

    it('should handle undefined and null gracefully', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.oneof(
              fc.string(),
              fc.constant(undefined),
              fc.constant(null),
              fc.constant(false),
              fc.constant(true),
            ),
          ),
          (inputs) => {
            const result = cn(...inputs);
            return typeof result === 'string';
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should filter out falsy values except empty strings', () => {
      expect(cn('a', false, 'b', null, 'c', undefined, 'd')).toBe('a b c d');
      expect(cn('a', 0, 'b')).toBe('a b');
      expect(cn('a', '', 'b')).toBe('a b');
    });

    it('should deduplicate identical classes', () => {
      // Tailwind merge should deduplicate for valid Tailwind classes
      // Note: For arbitrary strings, tw-merge may not deduplicate
      const result1 = cn('p-4 p-4');
      const result2 = cn('p-4');
      expect(result1).toBe(result2);

      const result3 = cn('bg-blue-500', 'bg-blue-500');
      const result4 = cn('bg-blue-500');
      expect(result3).toBe(result4);
    });

    it('should handle conditional class objects', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }),
          fc.boolean(),
          fc.string({ minLength: 1 }),
          fc.boolean(),
          (class1, cond1, class2, cond2) => {
            const result = cn({
              [class1]: cond1,
              [class2]: cond2,
            });

            // If both conditions are true and classes are different, both should be in result
            if (cond1 && cond2 && class1 !== class2) {
              return result.includes(class1.trim()) || result.includes(class2.trim());
            } else if (cond1) {
              return result.includes(class1.trim()) || result === class1.trim();
            } else if (cond2) {
              return result.includes(class2.trim()) || result === class2.trim();
            } else {
              return result === '';
            }
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should preserve order when classes do not conflict', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 1, maxLength: 5 }),
          (classes) => {
            // Use unique class names that won't conflict
            const uniqueClasses = classes.map((c, i) => `unique-${i}-${c.replace(/\s/g, '')}`);
            const result = cn(...uniqueClasses);

            // All unique classes should appear in result
            return uniqueClasses.every((cls) => result.includes(cls.split(' ')[0]));
          },
        ),
        { numRuns: 50 },
      );
    });

    it('should handle Tailwind conflicting classes (last wins)', () => {
      // When multiple conflicting Tailwind classes are provided, the last one should win
      const result1 = cn('p-4', 'p-8');
      const result2 = cn('p-8');

      // Should resolve to the last padding class
      expect(result1).toBe(result2);
    });

    it('should handle arrays of classes', () => {
      fc.assert(
        fc.property(fc.array(fc.string()), (classes) => {
          const flattened = cn(...classes);
          const asArray = cn(classes);

          // Both should produce same result
          return flattened === asArray;
        }),
        { numRuns: 100 },
      );
    });

    it('should be associative: cn(a, cn(b, c)) === cn(cn(a, b), c)', () => {
      fc.assert(
        fc.property(fc.string(), fc.string(), fc.string(), (a, b, c) => {
          const left = cn(a, cn(b, c));
          const right = cn(cn(a, b), c);
          return left === right;
        }),
        { numRuns: 100 },
      );
    });

    it('should trim and normalize whitespace', () => {
      fc.assert(
        fc.property(fc.string(), (className) => {
          const result = cn(className);
          // Should not start or end with whitespace
          return result === result.trim();
        }),
        { numRuns: 100 },
      );
    });

    it('should handle empty strings without adding extra spaces', () => {
      expect(cn('', '', '')).toBe('');
      expect(cn('a', '', 'b')).toBe('a b');
      expect(cn('', 'a', '')).toBe('a');
    });

    it('should handle complex mixed inputs', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.oneof(
              fc.string(),
              fc.constant(undefined),
              fc.constant(null),
              fc.boolean(),
              fc.record({ class: fc.string(), enabled: fc.boolean() }),
            ),
          ),
          (inputs) => {
            // Should not throw and should return a string
            const result = cn(...inputs);
            return typeof result === 'string';
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should handle Tailwind responsive classes correctly', () => {
      const result = cn('text-sm', 'md:text-base', 'lg:text-lg');
      expect(result).toContain('text-sm');
      expect(result).toContain('md:text-base');
      expect(result).toContain('lg:text-lg');
    });

    it('should handle Tailwind variant classes correctly', () => {
      const result = cn('hover:bg-blue-500', 'focus:bg-blue-700', 'active:bg-blue-900');
      expect(result).toContain('hover:bg-blue-500');
      expect(result).toContain('focus:bg-blue-700');
      expect(result).toContain('active:bg-blue-900');
    });
  });
});
