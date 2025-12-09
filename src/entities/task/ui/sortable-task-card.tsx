'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskCheckbox } from '@/features/toggle-task';
import type { Task } from '@/shared/api';
import { cn } from '@/shared/lib/utils';
import { Card, CardContent } from '@/shared/ui/card';
import { DragHandle } from '@/shared/ui/drag-handle';
import { useTaskDeadlineStatus } from '../hooks';
import { TaskCardContent } from './task-card-content';

interface SortableTaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function SortableTaskCard({ task, onToggle, onEdit, onDelete }: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  const { formattedDeadline, isOverdue } = useTaskDeadlineStatus(task.deadline, task.completed);

  const { role: _role, ...safeAttributes } = attributes;

  return (
    <div ref={setNodeRef} style={style} {...safeAttributes}>
      <Card
        className={cn(
          'overflow-hidden transition-all duration-200',
          task.completed && 'opacity-60',
          isDragging && 'shadow-lg ring-2 ring-primary/20 opacity-90',
          isOverdue && 'border-destructive/50',
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <DragHandle ref={setActivatorNodeRef} isDragging={isDragging} {...listeners} />

            <TaskCheckbox
              id={task.id}
              checked={task.completed}
              onToggle={onToggle}
              label={task.title}
              className="flex-shrink-0"
            />

            <TaskCardContent
              task={task}
              formattedDeadline={formattedDeadline}
              isOverdue={isOverdue}
              onEdit={() => onEdit(task)}
              onDelete={() => onDelete(task)}
              showTooltips
              titleClassName="truncate"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
