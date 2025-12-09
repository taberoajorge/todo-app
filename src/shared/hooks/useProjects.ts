'use client';

import { type Dispatch, type SetStateAction, useCallback, useMemo, useState } from 'react';
import { useProjectRepository } from '@/app/providers';
import type { Project, ProjectInput, ProjectWithStats } from '@/shared/api';
import { useAsyncData } from './useAsyncData';

interface UseProjectsReturn {
  projects: ProjectWithStats[];
  allProjects: ProjectWithStats[];
  totalCount: number;
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  createProject: (input: ProjectInput) => Promise<Project>;
  updateProject: (id: string, input: Partial<ProjectInput>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  refreshProjects: () => Promise<void>;
}

export function useProjects(): UseProjectsReturn {
  const repository = useProjectRepository();
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: projects,
    isLoading,
    refetch,
    setData: setProjects,
  } = useAsyncData({
    fetchFn: () => repository.getAllWithStats(),
    deps: [repository],
    onError: (error) => console.error('Failed to load projects:', error),
  });

  const allProjects = projects ?? [];

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return allProjects;
    const q = searchQuery.toLowerCase();
    return allProjects.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q),
    );
  }, [allProjects, searchQuery]);

  const createProject = useCallback(
    async (input: ProjectInput): Promise<Project> => {
      const newProject = await repository.create(input);
      const updatedProjects = await repository.getAllWithStats();
      setProjects(updatedProjects);
      return newProject;
    },
    [repository, setProjects],
  );

  const updateProject = useCallback(
    async (id: string, input: Partial<ProjectInput>): Promise<void> => {
      await repository.update(id, input);
      const updatedProjects = await repository.getAllWithStats();
      setProjects(updatedProjects);
    },
    [repository, setProjects],
  );

  const deleteProject = useCallback(
    async (id: string): Promise<void> => {
      await repository.delete(id);
      setProjects((prev) => (prev ? prev.filter((p) => p.id !== id) : null));
    },
    [repository, setProjects],
  );

  return {
    projects: filteredProjects,
    allProjects,
    totalCount: allProjects.length,
    isLoading,
    searchQuery,
    setSearchQuery,
    createProject,
    updateProject,
    deleteProject,
    refreshProjects: refetch,
  };
}
