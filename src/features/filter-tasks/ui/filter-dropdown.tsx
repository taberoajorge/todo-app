'use client';

import { Filter } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';

export type FilterOption = 'all' | 'pending' | 'completed';

interface FilterDropdownProps {
  value: FilterOption;
  onChange: (value: FilterOption) => void;
}

const filterLabels: Record<FilterOption, string> = {
  all: 'All Tasks',
  pending: 'Pending Only',
  completed: 'Completed Only',
};

export function FilterDropdown({ value, onChange }: FilterDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">{filterLabels[value]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={value} onValueChange={(v) => onChange(v as FilterOption)}>
          <DropdownMenuRadioItem value="all">All Tasks</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="pending">Pending Only</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="completed">Completed Only</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

