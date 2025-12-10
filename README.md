# Todo App

[![Deploy](https://img.shields.io/badge/deploy-vercel-black?logo=vercel)](https://taberoa.com)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss)](https://tailwindcss.com)

Project and task management application built with Next.js 15 and React 19.

<p align="center">
  <img src="public/screenshots/mobile-light.jpeg" width="200" alt="Mobile" />
  <img src="public/screenshots/tablet-light.jpeg" width="300" alt="Tablet" />
  <img src="public/screenshots/desktop-light.jpeg" width="400" alt="Desktop" />
</p>

## Quickstart

**Requirements:** Node.js 18+, pnpm

```bash
pnpm install
pnpm dev        # runs on http://localhost:3301
```

## Features

- **Projects**: Create, edit, delete projects with custom colors
- **Tasks**: Create, edit, delete tasks with deadlines
- **Status Management**: Swipe tasks to change status (Todo → In Progress → Done)
- **Views**: Home (today's tasks), Projects list, Project detail
- **Theme**: Dark/light mode with system preference support
- **Responsive**: Mobile-first design with floating navigation
- **Persistence**: Data stored in IndexedDB

## Tech Stack

| Tech | Why |
|------|-----|
| **React 19** | `useOptimistic` for instant UI feedback |
| **IndexedDB** | Async API, handles large datasets (vs localStorage) |
| **Biome** | Single tool for lint + format (vs ESLint + Prettier) |
| **fast-check** | Property-based testing for edge case coverage |
| **shadcn/ui** | Accessible components built on Radix UI |
| **next-themes** | SSR-safe theme management |

## Architecture: Feature-Sliced Design

Code organized by business domain, not technical type.

```
src/
├── app/                      # Entry points and routing
│   ├── page.tsx              # Home view
│   ├── projects/
│   │   ├── page.tsx          # Projects list
│   │   └── [id]/page.tsx     # Project detail
│   └── providers.tsx         # Context providers
│
├── widgets/                  # Composite UI blocks
│   └── bottom-nav/           # Floating navigation
│
├── features/                 # User interactions
│   ├── create-task/          # CreateTaskModal
│   ├── edit-task/            # EditTaskModal
│   ├── create-project/       # CreateProjectWizard
│   ├── edit-project/         # EditProjectModal
│   └── toggle-theme/         # ThemeSwitch
│
└── shared/                   # Reusable foundation
    ├── api/                  # Repositories + types
    ├── hooks/                # Custom hooks
    ├── lib/                  # Utilities (colors, formatters)
    ├── config/               # Constants
    └── ui/                   # shadcn components
```

**Import rule:** Layers can only import from layers below.

## Data Flow

```mermaid
sequenceDiagram
    participant User
    participant Component
    participant Hook
    participant Repository
    participant IndexedDB

    User->>Component: Click action
    Component->>Hook: Call handler
    Hook->>Hook: Optimistic update
    Hook-->>Component: UI updates instantly
    Hook->>Repository: Persist data
    Repository->>IndexedDB: Write to store
    IndexedDB-->>Repository: Confirm
    Repository-->>Hook: Success/Error
    Hook-->>Component: Final state
```

- **Optimistic updates**: UI updates instantly before async operations complete
- **Repository pattern**: Storage abstracted behind interfaces, easy to swap backends

## Commands

```bash
pnpm dev          # Dev server (port 3301)
pnpm build        # Production build
pnpm check        # Biome lint + format
pnpm test         # Run all tests
pnpm knip         # Find dead code
pnpm typecheck    # TypeScript type checking
```

## Key Decisions

### IndexedDB over localStorage
Async API, better for large datasets, supports indexes for queries.

### Repository Pattern
Storage abstracted behind interfaces. Swap IndexedDB for an API backend by implementing a new adapter.

### Swipe Gestures for Status
Mobile-friendly way to change task status without opening modals.

### Color Utilities
Centralized in `colors.ts`: `getDarkModeColor`, `getContrastColor` for theme-aware colors.

## Testing

Unit tests + property-based tests using fast-check for edge case discovery.

```bash
pnpm test
```

## Credits

Design inspired by [Dmitry Lauretsky](https://dribbble.com/dlauretsky) from [Ronas IT](https://dribbble.com/ronasit) — [Task Management App](https://dribbble.com/shots/15963414-Task-Management-App)
