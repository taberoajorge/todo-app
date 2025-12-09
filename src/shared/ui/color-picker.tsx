'use client';

import { Check } from 'lucide-react';
import { PROJECT_COLORS, type ProjectColor } from '@/shared/api/types';
import { isLightColor } from '@/shared/lib/colors';
import { cn } from '@/shared/lib/utils';

interface ColorPickerProps {
  value?: string;
  onChange: (color: ProjectColor) => void;
  className?: string;
}

const colorNames: Record<ProjectColor, string> = {
  '#5f33e1': 'Purple',
  '#ffe5a4': 'Yellow',
  '#f77bba': 'Pink',
  '#ebe4ff': 'Lavender',
  '#7dc8e7': 'Sky',
  '#77dd77': 'Mint',
};

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  return (
    <div className={cn('flex flex-wrap gap-3', className)}>
      {PROJECT_COLORS.map((color) => {
        const isSelected = value === color;
        const isLight = isLightColor(color);

        return (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={cn(
              'relative h-12 w-12 rounded-full transition-all duration-200',
              'ring-offset-2 ring-offset-background',
              'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary',
              isSelected && 'ring-2 ring-primary scale-110',
            )}
            style={{ backgroundColor: color }}
            title={colorNames[color]}
            aria-label={`Select ${colorNames[color]} color`}
          >
            {isSelected && (
              <Check
                className={cn(
                  'absolute inset-0 m-auto h-6 w-6',
                  isLight ? 'text-gray-800' : 'text-white',
                )}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
