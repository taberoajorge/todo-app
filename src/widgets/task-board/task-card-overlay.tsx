'use client';

import { TaskCardContent, useTaskDeadlineStatus } from '@/entities/task';
import { TaskCheckbox } from '@/features/toggle-task';
import type { Task } from '@/shared/api';
import { cn } from '@/shared/lib/utils';
import { Card, CardContent } from '@/shared/ui/card';
import { DragHandle } from '@/shared/ui/drag-handle';

interface TaskCardOverlayProps {
  task: Task;
}

export function TaskCardOverlay({ task }: TaskCardOverlayProps) {
  const { formattedDeadline, isOverdue } = useTaskDeadlineStatus(task.deadline, task.completed);

  return (
    <Card
      className={cn(
        'rotate-3 scale-105 shadow-xl ring-2 ring-primary/30',
        task.completed && 'opacity-60',
        isOverdue && 'border-destructive/50',
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <DragHandle isDragging />

          <TaskCheckbox id={task.id} checked={task.completed} label={task.title} disabled />

          <TaskCardContent
            task={task}
            formattedDeadline={formattedDeadline}
            isOverdue={isOverdue}
            disabled
            titleClassName="truncate"
          />
        </div>
      </CardContent>
    </Card>
  );
}
