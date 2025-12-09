import type { Task } from '@/shared/api/task-repository';

describe('Task Filtering Logic', () => {
  const createTask = (overrides: Partial<Task> = {}): Task => ({
    id: crypto.randomUUID(),
    title: 'Test Task',
    completed: false,
    createdAt: new Date().toISOString(),
    ...overrides,
  });

  describe('selectPendingTasks', () => {
    const selectPendingTasks = (tasks: Task[]) => tasks.filter((t) => !t.completed);

    it('should return only pending tasks', () => {
      const tasks = [
        createTask({ completed: false }),
        createTask({ completed: true }),
        createTask({ completed: false }),
      ];

      const result = selectPendingTasks(tasks);

      expect(result).toHaveLength(2);
      expect(result.every((t) => !t.completed)).toBe(true);
    });

    it('should return empty array when all completed', () => {
      const tasks = [createTask({ completed: true }), createTask({ completed: true })];

      const result = selectPendingTasks(tasks);

      expect(result).toEqual([]);
    });
  });

  describe('selectCompletedTasks', () => {
    const selectCompletedTasks = (tasks: Task[]) => tasks.filter((t) => t.completed);

    it('should return only completed tasks', () => {
      const tasks = [
        createTask({ completed: false }),
        createTask({ completed: true }),
        createTask({ completed: true }),
      ];

      const result = selectCompletedTasks(tasks);

      expect(result).toHaveLength(2);
      expect(result.every((t) => t.completed)).toBe(true);
    });
  });

  describe('selectTasksBySearch', () => {
    const selectTasksBySearch = (tasks: Task[], query: string) => {
      if (!query.trim()) return tasks;
      const lowerQuery = query.toLowerCase();
      return tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(lowerQuery) ||
          t.description?.toLowerCase().includes(lowerQuery)
      );
    };

    it('should filter tasks by title', () => {
      const tasks = [
        createTask({ title: 'Buy groceries' }),
        createTask({ title: 'Clean house' }),
        createTask({ title: 'Buy milk' }),
      ];

      const result = selectTasksBySearch(tasks, 'buy');

      expect(result).toHaveLength(2);
    });

    it('should filter tasks by description', () => {
      const tasks = [
        createTask({ title: 'Task 1', description: 'Important meeting' }),
        createTask({ title: 'Task 2', description: 'Casual task' }),
      ];

      const result = selectTasksBySearch(tasks, 'meeting');

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Task 1');
    });

    it('should return all tasks for empty search', () => {
      const tasks = [createTask(), createTask(), createTask()];

      const result = selectTasksBySearch(tasks, '');

      expect(result).toHaveLength(3);
    });

    it('should be case insensitive', () => {
      const tasks = [createTask({ title: 'BUY GROCERIES' })];

      const result = selectTasksBySearch(tasks, 'buy groceries');

      expect(result).toHaveLength(1);
    });
  });

  describe('combined filters', () => {
    const filterTasks = (
      tasks: Task[],
      options: { search: string; status: 'all' | 'pending' | 'completed' }
    ) => {
      let result = tasks;

      // Apply search
      if (options.search.trim()) {
        const query = options.search.toLowerCase();
        result = result.filter(
          (t) =>
            t.title.toLowerCase().includes(query) ||
            t.description?.toLowerCase().includes(query)
        );
      }

      // Apply status filter
      if (options.status === 'pending') {
        result = result.filter((t) => !t.completed);
      } else if (options.status === 'completed') {
        result = result.filter((t) => t.completed);
      }

      return result;
    };

    it('should filter by both search and status', () => {
      const tasks = [
        createTask({ title: 'Buy groceries', completed: false }),
        createTask({ title: 'Buy milk', completed: true }),
        createTask({ title: 'Clean house', completed: false }),
      ];

      const result = filterTasks(tasks, { search: 'buy', status: 'pending' });

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Buy groceries');
    });

    it('should return all matching when status is all', () => {
      const tasks = [
        createTask({ title: 'Buy groceries', completed: false }),
        createTask({ title: 'Buy milk', completed: true }),
      ];

      const result = filterTasks(tasks, { search: 'buy', status: 'all' });

      expect(result).toHaveLength(2);
    });
  });
});

