import type { Task } from '@/shared/api/task-repository';

export interface TaskActions {
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}
