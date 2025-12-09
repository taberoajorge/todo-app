import type { Task } from '@/shared/api/task-repository';

export interface ITaskStorage {
  getAll(): Promise<Task[]>;
  save(tasks: Task[]): Promise<void>;
  clear(): Promise<void>;
}
