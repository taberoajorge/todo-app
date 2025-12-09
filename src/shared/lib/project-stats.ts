import type { Project, ProjectWithStats, Task } from '@/shared/api/types';

export function calculateProjectStats(project: Project, tasks: Task[]): ProjectWithStats {
  const totalTasks = tasks.length;
  const completedTasks = countCompletedTasks(tasks);
  const progress = calculateProgress(totalTasks, completedTasks);
  const lastActivityAt = findLastActivity(project.createdAt, tasks);

  return {
    ...project,
    totalTasks,
    completedTasks,
    progress,
    lastActivityAt,
  };
}

function countCompletedTasks(tasks: Task[]): number {
  return tasks.filter((t) => t.status === 'done').length;
}

function calculateProgress(total: number, completed: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

function findLastActivity(projectCreatedAt: string, tasks: Task[]): string {
  if (tasks.length === 0) return projectCreatedAt;

  return tasks.reduce((latest, task) => {
    const taskDate = new Date(task.createdAt).getTime();
    return taskDate > new Date(latest).getTime() ? task.createdAt : latest;
  }, projectCreatedAt);
}

export function sortByLastActivity(projects: ProjectWithStats[]): ProjectWithStats[] {
  return [...projects].sort(
    (a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime(),
  );
}
