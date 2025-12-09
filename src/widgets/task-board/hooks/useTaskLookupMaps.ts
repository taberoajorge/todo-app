'use client';

import { useMemo } from 'react';
import type { Task } from '@/shared/api';

/**
 * Hook that provides efficient lookup structures for tasks.
 * Uses Map and Set for O(1) lookups instead of O(n) array searches.
 */
export function useTaskLookupMaps(pendingTasks: Task[], completedTasks: Task[]) {
  const allTasks = useMemo(
    () => [...pendingTasks, ...completedTasks],
    [pendingTasks, completedTasks],
  );

  const pendingIds = useMemo(() => pendingTasks.map((t) => t.id), [pendingTasks]);

  const completedIds = useMemo(() => completedTasks.map((t) => t.id), [completedTasks]);

  const pendingIdSet = useMemo(() => new Set(pendingIds), [pendingIds]);
  const completedIdSet = useMemo(() => new Set(completedIds), [completedIds]);

  const taskMap = useMemo(() => new Map(allTasks.map((t) => [t.id, t])), [allTasks]);

  const findTask = (id: string) => taskMap.get(id);

  const getColumnForId = (id: string): 'pending' | 'completed' | null => {
    if (id === 'pending' || pendingIdSet.has(id)) return 'pending';
    if (id === 'completed' || completedIdSet.has(id)) return 'completed';
    return null;
  };

  return {
    allTasks,
    pendingIds,
    completedIds,
    pendingIdSet,
    completedIdSet,
    taskMap,
    findTask,
    getColumnForId,
  };
}
