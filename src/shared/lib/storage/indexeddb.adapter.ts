import type { Task } from '@/shared/api/types';
import { DB_NAME, DB_VERSION, STORES } from '@/shared/config/constants';

let dbInstance: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORES.PROJECTS)) {
        db.createObjectStore(STORES.PROJECTS, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORES.TASKS)) {
        const taskStore = db.createObjectStore(STORES.TASKS, { keyPath: 'id' });
        taskStore.createIndex('projectId', 'projectId', { unique: false });
        taskStore.createIndex('status', 'status', { unique: false });
        taskStore.createIndex('deadline', 'deadline', { unique: false });
      }
    };
  });
}

export interface IDBStore<T> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | undefined>;
  add(item: T): Promise<void>;
  update(item: T): Promise<void>;
  remove(id: string): Promise<void>;
  clear(): Promise<void>;
}

export function createStore<T extends { id: string }>(storeName: string): IDBStore<T> {
  return {
    async getAll(): Promise<T[]> {
      if (typeof window === 'undefined') return [];

      try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
          const transaction = db.transaction(storeName, 'readonly');
          const store = transaction.objectStore(storeName);
          const request = store.getAll();

          request.onsuccess = () => resolve(request.result || []);
          request.onerror = () => reject(request.error);
        });
      } catch (error) {
        console.error(`[IndexedDB] Failed to getAll from "${storeName}":`, error);
        return [];
      }
    },

    async getById(id: string): Promise<T | undefined> {
      if (typeof window === 'undefined') return undefined;

      try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
          const transaction = db.transaction(storeName, 'readonly');
          const store = transaction.objectStore(storeName);
          const request = store.get(id);

          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      } catch (error) {
        console.error(`[IndexedDB] Failed to getById "${id}" from "${storeName}":`, error);
        return undefined;
      }
    },

    async add(item: T): Promise<void> {
      if (typeof window === 'undefined') return;

      const db = await openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.add(item);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    },

    async update(item: T): Promise<void> {
      if (typeof window === 'undefined') return;

      const db = await openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(item);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    },

    async remove(id: string): Promise<void> {
      if (typeof window === 'undefined') return;

      const db = await openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    },

    async clear(): Promise<void> {
      if (typeof window === 'undefined') return;

      const db = await openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    },
  };
}

async function getTasksByProjectId(projectId: string): Promise<Task[]> {
  if (typeof window === 'undefined') return [];

  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.TASKS, 'readonly');
      const store = transaction.objectStore(STORES.TASKS);
      const index = store.index('projectId');
      const request = index.getAll(projectId);

      request.onsuccess = () => resolve((request.result as Task[]) || []);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error(`[IndexedDB] Failed to getTasksByProjectId "${projectId}":`, error);
    return [];
  }
}

export async function deleteTasksByProjectId(projectId: string): Promise<void> {
  if (typeof window === 'undefined') return;

  const tasks = await getTasksByProjectId(projectId);
  if (tasks.length === 0) return;

  const db = await openDB();
  const transaction = db.transaction(STORES.TASKS, 'readwrite');
  const store = transaction.objectStore(STORES.TASKS);

  await Promise.all(
    tasks.map(
      (task) =>
        new Promise<void>((resolve, reject) => {
          const request = store.delete(task.id);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        }),
    ),
  );
}
