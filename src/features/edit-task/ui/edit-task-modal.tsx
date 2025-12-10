'use client';

import { startOfDay } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { useRef } from 'react';
import type { TaskFormState } from '@/features/create-task';
import { TASK_LIMITS } from '@/shared/config/constants';
import { createEnterHandler } from '@/shared/lib/form-helpers';
import { Button } from '@/shared/ui/button';
import { DatePicker } from '@/shared/ui/date-picker';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { FormField } from '@/shared/ui/form-field';

interface EditTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formState: TaskFormState;
  onSubmit: () => void;
  onDelete: () => void;
  isSubmitting: boolean;
  error?: string;
}

export function EditTaskModal({
  open,
  onOpenChange,
  formState,
  onSubmit,
  onDelete,
  isSubmitting,
  error,
}: EditTaskModalProps) {
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            id="title"
            label="Title"
            value={formState.title}
            onChange={formState.setTitle}
            onKeyDown={createEnterHandler(descriptionRef)}
            maxLength={TASK_LIMITS.TITLE_MAX}
          />

          <FormField
            id="description"
            label="Description"
            type="textarea"
            value={formState.description}
            onChange={formState.setDescription}
            onKeyDown={createEnterHandler(submitRef)}
            maxLength={TASK_LIMITS.DESCRIPTION_MAX}
            rows={3}
            textareaRef={descriptionRef}
          />

          <div>
            <span className="text-sm font-medium block mb-1">Deadline *</span>
            <DatePicker
              value={formState.deadline}
              onChange={formState.setDeadline}
              minDate={startOfDay(new Date())}
            />
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
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                ref={submitRef}
                type="submit"
                disabled={isSubmitting || !formState.hasChanges}
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
