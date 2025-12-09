'use client';

import { addDays, format, isSameDay, startOfDay } from 'date-fns';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DEFAULTS } from '@/shared/config/constants';
import { cn } from '@/shared/lib/utils';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './sheet';

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  minDate?: Date;
  className?: string;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return isMobile;
}

export function DatePicker({ value, onChange, minDate, className }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value || new Date());
  const [hours, setHours] = useState(value ? value.getHours() : DEFAULTS.DEADLINE_HOUR);
  const [minutes, setMinutes] = useState(value ? value.getMinutes() : 0);
  const isMobile = useIsMobile();

  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);
  const nextWeek = addDays(today, 7);

  const quickOptions = [
    { label: 'Today', date: today },
    { label: 'Tomorrow', date: tomorrow },
    { label: 'Next week', date: nextWeek },
  ];

  const applyTime = (date: Date) => {
    const newDate = new Date(date);
    newDate.setHours(hours, minutes);
    return newDate;
  };

  const handleQuickSelect = (date: Date) => {
    onChange(applyTime(date));
    setIsOpen(false);
  };

  const handleDaySelect = (day: Date) => {
    onChange(applyTime(day));
    setIsOpen(false);
  };

  const adjustHours = (delta: number) => {
    const newHours = (hours + delta + 24) % 24;
    setHours(newHours);
    if (value) {
      const newDate = new Date(value);
      newDate.setHours(newHours, minutes);
      onChange(newDate);
    }
  };

  const adjustMinutes = (delta: number) => {
    const newMinutes = (minutes + delta + 60) % 60;
    setMinutes(newMinutes);
    if (value) {
      const newDate = new Date(value);
      newDate.setHours(hours, newMinutes);
      onChange(newDate);
    }
  };

  const formatHour = (h: number) => {
    const hour12 = h % 12 || 12;
    return hour12.toString().padStart(2, '0');
  };

  const formatMinute = (m: number) => m.toString().padStart(2, '0');

  const getAmPm = (h: number) => (h >= 12 ? 'PM' : 'AM');

  const toggleAmPm = () => {
    const newHours = hours >= 12 ? hours - 12 : hours + 12;
    setHours(newHours);
    if (value) {
      const newDate = new Date(value);
      newDate.setHours(newHours, minutes);
      onChange(newDate);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    const startPadding = firstDay.getDay();
    for (let i = startPadding - 1; i >= 0; i--) {
      days.push(addDays(firstDay, -i - 1));
    }

    for (let i = 0; i < lastDay.getDate(); i++) {
      days.push(addDays(firstDay, i));
    }

    return days;
  };

  const days = getDaysInMonth(viewDate);
  const effectiveMinDate = minDate || today;

  const pickerContent = (
    <div className="space-y-3">
      <div className="flex gap-2">
        {quickOptions.map((option) => (
          <Button
            key={option.label}
            type="button"
            variant={value && isSameDay(value, option.date) ? 'default' : 'outline'}
            size="sm"
            className="flex-1 text-xs"
            onClick={() => handleQuickSelect(option.date)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setViewDate(addDays(viewDate, -30))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">{format(viewDate, 'MMMM yyyy')}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setViewDate(addDays(viewDate, 30))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-center text-xs font-medium text-muted-foreground">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day) => {
          const isSelected = value && isSameDay(day, value);
          const isToday = isSameDay(day, today);
          const isDisabled = day < effectiveMinDate;
          const isCurrentMonth = day.getMonth() === viewDate.getMonth();

          return (
            <Button
              key={day.toISOString()}
              type="button"
              variant={isSelected ? 'default' : 'ghost'}
              size="sm"
              className={cn(
                'h-8 w-8 p-0 text-xs font-normal',
                !isCurrentMonth && 'text-muted-foreground/40',
                isToday && !isSelected && 'border border-primary',
                isDisabled && 'pointer-events-none opacity-30',
              )}
              onClick={() => handleDaySelect(day)}
              disabled={isDisabled}
            >
              {day.getDate()}
            </Button>
          );
        })}
      </div>

      <div className="border-t border-border pt-3">
        <div className="flex items-center justify-center gap-1">
          <span className="mr-2 text-sm font-medium">Time:</span>

          <div className="flex flex-col items-center">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-8"
              onClick={() => adjustHours(1)}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <span className="text-lg font-semibold tabular-nums">{formatHour(hours)}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-8"
              onClick={() => adjustHours(-1)}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>

          <span className="text-lg font-semibold">:</span>

          <div className="flex flex-col items-center">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-8"
              onClick={() => adjustMinutes(5)}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <span className="text-lg font-semibold tabular-nums">{formatMinute(minutes)}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-8"
              onClick={() => adjustMinutes(-5)}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ml-2 h-8 w-12 text-xs font-semibold"
            onClick={toggleAmPm}
          >
            {getAmPm(hours)}
          </Button>
        </div>
      </div>
    </div>
  );

  const triggerButton = (
    <Button
      type="button"
      variant="outline"
      className="w-full justify-start gap-2 text-left font-normal"
    >
      <Calendar className="h-4 w-4" />
      {value ? format(value, 'PPP p') : 'Pick a date'}
    </Button>
  );

  if (isMobile) {
    return (
      <div className={cn('relative', className)}>
        <Button
          type="button"
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal rounded-[10px]',
            !value && 'text-muted-foreground',
          )}
          onClick={() => setIsOpen(true)}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {value ? format(value, 'PPP p') : 'Pick a date'}
        </Button>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side="bottom" className="rounded-t-[10px] px-6 pb-8">
            <SheetHeader className="mb-4">
              <SheetTitle>Select Date & Time</SheetTitle>
            </SheetHeader>
            {pickerContent}
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="start" sideOffset={8} collisionPadding={16}>
          {pickerContent}
        </PopoverContent>
      </Popover>
    </div>
  );
}
