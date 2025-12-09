'use client';

import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { useCallback, useState } from 'react';
import type { Task } from '@/shared/api';
import type { DragAction } from './useDragActionDetector';

interface UseDragOverlayParams {
  findTask: (id: string) => Task | undefined;
  getColumnForId: (id: string) => 'pending' | 'completed' | null;
  getDragAction: (activeId: string, overId: string) => DragAction;
  onToggle: (id: string) => void;
  onReorder: (orderedIds: string[]) => void;
}

/**
 * Hook that manages drag overlay state and handlers.
 * Provides visual feedback during drag operations and executes actions on drop.
 */
export function useDragOverlay({
  findTask,
  getColumnForId,
  getDragAction,
  onToggle,
  onReorder,
}: UseDragOverlayParams) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [overColumn, setOverColumn] = useState<'pending' | 'completed' | null>(null);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const task = findTask(String(event.active.id));
      if (task) setActiveTask(task);
    },
    [findTask],
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { over } = event;
      setOverColumn(over ? getColumnForId(String(over.id)) : null);
    },
    [getColumnForId],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveTask(null);
      setOverColumn(null);

      if (!over) return;

      const action = getDragAction(String(active.id), String(over.id));

      if (action.type === 'toggle') {
        onToggle(action.id);
      } else if (action.type === 'reorder') {
        onReorder(action.newOrder);
      }
    },
    [getDragAction, onToggle, onReorder],
  );

  return {
    activeTask,
    overColumn,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}
