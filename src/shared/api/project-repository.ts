import { STORES } from '@/shared/config/constants';
import { calculateProjectStats, sortByLastActivity } from '@/shared/lib/project-stats';
import {
  createStore,
  deleteTasksByProjectId,
  getTasksByProjectId,
  type IDBStore,
} from '@/shared/lib/storage/indexeddb.adapter';
import { type BaseRepository, createBaseRepository } from './base-repository';
import type { Project, ProjectInput, ProjectWithStats, Task } from './types';

export interface ProjectRepository extends BaseRepository<Project, ProjectInput> {
  getAllWithStats(): Promise<ProjectWithStats[]>;
}

export function createProjectRepository(
  store: IDBStore<Project> = createStore<Project>(STORES.PROJECTS),
): ProjectRepository {
  const baseRepo = createBaseRepository<Project, ProjectInput>({
    store,
    createEntity: (input, id, createdAt) => ({
      id,
      createdAt,
      name: input.name,
      description: input.description,
      color: input.color,
    }),
    beforeDelete: async (id) => {
      await deleteTasksByProjectId(id);
    },
  });

  return {
    ...baseRepo,

    async getAllWithStats(): Promise<ProjectWithStats[]> {
      const projects = await baseRepo.getAll();
      const projectsWithStats: ProjectWithStats[] = [];

      for (const project of projects) {
        const tasks = (await getTasksByProjectId(project.id)) as Task[];
        projectsWithStats.push(calculateProjectStats(project, tasks));
      }

      return sortByLastActivity(projectsWithStats);
    },
  };
}
