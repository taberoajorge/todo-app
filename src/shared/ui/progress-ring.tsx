'use client';

import { COLORS } from '@/shared/lib/colors';
import { cn } from '@/shared/lib/utils';

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showLabel?: boolean;
  color?: string;
}

export function ProgressRing({
  progress,
  size = 48,
  strokeWidth = 4,
  className,
  showLabel = true,
  color,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  const progressColor = color || COLORS.PRIMARY;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        className="progress-ring"
        aria-label={`Progress: ${Math.round(progress)}%`}
      >
        <title>Progress: {Math.round(progress)}%</title>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="stroke-muted-foreground/20"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="progress-ring__circle"
        />
      </svg>
      {showLabel && (
        <span className="absolute text-xs font-semibold text-foreground">
          {Math.round(progress)}%
        </span>
      )}
    </div>
  );
}
