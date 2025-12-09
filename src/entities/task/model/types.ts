// Task types are defined in @/shared/api/task-repository
// Re-exported from entities/task/index.ts for convenience
export type { Task, TaskInput } from '@/shared/api/task-repository';

import type { Task } from '@/shared/api/task-repository';

export interface TaskActions {
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}
