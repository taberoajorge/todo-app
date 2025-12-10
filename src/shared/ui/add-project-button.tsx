'use client';

import { Plus } from 'lucide-react';

interface AddProjectButtonProps {
  onClick: () => void;
}

export function AddProjectButton({ onClick }: AddProjectButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full min-h-[100px] items-center justify-center rounded-[10px] border-2 border-dashed border-muted-foreground/30 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
    >
      <Plus className="mr-2 h-5 w-5" />
      <span className="font-medium">New Project</span>
    </button>
  );
}
