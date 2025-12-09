'use client';

import { KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

interface UseDndSensorsOptions {
  /** Minimum distance in pixels before drag starts (default: 8) */
  distance?: number;
}

/**
 * Hook that provides configured DnD sensors for drag-and-drop functionality.
 * Encapsulates PointerSensor and KeyboardSensor configuration.
 */
export function useDndSensors(options: UseDndSensorsOptions = {}) {
  const { distance = 8 } = options;

  return useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
}
