import { STORES } from '@/shared/config/constants';
import { calculateProjectStats, sortByLastActivity } from '@/shared/lib/project-stats';
import {
  createStore,
  deleteTasksByProjectId,
  type IDBStore,
} from '@/shared/lib/storage/indexeddb.adapter';
import { type BaseRepository, createBaseRepository } from './base-repository';
import type { Project, ProjectInput, ProjectWithStats, Task } from './types';

export interface ProjectRepository extends BaseRepository<Project, ProjectInput> {
  getAllWithStats(): Promise<ProjectWithStats[]>;
}

export function createProjectRepository(
  store: IDBStore<Project> = createStore<Project>(STORES.PROJECTS),
  taskStore: IDBStore<Task> = createStore<Task>(STORES.TASKS),
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
      const [projects, allTasks] = await Promise.all([baseRepo.getAll(), taskStore.getAll()]);

      const tasksByProject = new Map<string, Task[]>();
      for (const task of allTasks) {
        const list = tasksByProject.get(task.projectId) || [];
        list.push(task);
        tasksByProject.set(task.projectId, list);
      }

      const projectsWithStats = projects.map((project) =>
        calculateProjectStats(project, tasksByProject.get(project.id) || []),
      );

      return sortByLastActivity(projectsWithStats);
    },
  };
}
