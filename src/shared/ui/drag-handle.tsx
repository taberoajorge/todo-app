'use client';

import { GripVertical } from 'lucide-react';
import { forwardRef } from 'react';
import { cn } from '@/shared/lib/utils';

interface DragHandleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isDragging?: boolean;
}

export const DragHandle = forwardRef<HTMLButtonElement, DragHandleProps>(
  ({ isDragging = false, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'mt-0.5 flex-shrink-0 touch-none text-muted-foreground hover:text-foreground focus:outline-none',
          isDragging ? 'cursor-grabbing' : 'cursor-grab active:cursor-grabbing',
          className,
        )}
        {...props}
      >
        <GripVertical className="h-5 w-5" />
      </button>
    );
  },
);

DragHandle.displayName = 'DragHandle';
