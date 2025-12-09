'use client';

import { type Dispatch, type SetStateAction, useMemo, useState } from 'react';
import type { Task, TaskStatus } from '@/shared/api';
import type { TaskFilter } from '@/shared/config/constants';

const STATUS_ORDER: Record<TaskStatus, number> = {
  todo: 0,
  in_progress: 1,
  done: 2,
};

function sortTasksByStatusAndDeadline(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const statusDiff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    if (statusDiff !== 0) return statusDiff;
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });
}

function sortTasksByDeadline(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
}

interface TasksByStatus {
  todo: Task[];
  inProgress: Task[];
  done: Task[];
}

interface TabItem {
  id: string;
  label: string;
  count: number;
}

interface UseTaskFilteringReturn {
  activeFilter: TaskFilter;
  setActiveFilter: Dispatch<SetStateAction<TaskFilter>>;
  filteredTasks: Task[];
  tabs: TabItem[];
}

export function useTaskFiltering(
  tasks: Task[],
  tasksByStatus: TasksByStatus,
): UseTaskFilteringReturn {
  const [activeFilter, setActiveFilter] = useState<TaskFilter>('all');

  const filteredTasks = useMemo(() => {
    switch (activeFilter) {
      case 'todo':
        return sortTasksByDeadline(tasksByStatus.todo);
      case 'in_progress':
        return sortTasksByDeadline(tasksByStatus.inProgress);
      case 'done':
        return sortTasksByDeadline(tasksByStatus.done);
      default:
        return sortTasksByStatusAndDeadline(tasks);
    }
  }, [activeFilter, tasks, tasksByStatus]);

  const tabs = useMemo(
    () => [
      { id: 'all', label: 'All', count: tasks.length },
      { id: 'todo', label: 'To do', count: tasksByStatus.todo.length },
      { id: 'in_progress', label: 'In progress', count: tasksByStatus.inProgress.length },
      { id: 'done', label: 'Done', count: tasksByStatus.done.length },
    ],
    [tasks, tasksByStatus],
  );

  return {
    activeFilter,
    setActiveFilter,
    filteredTasks,
    tabs,
  };
}
