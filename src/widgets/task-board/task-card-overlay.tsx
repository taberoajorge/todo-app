'use client';

import { GripVertical, Pencil, Trash2, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui/card';
import { Checkbox } from '@/shared/ui/checkbox';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';
import type { Task } from '@/shared/api';
import { formatDeadline, isOverdue } from '@/shared/lib/formatters';

interface TaskCardOverlayProps {
  task: Task;
}

export function TaskCardOverlay({ task }: TaskCardOverlayProps) {
  const deadline = formatDeadline(task.deadline);
  const overdue = isOverdue(task.deadline) && !task.completed;

  return (
    <Card
      className={cn(
        'rotate-3 scale-105 shadow-xl ring-2 ring-primary/30',
        task.completed && 'opacity-60',
        overdue && !task.completed && 'border-destructive/50'
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <button
            type="button"
            className="mt-0.5 cursor-grabbing text-muted-foreground"
          >
            <GripVertical className="h-5 w-5" />
          </button>

          <Checkbox
            checked={task.completed}
            className="mt-0.5 h-5 w-5"
            disabled
          />

          <div className="min-w-0 flex-1">
            <h3
              className={cn(
                'truncate font-medium leading-tight',
                task.completed && 'text-muted-foreground line-through'
              )}
            >
              {task.title}
            </h3>

            {task.description && (
              <p
                className={cn(
                  'mt-1 line-clamp-2 text-sm text-muted-foreground',
                  task.completed && 'line-through'
                )}
              >
                {task.description}
              </p>
            )}

            {deadline && (
              <div
                className={cn(
                  'mt-2 flex items-center gap-1.5 text-xs',
                  overdue ? 'text-destructive' : 'text-muted-foreground'
                )}
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>{deadline}</span>
              </div>
            )}
          </div>

          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              disabled
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

