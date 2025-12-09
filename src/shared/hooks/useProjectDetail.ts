'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProjectRepository } from '@/app/providers';
import type { Project, ProjectInput } from '@/shared/api';
import { ROUTES } from '@/shared/config/constants';

interface UseProjectDetailReturn {
  project: Project | null;
  isLoading: boolean;
  updateProject: (input: Partial<ProjectInput>) => Promise<void>;
  deleteProject: () => Promise<void>;
}

export function useProjectDetail(projectId: string): UseProjectDetailReturn {
  const router = useRouter();
  const projectRepo = useProjectRepository();

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const p = await projectRepo.getById(projectId);
        if (!p) {
          router.push(ROUTES.PROJECTS);
          return;
        }
        setProject(p);
      } catch (error) {
        console.error('Failed to load project:', error);
        router.push(ROUTES.PROJECTS);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [projectId, projectRepo, router]);

  const updateProject = async (input: Partial<ProjectInput>): Promise<void> => {
    if (!project) return;
    await projectRepo.update(project.id, input);
    setProject({ ...project, ...input });
  };

  const deleteProject = async (): Promise<void> => {
    if (!project) return;
    await projectRepo.delete(project.id);
    router.push(ROUTES.PROJECTS);
  };

  return {
    project,
    isLoading,
    updateProject,
    deleteProject,
  };
}
