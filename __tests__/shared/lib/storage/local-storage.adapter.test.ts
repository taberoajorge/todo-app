import { localStorageAdapter } from '@/shared/lib/storage';
import { STORAGE_KEYS } from '@/shared/config/constants';
import type { Task } from '@/entities/task';

describe('localStorageAdapter', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const createTask = (overrides: Partial<Task> = {}): Task => ({
    id: crypto.randomUUID(),
    title: 'Test Task',
    completed: false,
    createdAt: new Date().toISOString(),
    ...overrides,
  });

  describe('getAll', () => {
    it('should return empty array when no data in localStorage', async () => {
      const result = await localStorageAdapter.getAll();
      expect(result).toEqual([]);
    });

    it('should return tasks from localStorage', async () => {
      const tasks = [createTask({ title: 'Task 1' }), createTask({ title: 'Task 2' })];
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));

      const result = await localStorageAdapter.getAll();

      expect(result).toEqual(tasks);
    });

    it('should return empty array on parse error', async () => {
      localStorage.setItem(STORAGE_KEYS.TASKS, 'invalid json');

      const result = await localStorageAdapter.getAll();

      expect(result).toEqual([]);
    });
  });

  describe('save', () => {
    it('should save tasks to localStorage', async () => {
      const tasks = [createTask({ title: 'Test' })];

      await localStorageAdapter.save(tasks);

      const stored = localStorage.getItem(STORAGE_KEYS.TASKS);
      expect(JSON.parse(stored!)).toEqual(tasks);
    });

    it('should overwrite existing tasks', async () => {
      const oldTasks = [createTask({ title: 'Old' })];
      const newTasks = [createTask({ title: 'New' })];
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(oldTasks));

      await localStorageAdapter.save(newTasks);

      const stored = localStorage.getItem(STORAGE_KEYS.TASKS);
      expect(JSON.parse(stored!)).toEqual(newTasks);
    });
  });

  describe('clear', () => {
    it('should remove tasks from localStorage', async () => {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify([createTask()]));

      await localStorageAdapter.clear();

      expect(localStorage.getItem(STORAGE_KEYS.TASKS)).toBeNull();
    });
  });
});

