'use client';

import { useState } from 'react';
import { useTasks } from '@/shared/hooks';
import type { Task, TaskInput } from '@/shared/api';
import { TaskForm } from '@/features/create-task';
import { EditTaskDialog } from '@/features/edit-task';
import { DeleteConfirm } from '@/features/delete-task';
import { ThemeSwitch } from '@/features/toggle-theme';
import { SearchBar } from '@/features/filter-tasks';
import { TaskBoard } from '@/widgets/task-board';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

export default function HomePage() {
  const {
    pendingTasks,
    completedTasks,
    isLoading,
    searchQuery,
    setSearchQuery,
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

  // Handlers
  const handleAddTask = async (input: TaskInput) => {
    return addTask(input);
  };

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setIsEditDialogOpen(true);
  };

  const handleEditSave = async (id: string, input: TaskInput) => {
    await updateTask(id, input);
  };

  const handleDeleteClick = (task: Task) => {
    if (task.completed) {
      deleteTask(task.id);
    } else {
      setTaskToDelete(task);
      setIsDeleteDialogOpen(true);
    }
  };

  const handleDeleteConfirm = (id: string) => {
    deleteTask(id);
    setTaskToDelete(null);
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

        {/* Search */}
        <div className="mb-6">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        {/* Task Board with Drag & Drop */}
        <TaskBoard
          pendingTasks={pendingTasks}
          completedTasks={completedTasks}
          onToggle={toggleTask}
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
