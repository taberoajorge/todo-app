'use client';

import { cn } from '@/shared/lib/utils';

interface PageLoadingProps {
  className?: string;
  withBottomNav?: boolean;
}

export function PageLoading({ className, withBottomNav = true }: PageLoadingProps) {
  return (
    <main className={cn('min-h-dvh', withBottomNav && 'pb-28', className)}>
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    </main>
  );
}
