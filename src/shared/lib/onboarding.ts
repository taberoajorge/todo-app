import { addDays, addHours, startOfDay } from 'date-fns';
import type { Project, Task } from '@/shared/api/types';
import { COLORS } from './colors';

const ONBOARDING_KEY = 'todo-app-onboarding-complete';

export function isOnboardingComplete(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(ONBOARDING_KEY) === 'true';
}

export function markOnboardingComplete(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ONBOARDING_KEY, 'true');
}

export function getSampleProject(): Omit<Project, 'id' | 'createdAt'> {
  return {
    name: 'Getting Started',
    description: 'Learn how to use the app',
    color: COLORS.PRIMARY,
  };
}

export function getSampleTasks(projectId: string): Omit<Task, 'id' | 'createdAt'>[] {
  const today = startOfDay(new Date());

  return [
    {
      title: 'Welcome to Todo App!',
      description: 'This is your first task. Swipe right to mark it as done.',
      deadline: addHours(today, 14).toISOString(),
      status: 'todo',
      projectId,
    },
    {
      title: 'Try creating a new task',
      description: 'Tap the + button to create your own task.',
      deadline: addHours(today, 16).toISOString(),
      status: 'todo',
      projectId,
    },
    {
      title: 'Swipe left for In Progress',
      description: 'Swipe a task left to move it to In Progress status.',
      deadline: addDays(today, 1).toISOString(),
      status: 'in_progress',
      projectId,
    },
    {
      title: 'Create a new project',
      description: 'Go to Projects tab and create your own project.',
      deadline: addDays(today, 2).toISOString(),
      status: 'todo',
      projectId,
    },
  ];
}
