'use client';

import { Loader2, Plus } from 'lucide-react';
import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import type { Task, TaskInput } from '@/shared/api';
import { TASK_LIMITS } from '@/shared/config/constants';
import { toDateTimeLocal } from '@/shared/lib/formatters';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';

interface FormState {
  error: string | null;
  success: boolean;
}

interface TaskFormProps {
  onSubmit: (input: TaskInput) => Promise<Task>;
  editingTask?: Task | null;
  onCancel?: () => void;
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <Plus className="h-4 w-4" />
          {isEditing ? 'Update Task' : 'Add Task'}
        </>
      )}
    </Button>
  );
}

export function TaskForm({ onSubmit, editingTask, onCancel }: TaskFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  const [titleLength, setTitleLength] = useState(editingTask?.title?.length ?? 0);
  const [descLength, setDescLength] = useState(editingTask?.description?.length ?? 0);

  const [state, formAction] = useActionState<FormState, FormData>(
    async (_prevState, formData) => {
      const title = formData.get('title') as string;
      const description = formData.get('description') as string;

      if (!title.trim()) {
        return { error: 'Title is required', success: false };
      }

      if (title.length > TASK_LIMITS.TITLE_MAX) {
        return {
          error: `Title must be ${TASK_LIMITS.TITLE_MAX} characters or less`,
          success: false,
        };
      }

      if (description && description.length > TASK_LIMITS.DESCRIPTION_MAX) {
        return {
          error: `Description must be ${TASK_LIMITS.DESCRIPTION_MAX} characters or less`,
          success: false,
        };
      }

      const input: TaskInput = {
        title: title.trim(),
        description: description?.trim() || undefined,
        deadline: (formData.get('deadline') as string) || undefined,
      };

      try {
        await onSubmit(input);
        formRef.current?.reset();
        setTitleLength(0);
        setDescLength(0);
        return { error: null, success: true };
      } catch {
        return { error: 'Failed to save task', success: false };
      }
    },
    { error: null, success: false },
  );

  useEffect(() => {
    if (editingTask) {
      titleRef.current?.focus();
    }
  }, [editingTask]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        titleRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="title">Title *</Label>
          <span
            className={`text-xs ${
              titleLength > TASK_LIMITS.TITLE_MAX ? 'text-destructive' : 'text-muted-foreground'
            }`}
          >
            {titleLength}/{TASK_LIMITS.TITLE_MAX}
          </span>
        </div>
        <Input
          ref={titleRef}
          id="title"
          name="title"
          placeholder="What needs to be done?"
          defaultValue={editingTask?.title ?? ''}
          aria-describedby={state.error ? 'title-error' : undefined}
          autoComplete="off"
          maxLength={TASK_LIMITS.TITLE_MAX}
          onChange={(e) => setTitleLength(e.target.value.length)}
        />
        {state.error && (
          <p id="title-error" className="text-sm text-destructive">
            {state.error}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="description">Description</Label>
          <span
            className={`text-xs ${
              descLength > TASK_LIMITS.DESCRIPTION_MAX
                ? 'text-destructive'
                : 'text-muted-foreground'
            }`}
          >
            {descLength}/{TASK_LIMITS.DESCRIPTION_MAX}
          </span>
        </div>
        <Textarea
          id="description"
          name="description"
          placeholder="Add more details (optional)"
          defaultValue={editingTask?.description ?? ''}
          rows={3}
          maxLength={TASK_LIMITS.DESCRIPTION_MAX}
          onChange={(e) => setDescLength(e.target.value.length)}
          className="max-h-32 resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="deadline">Deadline</Label>
        <Input
          id="deadline"
          name="deadline"
          type="datetime-local"
          defaultValue={
            editingTask?.deadline ? toDateTimeLocal(new Date(editingTask.deadline)) : ''
          }
        />
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {editingTask && onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <SubmitButton isEditing={!!editingTask} />
      </div>
    </form>
  );
}
