import type { Task } from '@/shared/api/task-repository';
import { createTaskRepository } from '@/shared/api/task-repository';
import type { ITaskStorage } from '@/shared/lib/storage';

describe('createTaskRepository', () => {
  let mockStorage: ITaskStorage;
  let tasks: Task[];

  beforeEach(() => {
    tasks = [];
    mockStorage = {
      getAll: jest.fn(() => Promise.resolve(tasks)),
      save: jest.fn((newTasks: Task[]) => {
        tasks = newTasks;
        return Promise.resolve();
      }),
      clear: jest.fn(() => {
        tasks = [];
        return Promise.resolve();
      }),
    };
  });

  const createTask = (overrides: Partial<Task> = {}): Task => ({
    id: crypto.randomUUID(),
    title: 'Test Task',
    completed: false,
    createdAt: new Date().toISOString(),
    ...overrides,
  });

  describe('getAll', () => {
    it('should return all tasks from storage', async () => {
      const task1 = createTask({ title: 'Task 1' });
      const task2 = createTask({ title: 'Task 2' });
      tasks = [task1, task2];

      const repository = createTaskRepository(mockStorage);
      const result = await repository.getAll();

      expect(result).toEqual([task1, task2]);
      expect(mockStorage.getAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no tasks', async () => {
      const repository = createTaskRepository(mockStorage);
      const result = await repository.getAll();

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create a new task with generated id', async () => {
      const repository = createTaskRepository(mockStorage);
      const input = { title: 'New Task', description: 'Description' };

      const result = await repository.create(input);

      expect(result.id).toBeDefined();
      expect(result.title).toBe('New Task');
      expect(result.description).toBe('Description');
      expect(result.completed).toBe(false);
      expect(result.createdAt).toBeDefined();
      expect(tasks).toContainEqual(result);
    });

    it('should append task to existing tasks', async () => {
      const existingTask = createTask({ title: 'Existing' });
      tasks = [existingTask];

      const repository = createTaskRepository(mockStorage);
      await repository.create({ title: 'New Task' });

      expect(tasks).toHaveLength(2);
    });
  });

  describe('update', () => {
    it('should update an existing task', async () => {
      const task = createTask({ title: 'Original Title' });
      tasks = [task];

      const repository = createTaskRepository(mockStorage);
      await repository.update(task.id, { title: 'Updated Title' });

      expect(tasks[0].title).toBe('Updated Title');
    });

    it('should not modify other tasks', async () => {
      const task1 = createTask({ id: 'task-1', title: 'Task 1' });
      const task2 = createTask({ id: 'task-2', title: 'Task 2' });
      tasks = [task1, task2];

      const repository = createTaskRepository(mockStorage);
      await repository.update('task-1', { title: 'Updated Task 1' });

      expect(tasks.find((t) => t.id === 'task-2')?.title).toBe('Task 2');
    });
  });

  describe('delete', () => {
    it('should remove a task by id', async () => {
      const task1 = createTask({ id: 'task-1' });
      const task2 = createTask({ id: 'task-2' });
      tasks = [task1, task2];

      const repository = createTaskRepository(mockStorage);
      await repository.delete('task-1');

      expect(tasks).toHaveLength(1);
      expect(tasks[0].id).toBe('task-2');
    });
  });

  describe('toggle', () => {
    it('should toggle task completed status', async () => {
      const task = createTask({ completed: false });
      tasks = [task];

      const repository = createTaskRepository(mockStorage);
      await repository.toggle(task.id);

      expect(tasks[0].completed).toBe(true);
    });

    it('should toggle back to false', async () => {
      const task = createTask({ completed: true });
      tasks = [task];

      const repository = createTaskRepository(mockStorage);
      await repository.toggle(task.id);

      expect(tasks[0].completed).toBe(false);
    });
  });

  describe('reorder', () => {
    it('should reorder tasks according to provided ids', async () => {
      const task1 = createTask({ id: 'task-1', title: 'First' });
      const task2 = createTask({ id: 'task-2', title: 'Second' });
      const task3 = createTask({ id: 'task-3', title: 'Third' });
      tasks = [task1, task2, task3];

      const repository = createTaskRepository(mockStorage);
      await repository.reorder(['task-3', 'task-1', 'task-2']);

      expect(tasks[0].id).toBe('task-3');
      expect(tasks[1].id).toBe('task-1');
      expect(tasks[2].id).toBe('task-2');
    });
  });

  describe('clear', () => {
    it('should clear all tasks', async () => {
      tasks = [createTask(), createTask()];

      const repository = createTaskRepository(mockStorage);
      await repository.clear();

      expect(mockStorage.clear).toHaveBeenCalled();
    });
  });
});
