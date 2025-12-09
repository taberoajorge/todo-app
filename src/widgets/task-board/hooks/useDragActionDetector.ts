'use client';

import { useCallback } from 'react';

export type DragAction =
  | { type: 'toggle'; id: string }
  | { type: 'reorder'; newOrder: string[] }
  | { type: 'none' };

interface UseDragActionDetectorParams {
  pendingIds: string[];
  getColumnForId: (id: string) => 'pending' | 'completed' | null;
}

/**
 * Hook that determines what action to take based on drag source and destination.
 * Returns a function that computes the appropriate DragAction.
 */
export function useDragActionDetector({ pendingIds, getColumnForId }: UseDragActionDetectorParams) {
  const getDragAction = useCallback(
    (activeId: string, overId: string): DragAction => {
      const fromColumn = getColumnForId(activeId);
      const toColumn = getColumnForId(overId);

      // Moving between columns triggers toggle
      const isMovingBetweenColumns =
        fromColumn !== toColumn && fromColumn !== null && toColumn !== null;
      if (isMovingBetweenColumns) {
        return { type: 'toggle', id: activeId };
      }

      // Reordering within pending column
      const isReorderingPending =
        fromColumn === 'pending' && toColumn === 'pending' && activeId !== overId;
      if (isReorderingPending) {
        const oldIndex = pendingIds.indexOf(activeId);
        const newIndex = pendingIds.indexOf(overId);
        const newOrder = [...pendingIds];
        newOrder.splice(oldIndex, 1);
        newOrder.splice(newIndex, 0, activeId);
        return { type: 'reorder', newOrder };
      }

      return { type: 'none' };
    },
    [pendingIds, getColumnForId],
  );

  return { getDragAction };
}
