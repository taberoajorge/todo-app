'use client';

import { cn } from '@/shared/lib/utils';

interface PageLayoutProps {
  header: React.ReactNode;
  children: React.ReactNode;
  bottomPadding?: 'nav' | 'fab' | 'none';
  className?: string;
}

const paddingMap = {
  nav: 'pb-28',
  fab: 'pb-24',
  none: '',
};

export function PageLayout({
  header,
  children,
  bottomPadding = 'nav',
  className,
}: PageLayoutProps) {
  return (
    <main className={cn('flex h-dvh flex-col overflow-hidden', className)}>
      <div className="shrink-0 bg-background">
        <div className="mx-auto max-w-lg px-4 pt-6">{header}</div>
      </div>

      <div className={cn('flex-1 overflow-y-auto scrollbar-hide', paddingMap[bottomPadding])}>
        <div className="mx-auto max-w-lg px-4">{children}</div>
      </div>
    </main>
  );
}
