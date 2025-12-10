'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Project, ProjectColor } from '@/shared/api/types';
import { PROJECT_COLORS } from '@/shared/api/types';

type Step = 'name' | 'description' | 'color';
const STEPS: Step[] = ['name', 'description', 'color'];

interface UseProjectFormStateOptions {
  initialProject?: Project | null;
}

export function useProjectFormState(options?: UseProjectFormStateOptions) {
  const { initialProject } = options ?? {};

  const [step, setStep] = useState<Step>('name');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState<ProjectColor>(PROJECT_COLORS[0]);

  useEffect(() => {
    if (initialProject) {
      setName(initialProject.name);
      setDescription(initialProject.description || '');
      setColor(initialProject.color as ProjectColor);
    }
  }, [initialProject]);

  const currentStepIndex = STEPS.indexOf(step);
  const isFirstStep = step === 'name';
  const isLastStep = step === 'color';

  const hasChanges = useMemo(() => {
    if (initialProject) {
      return (
        name !== initialProject.name ||
        description !== (initialProject.description || '') ||
        color !== initialProject.color
      );
    }
    return name.length > 0 || description.length > 0;
  }, [name, description, color, initialProject]);

  const validateCurrentStep = useCallback((): string | null => {
    if (step === 'name' && !name.trim()) {
      return 'Name is required';
    }
    return null;
  }, [step, name]);

  const goNext = useCallback(() => {
    if (step === 'name') setStep('description');
    else if (step === 'description') setStep('color');
  }, [step]);

  const goPrev = useCallback(() => {
    if (step === 'description') setStep('name');
    else if (step === 'color') setStep('description');
  }, [step]);

  const reset = useCallback(() => {
    setStep('name');
    setName('');
    setDescription('');
    setColor(PROJECT_COLORS[0]);
  }, []);

  const getData = useCallback(() => {
    return {
      name: name.trim(),
      description: description.trim() || undefined,
      color,
    };
  }, [name, description, color]);

  return {
    step,
    name,
    setName,
    description,
    setDescription,
    color,
    setColor,
    currentStepIndex,
    steps: STEPS,
    isFirstStep,
    isLastStep,
    hasChanges,
    validateCurrentStep,
    goNext,
    goPrev,
    reset,
    getData,
  };
}

export type ProjectFormState = ReturnType<typeof useProjectFormState>;
