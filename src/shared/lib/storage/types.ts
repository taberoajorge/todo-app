import type { Task } from '@/shared/api/task-repository';

/**
 * Storage interface for task persistence
 * Abstracts the underlying storage mechanism (localStorage, IndexedDB, API, etc.)
 */
export interface ITaskStorage {
  getAll(): Promise<Task[]>;
  save(tasks: Task[]): Promise<void>;
  clear(): Promise<void>;
}

