'use client';

import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Edit,
  MoreVertical,
  Plus,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useState } from 'react';
import { toast } from 'sonner';
import { CreateTaskModal } from '@/features/create-task';
import { EditProjectModal } from '@/features/edit-project';
import { EditTaskModal } from '@/features/edit-task';
import type { Task } from '@/shared/api';
import { ROUTES, type TaskFilter } from '@/shared/config/constants';
import { TOAST } from '@/shared/config/messages';
import { useDialogs } from '@/shared/hooks/useDialogs';
import { useProjectDetail } from '@/shared/hooks/useProjectDetail';
import { useSwipeHint } from '@/shared/hooks/useSwipeHint';
import { useTaskFiltering } from '@/shared/hooks/useTaskFiltering';
import { useTasks } from '@/shared/hooks/useTasks';
import { isOverdue } from '@/shared/lib/date-utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog';
import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { EmptyState } from '@/shared/ui/empty-state';
import { PageLayout } from '@/shared/ui/page-layout';
import { PageLoading } from '@/shared/ui/page-loading';
import { Tabs } from '@/shared/ui/tabs';
import { TaskCard } from '@/shared/ui/task-card';

interface PageProps {
  params: Promise<{ id: string }>;
}

type ProjectDialog = 'createTask' | 'editProject' | 'deleteProject' | 'deleteTask';

export default function ProjectDetailPage({ params }: PageProps) {
  const { id: projectId } = use(params);
  const router = useRouter();

  const { project, isLoading, updateProject, deleteProject } = useProjectDetail(projectId);
  const { showSwipeHint, dismissSwipeHint } = useSwipeHint();
  const dialogs = useDialogs<ProjectDialog>();

  const { tasks, todo, inProgress, done, createTask, updateTask, updateTaskStatus, deleteTask } =
    useTasks(projectId);

  const { activeFilter, setActiveFilter, filteredTasks, tabs } = useTaskFiltering(tasks, {
    todo,
    inProgress,
    done,
  });

  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const handleSwipeLeft = async (task: Task) => {
    if (task.status !== 'in_progress') {
      await updateTaskStatus(task.id, 'in_progress');
      toast.success(TOAST.TASK.IN_PROGRESS);
    }
  };

  const handleSwipeRight = async (task: Task) => {
    if (task.status !== 'done') {
      await updateTaskStatus(task.id, 'done');
      toast.success(TOAST.TASK.COMPLETED);
    }
  };

  const confirmRevert = async () => {
    if (taskToDelete) {
      await updateTaskStatus(taskToDelete.id, 'in_progress');
      toast.info(TOAST.TASK.REVERTED);
      setTaskToDelete(null);
      dialogs.close();
    }
  };

  const handleDeleteTask = async (task: Task) => {
    setTaskToDelete(task);
    dialogs.open('deleteTask');
  };

  const confirmDeleteTask = async () => {
    if (taskToDelete) {
      await deleteTask(taskToDelete.id);
      toast.info(TOAST.TASK.DELETED);
      setTaskToDelete(null);
      dialogs.close();
    }
  };

  const handleDeleteProject = async () => {
    if (project) {
      await deleteProject();
      toast.success(TOAST.PROJECT.DELETED(project.name));
    }
  };

  const handleUpdateProject = async (input: {
    name: string;
    description?: string;
    color: string;
  }) => {
    if (project) {
      await updateProject(input);
      toast.success(TOAST.PROJECT.UPDATED);
      dialogs.close();
    }
  };

  const handleCreateTask = async (input: {
    title: string;
    description?: string;
    deadline: string;
  }) => {
    await createTask({ ...input, projectId });
    toast.success(TOAST.TASK.CREATED);
    dialogs.close();
  };

  const handleUpdateTask = async (input: {
    title: string;
    description?: string;
    deadline: string;
  }) => {
    if (taskToEdit) {
      await updateTask(taskToEdit.id, input);
      toast.success(TOAST.TASK.UPDATED);
      setTaskToEdit(null);
    }
  };

  if (isLoading || !project) {
    return <PageLoading withBottomNav={false} />;
  }

  const showHint =
    showSwipeHint && filteredTasks.length > 0 && filteredTasks.some((t) => t.status !== 'done');

  const header = (
    <>
      <header className="mb-4 flex items-center gap-3 rounded-[10px] bg-card p-4 shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(ROUTES.PROJECTS)}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">{project.name}</h1>
          {project.description && (
            <p className="text-sm text-muted-foreground truncate">{project.description}</p>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => dialogs.open('editProject')}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => dialogs.open('deleteProject')}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <Tabs
        tabs={tabs}
        activeTab={activeFilter}
        onChange={(id) => setActiveFilter(id as TaskFilter)}
        className="mb-4"
      />

      {showHint && (
        <div className="mb-4 flex items-center gap-3 rounded-[10px] bg-primary/10 p-3 text-sm">
          <div className="flex items-center gap-1 text-primary">
            <ChevronLeft className="h-4 w-4 animate-pulse" />
            <ChevronRight className="h-4 w-4 animate-pulse" />
          </div>
          <p className="flex-1 text-primary">
            <strong>Tip:</strong> Swipe tasks left for In Progress, right for Done
          </p>
          <button
            type="button"
            onClick={dismissSwipeHint}
            className="text-xs font-medium text-primary hover:underline"
          >
            Got it
          </button>
        </div>
      )}
    </>
  );

  return (
    <>
      <PageLayout header={header} bottomPadding="fab">
        {filteredTasks.length === 0 ? (
          <EmptyState
            message={
              activeFilter === 'all'
                ? 'No tasks yet. Create one!'
                : `No ${activeFilter.replace('_', ' ')} tasks`
            }
            className="shadow-sm"
          />
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                projectColor={project.color}
                showStatusBadge={activeFilter === 'all'}
                isOverdue={isOverdue(task.deadline) && task.status !== 'done'}
                onSwipeLeft={() => handleSwipeLeft(task)}
                onSwipeRight={() => handleSwipeRight(task)}
                onClick={() => setTaskToEdit(task)}
              />
            ))}
          </div>
        )}
      </PageLayout>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <button
          type="button"
          onClick={() => dialogs.open('createTask')}
          className="flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-primary-foreground shadow-xl transition-all hover:scale-105 hover:shadow-2xl active:scale-95"
        >
          <Plus className="h-6 w-6" />
          <span className="text-lg font-semibold">New Task</span>
        </button>
      </div>

      <CreateTaskModal
        open={dialogs.isOpen('createTask')}
        onOpenChange={(open) => !open && dialogs.close()}
        onSubmit={handleCreateTask}
      />

      <EditProjectModal
        open={dialogs.isOpen('editProject')}
        onOpenChange={(open) => !open && dialogs.close()}
        project={project}
        onSubmit={handleUpdateProject}
      />

      <EditTaskModal
        open={!!taskToEdit}
        onOpenChange={(open) => !open && setTaskToEdit(null)}
        task={taskToEdit}
        onSubmit={handleUpdateTask}
        onDelete={() => taskToEdit && handleDeleteTask(taskToEdit)}
      />

      <AlertDialog
        open={dialogs.isOpen('deleteProject')}
        onOpenChange={(open) => !open && dialogs.close()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{project.name}&quot; and all its tasks. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={dialogs.isOpen('deleteTask')}
        onOpenChange={(open) => {
          if (!open) {
            dialogs.close();
            setTaskToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {taskToDelete?.status === 'done' ? 'Revert Task?' : 'Delete Task?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {taskToDelete?.status === 'done'
                ? `Move "${taskToDelete?.title}" back to In Progress?`
                : `Are you sure you want to delete "${taskToDelete?.title}"?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={taskToDelete?.status === 'done' ? confirmRevert : confirmDeleteTask}
              className={
                taskToDelete?.status !== 'done'
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : ''
              }
            >
              {taskToDelete?.status === 'done' ? 'Revert' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
