import type { ITaskStorage } from '@/shared/lib/storage';

export interface Task {
  id: string;
  title: string;
  description?: string;
  deadline?: string;
  completed: boolean;
  createdAt: string;
}

export type TaskInput = Pick<Task, 'title' | 'description' | 'deadline'>;

/**
 * Creates a task repository with CRUD operations
 * Decoupled from storage implementation via dependency injection
 */
export function createTaskRepository(storage: ITaskStorage) {
  return {
    async getAll(): Promise<Task[]> {
      return storage.getAll();
    },

    async getById(id: string): Promise<Task | undefined> {
      const tasks = await storage.getAll();
      return tasks.find((t) => t.id === id);
    },

    async create(input: TaskInput): Promise<Task> {
      const tasks = await storage.getAll();
      const newTask: Task = {
        id: crypto.randomUUID(),
        ...input,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      await storage.save([...tasks, newTask]);
      return newTask;
    },

    async update(
      id: string,
      updates: Partial<Omit<Task, 'id' | 'createdAt'>>,
    ): Promise<Task | undefined> {
      const tasks = await storage.getAll();
      const index = tasks.findIndex((t) => t.id === id);
      if (index === -1) return undefined;

      const updated = { ...tasks[index], ...updates };
      tasks[index] = updated;
      await storage.save(tasks);
      return updated;
    },

    async delete(id: string): Promise<boolean> {
      const tasks = await storage.getAll();
      const filtered = tasks.filter((t) => t.id !== id);
      if (filtered.length === tasks.length) return false;
      await storage.save(filtered);
      return true;
    },

    async toggle(id: string): Promise<Task | undefined> {
      const tasks = await storage.getAll();
      const index = tasks.findIndex((t) => t.id === id);
      if (index === -1) return undefined;

      // Create new object instead of mutating
      const toggled: Task = { ...tasks[index], completed: !tasks[index].completed };
      const updatedTasks = [...tasks];
      updatedTasks[index] = toggled;
      await storage.save(updatedTasks);
      return toggled;
    },

    async reorder(taskIds: string[]): Promise<Task[]> {
      const tasks = await storage.getAll();
      const taskMap = new Map(tasks.map((t) => [t.id, t]));
      const reorderedIds = new Set(taskIds);

      // Get reordered tasks in new order
      const reordered = taskIds.map((id) => taskMap.get(id)).filter(Boolean) as Task[];

      // Preserve tasks not in reorder list (e.g., completed tasks when reordering pending)
      const preserved = tasks.filter((t) => !reorderedIds.has(t.id));

      // Combine: reordered tasks first, then preserved tasks
      const allTasks = [...reordered, ...preserved];
      await storage.save(allTasks);
      return allTasks;
    },

    async clear(): Promise<void> {
      await storage.clear();
    },
  };
}

export type TaskRepository = ReturnType<typeof createTaskRepository>;
