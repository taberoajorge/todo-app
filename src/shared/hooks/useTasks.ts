'use client';

import { startTransition, useCallback, useEffect, useMemo, useOptimistic, useState } from 'react';
import { useTaskRepository } from '@/app/providers';
import type { Task, TaskInput, TaskStatus } from '@/shared/api';
import { filterByToday } from '@/shared/lib/date-utils';

interface UseTasksReturn {
  tasks: Task[];
  todo: Task[];
  inProgress: Task[];
  done: Task[];
  todayTasks: Task[];
  isLoading: boolean;
  createTask: (input: TaskInput) => Promise<Task>;
  updateTask: (id: string, input: Partial<TaskInput>) => Promise<void>;
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

export function useTasks(projectId?: string): UseTasksReturn {
  const repository = useTaskRepository();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  type OptimisticAction =
    | { type: 'status'; id: string; status: TaskStatus }
    | { type: 'delete'; id: string };

  const [optimisticTasks, updateOptimistic] = useOptimistic(
    tasks,
    (current: Task[], action: OptimisticAction) => {
      switch (action.type) {
        case 'status':
          return current.map((t) => (t.id === action.id ? { ...t, status: action.status } : t));
        case 'delete':
          return current.filter((t) => t.id !== action.id);
        default:
          return current;
      }
    },
  );

  useEffect(() => {
    async function load() {
      try {
        const data = projectId
          ? await repository.getByProjectId(projectId)
          : await repository.getAll();
        setTasks(data);
      } catch (error) {
        console.error('Failed to load tasks:', error);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [repository, projectId]);

  const tasksByStatus = useMemo(() => {
    const todo = optimisticTasks.filter((t) => t.status === 'todo');
    const inProgress = optimisticTasks.filter((t) => t.status === 'in_progress');
    const done = optimisticTasks.filter((t) => t.status === 'done');
    return { todo, inProgress, done };
  }, [optimisticTasks]);

  const todayTasks = useMemo(
    () => filterByToday(optimisticTasks, (t) => t.deadline),
    [optimisticTasks],
  );

  const createTask = useCallback(
    async (input: TaskInput): Promise<Task> => {
      const task = await repository.create(input);
      setTasks((prev) => [...prev, task]);
      return task;
    },
    [repository],
  );

  const updateTask = useCallback(
    async (id: string, input: Partial<TaskInput>): Promise<void> => {
      await repository.update(id, input);
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...input } : t)));
    },
    [repository],
  );

  const updateTaskStatus = useCallback(
    async (id: string, status: TaskStatus): Promise<void> => {
      startTransition(() => {
        updateOptimistic({ type: 'status', id, status });
      });
      await repository.updateStatus(id, status);
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    },
    [repository, updateOptimistic],
  );

  const deleteTask = useCallback(
    async (id: string): Promise<void> => {
      startTransition(() => {
        updateOptimistic({ type: 'delete', id });
      });
      await repository.delete(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    },
    [repository, updateOptimistic],
  );

  return {
    tasks: optimisticTasks,
    ...tasksByStatus,
    todayTasks,
    isLoading,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
  };
}
