'use client';

import { FolderOpen, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { toast } from 'sonner';
import { CreateProjectWizard, useProjectFormState } from '@/features/create-project';
import { ThemeSwitch } from '@/features/toggle-theme';
import { ROUTES } from '@/shared/config/constants';
import { TOAST } from '@/shared/config/messages';
import { useFormModal } from '@/shared/hooks/useFormModal';
import { useProjects } from '@/shared/hooks/useProjects';
import { AddProjectButton } from '@/shared/ui/add-project-button';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { Input } from '@/shared/ui/input';
import { PageLayout } from '@/shared/ui/page-layout';
import { PageLoading } from '@/shared/ui/page-loading';
import { ProjectCard } from '@/shared/ui/project-card';
import { BottomNav } from '@/widgets/bottom-nav';

export default function ProjectsPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const { projects, totalCount, isLoading, searchQuery, setSearchQuery, createProject } =
    useProjects();

  const hasProjects = totalCount > 0;
  const noSearchResults = hasProjects && projects.length === 0 && searchQuery.trim() !== '';

  const [showWizard, setShowWizard] = useState(false);
  const projectForm = useProjectFormState();

  const { isSubmitting, error, setError, handleSubmit } = useFormModal({
    onSubmit: async () => {
      const data = projectForm.getData();
      await createProject(data);
      toast.success(TOAST.PROJECT.CREATED(data.name));
    },
  });

  const handleCreateProject = async () => {
    const validationError = projectForm.validateCurrentStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    const success = await handleSubmit(undefined);
    if (success) {
      projectForm.reset();
      setShowWizard(false);
    }
  };

  const handleWizardOpenChange = (open: boolean) => {
    if (!open) {
      projectForm.reset();
      setError('');
    }
    setShowWizard(open);
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
            {projects.map((project) => (
              <Link key={project.id} href={ROUTES.PROJECT_DETAIL(project.id)}>
                <ProjectCard project={project} isDark={isDark} />
              </Link>
            ))}
            <AddProjectButton onClick={() => setShowWizard(true)} />
          </div>
        )}
      </PageLayout>

      <CreateProjectWizard
        open={showWizard}
        onOpenChange={handleWizardOpenChange}
        formState={projectForm}
        onSubmit={handleCreateProject}
        isSubmitting={isSubmitting}
        error={error}
        onClearError={() => setError('')}
      />

      <BottomNav />
    </>
  );
}
