'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, GripVertical, Pencil, Trash2 } from 'lucide-react';
import type { Task } from '@/shared/api';
import { formatDeadline, isOverdue } from '@/shared/lib/formatters';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { Checkbox } from '@/shared/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip';

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

  const deadline = formatDeadline(task.deadline);
  const overdue = isOverdue(task.deadline) && !task.completed;

  // Remove role from attributes to prevent the whole card being a button
  const { role: _role, ...safeAttributes } = attributes;

  return (
    <div ref={setNodeRef} style={style} {...safeAttributes}>
      <Card
        className={cn(
          'overflow-hidden transition-all duration-200',
          task.completed && 'opacity-60',
          isDragging && 'shadow-lg ring-2 ring-primary/20 opacity-90',
          overdue && !task.completed && 'border-destructive/50',
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Drag handle */}
            <button
              ref={setActivatorNodeRef}
              type="button"
              className="mt-0.5 flex-shrink-0 cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing focus:outline-none"
              {...listeners}
            >
              <GripVertical className="h-5 w-5" />
            </button>

            {/* Checkbox */}
            <Checkbox
              checked={task.completed}
              onCheckedChange={() => onToggle(task.id)}
              className="mt-0.5 h-5 w-5 flex-shrink-0"
              aria-label={`Mark "${task.title}" as ${task.completed ? 'pending' : 'completed'}`}
            />

            {/* Content */}
            <div className="flex-1 min-w-0">
              <TooltipProvider delayDuration={400}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <h3
                      className={cn(
                        'truncate font-medium leading-tight cursor-default',
                        task.completed && 'text-muted-foreground line-through',
                      )}
                    >
                      {task.title}
                    </h3>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-sm">
                    <p className="break-words">{task.title}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {task.description && (
                <TooltipProvider delayDuration={400}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p
                        className={cn(
                          'mt-1 line-clamp-2 text-sm text-muted-foreground cursor-default',
                          task.completed && 'line-through',
                        )}
                      >
                        {task.description}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-sm">
                      <p className="break-words">{task.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {deadline && (
                <div
                  className={cn(
                    'mt-2 flex items-center gap-1.5 text-xs',
                    overdue ? 'text-destructive' : 'text-muted-foreground',
                  )}
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{deadline}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-1 flex-shrink-0">
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
    </div>
  );
}
