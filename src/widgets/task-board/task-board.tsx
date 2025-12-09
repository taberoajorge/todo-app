'use client';

import {
  closestCorners,
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
} from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useState } from 'react';
import { SortableTaskCard } from '@/entities/task';
import type { Task } from '@/shared/api';
import { useDndSensors } from '@/shared/hooks';
import { DroppableColumn } from './droppable-column';
import { TaskCardOverlay } from './task-card-overlay';

type ColumnType = 'pending' | 'completed';

interface TaskBoardProps {
  pendingTasks: Task[];
  completedTasks: Task[];
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onReorder: (orderedIds: string[]) => void;
}

function detectColumn(id: string, pendingIds: string[], completedIds: string[]): ColumnType | null {
  if (id === 'pending' || pendingIds.includes(id)) return 'pending';
  if (id === 'completed' || completedIds.includes(id)) return 'completed';
  return null;
}

function reorderIds(ids: string[], fromId: string, toId: string): string[] {
  const oldIndex = ids.indexOf(fromId);
  const newIndex = ids.indexOf(toId);
  const newOrder = [...ids];
  newOrder.splice(oldIndex, 1);
  newOrder.splice(newIndex, 0, fromId);
  return newOrder;
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
  const [overColumn, setOverColumn] = useState<ColumnType | null>(null);

  const sensors = useDndSensors();

  const allTasks = [...pendingTasks, ...completedTasks];
  const pendingIds = pendingTasks.map((t) => t.id);
  const completedIds = completedTasks.map((t) => t.id);

  const findTask = (id: string) => allTasks.find((t) => t.id === id);

  const handleDragStart = (event: DragStartEvent) => {
    const task = findTask(String(event.active.id));
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const overId = event.over ? String(event.over.id) : null;
    const column = overId ? detectColumn(overId, pendingIds, completedIds) : null;
    setOverColumn(column);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    setOverColumn(null);

    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const activeColumn = detectColumn(activeId, pendingIds, completedIds);
    const overColumn = detectColumn(overId, pendingIds, completedIds);

    if (activeColumn !== overColumn && overColumn !== null) {
      onToggle(activeId);
      return;
    }

    if (activeColumn === 'pending' && pendingIds.includes(overId) && activeId !== overId) {
      onReorder(reorderIds(pendingIds, activeId, overId));
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToWindowEdges]}
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 min-w-0">
        <DroppableColumn
          id="pending"
          title="Pending"
          count={pendingTasks.length}
          emptyMessage="No pending tasks. Add one above!"
          isHighlighted={overColumn === 'pending'}
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
          isHighlighted={overColumn === 'completed'}
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

      <DragOverlay>{activeTask ? <TaskCardOverlay task={activeTask} /> : null}</DragOverlay>
    </DndContext>
  );
}
