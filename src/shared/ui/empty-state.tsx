'use client';

import { ClipboardList, type LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  message: string;
  className?: string;
}

export function EmptyState({ icon: Icon = ClipboardList, message, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center',
        className,
      )}
    >
      <Icon className="h-12 w-12 text-muted-foreground/50" />
      <p className="mt-4 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
