# Kanban Project Management Tool

A feature-rich Kanban application for planning, tracking, and managing projects with modern workflows.

![App Preview](./src/assets/hero.png)

## Features

- Authentication with login and signup flow
- Start page, auth page, and dashboard navigation
- Kanban board with drag and drop
- List, calendar, and stats views
- Bulk task actions (select, move, delete)
- Advanced filters and global task search
- Task details with assignees, labels, comments, due dates, and priority
- Keyboard shortcuts and undo/redo
- Realtime in-app notifications
- Dark mode with persisted preference
- Burndown chart and completion metrics
- Recurring tasks, attachments, and custom fields (stored in local browser metadata)

## Tech Stack

- React + Vite
- Zustand for state management
- Supabase for auth/data/realtime
- dnd-kit for drag and drop

## Project Structure

```text
src/
  features/
    auth/
    board/
    notifications/
    projects/
    tasks/
  pages/
  store/
  lib/
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create `kanban-app/.env` with:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run development server

From the workspace root:

```bash
npm run dev
```

Or from this folder:

```bash
npm run dev
```

## Available Scripts

- `npm run dev` - start local development server
- `npm run build` - create production build
- `npm run lint` - run lint checks
- `npm run preview` - preview production build

## Notes

- Advanced task extras (attachments, recurrence, custom fields) are currently stored in localStorage.
- Ensure Supabase RLS policies are configured for your project tables.
