'use client';

import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import type { KeyboardEvent } from 'react';
import { PROJECT_LIMITS } from '@/shared/config/constants';
import { isLightColor } from '@/shared/lib/colors';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { ColorPicker } from '@/shared/ui/color-picker';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { FormField } from '@/shared/ui/form-field';
import { Label } from '@/shared/ui/label';
import type { ProjectFormState } from '../model/useProjectFormState';

interface CreateProjectWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formState: ProjectFormState;
  onSubmit: () => void;
  isSubmitting: boolean;
  error?: string;
  onClearError?: () => void;
}

export function CreateProjectWizard({
  open,
  onOpenChange,
  formState,
  onSubmit,
  isSubmitting,
  error,
  onClearError,
}: CreateProjectWizardProps) {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (formState.isLastStep) {
        onSubmit();
      } else {
        const validationError = formState.validateCurrentStep();
        if (!validationError) {
          onClearError?.();
          formState.goNext();
        }
      }
    }
  };

  const handleNext = () => {
    const validationError = formState.validateCurrentStep();
    if (!validationError) {
      onClearError?.();
      formState.goNext();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
        </DialogHeader>

        <div className="flex justify-center gap-3">
          {formState.steps.map((s, i) => (
            <div
              key={s}
              className={cn(
                'h-2.5 w-2.5 rounded-full transition-colors',
                i <= formState.currentStepIndex ? 'bg-primary' : 'bg-muted-foreground/30',
              )}
            />
          ))}
        </div>

        <div className="min-h-[200px] py-4">
          {formState.step === 'name' && (
            <FormField
              id="name"
              label="Project Name"
              required
              value={formState.name}
              onChange={formState.setName}
              onKeyDown={handleKeyDown}
              placeholder="e.g., Work Tasks"
              maxLength={PROJECT_LIMITS.NAME_MAX}
              error={error}
              autoFocus
            />
          )}

          {formState.step === 'description' && (
            <FormField
              id="description"
              label="Description (optional)"
              type="textarea"
              value={formState.description}
              onChange={formState.setDescription}
              onKeyDown={handleKeyDown}
              placeholder="What is this project about?"
              maxLength={PROJECT_LIMITS.DESCRIPTION_MAX}
              rows={4}
              autoFocus
            />
          )}

          {formState.step === 'color' && (
            <div className="space-y-4">
              <Label>Choose a Color</Label>
              <ColorPicker
                value={formState.color}
                onChange={formState.setColor}
                className="justify-center"
              />

              <div className="mt-6 space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Preview
                </p>
                <div
                  className="rounded-[10px] p-4 shadow-sm border"
                  style={{ backgroundColor: formState.color }}
                >
                  <p
                    className={cn(
                      'font-semibold text-lg',
                      isLightColor(formState.color) ? 'text-gray-800' : 'text-white',
                    )}
                  >
                    {formState.name || 'Project Name'}
                  </p>
                  {formState.description && (
                    <p
                      className={cn(
                        'text-sm mt-1 line-clamp-2',
                        isLightColor(formState.color) ? 'text-gray-600' : 'text-white/80',
                      )}
                    >
                      {formState.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={formState.goPrev}
            disabled={formState.isFirstStep}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {formState.isLastStep ? (
            <Button onClick={onSubmit} disabled={isSubmitting}>
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
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
