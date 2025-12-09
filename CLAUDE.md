# Todo App - AI Agent Guidelines

This document serves as the source of truth for any AI code agent working on this project. Follow these guidelines to maintain consistency and architectural integrity.

## Project Overview

- **Purpose**: Modern todo application with full CRUD operations
- **Target**: Production-ready, scalable architecture
- **Design Philosophy**: Feature-Sliced Design (FSD) with Repository Pattern

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.x | Framework (App Router) |
| React | 19.x | UI Library |
| TypeScript | 5.x | Type Safety |
| Tailwind CSS | 3.4.x | Styling |
| shadcn/ui | latest | Component Library |
| date-fns | 3.x | Date Formatting |
| Framer Motion | 11.x | Animations |
| @dnd-kit | latest | Drag & Drop |
| next-themes | latest | Dark Mode |
| Biome | latest | Linting & Formatting |
| Jest | latest | Testing |
| pnpm | 9.15.0+ | Package Manager |

---

## Architecture: Feature-Sliced Design (FSD)

### Layers (top to bottom)

```
app/        -> Application entry, providers, global styles
widgets/    -> Composite UI blocks (TaskBoard)
features/   -> User interactions (create-task, edit-task, etc.)
entities/   -> Business entities (task UI components)
shared/     -> Reusable code (ui, hooks, lib, api)
```

### Import Rules (CRITICAL)

These rules MUST be followed to maintain architectural integrity:

1. **Lower layers CANNOT import from upper layers**
2. `widgets/` can import from: `features/`, `entities/`, `shared/`
3. `features/` can import from: `entities/`, `shared/`
4. `entities/` can import from: `shared/`
5. `shared/` cannot import from any other layer
6. Same-layer imports are allowed within a slice

```
app/ --> widgets/ --> features/ --> entities/ --> shared/
  |         |             |              |
  +---------+-------------+--------------+--------> shared/
```

### Folder Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Main page
│   ├── providers.tsx             # Context providers (Theme, Repository)
│   └── globals.css               # Global styles + CSS variables
│
├── widgets/                      # Composite UI blocks
│   └── task-board/
│       ├── index.ts              # Public API
│       ├── task-board.tsx        # Main board with DnD between columns
│       ├── droppable-column.tsx  # Droppable column wrapper
│       └── task-card-overlay.tsx # Drag overlay component
│
├── entities/                     # Business domain UI
│   └── task/
│       ├── index.ts              # Public API exports
│       └── ui/
│           ├── task-card.tsx     # Task card component
│           ├── task-list.tsx     # Task list component
│           ├── sortable-task-card.tsx  # Draggable task card
│           └── sortable-task-list.tsx  # Sortable list with DnD
│
├── features/                     # User interactions
│   ├── create-task/
│   │   ├── index.ts
│   │   └── ui/
│   │       └── task-form.tsx
│   ├── edit-task/
│   │   ├── index.ts
│   │   └── ui/
│   │       └── edit-task-dialog.tsx
│   ├── delete-task/
│   │   ├── index.ts
│   │   └── ui/
│   │       └── delete-confirm.tsx
│   ├── toggle-task/
│   │   ├── index.ts
│   │   └── ui/
│   │       └── task-checkbox.tsx
│   ├── filter-tasks/
│   │   ├── index.ts
│   │   └── ui/
│   │       ├── search-bar.tsx
│   │       └── filter-dropdown.tsx
│   ├── reorder-tasks/
│   │   ├── index.ts
│   │   └── ui/
│   │       └── sortable-task-list.tsx
│   └── toggle-theme/
│       ├── index.ts
│       └── ui/
│           └── theme-switch.tsx
│
└── shared/                       # Reusable foundation
    ├── api/
    │   ├── index.ts              # Exports Task, TaskInput, TaskRepository
    │   └── task-repository.ts    # Repository pattern + types
    ├── hooks/
    │   ├── index.ts
    │   ├── useTasks.ts           # Core task state with useOptimistic
    │   ├── useTheme.ts           # Dark mode hook
    │   └── use-local-storage.ts  # Generic localStorage hook
    ├── lib/
    │   ├── utils.ts              # cn() helper
    │   ├── formatters.ts         # Date formatting utilities
    │   └── storage/
    │       ├── index.ts
    │       ├── types.ts          # ITaskStorage interface
    │       └── local-storage.adapter.ts
    ├── ui/                       # shadcn/ui components
    │   ├── button.tsx
    │   ├── input.tsx
    │   ├── textarea.tsx
    │   ├── label.tsx
    │   ├── checkbox.tsx
    │   ├── dialog.tsx
    │   ├── alert-dialog.tsx
    │   ├── card.tsx
    │   ├── dropdown-menu.tsx
    │   └── tooltip.tsx
    └── config/
        └── constants.ts          # App constants (storage keys, limits)
```

---

## Coding Conventions

### File Naming

| Type | Convention | Example |
|------|------------|---------|
| Components | kebab-case | `task-card.tsx` |
| Hooks | camelCase with `use` prefix | `useTasks.ts` |
| Types | PascalCase in files | `types.ts` |
| Utilities | kebab-case | `formatters.ts` |
| Indexes | lowercase | `index.ts` |

### Component Pattern

```typescript
'use client'; // Only add when using client-side features

import { cn } from '@/shared/lib/utils';
import type { Task } from '@/shared/api';

interface TaskCardProps {
  task: Task;
  className?: string;
}

export function TaskCard({ task, className }: TaskCardProps) {
  return (
    <div className={cn('base-classes', className)}>
      {/* Component content */}
    </div>
  );
}
```

### Public API Pattern

Each feature/entity/widget MUST export via `index.ts`:

```typescript
// features/create-task/index.ts
export { TaskForm } from './ui/task-form';
```

**CORRECT import:**
```typescript
import { TaskForm } from '@/features/create-task';
import type { Task } from '@/shared/api';
import { useTasks } from '@/shared/hooks';
```

**INCORRECT import:**
```typescript
import { TaskForm } from '@/features/create-task/ui/task-form'; // NEVER do this
```

---

## Type Definitions

### Core Task Type

```typescript
// shared/api/task-repository.ts
export interface Task {
  id: string;
  title: string;
  description?: string;
  deadline?: string;       // ISO string
  completed: boolean;
  createdAt: string;       // ISO string
}

export type TaskInput = Pick<Task, 'title' | 'description' | 'deadline'>;
```

---

## State Management

### Repository Pattern

The data layer uses the Repository Pattern for abstraction:

```typescript
// shared/lib/storage/types.ts
export interface ITaskStorage {
  getAll(): Promise<Task[]>;
  save(tasks: Task[]): Promise<void>;
  clear(): Promise<void>;
}

// shared/api/task-repository.ts
export function createTaskRepository(storage: ITaskStorage) {
  return {
    getAll(): Promise<Task[]>;
    getById(id: string): Promise<Task | undefined>;
    create(input: TaskInput): Promise<Task>;
    update(id: string, updates: Partial<Task>): Promise<Task | undefined>;
    delete(id: string): Promise<boolean>;
    toggle(id: string): Promise<Task | undefined>;
    reorder(taskIds: string[]): Promise<Task[]>;
  };
}
```

### React 19 Hooks

Use these new React 19 hooks:

| Hook | Purpose | Usage |
|------|---------|-------|
| `useActionState` | Form handling | TaskForm submit |
| `useFormStatus` | Button pending state | SubmitButton |
| `useOptimistic` | Instant UI updates | Toggle task |
| `startTransition` | Non-blocking updates | All mutations |

**Example - useOptimistic:**
```typescript
const [optimisticTasks, setOptimisticTask] = useOptimistic(
  tasks,
  (state, action: { type: 'toggle' | 'delete'; id: string }) => {
    switch (action.type) {
      case 'toggle':
        return state.map(t => t.id === action.id ? { ...t, completed: !t.completed } : t);
      case 'delete':
        return state.filter(t => t.id !== action.id);
    }
  }
);

// Usage with startTransition
startTransition(() => {
  setOptimisticTask({ type: 'toggle', id });
});
```

---

## Styling Guidelines

### Tailwind CSS

1. Use utility classes directly
2. Use `cn()` helper for conditional classes
3. Follow mobile-first approach

```typescript
import { cn } from '@/shared/lib/utils';

<div className={cn(
  'base-styles',
  isActive && 'active-styles',
  className
)} />
```

### CSS Variables

All colors use CSS variables for theme support:

```css
/* Light theme */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ... */
}

/* Dark theme */
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... */
}
```

### Responsive Design

Mobile-first breakpoints:
- Base: Mobile (< 640px)
- `sm:` 640px+
- `md:` 768px+
- `lg:` 1024px+

---

## Testing

### File Location

Tests go in `__tests__/` folders at the project root:

```
__tests__/
├── entities/
│   └── task/
│       └── selectors.test.ts
└── shared/
    └── lib/
        └── storage/
            └── local-storage.adapter.test.ts
```

### Testing Stack

- Jest + Testing Library
- Mock localStorage for repository tests
- Render components with proper providers

---

## Commands

```bash
pnpm dev          # Development server (Turbopack)
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Biome linting
pnpm format       # Biome formatting
pnpm check        # Biome check (lint + format)
pnpm test         # Run tests
pnpm test:watch   # Watch mode
```

**Package Manager**: This project uses pnpm (v9.15.0+)

---

## Key Implementation Notes

### Hydration Safety

Always handle SSR/client mismatch for localStorage:

```typescript
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  loadTasks().finally(() => setIsLoading(false));
}, []);

if (isLoading) return <Loading />;
```

### ID Generation

Use `crypto.randomUUID()` for unique IDs:

```typescript
const id = crypto.randomUUID();
```

### Date Handling

- Store as ISO string: `new Date().toISOString()`
- Format with date-fns for display
- Use `datetime-local` input type for forms

### Task Limits

```typescript
// shared/config/constants.ts
export const TASK_LIMITS = {
  TITLE_MAX: 100,
  DESCRIPTION_MAX: 500,
} as const;
```

---

## DO's and DON'Ts

### DO

- Follow FSD layer import rules
- Use public API exports (index.ts)
- Add `'use client'` only when needed
- Use React 19 hooks for forms and optimistic updates
- Keep components small and focused
- Use TypeScript strict mode
- Import types from `@/shared/api`
- Import hooks from `@/shared/hooks`

### DON'T

- Import directly from feature/entity/widget internals
- Skip the repository pattern for data access
- Add client directives unnecessarily
- Mix business logic in UI components
- Use inline styles (use Tailwind)
- Ignore accessibility (use shadcn/ui primitives)
- Import Task type from entities (use shared/api)
