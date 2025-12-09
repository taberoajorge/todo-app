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
}

export function DroppableColumn({
  id,
  title,
  count,
  emptyMessage,
  children,
}: DroppableColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id });

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
          'min-h-[120px] rounded-lg border-2 border-dashed border-transparent p-2 transition-colors',
          isOver && 'border-primary/50 bg-primary/5'
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

