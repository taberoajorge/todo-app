'use client';

import { format } from 'date-fns';
import { Check, Clock, Play } from 'lucide-react';
import type { Task, TaskStatus } from '@/shared/api';
import { calculateTimeProgress } from '@/shared/lib/formatters';
import { cn } from '@/shared/lib/utils';
import { ProgressRing } from '@/shared/ui/progress-ring';
import { SwipeableCard } from '@/shared/ui/swipeable-card';

interface TaskCardProps {
  task: Task;
  projectColor: string;
  showStatusBadge?: boolean;
  isOverdue?: boolean;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onClick?: () => void;
}

function getProgress(task: Task): number {
  if (task.status === 'done') return 100;
  return calculateTimeProgress(task.createdAt, task.deadline);
}

function getStatusLabel(status: TaskStatus): string {
  switch (status) {
    case 'in_progress':
      return 'In Progress';
    case 'todo':
      return 'To Do';
    default:
      return 'Done';
  }
}

export function TaskCard({
  task,
  projectColor,
  showStatusBadge = false,
  isOverdue = false,
  onSwipeLeft,
  onSwipeRight,
  onClick,
}: TaskCardProps) {
  const progress = getProgress(task);
  const isDone = task.status === 'done';

  return (
    <SwipeableCard
      left={{
        label: 'In Progress',
        icon: <Play className="h-5 w-5" />,
        color: 'bg-primary',
        onSwipe: onSwipeLeft,
      }}
      right={{
        label: 'Done',
        icon: <Check className="h-5 w-5" />,
        color: 'bg-green-500',
        onSwipe: onSwipeRight,
      }}
      disabled={isDone}
    >
      <button
        type="button"
        className={cn(
          'w-full text-left cursor-pointer rounded-[10px] border bg-card shadow-sm transition-all hover:shadow-md',
          isOverdue && 'border-destructive/50 bg-destructive/5',
        )}
        onClick={onClick}
      >
        <div className="flex items-center gap-4 p-4">
          <ProgressRing progress={progress} size={44} strokeWidth={4} color={projectColor} />
          <div className="min-w-0 flex-1">
            {showStatusBadge && <StatusBadge status={task.status} />}
            <h3
              className={cn('truncate font-medium', isDone && 'text-muted-foreground line-through')}
            >
              {task.title}
            </h3>
            {task.description && (
              <p className="truncate text-sm text-muted-foreground">{task.description}</p>
            )}
            <div
              className={cn(
                'mt-1 flex items-center gap-1 text-xs',
                isOverdue ? 'text-destructive' : 'text-muted-foreground',
              )}
            >
              <Clock className="h-3 w-3" />
              {format(new Date(task.deadline), 'MMM d, h:mm a')}
              {isOverdue && ' (Overdue)'}
            </div>
          </div>
        </div>
      </button>
    </SwipeableCard>
  );
}

function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span
      className={cn(
        'inline-block mb-1 text-[10px] font-medium uppercase tracking-wide px-1.5 py-0.5 rounded',
        status === 'todo' && 'bg-muted text-muted-foreground',
        status === 'in_progress' && 'bg-primary/20 text-primary',
        status === 'done' && 'bg-green-500/20 text-green-600 dark:text-green-400',
      )}
    >
      {getStatusLabel(status)}
    </span>
  );
}
