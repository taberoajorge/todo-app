import {
  selectPendingTasks,
  selectCompletedTasks,
  selectTasksBySearch,
} from '@/entities/task';
import type { Task } from '@/entities/task';

describe('Task Selectors', () => {
  const createTask = (overrides: Partial<Task> = {}): Task => ({
    id: crypto.randomUUID(),
    title: 'Test Task',
    completed: false,
    createdAt: new Date().toISOString(),
    ...overrides,
  });

  describe('selectPendingTasks', () => {
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
});

