## Detailed Directory & File Explanations

---

### `/app` - Next.js App Router Core
*   Contains all routing, page UI, layouts, and API endpoint logic as defined by the Next.js App Router convention.
    *   `/app/page.tsx` - Main home page with task list, filters, and task creation form
    *   `/app/tasks/[id]/page.tsx` - Task detail page with full editing capabilities
    *   `/app/api/tasks/route.ts` - API endpoints for listing and creating tasks
    *   `/app/api/tasks/[id]/route.ts` - API endpoints for individual task operations (get, update, delete)

### `/components` - UI Components
*   All reusable UI components (forms, lists, field displays, etc.).
    *   `TaskForm.tsx` - Component for adding new tasks
    *   `TaskList.tsx` - Component for displaying tasks in a tabular format
    *   `FilterBar.tsx` - Component for filtering tasks by various criteria
    *   `ImportCSVModal.tsx` - Modal dialog for importing tasks from CSV files

### `/config` - Configuration & Setup Files
*   Stores all configuration files for the app, including:
    *   `TASK_FIELD_CONFIG.ts` — Core field definitions
    *   `.env.local` — Environment variables
    *   `next.config.mjs` — Next.js config
    *   `package.json` — Dependencies & scripts
    *   `postcss.config.js` — PostCSS config
    *   `tailwind.config.ts` — Tailwind config
    *   `tsconfig.json` — TypeScript config
    *   `.windsurfrules` — Project rules

### `/lib` - Library Code
*   Utility code, database clients, and shared logic.
    *   `prisma.ts` - Prisma client singleton for database operations
    *   `csvExport.ts` - Utilities for exporting tasks to CSV
    *   `csvImport.ts` - Utilities for importing tasks from CSV

### `/prisma` - Database Schema & Migrations
*   Prisma ORM configuration and database schema management.
    *   `schema.prisma` - Database schema definition

### `/public` - Static Assets
*   Static files served directly by the web server (images, fonts, etc.).

### Root Files
*   Documentation and planning files (`README.md`, `PRD.txt`, `PLANNING.md`, `TASK.md`, `DONE.md`, this file, etc.).

---

### Current File Structure
```
/
├── app/
│   ├── api/
│   │   └── tasks/
│   │       ├── [id]/
│   │       │   └── route.ts
│   │       └── route.ts
│   ├── tasks/
│   │   └── [id]/
│   │       └── page.tsx
│   └── page.tsx
├── components/
│   ├── FilterBar.tsx
│   ├── ImportCSVModal.tsx
│   ├── TaskForm.tsx
│   └── TaskList.tsx
├── config/
│   ├── TASK_FIELD_CONFIG.ts
│   ├── next.config.mjs
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── .windsurfrules
├── lib/
│   ├── csvExport.ts
│   ├── csvImport.ts
│   └── prisma.ts
├── prisma/
│   └── schema.prisma
├── public/
│   └── [static assets]
├── DONE.md
├── PLANNING.md
├── PRD.txt
├── PROJECTS_FILE_STRUCTURE_DOCUMENTATION.md
├── README.md
└── TASK.md
```

### File Management Log
*   [2025-04-22 01:09] Moved all config and environment files to `/config` for clarity and maintainability.
*   [2025-04-22 02:27] Added new components (FilterBar, ImportCSVModal) and utilities (csvExport, csvImport).

_Last updated: 2025-04-22 02:27_
