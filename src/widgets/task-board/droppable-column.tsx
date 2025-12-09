'use client';

import { useDroppable } from '@dnd-kit/core';
import { ClipboardList } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

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
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-sm font-medium text-muted-foreground">
          {count}
        </span>
      </header>

      <div
        ref={setNodeRef}
        className={cn(
          // Base state - always visible drop zone
          'min-h-[200px] rounded-xl border-2 border-dashed p-4',
          'border-border/50 bg-muted/50',
          'transition-all duration-200',
          // Highlight when dragging over the zone
          isHighlighted &&
            'border-solid border-primary bg-primary/15 ring-2 ring-primary/40 ring-offset-2 ring-offset-background',
        )}
      >
        {count === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ClipboardList className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-sm text-muted-foreground">{emptyMessage}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
}
