'use client';

import { KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

interface UseDndSensorsOptions {
  distance?: number;
}

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
