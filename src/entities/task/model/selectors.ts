import type { Task } from './types';

/**
 * Pure selector functions for task filtering
 */
export const selectPendingTasks = (tasks: Task[]): Task[] => tasks.filter((t) => !t.completed);

export const selectCompletedTasks = (tasks: Task[]): Task[] => tasks.filter((t) => t.completed);

export const selectTaskById = (tasks: Task[], id: string): Task | undefined =>
  tasks.find((t) => t.id === id);

export const selectTasksBySearch = (tasks: Task[], search: string): Task[] => {
  const normalizedSearch = search.toLowerCase().trim();
  if (!normalizedSearch) return tasks;
  return tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(normalizedSearch) ||
      t.description?.toLowerCase().includes(normalizedSearch)
  );
};

