'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useTasks } from '@/shared/hooks';
import type { Task, TaskInput } from '@/shared/api';
import { TaskForm } from '@/features/create-task';
import { EditTaskDialog } from '@/features/edit-task';
import { DeleteConfirm } from '@/features/delete-task';
import { ThemeSwitch } from '@/features/toggle-theme';
import { SearchBar, FilterDropdown } from '@/features/filter-tasks';
import { TaskBoard } from '@/widgets/task-board';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

export default function HomePage() {
  const {
    pendingTasks,
    completedTasks,
    totalPending,
    totalCompleted,
    isLoading,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    reorderTasks,
  } = useTasks();

  // Edit dialog state
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Delete confirmation state
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Handlers with toast notifications
  const handleAddTask = async (input: TaskInput) => {
    const task = await addTask(input);
    toast.success('Task created', {
      description: `"${task.title}" has been added to your list.`,
    });
    return task;
  };

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setIsEditDialogOpen(true);
  };

  const handleEditSave = async (id: string, input: TaskInput) => {
    await updateTask(id, input);
    toast.success('Task updated', {
      description: `"${input.title}" has been updated.`,
    });
  };

  const handleDeleteClick = (task: Task) => {
    if (task.completed) {
      deleteTask(task.id);
      toast.success('Task deleted', {
        description: `"${task.title}" has been removed.`,
      });
    } else {
      setTaskToDelete(task);
      setIsDeleteDialogOpen(true);
    }
  };

  const handleDeleteConfirm = (id: string) => {
    const task = taskToDelete;
    deleteTask(id);
    setTaskToDelete(null);
    if (task) {
      toast.success('Task deleted', {
        description: `"${task.title}" has been removed.`,
      });
    }
  };

  const handleToggle = async (id: string) => {
    await toggleTask(id);
    const task = [...pendingTasks, ...completedTasks].find((t) => t.id === id);
    if (task) {
      const newStatus = !task.completed;
      toast.success(newStatus ? 'Task completed' : 'Task reopened', {
        description: `"${task.title}" marked as ${newStatus ? 'completed' : 'pending'}.`,
      });
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background transition-colors duration-300">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Task Manager</h1>
            <p className="text-muted-foreground">Organize your day efficiently</p>
          </div>
          <ThemeSwitch />
        </header>

        {/* Add Task Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Add New Task</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskForm onSubmit={handleAddTask} />
          </CardContent>
        </Card>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
          <FilterDropdown
            value={filterStatus}
            onChange={setFilterStatus}
            pendingCount={totalPending}
            completedCount={totalCompleted}
          />
        </div>

        {/* Task Board with Drag & Drop */}
        <TaskBoard
          pendingTasks={pendingTasks}
          completedTasks={completedTasks}
          onToggle={handleToggle}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          onReorder={reorderTasks}
        />

        {/* Edit Dialog */}
        <EditTaskDialog
          task={editingTask}
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) setEditingTask(null);
          }}
          onSave={handleEditSave}
        />

        {/* Delete Confirmation */}
        <DeleteConfirm
          task={taskToDelete}
          open={isDeleteDialogOpen}
          onOpenChange={(open) => {
            setIsDeleteDialogOpen(open);
            if (!open) setTaskToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
        />
      </div>
    </main>
  );
}
