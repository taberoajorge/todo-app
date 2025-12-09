'use client';

import { cn } from '@/shared/lib/utils';
import { Checkbox } from '@/shared/ui/checkbox';

interface TaskCheckboxProps {
  id: string;
  checked: boolean;
  onToggle?: (id: string) => void;
  label: string;
  className?: string;
  disabled?: boolean;
}

export function TaskCheckbox({
  id,
  checked,
  onToggle,
  label,
  className,
  disabled = false,
}: TaskCheckboxProps) {
  return (
    <Checkbox
      checked={checked}
      onCheckedChange={onToggle ? () => onToggle(id) : undefined}
      className={cn('mt-0.5 h-5 w-5', className)}
      aria-label={`Mark "${label}" as ${checked ? 'pending' : 'completed'}`}
      disabled={disabled}
    />
  );
}
