'use client';

import { Check, Play } from 'lucide-react';
import { type MouseEvent, type TouchEvent, useRef, useState } from 'react';
import { cn } from '@/shared/lib/utils';

interface SwipeAction {
  label: string;
  icon: React.ReactNode;
  color: string;
  onSwipe?: () => void;
}

interface SwipeableCardProps {
  children: React.ReactNode;
  left?: SwipeAction;
  right?: SwipeAction;
  threshold?: number;
  disabled?: boolean;
  className?: string;
}

const DEFAULT_LEFT: SwipeAction = {
  label: 'In Progress',
  icon: <Play className="h-5 w-5" />,
  color: 'bg-primary',
};

const DEFAULT_RIGHT: SwipeAction = {
  label: 'Done',
  icon: <Check className="h-5 w-5" />,
  color: 'bg-green-500',
};

export function SwipeableCard({
  children,
  left = DEFAULT_LEFT,
  right = DEFAULT_RIGHT,
  threshold = 80,
  disabled = false,
  className,
}: SwipeableCardProps) {
  const leftAction = { ...DEFAULT_LEFT, ...left };
  const rightAction = { ...DEFAULT_RIGHT, ...right };
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const hasMoved = useRef(false);
  const preventClick = useRef(false);

  const MOVE_THRESHOLD = 10;

  const handleStart = (clientX: number) => {
    if (disabled) return;
    startX.current = clientX;
    currentX.current = clientX;
    hasMoved.current = false;
    setIsDragging(true);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || disabled) return;
    currentX.current = clientX;
    const diff = clientX - startX.current;

    if (Math.abs(diff) > MOVE_THRESHOLD) {
      hasMoved.current = true;
    }

    const limitedDiff = Math.max(-150, Math.min(150, diff));
    setOffset(limitedDiff);
  };

  const handleEnd = () => {
    if (!isDragging || disabled) return;
    setIsDragging(false);

    if (hasMoved.current) {
      preventClick.current = true;
      setTimeout(() => {
        preventClick.current = false;
      }, 100);
    }

    if (offset < -threshold && leftAction.onSwipe) {
      leftAction.onSwipe();
    } else if (offset > threshold && rightAction.onSwipe) {
      rightAction.onSwipe();
    }

    setOffset(0);
  };

  const handleClickCapture = (e: MouseEvent | React.MouseEvent) => {
    if (preventClick.current || hasMoved.current) {
      e.stopPropagation();
      e.preventDefault();
      preventClick.current = false;
    }
  };

  const handleTouchStart = (e: TouchEvent) => handleStart(e.touches[0].clientX);
  const handleTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);
  const handleTouchEnd = () => handleEnd();

  const handleMouseDown = (e: MouseEvent) => handleStart(e.clientX);
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      handleMove(e.clientX);
    }
  };
  const handleMouseUp = () => handleEnd();
  const handleMouseLeave = () => {
    if (isDragging) handleEnd();
  };

  const showLeftAction = offset < -20;
  const showRightAction = offset > 20;
  const leftProgress = Math.min(1, Math.abs(offset) / threshold);
  const rightProgress = Math.min(1, offset / threshold);

  return (
    <div className={cn('relative overflow-hidden rounded-[10px]', className)}>
      <div
        className={cn(
          'absolute inset-y-0 right-0 flex items-center justify-end rounded-r-[10px] px-4 transition-opacity',
          leftAction.color,
          showLeftAction ? 'opacity-100' : 'opacity-0',
        )}
        style={{ width: Math.abs(offset) + 20 }}
      >
        <div
          className="flex items-center gap-2 text-white"
          style={{
            opacity: leftProgress,
            transform: `scale(${0.8 + leftProgress * 0.2})`,
          }}
        >
          {leftAction.icon}
          <span className="text-sm font-medium">{leftAction.label}</span>
        </div>
      </div>

      <div
        className={cn(
          'absolute inset-y-0 left-0 flex items-center justify-start rounded-l-[10px] px-4 transition-opacity',
          rightAction.color,
          showRightAction ? 'opacity-100' : 'opacity-0',
        )}
        style={{ width: offset + 20 }}
      >
        <div
          className="flex items-center gap-2 text-white"
          style={{
            opacity: rightProgress,
            transform: `scale(${0.8 + rightProgress * 0.2})`,
          }}
        >
          {rightAction.icon}
          <span className="text-sm font-medium">{rightAction.label}</span>
        </div>
      </div>

      <div
        role="application"
        aria-label="Swipeable content"
        className={cn(
          'relative touch-pan-y transition-transform',
          isDragging ? 'cursor-grabbing' : 'cursor-grab',
          disabled && 'cursor-default',
        )}
        style={{
          transform: `translateX(${offset}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onClickCapture={handleClickCapture}
      >
        {children}
      </div>
    </div>
  );
}
