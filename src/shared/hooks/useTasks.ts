'use client';

import { useState, useEffect, useCallback, useMemo, useContext, startTransition, createContext } from 'react';
import { useOptimistic } from 'react';
import type { Task, TaskInput, TaskRepository } from '@/shared/api/task-repository';

// Repository context for dependency injection
export const RepositoryContext = createContext<TaskRepository | null>(null);

function useRepository(): TaskRepository {
  const repository = useContext(RepositoryContext);
  if (!repository) {
    throw new Error('useTasks must be used within a RepositoryProvider');
  }
  return repository;
}

/**
 * Main hook for task state management
 * Uses repository pattern for data operations
 */
export function useTasks() {
  const repository = useRepository();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Optimistic state for instant UI feedback
  const [optimisticTasks, setOptimisticTask] = useOptimistic(
    tasks,
    (currentTasks: Task[], action: { type: 'toggle' | 'delete'; id: string }) => {
      switch (action.type) {
        case 'toggle':
          return currentTasks.map((t) =>
            t.id === action.id ? { ...t, completed: !t.completed } : t
          );
        case 'delete':
          return currentTasks.filter((t) => t.id !== action.id);
        default:
          return currentTasks;
      }
    }
  );

  // Load tasks on mount
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

  // Filtered tasks based on search query
  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return optimisticTasks;
    const query = searchQuery.toLowerCase();
    return optimisticTasks.filter(
      (t) =>
        t.title.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query)
    );
  }, [optimisticTasks, searchQuery]);

  // Derived state
  const pendingTasks = useMemo(
    () => filteredTasks.filter((t) => !t.completed),
    [filteredTasks]
  );

  const completedTasks = useMemo(
    () => filteredTasks.filter((t) => t.completed),
    [filteredTasks]
  );

  // Actions
  const addTask = useCallback(
    async (input: TaskInput) => {
      const newTask = await repository.create(input);
      setTasks((prev) => [...prev, newTask]);
      return newTask;
    },
    [repository]
  );

  const updateTask = useCallback(
    async (id: string, updates: Partial<TaskInput>) => {
      await repository.update(id, updates);
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    },
    [repository]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      startTransition(() => {
        setOptimisticTask({ type: 'delete', id });
      });
      await repository.delete(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    },
    [repository, setOptimisticTask]
  );

  const toggleTask = useCallback(
    async (id: string) => {
      startTransition(() => {
        setOptimisticTask({ type: 'toggle', id });
      });
      await repository.toggle(id);
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
    },
    [repository, setOptimisticTask]
  );

  const reorderTasks = useCallback(
    async (orderedIds: string[]) => {
      await repository.reorder(orderedIds);
      setTasks((prev) => {
        const taskMap = new Map(prev.map((t) => [t.id, t]));
        return orderedIds.map((id) => taskMap.get(id)).filter(Boolean) as Task[];
      });
    },
    [repository]
  );

  return {
    tasks: optimisticTasks,
    pendingTasks,
    completedTasks,
    isLoading,
    searchQuery,
    setSearchQuery,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    reorderTasks,
  };
}

