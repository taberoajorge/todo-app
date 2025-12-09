/**
 * Storage keys for localStorage
 */
export const STORAGE_KEYS = {
  TASKS: 'todo-app-tasks',
  THEME: 'todo-app-theme',
} as const;

/**
 * Filter options for task list
 */
export const FILTER_OPTIONS = {
  ALL: 'all',
  ACTIVE: 'active',
  COMPLETED: 'completed',
} as const;

export type FilterOption = (typeof FILTER_OPTIONS)[keyof typeof FILTER_OPTIONS];

/**
 * Task field limits
 */
export const TASK_LIMITS = {
  TITLE_MAX: 100,
  DESCRIPTION_MAX: 500,
} as const;
