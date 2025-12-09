/**
 * Core Task type definition
 */
export interface Task {
  id: string;
  title: string;
  description?: string;
  deadline?: string;
  completed: boolean;
  createdAt: string;
}

/**
 * Input type for creating/editing tasks
 */
export type TaskInput = Pick<Task, 'title' | 'description' | 'deadline'>;
