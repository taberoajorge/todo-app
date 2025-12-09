'use client';

import { Check, FolderOpen, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { toast } from 'sonner';
import { CreateProjectWizard } from '@/features/create-project';
import { ThemeSwitch } from '@/features/toggle-theme';
import { ROUTES } from '@/shared/config/constants';
import { TOAST } from '@/shared/config/messages';
import { useProjects } from '@/shared/hooks/useProjects';
import { getContrastColor, getDarkModeColor } from '@/shared/lib/colors';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { Input } from '@/shared/ui/input';
import { PageLayout } from '@/shared/ui/page-layout';
import { PageLoading } from '@/shared/ui/page-loading';
import { BottomNav } from '@/widgets/bottom-nav';

export default function ProjectsPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const { projects, totalCount, isLoading, searchQuery, setSearchQuery, createProject } =
    useProjects();

  const hasProjects = totalCount > 0;
  const noSearchResults = hasProjects && projects.length === 0 && searchQuery.trim() !== '';

  const [showWizard, setShowWizard] = useState(false);

  const handleCreateProject = async (input: {
    name: string;
    description?: string;
    color: string;
  }) => {
    await createProject(input);
    toast.success(TOAST.PROJECT.CREATED(input.name));
    setShowWizard(false);
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
    <>
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowWizard(true)}
            aria-label="Create project"
          >
            <Plus className="h-5 w-5" />
          </Button>
          <ThemeSwitch />
        </div>
      </header>

      {hasProjects && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-[10px]"
          />
        </div>
      )}
    </>
  );

  return (
    <>
      <PageLayout header={header}>
        {!hasProjects ? (
          <EmptyState
            icon={FolderOpen}
            title="No projects yet"
            message="Create your first project to get started"
            action={{
              label: 'Create Project',
              onClick: () => setShowWizard(true),
              icon: Plus,
            }}
          />
        ) : noSearchResults ? (
          <EmptyState
            icon={Search}
            title="No results found"
            message={`No projects match "${searchQuery}"`}
            action={{
              label: 'Clear search',
              onClick: () => setSearchQuery(''),
              variant: 'outline',
            }}
          />
        ) : (
          <div className="flex flex-col gap-6">
            {projects.map((project) => {
              const isCompleted = project.progress === 100 && project.totalTasks > 0;
              const bgColor = isDark ? getDarkModeColor(project.color) : project.color;
              const textColor = getContrastColor(project.color, isDark);

              return (
                <Link key={project.id} href={ROUTES.PROJECT_DETAIL(project.id)}>
                  <div
                    className={cn(
                      'relative min-h-[140px] p-5 rounded-[10px] shadow-lg transition-all duration-200',
                      'hover:scale-[1.02] hover:shadow-xl',
                      isCompleted && 'ring-2 ring-green-500/30',
                    )}
                    style={{ backgroundColor: bgColor }}
                  >
                    <div
                      className="flex items-center gap-2 text-sm"
                      style={{ color: textColor, opacity: 0.8 }}
                    >
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
                </Link>
              );
            })}

            <button
              type="button"
              onClick={() => setShowWizard(true)}
              className="flex w-full min-h-[100px] items-center justify-center rounded-[10px] border-2 border-dashed border-muted-foreground/30 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Plus className="mr-2 h-5 w-5" />
              <span className="font-medium">New Project</span>
            </button>
          </div>
        )}
      </PageLayout>

      <CreateProjectWizard
        open={showWizard}
        onOpenChange={setShowWizard}
        onSubmit={handleCreateProject}
      />

      <BottomNav />
    </>
  );
}
