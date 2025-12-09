'use client';

import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useOptimistic,
  useState,
} from 'react';
import type { Task, TaskInput, TaskRepository } from '@/shared/api/task-repository';

export type FilterStatus = 'all' | 'pending' | 'completed';

export const RepositoryContext = createContext<TaskRepository | null>(null);

function useRepository(): TaskRepository {
  const repository = useContext(RepositoryContext);
  if (!repository) {
    throw new Error('useTasks must be used within a RepositoryProvider');
  }
  return repository;
}

function matchesSearch(task: Task, query: string): boolean {
  if (!query) return true;
  const lowerQuery = query.toLowerCase();
  return (
    task.title?.toLowerCase().includes(lowerQuery) ||
    task.description?.toLowerCase().includes(lowerQuery) ||
    false
  );
}

function matchesStatus(task: Task, status: FilterStatus): boolean {
  if (status === 'all') return true;
  if (status === 'pending') return !task.completed;
  return task.completed;
}

function partitionTasks(
  tasks: Task[],
  searchQuery: string,
  filterStatus: FilterStatus,
): { pending: Task[]; completed: Task[] } {
  const query = searchQuery.trim();
  const pending: Task[] = [];
  const completed: Task[] = [];

  for (const task of tasks) {
    if (!matchesSearch(task, query)) continue;
    if (!matchesStatus(task, filterStatus)) continue;

    if (task.completed) {
      completed.push(task);
    } else {
      pending.push(task);
    }
  }

  return { pending, completed };
}

export function useTasks() {
  const repository = useRepository();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  const [optimisticTasks, setOptimisticTask] = useOptimistic(
    tasks,
    (currentTasks: Task[], action: { type: 'toggle' | 'delete'; id: string }) => {
      if (action.type === 'toggle') {
        return currentTasks.map((t) =>
          t.id === action.id ? { ...t, completed: !t.completed } : t,
        );
      }
      if (action.type === 'delete') {
        return currentTasks.filter((t) => t.id !== action.id);
      }
      return currentTasks;
    },
  );

  useEffect(() => {
    async function loadTasks() {
      try {
        const loaded = await repository.getAll();
        setTasks(loaded);
      } catch (error) {
        console.error('Failed to load tasks:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadTasks();
  }, [repository]);

  const { pendingTasks, completedTasks } = useMemo(() => {
    const { pending, completed } = partitionTasks(optimisticTasks, searchQuery, filterStatus);
    return { pendingTasks: pending, completedTasks: completed };
  }, [optimisticTasks, searchQuery, filterStatus]);

  const totalPending = useMemo(
    () => optimisticTasks.filter((t) => !t.completed).length,
    [optimisticTasks],
  );

  const totalCompleted = useMemo(
    () => optimisticTasks.filter((t) => t.completed).length,
    [optimisticTasks],
  );

  const addTask = useCallback(
    async (input: TaskInput) => {
      const newTask = await repository.create(input);
      setTasks((prev) => [...prev, newTask]);
      return newTask;
    },
    [repository],
  );

  const updateTask = useCallback(
    async (id: string, updates: Partial<TaskInput>) => {
      await repository.update(id, updates);
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    },
    [repository],
  );

  const deleteTask = useCallback(
    async (id: string) => {
      startTransition(() => {
        setOptimisticTask({ type: 'delete', id });
      });
      await repository.delete(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    },
    [repository, setOptimisticTask],
  );

  const toggleTask = useCallback(
    async (id: string) => {
      startTransition(() => {
        setOptimisticTask({ type: 'toggle', id });
      });
      await repository.toggle(id);
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
    },
    [repository, setOptimisticTask],
  );

  const reorderTasks = useCallback(
    async (orderedIds: string[]) => {
      const allTasks = await repository.reorder(orderedIds);
      setTasks(allTasks);
    },
    [repository],
  );

  return {
    tasks: optimisticTasks,
    pendingTasks,
    completedTasks,
    totalPending,
    totalCompleted,
    isLoading,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    reorderTasks,
  };
}
