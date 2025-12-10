'use client';

import { useRouter } from 'next/navigation';
import { type RefObject, useCallback, useRef, useState } from 'react';
import type { Task } from '@/shared/api';
import { useHomeData } from '@/shared/hooks/useHomeData';

interface UseHomeActionsReturn {
  carouselRef: RefObject<HTMLDivElement | null>;
  activeIndex: number;
  handleCarouselScroll: () => void;
  scrollToCard: (index: number) => void;
  handleTaskClick: (task: Task) => void;
  handleStatusChange: ReturnType<typeof useHomeData>['handleStatusChange'];
}

export function useHomeActions(todayTodoLength: number): UseHomeActionsReturn {
  const router = useRouter();
  const { handleStatusChange, getTaskRoute } = useHomeData();

  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleCarouselScroll = useCallback(() => {
    if (!carouselRef.current) return;
    const scrollLeft = carouselRef.current.scrollLeft;
    const cardWidth = 180 + 16;
    const index = Math.round(scrollLeft / cardWidth);
    setActiveIndex(Math.min(index, Math.max(0, todayTodoLength - 1)));
  }, [todayTodoLength]);

  const scrollToCard = useCallback((index: number) => {
    if (!carouselRef.current) return;
    const cardWidth = 180 + 16;
    carouselRef.current.scrollTo({
      left: index * cardWidth,
      behavior: 'smooth',
    });
  }, []);

  const handleTaskClick = useCallback(
    (task: Task) => {
      router.push(getTaskRoute(task));
    },
    [router, getTaskRoute],
  );

  return {
    carouselRef,
    activeIndex,
    handleCarouselScroll,
    scrollToCard,
    handleTaskClick,
    handleStatusChange,
  };
}
