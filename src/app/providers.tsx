'use client';

import { ThemeProvider } from 'next-themes';
import { RepositoryContext } from '@/shared/hooks';
import { createTaskRepository } from '@/shared/api';
import { localStorageAdapter } from '@/shared/lib/storage';

// Create repository instance with localStorage adapter
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
      <RepositoryContext.Provider value={taskRepository}>{children}</RepositoryContext.Provider>
    </ThemeProvider>
  );
}
