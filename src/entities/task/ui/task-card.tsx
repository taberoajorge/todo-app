'use client';

import { Pencil, Trash2, Calendar, GripVertical } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui/card';
import { Checkbox } from '@/shared/ui/checkbox';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';
import type { Task } from '../model/types';
import { formatDeadline, isOverdue } from '../lib/format-deadline';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  isDragging?: boolean;
  dragHandleProps?: Record<string, unknown>;
}

export function TaskCard({
  task,
  onToggle,
  onEdit,
  onDelete,
  isDragging = false,
  dragHandleProps,
}: TaskCardProps) {
  const deadline = formatDeadline(task.deadline);
  const overdue = isOverdue(task.deadline) && !task.completed;

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        task.completed && 'opacity-60',
        isDragging && 'shadow-lg ring-2 ring-primary/20',
        overdue && !task.completed && 'border-destructive/50'
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Drag handle */}
          {dragHandleProps && (
            <button
              type="button"
              className="mt-0.5 cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
              {...dragHandleProps}
            >
              <GripVertical className="h-5 w-5" />
            </button>
          )}

          {/* Checkbox */}
          <Checkbox
            checked={task.completed}
            onCheckedChange={() => onToggle(task.id)}
            className="mt-0.5 h-5 w-5"
            aria-label={`Mark "${task.title}" as ${task.completed ? 'pending' : 'completed'}`}
          />

          {/* Content */}
          <div className="min-w-0 flex-1">
            <h3
              className={cn(
                'font-medium leading-tight',
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

          {/* Actions */}
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(task)}
              aria-label={`Edit "${task.title}"`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onDelete(task)}
              aria-label={`Delete "${task.title}"`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

