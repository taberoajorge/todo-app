'use client';

import { startOfDay } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Task } from '@/shared/api';
import { TASK_LIMITS } from '@/shared/config/constants';
import { useFormModal } from '@/shared/hooks/useFormModal';
import { createEnterHandler } from '@/shared/lib/form-helpers';
import { Button } from '@/shared/ui/button';
import { DatePicker } from '@/shared/ui/date-picker';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { FormField } from '@/shared/ui/form-field';

interface EditTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  onSubmit: (data: { title: string; description?: string; deadline: string }) => Promise<void>;
  onDelete: () => void;
}

export function EditTaskModal({
  open,
  onOpenChange,
  task,
  onSubmit,
  onDelete,
}: EditTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState<Date | undefined>();

  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);

  const {
    isSubmitting,
    error,
    setError,
    handleSubmit,
    handleOpenChange: onModalClose,
  } = useFormModal({
    onSubmit: async (data: { title: string; description?: string; deadline: string }) => {
      await onSubmit(data);
    },
  });

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setDeadline(new Date(task.deadline));
    }
  }, [task]);

  const hasChanges = task
    ? title !== task.title ||
      description !== (task.description || '') ||
      deadline?.toISOString() !== task.deadline
    : false;

  const handleDialogOpenChange = (isOpen: boolean) => {
    if (onModalClose(isOpen, hasChanges)) {
      onOpenChange(isOpen);
    }
  };

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!deadline) {
      setError('Deadline is required');
      return;
    }

    const success = await handleSubmit({
      title: title.trim() || 'Untitled',
      description: description.trim() || undefined,
      deadline: deadline.toISOString(),
    });

    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={onFormSubmit} className="space-y-4">
          <FormField
            id="title"
            label="Title"
            value={title}
            onChange={setTitle}
            onKeyDown={createEnterHandler(descriptionRef)}
            maxLength={TASK_LIMITS.TITLE_MAX}
          />

          <FormField
            id="description"
            label="Description"
            type="textarea"
            value={description}
            onChange={setDescription}
            onKeyDown={createEnterHandler(submitRef)}
            maxLength={TASK_LIMITS.DESCRIPTION_MAX}
            rows={3}
            textareaRef={descriptionRef}
          />

          <div>
            <span className="text-sm font-medium block mb-1">Deadline *</span>
            <DatePicker value={deadline} onChange={setDeadline} minDate={startOfDay(new Date())} />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="ghost"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>

            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => handleDialogOpenChange(false)}>
                Cancel
              </Button>
              <Button ref={submitRef} type="submit" disabled={isSubmitting || !hasChanges}>
                {isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
