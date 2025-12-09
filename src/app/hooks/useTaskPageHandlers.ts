'use client';

import { useCallback, useMemo } from 'react';
import type { TaskActions } from '@/entities/task';
import type { Task, TaskInput } from '@/shared/api';
import { useDialogState, useTaskNotifications, useTasks } from '@/shared/hooks';

/**
 * Hook that encapsulates all task page handlers and state management.
 * Combines useTasks, dialog states, and notifications into a single interface.
 */
export function useTaskPageHandlers() {
  const tasks = useTasks();
  const notifications = useTaskNotifications();
  const editDialog = useDialogState<Task>();
  const deleteDialog = useDialogState<Task>();

  // Memoized Map for O(1) task lookups
  const tasksById = useMemo(
    () => new Map([...tasks.pendingTasks, ...tasks.completedTasks].map((t) => [t.id, t])),
    [tasks.pendingTasks, tasks.completedTasks],
  );

  const handleAddTask = useCallback(
    async (input: TaskInput) => {
      const task = await tasks.addTask(input);
      notifications.notifyCreated(task);
      return task;
    },
    [tasks, notifications],
  );

  const handleEditClick = useCallback(
    (task: Task) => {
      editDialog.open(task);
    },
    [editDialog],
  );

  const handleEditSave = useCallback(
    async (id: string, input: TaskInput) => {
      await tasks.updateTask(id, input);
      notifications.notifyUpdated(input.title);
    },
    [tasks, notifications],
  );

  const handleDeleteClick = useCallback(
    (task: Task) => {
      if (task.completed) {
        tasks.deleteTask(task.id);
        notifications.notifyDeleted(task);
      } else {
        deleteDialog.open(task);
      }
    },
    [tasks, notifications, deleteDialog],
  );

  const handleDeleteConfirm = useCallback(
    (id: string) => {
      const task = tasksById.get(id);
      tasks.deleteTask(id);
      deleteDialog.close();
      if (task) {
        notifications.notifyDeleted(task);
      }
    },
    [tasks, tasksById, notifications, deleteDialog],
  );

  const handleToggle = useCallback(
    async (id: string) => {
      const task = tasksById.get(id);
      await tasks.toggleTask(id);
      if (task) {
        const newStatus = !task.completed;
        notifications.notifyToggled(task, newStatus);
      }
    },
    [tasks, tasksById, notifications],
  );

  const taskActions: TaskActions = useMemo(
    () => ({
      onToggle: handleToggle,
      onEdit: handleEditClick,
      onDelete: handleDeleteClick,
    }),
    [handleToggle, handleEditClick, handleDeleteClick],
  );

  return {
    // Task data
    pendingTasks: tasks.pendingTasks,
    completedTasks: tasks.completedTasks,
    totalPending: tasks.totalPending,
    totalCompleted: tasks.totalCompleted,
    isLoading: tasks.isLoading,

    // Search and filter
    searchQuery: tasks.searchQuery,
    setSearchQuery: tasks.setSearchQuery,
    filterStatus: tasks.filterStatus,
    setFilterStatus: tasks.setFilterStatus,

    // Dialog states
    editDialog,
    deleteDialog,

    // Handlers
    handleAddTask,
    handleEditSave,
    handleDeleteConfirm,
    reorderTasks: tasks.reorderTasks,

    // Task actions for TaskBoard
    taskActions,
  };
}
