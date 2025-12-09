'use client';

import { Calendar, Pencil, Trash2 } from 'lucide-react';
import type { Task } from '@/shared/api';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip';

interface TaskCardContentProps {
  task: Task;
  formattedDeadline: string | null;
  isOverdue: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  disabled?: boolean;
  showTooltips?: boolean;
  titleClassName?: string;
}

export function TaskCardContent({
  task,
  formattedDeadline,
  isOverdue,
  onEdit,
  onDelete,
  disabled = false,
  showTooltips = false,
  titleClassName,
}: TaskCardContentProps) {
  const titleClasses = cn(
    'font-medium leading-tight',
    titleClassName,
    task.completed && 'text-muted-foreground line-through',
    showTooltips && 'cursor-default',
  );

  const descriptionClasses = cn(
    'mt-1 line-clamp-2 text-sm text-muted-foreground',
    task.completed && 'line-through',
    showTooltips && 'cursor-default',
  );

  const renderTitle = () => {
    const title = <h3 className={titleClasses}>{task.title}</h3>;

    if (!showTooltips) return title;

    return (
      <TooltipProvider delayDuration={400}>
        <Tooltip>
          <TooltipTrigger asChild>{title}</TooltipTrigger>
          <TooltipContent side="top" className="max-w-sm">
            <p className="break-words">{task.title}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const renderDescription = () => {
    if (!task.description) return null;

    const description = <p className={descriptionClasses}>{task.description}</p>;

    if (!showTooltips) return description;

    return (
      <TooltipProvider delayDuration={400}>
        <Tooltip>
          <TooltipTrigger asChild>{description}</TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-sm">
            <p className="break-words">{task.description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <>
      <div className="min-w-0 flex-1">
        {renderTitle()}
        {renderDescription()}

        {formattedDeadline && (
          <div
            className={cn(
              'mt-2 flex items-center gap-1.5 text-xs',
              isOverdue ? 'text-destructive' : 'text-muted-foreground',
            )}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>{formattedDeadline}</span>
          </div>
        )}
      </div>

      <div className="flex gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onEdit}
          disabled={disabled}
          aria-label={`Edit "${task.title}"`}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-8 w-8 text-destructive',
            !disabled && 'hover:bg-destructive/10 hover:text-destructive',
          )}
          onClick={onDelete}
          disabled={disabled}
          aria-label={`Delete "${task.title}"`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
}
