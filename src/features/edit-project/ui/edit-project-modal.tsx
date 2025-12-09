'use client';

import { useEffect, useRef, useState } from 'react';
import type { Project, ProjectColor } from '@/shared/api';
import { PROJECT_LIMITS } from '@/shared/config/constants';
import { useFormModal } from '@/shared/hooks/useFormModal';
import { COLORS } from '@/shared/lib/colors';
import { createEnterHandler } from '@/shared/lib/form-helpers';
import { Button } from '@/shared/ui/button';
import { ColorPicker } from '@/shared/ui/color-picker';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { FormField } from '@/shared/ui/form-field';
import { Label } from '@/shared/ui/label';

interface EditProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
  onSubmit: (data: { name: string; description?: string; color: string }) => Promise<void>;
}

export function EditProjectModal({ open, onOpenChange, project, onSubmit }: EditProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState<ProjectColor>(COLORS.PRIMARY);

  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);

  const {
    isSubmitting,
    error,
    setError,
    handleSubmit,
    handleOpenChange: onModalClose,
  } = useFormModal({
    onSubmit: async (data: { name: string; description?: string; color: string }) => {
      await onSubmit(data);
    },
  });

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || '');
      setColor(project.color as ProjectColor);
    }
  }, [project]);

  const hasChanges = project
    ? name !== project.name ||
      description !== (project.description || '') ||
      color !== project.color
    : false;

  const handleDialogOpenChange = (isOpen: boolean) => {
    if (onModalClose(isOpen, hasChanges)) {
      onOpenChange(isOpen);
    }
  };

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    const success = await handleSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      color,
    });

    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>

        <form onSubmit={onFormSubmit} className="space-y-4">
          <FormField
            id="name"
            label="Name"
            required
            value={name}
            onChange={setName}
            onKeyDown={createEnterHandler(descriptionRef)}
            onBlur={() => {
              if (!name.trim()) setError('Name is required');
              else setError('');
            }}
            maxLength={PROJECT_LIMITS.NAME_MAX}
            error={error && !name.trim() ? error : undefined}
          />

          <FormField
            id="description"
            label="Description"
            type="textarea"
            value={description}
            onChange={setDescription}
            onKeyDown={createEnterHandler(submitRef)}
            maxLength={PROJECT_LIMITS.DESCRIPTION_MAX}
            rows={3}
            textareaRef={descriptionRef}
          />

          <div>
            <Label>Color</Label>
            <ColorPicker value={color} onChange={setColor} className="mt-2" />
          </div>

          {error && name.trim() && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => handleDialogOpenChange(false)}>
              Cancel
            </Button>
            <Button ref={submitRef} type="submit" disabled={isSubmitting || !hasChanges}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
