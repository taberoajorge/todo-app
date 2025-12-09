export const TOAST = {
  TASK: {
    CREATED: 'Task created',
    UPDATED: 'Task updated',
    DELETED: 'Task deleted',
    COMPLETED: 'Task completed!',
    IN_PROGRESS: 'Task moved to In progress',
    REVERTED: 'Task moved back to In progress',
  },
  PROJECT: {
    CREATED: (name: string) => `Project "${name}" created!`,
    UPDATED: 'Project updated',
    DELETED: (name: string) => `Project "${name}" deleted`,
  },
} as const;
