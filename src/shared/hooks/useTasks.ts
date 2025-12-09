'use client';

import { useState, useEffect, useCallback, useMemo, useContext, startTransition, createContext } from 'react';
import { useOptimistic } from 'react';
import type { Task, TaskInput, TaskRepository } from '@/shared/api/task-repository';

export type FilterStatus = 'all' | 'pending' | 'completed';

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
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

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

  // Filtered tasks based on search query and status filter
  const filteredTasks = useMemo(() => {
    let result = optimisticTasks;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (filterStatus === 'pending') {
      result = result.filter((t) => !t.completed);
    } else if (filterStatus === 'completed') {
      result = result.filter((t) => t.completed);
    }

    return result;
  }, [optimisticTasks, searchQuery, filterStatus]);

  // Derived state (for display in separate columns)
  const pendingTasks = useMemo(
    () => filteredTasks.filter((t) => !t.completed),
    [filteredTasks]
  );

  const completedTasks = useMemo(
    () => filteredTasks.filter((t) => t.completed),
    [filteredTasks]
  );

  // Counts (unfiltered for badges)
  const totalPending = useMemo(
    () => optimisticTasks.filter((t) => !t.completed).length,
    [optimisticTasks]
  );

  const totalCompleted = useMemo(
    () => optimisticTasks.filter((t) => t.completed).length,
    [optimisticTasks]
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
        const orderedIdsSet = new Set(orderedIds);

        // Reorder the specified tasks
        const reorderedTasks = orderedIds.map((id) => taskMap.get(id)).filter(Boolean) as Task[];

        // Preserve tasks not included in the reorder
        const preservedTasks = prev.filter((t) => !orderedIdsSet.has(t.id));

        return [...reorderedTasks, ...preservedTasks];
      });
    },
    [repository]
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

