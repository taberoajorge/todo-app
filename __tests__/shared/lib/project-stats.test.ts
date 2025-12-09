import type { Project, ProjectWithStats, Task } from '@/shared/api';
import { calculateProjectStats, sortByLastActivity } from '@/shared/lib/project-stats';

describe('project-stats', () => {
  const baseProject: Project = {
    id: 'proj-1',
    name: 'Test Project',
    description: 'A test project',
    color: '#5f33e1',
    createdAt: '2024-01-01T00:00:00.000Z',
  };

  const createTask = (overrides: Partial<Task> = {}): Task => ({
    id: 'task-1',
    title: 'Test Task',
    description: undefined,
    deadline: '2024-06-15T12:00:00.000Z',
    status: 'todo',
    projectId: 'proj-1',
    createdAt: '2024-01-15T00:00:00.000Z',
    ...overrides,
  });

  describe('calculateProjectStats', () => {
    it('should return 0 stats for project with no tasks', () => {
      const result = calculateProjectStats(baseProject, []);

      expect(result.totalTasks).toBe(0);
      expect(result.completedTasks).toBe(0);
      expect(result.progress).toBe(0);
      expect(result.lastActivityAt).toBe(baseProject.createdAt);
    });

    it('should count total tasks correctly', () => {
      const tasks = [
        createTask({ id: '1', status: 'todo' }),
        createTask({ id: '2', status: 'in_progress' }),
        createTask({ id: '3', status: 'done' }),
      ];

      const result = calculateProjectStats(baseProject, tasks);

      expect(result.totalTasks).toBe(3);
    });

    it('should count only done tasks as completed', () => {
      const tasks = [
        createTask({ id: '1', status: 'todo' }),
        createTask({ id: '2', status: 'in_progress' }),
        createTask({ id: '3', status: 'done' }),
        createTask({ id: '4', status: 'done' }),
      ];

      const result = calculateProjectStats(baseProject, tasks);

      expect(result.completedTasks).toBe(2);
    });

    it('should calculate progress as percentage', () => {
      const tasks = [
        createTask({ id: '1', status: 'done' }),
        createTask({ id: '2', status: 'done' }),
        createTask({ id: '3', status: 'todo' }),
        createTask({ id: '4', status: 'todo' }),
      ];

      const result = calculateProjectStats(baseProject, tasks);

      expect(result.progress).toBe(50);
    });

    it('should round progress to nearest integer', () => {
      const tasks = [
        createTask({ id: '1', status: 'done' }),
        createTask({ id: '2', status: 'todo' }),
        createTask({ id: '3', status: 'todo' }),
      ];

      const result = calculateProjectStats(baseProject, tasks);

      // 1/3 = 33.33... should round to 33
      expect(result.progress).toBe(33);
    });

    it('should return 100% progress when all tasks are done', () => {
      const tasks = [
        createTask({ id: '1', status: 'done' }),
        createTask({ id: '2', status: 'done' }),
      ];

      const result = calculateProjectStats(baseProject, tasks);

      expect(result.progress).toBe(100);
    });

    it('should return 0% progress when no tasks are done', () => {
      const tasks = [
        createTask({ id: '1', status: 'todo' }),
        createTask({ id: '2', status: 'in_progress' }),
      ];

      const result = calculateProjectStats(baseProject, tasks);

      expect(result.progress).toBe(0);
    });

    it('should use project createdAt when no tasks exist', () => {
      const result = calculateProjectStats(baseProject, []);

      expect(result.lastActivityAt).toBe(baseProject.createdAt);
    });

    it('should use most recent task createdAt as lastActivityAt', () => {
      const tasks = [
        createTask({ id: '1', createdAt: '2024-01-10T00:00:00.000Z' }),
        createTask({ id: '2', createdAt: '2024-02-15T00:00:00.000Z' }), // most recent
        createTask({ id: '3', createdAt: '2024-01-20T00:00:00.000Z' }),
      ];

      const result = calculateProjectStats(baseProject, tasks);

      expect(result.lastActivityAt).toBe('2024-02-15T00:00:00.000Z');
    });

    it('should use project createdAt if it is more recent than all tasks', () => {
      const recentProject: Project = {
        ...baseProject,
        createdAt: '2024-06-01T00:00:00.000Z',
      };

      const tasks = [
        createTask({ id: '1', createdAt: '2024-01-10T00:00:00.000Z' }),
        createTask({ id: '2', createdAt: '2024-02-15T00:00:00.000Z' }),
      ];

      const result = calculateProjectStats(recentProject, tasks);

      // Project createdAt is more recent
      expect(result.lastActivityAt).toBe('2024-06-01T00:00:00.000Z');
    });

    it('should preserve all original project properties', () => {
      const result = calculateProjectStats(baseProject, []);

      expect(result.id).toBe(baseProject.id);
      expect(result.name).toBe(baseProject.name);
      expect(result.description).toBe(baseProject.description);
      expect(result.color).toBe(baseProject.color);
      expect(result.createdAt).toBe(baseProject.createdAt);
    });
  });

  describe('sortByLastActivity', () => {
    const createProjectWithStats = (id: string, lastActivityAt: string): ProjectWithStats => ({
      ...baseProject,
      id,
      totalTasks: 0,
      completedTasks: 0,
      progress: 0,
      lastActivityAt,
    });

    it('should return empty array for empty input', () => {
      const result = sortByLastActivity([]);
      expect(result).toEqual([]);
    });

    it('should sort projects by lastActivityAt descending (most recent first)', () => {
      const projects = [
        createProjectWithStats('old', '2024-01-01T00:00:00.000Z'),
        createProjectWithStats('newest', '2024-06-01T00:00:00.000Z'),
        createProjectWithStats('middle', '2024-03-01T00:00:00.000Z'),
      ];

      const result = sortByLastActivity(projects);

      expect(result.map((p) => p.id)).toEqual(['newest', 'middle', 'old']);
    });

    it('should not mutate original array', () => {
      const projects = [
        createProjectWithStats('a', '2024-01-01T00:00:00.000Z'),
        createProjectWithStats('b', '2024-06-01T00:00:00.000Z'),
      ];
      const originalOrder = projects.map((p) => p.id);

      sortByLastActivity(projects);

      expect(projects.map((p) => p.id)).toEqual(originalOrder);
    });

    it('should handle single project', () => {
      const projects = [createProjectWithStats('only', '2024-01-01T00:00:00.000Z')];

      const result = sortByLastActivity(projects);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('only');
    });

    it('should handle projects with same lastActivityAt', () => {
      const sameDate = '2024-06-01T00:00:00.000Z';
      const projects = [
        createProjectWithStats('a', sameDate),
        createProjectWithStats('b', sameDate),
        createProjectWithStats('c', sameDate),
      ];

      const result = sortByLastActivity(projects);

      // All should be present
      expect(result).toHaveLength(3);
    });
  });
});
