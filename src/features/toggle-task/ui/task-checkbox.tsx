'use client';

import { cn } from '@/shared/lib/utils';
import { Checkbox } from '@/shared/ui/checkbox';

interface TaskCheckboxProps {
  id: string;
  checked: boolean;
  onToggle: (id: string) => void;
  label: string;
  className?: string;
}

export function TaskCheckbox({ id, checked, onToggle, label, className }: TaskCheckboxProps) {
  return (
    <Checkbox
      checked={checked}
      onCheckedChange={() => onToggle(id)}
      className={cn('h-5 w-5', className)}
      aria-label={`Mark "${label}" as ${checked ? 'pending' : 'completed'}`}
    />
  );
}
