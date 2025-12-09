'use client';

import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/shared/lib/utils';
import { EmptyState } from '@/shared/ui/empty-state';
import { SectionHeader } from '@/shared/ui/section-header';

interface DroppableColumnProps {
  id: string;
  title: string;
  count: number;
  emptyMessage: string;
  children: React.ReactNode;
  isHighlighted?: boolean;
}

export function DroppableColumn({
  id,
  title,
  count,
  emptyMessage,
  children,
  isHighlighted = false,
}: DroppableColumnProps) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <section className="space-y-4 min-w-0 overflow-hidden">
      <SectionHeader title={title} count={count} />

      <div
        ref={setNodeRef}
        className={cn(
          'min-h-[200px] rounded-xl border-2 border-dashed p-4',
          'border-border/50 bg-muted/50',
          'transition-all duration-200',
          isHighlighted &&
            'border-solid border-primary bg-primary/15 ring-2 ring-primary/40 ring-offset-2 ring-offset-background',
        )}
      >
        {count === 0 ? (
          <EmptyState message={emptyMessage} className="border-none py-12" />
        ) : (
          children
        )}
      </div>
    </section>
  );
}
