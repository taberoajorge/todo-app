'use client';

import { cn } from '@/shared/lib/utils';

interface SectionHeaderProps {
  title: string;
  count: number;
  variant?: 'default' | 'primary';
  className?: string;
  children?: React.ReactNode;
}

export function SectionHeader({
  title,
  count,
  variant = 'default',
  className,
  children,
}: SectionHeaderProps) {
  return (
    <div className={cn('mb-4 flex items-center justify-between', className)}>
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-bold">{title}</h2>
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-sm font-medium',
            variant === 'primary' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
          )}
        >
          {count}
        </span>
      </div>
      {children}
    </div>
  );
}
