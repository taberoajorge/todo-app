'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/dialog';
import { TaskForm } from '@/features/create-task';
import type { Task, TaskInput } from '@/shared/api';

interface EditTaskDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, input: TaskInput) => Promise<void>;
}

export function EditTaskDialog({ task, open, onOpenChange, onSave }: EditTaskDialogProps) {
  if (!task) return null;

  const handleSubmit = async (input: TaskInput) => {
    await onSave(task.id, input);
    onOpenChange(false);
    return task; // Return the task for form state
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>Make changes to your task below.</DialogDescription>
        </DialogHeader>
        <TaskForm
          editingTask={task}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

