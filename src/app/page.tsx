'use client';

import { format } from 'date-fns';
import { ArrowRight, Check, Clock, MoreVertical, Play, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useRef, useState } from 'react';
import { ThemeSwitch } from '@/features/toggle-theme';
import type { Task } from '@/shared/api';
import { DEFAULTS, ROUTES } from '@/shared/config/constants';
import { useHomeData } from '@/shared/hooks/useHomeData';
import { COLORS, getContrastColor, getDarkModeColor } from '@/shared/lib/colors';
import { cn } from '@/shared/lib/utils';
import { Card, CardContent } from '@/shared/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { PageLayout } from '@/shared/ui/page-layout';
import { PageLoading } from '@/shared/ui/page-loading';
import { ProgressRing } from '@/shared/ui/progress-ring';
import { SectionHeader } from '@/shared/ui/section-header';
import { BottomNav } from '@/widgets/bottom-nav';

export default function HomePage() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const {
    isLoading,
    todayTodo,
    inProgress,
    todayStats,
    projectMap,
    isFreeDay,
    handleStatusChange,
    getTaskRoute,
  } = useHomeData();

  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleCarouselScroll = () => {
    if (!carouselRef.current) return;
    const scrollLeft = carouselRef.current.scrollLeft;
    const cardWidth = 180 + 16;
    const index = Math.round(scrollLeft / cardWidth);
    setActiveIndex(Math.min(index, todayTodo.length - 1));
  };

  const scrollToCard = (index: number) => {
    if (!carouselRef.current) return;
    const cardWidth = 180 + 16;
    carouselRef.current.scrollTo({
      left: index * cardWidth,
      behavior: 'smooth',
    });
  };

  const handleTaskClick = (task: Task) => {
    router.push(getTaskRoute(task));
  };

  if (isLoading) {
    return (
      <>
        <PageLoading />
        <BottomNav />
      </>
    );
  }

  const header = (
    <header className="mb-4 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Hello, {DEFAULTS.USER_NAME}</h1>
      </div>
      <ThemeSwitch />
    </header>
  );

  const paginationDots = todayTodo.length > 1 && (
    <div className="flex gap-1.5">
      {todayTodo.map((task, index) => (
        <button
          type="button"
          key={task.id}
          onClick={() => scrollToCard(index)}
          className={cn(
            'h-2 w-2 rounded-full transition-all',
            index === activeIndex
              ? 'bg-primary w-4'
              : 'bg-muted-foreground/30 hover:bg-muted-foreground/50',
          )}
          aria-label={`Go to task ${index + 1}`}
        />
      ))}
    </div>
  );

  return (
    <>
      <PageLayout header={header}>
        {isFreeDay && (
          <div className="mb-8 overflow-hidden rounded-[10px] bg-primary p-6">
            <div className="flex flex-col items-center text-center text-primary-foreground">
              <div className="mb-4 animate-celebrate rounded-full bg-white/20 p-6">
                <Sparkles className="h-12 w-12" />
              </div>
              <h2 className="mb-2 text-2xl font-bold">Free Day!</h2>
              <p className="opacity-90">No tasks scheduled for today. Enjoy your day!</p>
              <Link
                href={ROUTES.PROJECTS}
                className="mt-4 flex items-center gap-2 font-medium hover:underline"
              >
                View projects <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}

        {!isFreeDay && (
          <div className="mb-8 overflow-hidden rounded-[10px] bg-primary p-6">
            <div className="relative flex items-center justify-between">
              <div className="text-primary-foreground">
                <p className="text-sm font-medium opacity-90">Today</p>
                <p className="mt-1 text-3xl font-bold">
                  {todayStats.completed}/{todayStats.total} tasks
                </p>
              </div>
              <div className="absolute -right-4 -top-4 h-32 w-32 opacity-20">
                <svg
                  viewBox="0 0 100 100"
                  className="h-full w-full fill-current text-white"
                  role="img"
                  aria-label="Decorative smiley face illustration"
                >
                  <title>Decorative illustration</title>
                  <circle cx="50" cy="50" r="40" />
                  <circle cx="30" cy="40" r="8" />
                  <circle cx="70" cy="40" r="8" />
                  <path d="M30 65 Q50 80 70 65" fill="none" stroke="currentColor" strokeWidth="4" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {todayTodo.length > 0 && (
          <section className="mb-8">
            <SectionHeader title="To do" count={todayTodo.length} variant="primary">
              {paginationDots}
            </SectionHeader>
            <div
              ref={carouselRef}
              onScroll={handleCarouselScroll}
              className="carousel flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
            >
              {todayTodo.map((task) => {
                const project = projectMap.get(task.projectId);
                const baseColor = project?.color || COLORS.PRIMARY;
                const cardColor = isDark ? getDarkModeColor(baseColor) : baseColor;
                const textColor = getContrastColor(baseColor, isDark);

                return (
                  <button
                    type="button"
                    key={task.id}
                    className="carousel-item min-w-[180px] max-w-[180px] rounded-[10px] shadow-md snap-start cursor-pointer transition-transform hover:scale-[1.02] text-left"
                    style={{ backgroundColor: cardColor }}
                    onClick={() => handleTaskClick(task)}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        {project && (
                          <p
                            className="text-xs font-medium flex-1 truncate"
                            style={{ color: textColor, opacity: 0.8 }}
                          >
                            {project.name}
                          </p>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 -mr-1 rounded hover:bg-black/10"
                          >
                            <MoreVertical
                              className="h-4 w-4"
                              style={{ color: textColor, opacity: 0.8 }}
                            />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(task, 'in_progress');
                              }}
                            >
                              <Play className="mr-2 h-4 w-4" />
                              Start Progress
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(task, 'done');
                              }}
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Mark as Done
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <h3 className="line-clamp-2 font-semibold" style={{ color: textColor }}>
                        {task.title}
                      </h3>
                      <div
                        className="mt-3 flex items-center gap-1 text-xs"
                        style={{ color: textColor, opacity: 0.8 }}
                      >
                        <Clock className="h-3 w-3" />
                        <span>till {format(new Date(task.deadline), 'dd MMM yyyy')}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {inProgress.length > 0 && (
          <section>
            <SectionHeader title="In progress" count={inProgress.length} variant="primary" />
            <div className="space-y-4">
              {inProgress.map((task) => {
                const project = projectMap.get(task.projectId);

                return (
                  <Link key={task.id} href={ROUTES.PROJECT_DETAIL(task.projectId)}>
                    <Card className="rounded-[10px] transition-all hover:shadow-md">
                      <CardContent className="flex items-center gap-4 py-4">
                        <div className="min-w-0 flex-1">
                          {project && (
                            <p className="text-xs text-muted-foreground">{project.name}</p>
                          )}
                          <h3 className="mt-1 truncate font-semibold">{task.title}</h3>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {format(new Date(task.deadline), 'h:mm a')}
                          </p>
                        </div>
                        <ProgressRing
                          progress={50}
                          size={48}
                          strokeWidth={4}
                          color={project?.color}
                        />
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {inProgress.length === 0 && !isFreeDay && (
          <section>
            <SectionHeader title="In progress" count={0} />
            <div className="rounded-[10px] border bg-card py-8 text-center text-muted-foreground">
              No tasks in progress
            </div>
          </section>
        )}
      </PageLayout>
      <BottomNav />
    </>
  );
}
