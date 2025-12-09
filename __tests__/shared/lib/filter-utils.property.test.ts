import fc from 'fast-check';
import type { Task } from '@/shared/api';

// Extract the filtering logic from useTasks for property testing
type FilterStatus = 'all' | 'pending' | 'completed';

function filterTasks(tasks: Task[], searchQuery: string, filterStatus: FilterStatus): Task[] {
  const matchesSearch = (t: Task): boolean => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      t.title?.toLowerCase().includes(query) ||
      t.description?.toLowerCase().includes(query) ||
      false
    );
  };

  const matchesStatus = (t: Task): boolean =>
    filterStatus === 'all' ||
    (filterStatus === 'pending' && !t.completed) ||
    (filterStatus === 'completed' && t.completed);

  return tasks.filter((t) => matchesSearch(t) && matchesStatus(t));
}

// Arbitrary for generating valid Tasks with all required fields
// Using tuple to avoid fast-check shrinking by removing required fields
const taskArbitrary = fc
  .tuple(
    fc.uuid(), // id
    fc.string({ minLength: 1, maxLength: 100 }), // title
    fc.option(fc.string({ maxLength: 500 }), { nil: undefined }), // description
    fc.option(
      fc
        .integer({ min: Date.now(), max: Date.now() + 365 * 24 * 60 * 60 * 1000 })
        .map((ts) => new Date(ts).toISOString()),
      { nil: undefined },
    ), // deadline
    fc.boolean(), // completed
    fc
      .integer({ min: Date.now() - 365 * 24 * 60 * 60 * 1000, max: Date.now() })
      .map((ts) => new Date(ts).toISOString()), // createdAt
  )
  .map(
    ([id, title, description, deadline, completed, createdAt]): Task => ({
      id,
      title,
      description,
      deadline,
      completed,
      createdAt,
    }),
  );

describe('Filter Utils Property-Based Tests', () => {
  describe('BUG FIXED: Null safety added', () => {
    it('should handle undefined title safely (previously crashed)', () => {
      const tasksWithUndefinedTitle = [
        {
          id: '1',
          title: undefined as any, // Simulating corrupted data
          description: 'Test',
          completed: false,
          createdAt: new Date().toISOString(),
        },
      ];

      // Now it should NOT throw, thanks to optional chaining fix
      expect(() => {
        filterTasks(tasksWithUndefinedTitle, 'test', 'all');
      }).not.toThrow();

      // And it should still find the task by description
      const result = filterTasks(tasksWithUndefinedTitle, 'test', 'all');
      expect(result).toHaveLength(1);
    });
  });

  describe('filterTasks', () => {
    it('should never increase the number of tasks', () => {
      fc.assert(
        fc.asyncProperty(
          fc.array(taskArbitrary),
          fc.string(),
          fc.constantFrom('all' as const, 'pending' as const, 'completed' as const),
          async (tasks, searchQuery, filterStatus) => {
            const filtered = filterTasks(tasks, searchQuery, filterStatus);
            return filtered.length <= tasks.length;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should be idempotent (filtering twice gives same result)', () => {
      fc.assert(
        fc.asyncProperty(
          fc.array(taskArbitrary),
          fc.string(),
          fc.constantFrom('all' as const, 'pending' as const, 'completed' as const),
          async (tasks, searchQuery, filterStatus) => {
            const filtered1 = filterTasks(tasks, searchQuery, filterStatus);
            const filtered2 = filterTasks(filtered1, searchQuery, filterStatus);
            return filtered1.length === filtered2.length;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should return empty array for empty input', () => {
      fc.assert(
        fc.property(
          fc.string(),
          fc.constantFrom('all' as const, 'pending' as const, 'completed' as const),
          (searchQuery, filterStatus) => {
            const result = filterTasks([], searchQuery, filterStatus);
            return result.length === 0;
          },
        ),
        { numRuns: 50 },
      );
    });

    it('should return all tasks when filter is "all" and search is empty', () => {
      fc.assert(
        fc.asyncProperty(fc.array(taskArbitrary, { minLength: 1 }), async (tasks) => {
          const filtered = filterTasks(tasks, '', 'all');
          return filtered.length === tasks.length;
        }),
        { numRuns: 100 },
      );
    });

    it('should return only pending tasks when filter is "pending"', () => {
      fc.assert(
        fc.asyncProperty(fc.array(taskArbitrary, { minLength: 1 }), async (tasks) => {
          const filtered = filterTasks(tasks, '', 'pending');
          return filtered.every((t) => !t.completed);
        }),
        { numRuns: 100 },
      );
    });

    it('should return only completed tasks when filter is "completed"', () => {
      fc.assert(
        fc.asyncProperty(fc.array(taskArbitrary, { minLength: 1 }), async (tasks) => {
          const filtered = filterTasks(tasks, '', 'completed');
          return filtered.every((t) => t.completed);
        }),
        { numRuns: 100 },
      );
    });

    it('should filter by search query in title', () => {
      fc.assert(
        fc.asyncProperty(
          fc.array(taskArbitrary, { minLength: 1 }),
          fc.string({ minLength: 1, maxLength: 10 }),
          async (tasks, searchQuery) => {
            const filtered = filterTasks(tasks, searchQuery, 'all');
            const query = searchQuery.toLowerCase();

            // If searchQuery is only whitespace, no filtering happens
            if (!searchQuery.trim()) {
              return filtered.length === tasks.length;
            }

            return filtered.every(
              (t) =>
                t.title.toLowerCase().includes(query) ||
                t.description?.toLowerCase().includes(query),
            );
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should be case-insensitive for search', () => {
      fc.assert(
        fc.asyncProperty(
          fc.array(taskArbitrary, { minLength: 1 }),
          fc.string({ minLength: 1, maxLength: 10 }),
          async (tasks, searchQuery) => {
            const lowerFiltered = filterTasks(tasks, searchQuery.toLowerCase(), 'all');
            const upperFiltered = filterTasks(tasks, searchQuery.toUpperCase(), 'all');

            return lowerFiltered.length === upperFiltered.length;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should preserve task order', () => {
      fc.assert(
        fc.asyncProperty(
          fc.array(taskArbitrary, { minLength: 2, maxLength: 10 }),
          fc.string(),
          fc.constantFrom('all' as const, 'pending' as const, 'completed' as const),
          async (tasks, searchQuery, filterStatus) => {
            const filtered = filterTasks(tasks, searchQuery, filterStatus);
            const originalIndices = filtered.map((t) => tasks.indexOf(t));

            // Check if indices are in ascending order
            for (let i = 1; i < originalIndices.length; i++) {
              if (originalIndices[i] < originalIndices[i - 1]) {
                return false;
              }
            }
            return true;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should handle whitespace-only search query as empty', () => {
      fc.assert(
        fc.asyncProperty(
          fc.array(taskArbitrary, { minLength: 1 }),
          fc
            .integer({ min: 1, max: 10 })
            .map((n) => ' '.repeat(n)), // Create whitespace-only strings
          async (tasks, whitespace) => {
            const filtered = filterTasks(tasks, whitespace, 'all');
            return filtered.length === tasks.length;
          },
        ),
        { numRuns: 50 },
      );
    });

    it('should combine filters correctly (pending + search)', () => {
      fc.assert(
        fc.asyncProperty(
          fc.array(taskArbitrary, { minLength: 1 }),
          fc.string({ minLength: 1 }),
          async (tasks, searchQuery) => {
            const filtered = filterTasks(tasks, searchQuery, 'pending');
            const query = searchQuery.toLowerCase();

            // If searchQuery is only whitespace, only status filter applies
            if (!searchQuery.trim()) {
              return filtered.every((t) => !t.completed);
            }

            return filtered.every(
              (t) =>
                !t.completed &&
                (t.title.toLowerCase().includes(query) ||
                  t.description?.toLowerCase().includes(query)),
            );
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should combine filters correctly (completed + search)', () => {
      fc.assert(
        fc.asyncProperty(
          fc.array(taskArbitrary, { minLength: 1 }),
          fc.string({ minLength: 1 }),
          async (tasks, searchQuery) => {
            const filtered = filterTasks(tasks, searchQuery, 'completed');
            const query = searchQuery.toLowerCase();

            // If searchQuery is only whitespace, only status filter applies
            if (!searchQuery.trim()) {
              return filtered.every((t) => t.completed);
            }

            return filtered.every(
              (t) =>
                t.completed &&
                (t.title.toLowerCase().includes(query) ||
                  t.description?.toLowerCase().includes(query)),
            );
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should not mutate original array', () => {
      fc.assert(
        fc.asyncProperty(
          fc.array(taskArbitrary, { minLength: 1 }),
          fc.string(),
          fc.constantFrom('all' as const, 'pending' as const, 'completed' as const),
          async (tasks, searchQuery, filterStatus) => {
            const originalLength = tasks.length;
            const originalIds = tasks.map((t) => t.id);

            filterTasks(tasks, searchQuery, filterStatus);

            // Original array should be unchanged
            return (
              tasks.length === originalLength && tasks.every((t, i) => t.id === originalIds[i])
            );
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should find tasks with search query in description', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'Task One',
          description: 'Contains special keyword',
          completed: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Task Two',
          description: 'Nothing here',
          completed: false,
          createdAt: new Date().toISOString(),
        },
      ];

      const filtered = filterTasks(tasks, 'keyword', 'all');
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe('1');
    });

    it('should handle tasks without description', () => {
      fc.assert(
        fc.asyncProperty(
          fc.array(
            taskArbitrary.map((task) => ({ ...task, description: undefined })),
            { minLength: 1 },
          ),
          fc.string({ minLength: 1 }),
          async (tasks, searchQuery) => {
            const filtered = filterTasks(tasks, searchQuery, 'all');
            const query = searchQuery.toLowerCase();

            // If searchQuery is only whitespace, no filtering happens
            if (!searchQuery.trim()) {
              return filtered.length === tasks.length;
            }

            return filtered.every((t) => t.title.toLowerCase().includes(query));
          },
        ),
        { numRuns: 50 },
      );
    });

    it('should be commutative: filter(search) === search(filter) for status filters', () => {
      fc.assert(
        fc.asyncProperty(
          fc.array(taskArbitrary, { minLength: 1 }),
          fc.string(),
          fc.constantFrom('pending' as const, 'completed' as const),
          async (tasks, searchQuery, filterStatus) => {
            // Apply filters in combined way
            const combined = filterTasks(tasks, searchQuery, filterStatus);

            // Apply filters separately and compare
            const searchFirst = filterTasks(tasks, searchQuery, 'all');
            const thenStatus = filterTasks(searchFirst, '', filterStatus);

            return combined.length === thenStatus.length;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should return subset when adding more filters', () => {
      fc.assert(
        fc.asyncProperty(
          fc.array(taskArbitrary, { minLength: 1 }),
          fc.string({ minLength: 1 }),
          async (tasks, searchQuery) => {
            const withoutSearch = filterTasks(tasks, '', 'pending');
            const withSearch = filterTasks(tasks, searchQuery, 'pending');

            // Adding search filter should not increase results
            return withSearch.length <= withoutSearch.length;
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
