import { v4 as uuidv4 } from 'uuid';
import type { Task, TaskStatus } from '@/shared/api';

/**
 * Factory function for creating test Task objects
 * @param overrides - Partial Task properties to override defaults
 */
export const createTask = (overrides: Partial<Task> = {}): Task => ({
  id: uuidv4(),
  title: 'Test Task',
  description: undefined,
  deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
  status: 'todo' as TaskStatus,
  projectId: uuidv4(),
  createdAt: new Date().toISOString(),
  ...overrides,
});
