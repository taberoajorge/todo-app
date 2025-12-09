import { v4 as uuidv4 } from 'uuid';
import type { IDBStore } from '@/shared/lib/storage/indexeddb.adapter';

interface BaseEntity {
  id: string;
  createdAt: string;
}

export interface BaseRepository<T extends BaseEntity, TInput> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | undefined>;
  create(input: TInput): Promise<T>;
  update(id: string, input: Partial<TInput>): Promise<T | undefined>;
  delete(id: string): Promise<void>;
}

interface CreateBaseRepositoryOptions<T extends BaseEntity, TInput> {
  store: IDBStore<T>;
  createEntity: (input: TInput, id: string, createdAt: string) => T;
  mergeUpdate?: (existing: T, input: Partial<TInput>) => T;
  beforeDelete?: (id: string) => Promise<void>;
}

export function createBaseRepository<T extends BaseEntity, TInput>({
  store,
  createEntity,
  mergeUpdate,
  beforeDelete,
}: CreateBaseRepositoryOptions<T, TInput>): BaseRepository<T, TInput> {
  return {
    async getAll(): Promise<T[]> {
      return store.getAll();
    },

    async getById(id: string): Promise<T | undefined> {
      return store.getById(id);
    },

    async create(input: TInput): Promise<T> {
      const id = uuidv4();
      const createdAt = new Date().toISOString();
      const entity = createEntity(input, id, createdAt);

      await store.add(entity);
      return entity;
    },

    async update(id: string, input: Partial<TInput>): Promise<T | undefined> {
      const existing = await store.getById(id);
      if (!existing) return undefined;

      const updated = mergeUpdate ? mergeUpdate(existing, input) : { ...existing, ...input };

      await store.update(updated);
      return updated;
    },

    async delete(id: string): Promise<void> {
      if (beforeDelete) {
        await beforeDelete(id);
      }
      await store.remove(id);
    },
  };
}
