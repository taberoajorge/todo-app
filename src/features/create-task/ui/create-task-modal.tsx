'use client';

import { addHours, startOfDay } from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import { DEFAULTS, TASK_LIMITS } from '@/shared/config/constants';
import { useFormModal } from '@/shared/hooks/useFormModal';
import { createEnterHandler } from '@/shared/lib/form-helpers';
import { Button } from '@/shared/ui/button';
import { DatePicker } from '@/shared/ui/date-picker';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { FormField } from '@/shared/ui/form-field';

interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { title: string; description?: string; deadline: string }) => Promise<void>;
}

export function CreateTaskModal({ open, onOpenChange, onSubmit }: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState<Date | undefined>();

  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);

  const hasUnsavedChanges = title.length > 0 || description.length > 0;

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
    if (open && !deadline) {
      setDeadline(addHours(startOfDay(new Date()), DEFAULTS.DEADLINE_HOUR));
    }
  }, [open, deadline]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDeadline(undefined);
  };

  const handleDialogOpenChange = (isOpen: boolean) => {
    if (onModalClose(isOpen, hasUnsavedChanges)) {
      if (!isOpen) resetForm();
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
      title: title.trim() || DEFAULTS.TASK_TITLE,
      description: description.trim() || undefined,
      deadline: deadline.toISOString(),
    });

    if (success) {
      resetForm();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={onFormSubmit} className="space-y-4">
          <FormField
            id="title"
            label="Title"
            value={title}
            onChange={setTitle}
            onKeyDown={createEnterHandler(descriptionRef)}
            onBlur={() => {
              if (!title.trim()) setError('');
            }}
            placeholder="What needs to be done?"
            maxLength={TASK_LIMITS.TITLE_MAX}
            autoFocus
          />

          <FormField
            id="description"
            label="Description"
            type="textarea"
            value={description}
            onChange={setDescription}
            onKeyDown={createEnterHandler(submitRef)}
            placeholder="Add more details (optional)"
            maxLength={TASK_LIMITS.DESCRIPTION_MAX}
            rows={3}
            textareaRef={descriptionRef}
          />

          <div>
            <span className="text-sm font-medium block mb-1">Deadline *</span>
            <DatePicker value={deadline} onChange={setDeadline} minDate={startOfDay(new Date())} />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => handleDialogOpenChange(false)}>
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
