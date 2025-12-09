'use client';

import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { useState } from 'react';
import type { Task } from '@/shared/api';
import { DroppableColumn } from './droppable-column';
import { SortableTaskCard } from '@/entities/task';
import { TaskCardOverlay } from './task-card-overlay';

interface TaskBoardProps {
  pendingTasks: Task[];
  completedTasks: Task[];
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onReorder: (orderedIds: string[]) => void;
}

export function TaskBoard({
  pendingTasks,
  completedTasks,
  onToggle,
  onEdit,
  onDelete,
  onReorder,
}: TaskBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const allTasks = [...pendingTasks, ...completedTasks];
  const pendingIds = pendingTasks.map((t) => t.id);
  const completedIds = completedTasks.map((t) => t.id);

  const findTask = (id: string) => allTasks.find((t) => t.id === id);

  const handleDragStart = (event: DragStartEvent) => {
    const task = findTask(String(event.active.id));
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const activeInPending = pendingIds.includes(activeId);
    const activeInCompleted = completedIds.includes(activeId);

    // Check if dropping on a column or task in different column
    const overIsPendingColumn = overId === 'pending';
    const overIsCompletedColumn = overId === 'completed';
    const overInPending = pendingIds.includes(overId);
    const overInCompleted = completedIds.includes(overId);

    // Moving from pending to completed
    if (activeInPending && (overIsCompletedColumn || overInCompleted)) {
      onToggle(activeId);
      return;
    }

    // Moving from completed to pending
    if (activeInCompleted && (overIsPendingColumn || overInPending)) {
      onToggle(activeId);
      return;
    }

    // Reorder within pending tasks
    if (activeInPending && overInPending && activeId !== overId) {
      const oldIndex = pendingIds.indexOf(activeId);
      const newIndex = pendingIds.indexOf(overId);

      const newOrder = [...pendingIds];
      newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, activeId);

      onReorder(newOrder);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToWindowEdges]}
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 min-w-0">
        <DroppableColumn
          id="pending"
          title="Pending"
          count={pendingTasks.length}
          emptyMessage="No pending tasks. Add one above!"
        >
          <SortableContext items={pendingIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {pendingTasks.map((task) => (
                <SortableTaskCard
                  key={task.id}
                  task={task}
                  onToggle={onToggle}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DroppableColumn>

        <DroppableColumn
          id="completed"
          title="Completed"
          count={completedTasks.length}
          emptyMessage="No completed tasks yet"
        >
          <SortableContext items={completedIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {completedTasks.map((task) => (
                <SortableTaskCard
                  key={task.id}
                  task={task}
                  onToggle={onToggle}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DroppableColumn>
      </div>

      <DragOverlay>
        {activeTask ? <TaskCardOverlay task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

