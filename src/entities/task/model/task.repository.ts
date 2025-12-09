import type { ITaskStorage } from '@/shared/lib/storage';
import type { Task } from './types';

/**
 * Creates a task repository with CRUD operations
 * Decoupled from storage implementation via dependency injection
 */
export function createTaskRepository(storage: ITaskStorage) {
  return {
    async getAll(): Promise<Task[]> {
      return storage.getAll();
    },

    async add(task: Task): Promise<void> {
      const tasks = await storage.getAll();
      await storage.save([...tasks, task]);
    },

    async update(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<void> {
      const tasks = await storage.getAll();
      const updated = tasks.map((t) => (t.id === id ? { ...t, ...updates } : t));
      await storage.save(updated);
    },

    async remove(id: string): Promise<void> {
      const tasks = await storage.getAll();
      await storage.save(tasks.filter((t) => t.id !== id));
    },

    async toggle(id: string): Promise<void> {
      const tasks = await storage.getAll();
      const updated = tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
      await storage.save(updated);
    },

    async reorder(orderedIds: string[]): Promise<void> {
      const tasks = await storage.getAll();
      const taskMap = new Map(tasks.map((t) => [t.id, t]));
      const ordered = orderedIds.map((id) => taskMap.get(id)).filter(Boolean) as Task[];
      await storage.save(ordered);
    },

    async clear(): Promise<void> {
      await storage.clear();
    },
  };
}

export type TaskRepository = ReturnType<typeof createTaskRepository>;

