'use client';

import type * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';

interface BaseFieldProps {
  id: string;
  label: string;
  required?: boolean;
  maxLength?: number;
  value: string;
  error?: string;
  className?: string;
}

interface InputFieldProps extends BaseFieldProps {
  type?: 'input';
  placeholder?: string;
  autoFocus?: boolean;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onBlur?: () => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

interface TextareaFieldProps extends BaseFieldProps {
  type: 'textarea';
  placeholder?: string;
  rows?: number;
  autoFocus?: boolean;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
}

type FormFieldProps = InputFieldProps | TextareaFieldProps;

export function FormField(props: FormFieldProps) {
  const { id, label, required, maxLength, value, error, className } = props;

  const showCounter = maxLength !== undefined;

  return (
    <div className={cn('space-y-1', className)}>
      <Label htmlFor={id}>
        {label}
        {required && ' *'}
      </Label>

      {props.type === 'textarea' ? (
        <Textarea
          ref={props.textareaRef}
          id={id}
          value={value}
          onChange={(e) => props.onChange(e.target.value)}
          onKeyDown={props.onKeyDown}
          placeholder={props.placeholder}
          maxLength={maxLength}
          rows={props.rows ?? 3}
          autoFocus={props.autoFocus}
          className="max-h-32 resize-none"
        />
      ) : (
        <Input
          ref={props.inputRef}
          id={id}
          value={value}
          onChange={(e) => props.onChange(e.target.value)}
          onKeyDown={props.onKeyDown}
          onBlur={props.onBlur}
          placeholder={props.placeholder}
          maxLength={maxLength}
          autoFocus={props.autoFocus}
        />
      )}

      <div className="flex justify-between text-xs text-muted-foreground">
        {error ? <span className="text-destructive">{error}</span> : <span />}
        {showCounter && (
          <span className="ml-auto">
            {value.length}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}
