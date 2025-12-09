export const DB_NAME = 'todo-app-db';
export const DB_VERSION = 1;

export const STORES = {
  PROJECTS: 'projects',
  TASKS: 'tasks',
} as const;

export const TASK_LIMITS = {
  TITLE_MAX: 50,
  DESCRIPTION_MAX: 200,
} as const;

export const PROJECT_LIMITS = {
  NAME_MAX: 50,
  DESCRIPTION_MAX: 200,
} as const;

export const DEFAULTS = {
  TASK_TITLE: 'Untitled',
  USER_NAME: 'there',
  DEADLINE_HOUR: 12,
} as const;

const TASK_FILTERS = {
  ALL: 'all',
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
} as const;

export type TaskFilter = (typeof TASK_FILTERS)[keyof typeof TASK_FILTERS];

export const ROUTES = {
  HOME: '/',
  PROJECTS: '/projects',
  PROJECT_DETAIL: (id: string) => `/projects/${id}`,
} as const;
