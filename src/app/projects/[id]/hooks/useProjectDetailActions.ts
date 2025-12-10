'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useProjectFormState } from '@/features/create-project';
import { useTaskFormState } from '@/features/create-task';
import type { Project, Task } from '@/shared/api';
import { TOAST } from '@/shared/config/messages';
import type { useDialogs } from '@/shared/hooks/useDialogs';
import { useFormModal } from '@/shared/hooks/useFormModal';
import { useProjectDetail } from '@/shared/hooks/useProjectDetail';
import { useTasks } from '@/shared/hooks/useTasks';

type ProjectDialog = 'createTask' | 'editProject' | 'deleteProject' | 'deleteTask';

export function useProjectDetailActions(
  projectId: string,
  project: Project | null,
  dialogs: ReturnType<typeof useDialogs<ProjectDialog>>,
) {
  const { updateProject, deleteProject } = useProjectDetail(projectId);
  const { tasks, todo, inProgress, done, createTask, updateTask, updateTaskStatus, deleteTask } =
    useTasks(projectId);

  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const createTaskForm = useTaskFormState({ isOpen: dialogs.isOpen('createTask') });
  const editTaskForm = useTaskFormState({ initialTask: taskToEdit });
  const editProjectForm = useProjectFormState({ initialProject: project });

  const createTaskModal = useFormModal({
    onSubmit: async () => {
      const data = createTaskForm.getData();
      await createTask({ ...data, projectId });
      toast.success(TOAST.TASK.CREATED);
    },
  });

  const editTaskModal = useFormModal({
    onSubmit: async () => {
      if (taskToEdit) {
        const data = editTaskForm.getData();
        await updateTask(taskToEdit.id, data);
        toast.success(TOAST.TASK.UPDATED);
      }
    },
  });

  const editProjectModal = useFormModal({
    onSubmit: async () => {
      if (project) {
        const data = editProjectForm.getData();
        await updateProject(data);
        toast.success(TOAST.PROJECT.UPDATED);
      }
    },
  });

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
      setTaskToEdit(null);
      dialogs.close();
    }
  };

  const handleDeleteProject = async () => {
    if (project) {
      await deleteProject();
      toast.success(TOAST.PROJECT.DELETED(project.name));
    }
  };

  const handleCreateTaskSubmit = async () => {
    const validationError = createTaskForm.validate();
    if (validationError) {
      createTaskModal.setError(validationError);
      return;
    }
    const success = await createTaskModal.handleSubmit(undefined);
    if (success) {
      createTaskForm.reset();
      dialogs.close();
    }
  };

  const handleEditTaskSubmit = async () => {
    const validationError = editTaskForm.validate();
    if (validationError) {
      editTaskModal.setError(validationError);
      return;
    }
    const success = await editTaskModal.handleSubmit(undefined);
    if (success) {
      setTaskToEdit(null);
    }
  };

  const handleEditProjectSubmit = async () => {
    const validationError = editProjectForm.validateCurrentStep();
    if (validationError) {
      editProjectModal.setError(validationError);
      return;
    }
    const success = await editProjectModal.handleSubmit(undefined);
    if (success) {
      dialogs.close();
    }
  };

  const handleCreateTaskOpenChange = (open: boolean) => {
    if (!open) {
      createTaskForm.reset();
      createTaskModal.reset();
      dialogs.close();
    }
  };

  const handleEditTaskOpenChange = (open: boolean) => {
    if (!open) {
      editTaskModal.reset();
      setTaskToEdit(null);
    }
  };

  const handleEditProjectOpenChange = (open: boolean) => {
    if (!open) {
      editProjectModal.reset();
      dialogs.close();
    }
  };

  const handleDeleteTaskDialogChange = (open: boolean) => {
    if (!open) {
      dialogs.close();
      setTaskToDelete(null);
    }
  };

  return {
    tasks: { tasks, todo, inProgress, done },
    taskToEdit,
    setTaskToEdit,
    taskToDelete,
    createTaskForm,
    editTaskForm,
    editProjectForm,
    createTaskModal,
    editTaskModal,
    editProjectModal,
    handleSwipeLeft,
    handleSwipeRight,
    handleDeleteTask,
    confirmDeleteTask,
    confirmRevert,
    handleDeleteProject,
    handleCreateTaskSubmit,
    handleEditTaskSubmit,
    handleEditProjectSubmit,
    handleCreateTaskOpenChange,
    handleEditTaskOpenChange,
    handleEditProjectOpenChange,
    handleDeleteTaskDialogChange,
  };
}
