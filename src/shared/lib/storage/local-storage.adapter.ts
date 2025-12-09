import type { Task } from '@/shared/api/task-repository';
import { STORAGE_KEYS } from '@/shared/config/constants';
import type { ITaskStorage } from './types';

/**
 * LocalStorage adapter implementing ITaskStorage
 * Handles SSR safety by checking for window
 */
export const localStorageAdapter: ITaskStorage = {
  async getAll(): Promise<Task[]> {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async save(tasks: Task[]): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  },

  async clear(): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.TASKS);
  },
};
