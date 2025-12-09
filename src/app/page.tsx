'use client';

import { TaskForm } from '@/features/create-task';
import { DeleteConfirm } from '@/features/delete-task';
import { EditTaskDialog } from '@/features/edit-task';
import { FilterDropdown, SearchBar } from '@/features/filter-tasks';
import { ThemeSwitch } from '@/features/toggle-theme';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { TaskBoard } from '@/widgets/task-board';
import { useTaskPageHandlers } from './hooks';

/**
 * HomePage - Presentational component for the main task management page.
 * All business logic is extracted to useTaskPageHandlers hook.
 */
export default function HomePage() {
  const {
    // Task data
    pendingTasks,
    completedTasks,
    totalPending,
    totalCompleted,
    isLoading,

    // Search and filter
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,

    // Dialog states
    editDialog,
    deleteDialog,

    // Handlers
    handleAddTask,
    handleEditSave,
    handleDeleteConfirm,
    reorderTasks,

    // Task actions
    taskActions,
  } = useTaskPageHandlers();

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
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Task Manager</h1>
            <p className="text-muted-foreground">Organize your day efficiently</p>
          </div>
          <ThemeSwitch />
        </header>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Add New Task</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskForm onSubmit={handleAddTask} />
          </CardContent>
        </Card>

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

        <TaskBoard
          pendingTasks={pendingTasks}
          completedTasks={completedTasks}
          onToggle={taskActions.onToggle}
          onEdit={taskActions.onEdit}
          onDelete={taskActions.onDelete}
          onReorder={reorderTasks}
        />

        <EditTaskDialog
          task={editDialog.data}
          open={editDialog.isOpen}
          onOpenChange={editDialog.setOpen}
          onSave={handleEditSave}
        />

        <DeleteConfirm
          task={deleteDialog.data}
          open={deleteDialog.isOpen}
          onOpenChange={deleteDialog.setOpen}
          onConfirm={handleDeleteConfirm}
        />
      </div>
    </main>
  );
}
