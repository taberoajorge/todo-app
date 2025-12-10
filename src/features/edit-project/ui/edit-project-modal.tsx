'use client';

import { useRef } from 'react';
import type { ProjectFormState } from '@/features/create-project';
import { PROJECT_LIMITS } from '@/shared/config/constants';
import { createEnterHandler } from '@/shared/lib/form-helpers';
import { Button } from '@/shared/ui/button';
import { ColorPicker } from '@/shared/ui/color-picker';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { FormField } from '@/shared/ui/form-field';
import { Label } from '@/shared/ui/label';

interface EditProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formState: ProjectFormState;
  onSubmit: () => void;
  isSubmitting: boolean;
  error?: string;
}

export function EditProjectModal({
  open,
  onOpenChange,
  formState,
  onSubmit,
  isSubmitting,
  error,
}: EditProjectModalProps) {
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
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            id="name"
            label="Name"
            required
            value={formState.name}
            onChange={formState.setName}
            onKeyDown={createEnterHandler(descriptionRef)}
            maxLength={PROJECT_LIMITS.NAME_MAX}
            error={error && !formState.name.trim() ? error : undefined}
          />

          <FormField
            id="description"
            label="Description"
            type="textarea"
            value={formState.description}
            onChange={formState.setDescription}
            onKeyDown={createEnterHandler(submitRef)}
            maxLength={PROJECT_LIMITS.DESCRIPTION_MAX}
            rows={3}
            textareaRef={descriptionRef}
          />

          <div>
            <Label>Color</Label>
            <ColorPicker value={formState.color} onChange={formState.setColor} className="mt-2" />
          </div>

          {error && formState.name.trim() && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button ref={submitRef} type="submit" disabled={isSubmitting || !formState.hasChanges}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
