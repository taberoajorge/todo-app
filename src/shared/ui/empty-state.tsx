'use client';

import { ClipboardList, type LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
    variant?: 'default' | 'outline' | 'ghost';
  };
  className?: string;
}

export function EmptyState({
  icon: Icon = ClipboardList,
  title,
  message,
  action,
  className,
}: EmptyStateProps) {
  const ActionIcon = action?.icon;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-[10px] border bg-card py-12 text-center',
        className,
      )}
    >
      <Icon className="mb-4 h-12 w-12 text-muted-foreground/50" />
      {title && <h2 className="mb-2 text-lg font-semibold">{title}</h2>}
      <p className="mb-4 text-sm text-muted-foreground">{message}</p>
      {action && (
        <Button
          onClick={action.onClick}
          variant={action.variant ?? 'default'}
          className="rounded-[10px]"
        >
          {ActionIcon && <ActionIcon className="mr-2 h-4 w-4" />}
          {action.label}
        </Button>
      )}
    </div>
  );
}
