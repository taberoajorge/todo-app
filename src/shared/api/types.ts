export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description?: string;
  deadline: string;
  status: TaskStatus;
  projectId: string;
  createdAt: string;
}

export type TaskInput = Pick<Task, 'title' | 'description' | 'deadline' | 'projectId'>;

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  createdAt: string;
}

export type ProjectInput = Pick<Project, 'name' | 'description' | 'color'>;

export const PROJECT_COLORS = [
  '#5f33e1',
  '#ffe5a4',
  '#f77bba',
  '#ebe4ff',
  '#7dc8e7',
  '#77dd77',
] as const;

export type ProjectColor = (typeof PROJECT_COLORS)[number];

export interface ProjectWithStats extends Project {
  totalTasks: number;
  completedTasks: number;
  progress: number;
  lastActivityAt: string;
}
