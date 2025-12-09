import type { Task } from '@/shared/api/task-repository';

/**
 * Factory function for creating test Task objects
 * @param overrides - Partial Task properties to override defaults
 */
export const createTask = (overrides: Partial<Task> = {}): Task => ({
  id: crypto.randomUUID(),
  title: 'Test Task',
  completed: false,
  createdAt: new Date().toISOString(),
  ...overrides,
});
