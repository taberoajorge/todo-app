'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import {
  createProjectRepository,
  createTaskRepository,
  type ProjectRepository,
  type TaskRepository,
} from '@/shared/api';
import {
  getSampleProject,
  getSampleTasks,
  isOnboardingComplete,
  markOnboardingComplete,
} from '@/shared/lib/onboarding';

interface Repositories {
  taskRepository: TaskRepository;
  projectRepository: ProjectRepository;
}

const RepositoryContext = createContext<Repositories | null>(null);

function useRepositories(): Repositories {
  const ctx = useContext(RepositoryContext);
  if (!ctx) {
    throw new Error('useRepositories must be used within Providers');
  }
  return ctx;
}

export function useTaskRepository(): TaskRepository {
  return useRepositories().taskRepository;
}

export function useProjectRepository(): ProjectRepository {
  return useRepositories().projectRepository;
}

function OnboardingSetup({
  projectRepo,
  taskRepo,
}: {
  projectRepo: ProjectRepository;
  taskRepo: TaskRepository;
}) {
  const [hasSetup, setHasSetup] = useState(false);

  useEffect(() => {
    async function setupOnboarding() {
      if (isOnboardingComplete() || hasSetup) {
        return;
      }

      const projects = await projectRepo.getAll();
      if (projects.length > 0) {
        markOnboardingComplete();
        return;
      }

      try {
        const projectData = getSampleProject();
        const project = await projectRepo.create(projectData);

        const tasksData = getSampleTasks(project.id);
        for (const taskData of tasksData) {
          await taskRepo.create(taskData);
        }

        markOnboardingComplete();
        setHasSetup(true);

        window.location.reload();
      } catch (error) {
        console.error('Failed to setup sample data:', error);
      }
    }

    setupOnboarding();
  }, [projectRepo, taskRepo, hasSetup]);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const repositories = useMemo(
    () => ({
      taskRepository: createTaskRepository(),
      projectRepository: createProjectRepository(),
    }),
    [],
  );

  return (
    <RepositoryContext.Provider value={repositories}>
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange={false}
      >
        <OnboardingSetup
          projectRepo={repositories.projectRepository}
          taskRepo={repositories.taskRepository}
        />
        {children}
      </NextThemesProvider>
    </RepositoryContext.Provider>
  );
}
