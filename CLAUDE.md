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
| Biome | latest | Linting & Formatting |
| Jest | latest | Testing |
| pnpm | 9.15.0+ | Package Manager |

---

## Architecture: Feature-Sliced Design (FSD)

### Layers (top to bottom)

```
app/        -> Application entry, providers, global styles
features/   -> User interactions (create-task, edit-task, etc.)
entities/   -> Business entities (task)
shared/     -> Reusable code (ui, hooks, lib, api)
```

### Import Rules (CRITICAL)

These rules MUST be followed to maintain architectural integrity:

1. **Lower layers CANNOT import from upper layers**
2. `features/` can import from: `entities/`, `shared/`
3. `entities/` can import from: `shared/`
4. `shared/` cannot import from any other layer
5. Same-layer imports are allowed within a slice

```
app/ -----> features/ -----> entities/ -----> shared/
  |             |                |
  +-------------+----------------+----------> shared/
```

### Folder Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Main page
│   └── globals.css               # Global styles + CSS variables
│
├── entities/                     # Business domain
│   └── task/
│       ├── index.ts              # Public API exports
│       ├── model/
│       │   └── types.ts          # Task interface
│       └── ui/
│           ├── TaskCard.tsx      # Task card component
│           └── TaskList.tsx      # Task list component
│
├── features/                     # User interactions
│   ├── create-task/
│   │   ├── index.ts
│   │   └── ui/
│   │       └── TaskForm.tsx
│   ├── edit-task/
│   │   ├── index.ts
│   │   └── ui/
│   │       └── EditTaskDialog.tsx
│   ├── delete-task/
│   │   ├── index.ts
│   │   └── ui/
│   │       └── DeleteConfirmDialog.tsx
│   ├── toggle-task/
│   │   ├── index.ts
│   │   └── ui/
│   │       └── TaskCheckbox.tsx
│   ├── filter-tasks/
│   │   ├── index.ts
│   │   └── ui/
│   │       ├── SearchBar.tsx
│   │       └── FilterDropdown.tsx
│   ├── reorder-tasks/
│   │   ├── index.ts
│   │   └── ui/
│   │       └── SortableTaskList.tsx
│   └── toggle-theme/
│       ├── index.ts
│       └── ui/
│           └── ThemeToggle.tsx
│
└── shared/                       # Reusable foundation
    ├── api/
    │   ├── index.ts
    │   ├── storage.ts            # IStorage interface + LocalStorageAdapter
    │   └── task-repository.ts    # Repository pattern implementation
    ├── hooks/
    │   ├── index.ts
    │   ├── useTasks.ts           # Core task state with useOptimistic
    │   └── useTheme.ts           # Dark mode hook
    ├── lib/
    │   ├── utils.ts              # cn() helper
    │   └── formatters.ts         # Date formatting utilities
    ├── ui/                       # shadcn/ui components
    │   ├── button.tsx
    │   ├── input.tsx
    │   ├── checkbox.tsx
    │   ├── dialog.tsx
    │   ├── card.tsx
    │   └── dropdown-menu.tsx
    └── config/
        └── constants.ts          # App constants
```

---

## Coding Conventions

### File Naming

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `TaskCard.tsx` |
| Hooks | camelCase with `use` prefix | `useTasks.ts` |
| Types | PascalCase | `types.ts` |
| Utilities | camelCase | `formatters.ts` |
| Indexes | lowercase | `index.ts` |

### Component Pattern

```typescript
'use client'; // Only add when using client-side features

import { cn } from '@/shared/lib/utils';

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

Each feature/entity MUST export via `index.ts`:

```typescript
// features/create-task/index.ts
export { TaskForm } from './ui/TaskForm';
```

**CORRECT import:**
```typescript
import { TaskForm } from '@/features/create-task';
```

**INCORRECT import:**
```typescript
import { TaskForm } from '@/features/create-task/ui/TaskForm'; // NEVER do this
```

---

## Type Definitions

### Core Task Type

```typescript
// entities/task/model/types.ts
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
// shared/api/storage.ts
export interface IStorage<T> {
  getItem(key: string): T | null;
  setItem(key: string, value: T): void;
  removeItem(key: string): void;
}

// shared/api/task-repository.ts
export interface TaskRepository {
  getAll(): Task[];
  getById(id: string): Task | undefined;
  create(task: TaskInput): Task;
  update(id: string, updates: Partial<Task>): Task | undefined;
  delete(id: string): boolean;
  reorder(taskIds: string[]): Task[];
}
```

### React 19 Hooks

Use these new React 19 hooks:

| Hook | Purpose | Usage |
|------|---------|-------|
| `useActionState` | Form handling | TaskForm submit |
| `useFormStatus` | Button pending state | SubmitButton |
| `useOptimistic` | Instant UI updates | Toggle task |
| `useTransition` | Non-blocking updates | All mutations |

**Example - useOptimistic:**
```typescript
const [optimisticTasks, addOptimistic] = useOptimistic(
  tasks,
  (state, action: { type: 'toggle'; id: string }) =>
    state.map(t => t.id === action.id ? { ...t, completed: !t.completed } : t)
);
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

Tests go in `__tests__/` folders adjacent to the code:

```
shared/
├── api/
│   ├── task-repository.ts
│   └── __tests__/
│       └── task-repository.test.ts
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
const [isHydrated, setIsHydrated] = useState(false);

useEffect(() => {
  setIsHydrated(true);
}, []);

if (!isHydrated) return <Loading />;
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

---

## DO's and DON'Ts

### DO

- Follow FSD layer import rules
- Use public API exports (index.ts)
- Add `'use client'` only when needed
- Use React 19 hooks for forms and optimistic updates
- Keep components small and focused
- Use TypeScript strict mode

### DON'T

- Import directly from feature/entity internals
- Skip the repository pattern for data access
- Add client directives unnecessarily
- Mix business logic in UI components
- Use inline styles (use Tailwind)
- Ignore accessibility (use shadcn/ui primitives)
