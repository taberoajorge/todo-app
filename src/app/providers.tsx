'use client';

import { ThemeProvider } from 'next-themes';
import { createTaskRepository } from '@/shared/api';
import { RepositoryContext } from '@/shared/hooks';
import { localStorageAdapter } from '@/shared/lib/storage';
import { TooltipProvider } from '@/shared/ui/tooltip';

const taskRepository = createTaskRepository(localStorageAdapter);

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
    >
      <TooltipProvider delayDuration={400}>
        <RepositoryContext.Provider value={taskRepository}>{children}</RepositoryContext.Provider>
      </TooltipProvider>
    </ThemeProvider>
  );
}
