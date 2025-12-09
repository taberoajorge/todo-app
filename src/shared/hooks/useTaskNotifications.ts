'use client';

import { useCallback } from 'react';
import { toast } from 'sonner';
import type { Task } from '@/shared/api';

export function useTaskNotifications() {
  const notifyCreated = useCallback((task: Task) => {
    toast.success('Task created', {
      description: `"${task.title}" has been added to your list.`,
    });
  }, []);

  const notifyUpdated = useCallback((title: string) => {
    toast.success('Task updated', {
      description: `"${title}" has been updated.`,
    });
  }, []);

  const notifyDeleted = useCallback((task: Task) => {
    toast.success('Task deleted', {
      description: `"${task.title}" has been removed.`,
    });
  }, []);

  const notifyToggled = useCallback((task: Task, newStatus: boolean) => {
    toast.success(newStatus ? 'Task completed' : 'Task reopened', {
      description: `"${task.title}" marked as ${newStatus ? 'completed' : 'pending'}.`,
    });
  }, []);

  return {
    notifyCreated,
    notifyUpdated,
    notifyDeleted,
    notifyToggled,
  };
}
