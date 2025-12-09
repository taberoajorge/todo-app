'use client';

import { Filter } from 'lucide-react';
import type { FilterStatus } from '@/shared/hooks';
import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';

interface FilterDropdownProps {
  value: FilterStatus;
  onChange: (value: FilterStatus) => void;
  pendingCount?: number;
  completedCount?: number;
}

const filterLabels: Record<FilterStatus, string> = {
  all: 'All Tasks',
  pending: 'Pending Only',
  completed: 'Completed Only',
};

export function FilterDropdown({
  value,
  onChange,
  pendingCount,
  completedCount,
}: FilterDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">{filterLabels[value]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={value} onValueChange={(v) => onChange(v as FilterStatus)}>
          <DropdownMenuRadioItem value="all">
            All Tasks
            {pendingCount !== undefined && completedCount !== undefined && (
              <span className="ml-auto text-xs text-muted-foreground">
                {pendingCount + completedCount}
              </span>
            )}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="pending">
            Pending Only
            {pendingCount !== undefined && (
              <span className="ml-auto text-xs text-muted-foreground">{pendingCount}</span>
            )}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="completed">
            Completed Only
            {completedCount !== undefined && (
              <span className="ml-auto text-xs text-muted-foreground">{completedCount}</span>
            )}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
