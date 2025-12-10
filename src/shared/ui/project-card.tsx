'use client';

import { Check } from 'lucide-react';
import type { ProjectWithStats } from '@/shared/api';
import { getContrastColor, getDarkModeColor } from '@/shared/lib/colors';
import { cn } from '@/shared/lib/utils';

interface ProjectCardProps {
  project: ProjectWithStats;
  isDark: boolean;
}

export function ProjectCard({ project, isDark }: ProjectCardProps) {
  const isCompleted = project.progress === 100 && project.totalTasks > 0;
  const bgColor = isDark ? getDarkModeColor(project.color) : project.color;
  const textColor = getContrastColor(project.color, isDark);

  return (
    <div
      className={cn(
        'relative min-h-[140px] p-5 rounded-[10px] shadow-lg transition-all duration-200',
        'hover:scale-[1.02] hover:shadow-xl',
        isCompleted && 'ring-2 ring-green-500/30',
      )}
      style={{ backgroundColor: bgColor }}
    >
      <div className="flex items-center gap-2 text-sm" style={{ color: textColor, opacity: 0.8 }}>
        <span>
          {project.completedTasks}/{project.totalTasks} tasks
        </span>
        <span>•</span>
        <span>{project.progress}%</span>
        {isCompleted && <Check className="h-4 w-4" style={{ color: textColor }} />}
      </div>

      <h3
        className="absolute bottom-5 left-5 right-5 text-xl font-bold"
        style={{ color: textColor }}
      >
        {project.name}
      </h3>
    </div>
  );
}
