'use client';

import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { type KeyboardEvent, useState } from 'react';
import { PROJECT_COLORS, type ProjectColor } from '@/shared/api/types';
import { PROJECT_LIMITS } from '@/shared/config/constants';
import { useFormModal } from '@/shared/hooks/useFormModal';
import { isLightColor } from '@/shared/lib/colors';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { ColorPicker } from '@/shared/ui/color-picker';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { FormField } from '@/shared/ui/form-field';
import { Label } from '@/shared/ui/label';

interface CreateProjectWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; description?: string; color: string }) => Promise<void>;
}

type Step = 'name' | 'description' | 'color';

const steps: Step[] = ['name', 'description', 'color'];

export function CreateProjectWizard({ open, onOpenChange, onSubmit }: CreateProjectWizardProps) {
  const [step, setStep] = useState<Step>('name');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState<ProjectColor>(PROJECT_COLORS[0]);

  const {
    isSubmitting,
    error,
    setError,
    handleSubmit,
    reset: resetFormModal,
  } = useFormModal({
    onSubmit: async () => {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        color,
      });
    },
  });

  const currentStepIndex = steps.indexOf(step);

  const reset = () => {
    setStep('name');
    setName('');
    setDescription('');
    setColor(PROJECT_COLORS[0]);
    resetFormModal();
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) reset();
    onOpenChange(isOpen);
  };

  const goNext = () => {
    if (step === 'name') {
      if (!name.trim()) {
        setError('Name is required');
        return;
      }
      setError('');
      setStep('description');
    } else if (step === 'description') {
      setStep('color');
    }
  };

  const goPrev = () => {
    if (step === 'description') setStep('name');
    else if (step === 'color') setStep('description');
  };

  const onFormSubmit = async () => {
    const success = await handleSubmit(undefined);
    if (success) {
      reset();
      onOpenChange(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (step === 'color') {
        onFormSubmit();
      } else {
        goNext();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
        </DialogHeader>

        <div className="flex justify-center gap-3">
          {steps.map((s, i) => (
            <div
              key={s}
              className={cn(
                'h-2.5 w-2.5 rounded-full transition-colors',
                i <= currentStepIndex ? 'bg-primary' : 'bg-muted-foreground/30',
              )}
            />
          ))}
        </div>

        <div className="min-h-[200px] py-4">
          {step === 'name' && (
            <FormField
              id="name"
              label="Project Name"
              required
              value={name}
              onChange={setName}
              onKeyDown={handleKeyDown}
              placeholder="e.g., Work Tasks"
              maxLength={PROJECT_LIMITS.NAME_MAX}
              error={error}
              autoFocus
            />
          )}

          {step === 'description' && (
            <FormField
              id="description"
              label="Description (optional)"
              type="textarea"
              value={description}
              onChange={setDescription}
              onKeyDown={handleKeyDown}
              placeholder="What is this project about?"
              maxLength={PROJECT_LIMITS.DESCRIPTION_MAX}
              rows={4}
              autoFocus
            />
          )}

          {step === 'color' && (
            <div className="space-y-4">
              <Label>Choose a Color</Label>
              <ColorPicker value={color} onChange={setColor} className="justify-center" />

              <div className="mt-6 space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Preview
                </p>
                <div
                  className="rounded-[10px] p-4 shadow-sm border"
                  style={{ backgroundColor: color }}
                >
                  <p
                    className={cn(
                      'font-semibold text-lg',
                      isLightColor(color) ? 'text-gray-800' : 'text-white',
                    )}
                  >
                    {name || 'Project Name'}
                  </p>
                  {description && (
                    <p
                      className={cn(
                        'text-sm mt-1 line-clamp-2',
                        isLightColor(color) ? 'text-gray-600' : 'text-white/80',
                      )}
                    >
                      {description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <Button type="button" variant="ghost" onClick={goPrev} disabled={step === 'name'}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {step === 'color' ? (
            <Button onClick={onFormSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                'Creating...'
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Create
                </>
              )}
            </Button>
          ) : (
            <Button onClick={goNext}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
