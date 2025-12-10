'use client';

import { startOfDay } from 'date-fns';
import { useRef } from 'react';
import { TASK_LIMITS } from '@/shared/config/constants';
import { createEnterHandler } from '@/shared/lib/form-helpers';
import { Button } from '@/shared/ui/button';
import { DatePicker } from '@/shared/ui/date-picker';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { FormField } from '@/shared/ui/form-field';
import type { TaskFormState } from '../model/useTaskFormState';

interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formState: TaskFormState;
  onSubmit: () => void;
  isSubmitting: boolean;
  error?: string;
}

export function CreateTaskModal({
  open,
  onOpenChange,
  formState,
  onSubmit,
  isSubmitting,
  error,
}: CreateTaskModalProps) {
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
          <DialogTitle>New Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            id="title"
            label="Title"
            value={formState.title}
            onChange={formState.setTitle}
            onKeyDown={createEnterHandler(descriptionRef)}
            placeholder="What needs to be done?"
            maxLength={TASK_LIMITS.TITLE_MAX}
            autoFocus
          />

          <FormField
            id="description"
            label="Description"
            type="textarea"
            value={formState.description}
            onChange={formState.setDescription}
            onKeyDown={createEnterHandler(submitRef)}
            placeholder="Add more details (optional)"
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

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button ref={submitRef} type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
