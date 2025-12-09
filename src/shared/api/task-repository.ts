import { DEFAULTS, STORES } from '@/shared/config/constants';
import { isToday } from '@/shared/lib/date-utils';
import { createStore, type IDBStore } from '@/shared/lib/storage/indexeddb.adapter';
import { type BaseRepository, createBaseRepository } from './base-repository';
import type { Task, TaskInput, TaskStatus } from './types';

export interface TaskRepository extends BaseRepository<Task, TaskInput> {
  getByProjectId(projectId: string): Promise<Task[]>;
  getByStatus(status: TaskStatus): Promise<Task[]>;
  getTodayTasks(): Promise<Task[]>;
  updateStatus(id: string, status: TaskStatus): Promise<Task | undefined>;
}

export function createTaskRepository(
  store: IDBStore<Task> = createStore<Task>(STORES.TASKS),
): TaskRepository {
  const baseRepo = createBaseRepository<Task, TaskInput>({
    store,
    createEntity: (input, id, createdAt) => ({
      id,
      createdAt,
      title: input.title.trim() || DEFAULTS.TASK_TITLE,
      description: input.description?.trim(),
      deadline: input.deadline,
      status: 'todo',
      projectId: input.projectId,
    }),
    mergeUpdate: (existing, input) => ({
      ...existing,
      ...input,
      title: input.title?.trim() || existing.title,
      description: input.description?.trim(),
    }),
  });

  return {
    ...baseRepo,

    async getByProjectId(projectId: string): Promise<Task[]> {
      const all = await baseRepo.getAll();
      return all.filter((t) => t.projectId === projectId);
    },

    async getByStatus(status: TaskStatus): Promise<Task[]> {
      const all = await baseRepo.getAll();
      return all.filter((t) => t.status === status);
    },

    async getTodayTasks(): Promise<Task[]> {
      const all = await baseRepo.getAll();
      return all.filter((t) => isToday(t.deadline));
    },

    async updateStatus(id: string, status: TaskStatus): Promise<Task | undefined> {
      const existing = await store.getById(id);
      if (!existing) return undefined;

      const updated: Task = {
        ...existing,
        status,
      };

      await store.update(updated);
      return updated;
    },
  };
}
