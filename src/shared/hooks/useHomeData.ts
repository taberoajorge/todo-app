'use client';

import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import type { Project, Task, TaskStatus } from '@/shared/api';
import { ROUTES } from '@/shared/config/constants';
import { TOAST } from '@/shared/config/messages';
import { useProjects } from './useProjects';
import { useTasks } from './useTasks';

interface TodayStats {
  total: number;
  completed: number;
  remaining: number;
}

interface UseHomeDataReturn {
  isLoading: boolean;
  todayTasks: Task[];
  todayTodo: Task[];
  inProgress: Task[];
  todayStats: TodayStats;
  projectMap: Map<string, Project>;
  isFreeDay: boolean;
  handleStatusChange: (task: Task, status: TaskStatus) => Promise<void>;
  getTaskRoute: (task: Task) => string;
}

export function useHomeData(): UseHomeDataReturn {
  const { todayTasks, inProgress, isLoading: tasksLoading, updateTaskStatus } = useTasks();

  const { projects, isLoading: projectsLoading } = useProjects();

  const isLoading = tasksLoading || projectsLoading;

  const todayStats = useMemo<TodayStats>(() => {
    const total = todayTasks.length;
    const completed = todayTasks.filter((t) => t.status === 'done').length;
    const remaining = total - completed;
    return { total, completed, remaining };
  }, [todayTasks]);

  const projectMap = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);

  const todayTodo = useMemo(() => todayTasks.filter((t) => t.status === 'todo'), [todayTasks]);

  const isFreeDay = !isLoading && todayTasks.length === 0;

  const handleStatusChange = useCallback(
    async (task: Task, status: TaskStatus) => {
      await updateTaskStatus(task.id, status);
      toast.success(status === 'done' ? TOAST.TASK.COMPLETED : TOAST.TASK.IN_PROGRESS);
    },
    [updateTaskStatus],
  );

  const getTaskRoute = useCallback((task: Task) => {
    return ROUTES.PROJECT_DETAIL(task.projectId);
  }, []);

  return {
    isLoading,
    todayTasks,
    todayTodo,
    inProgress,
    todayStats,
    projectMap,
    isFreeDay,
    handleStatusChange,
    getTaskRoute,
  };
}
