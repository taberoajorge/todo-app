'use client';

import { FolderKanban, Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/shared/config/constants';
import { cn } from '@/shared/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  {
    href: ROUTES.HOME,
    label: 'Home',
    icon: Home,
  },
  {
    href: ROUTES.PROJECTS,
    label: 'Projects',
    icon: FolderKanban,
  },
];

export function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <TooltipProvider delayDuration={0}>
      <nav className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
        <div className="flex h-14 items-center gap-2 rounded-full bg-card px-4 shadow-lg ring-1 ring-border/50">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link href={item.href}>
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full transition-all',
                        active
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                      )}
                    >
                      <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                    </div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={8}>
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </nav>
    </TooltipProvider>
  );
}
