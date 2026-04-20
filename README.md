# Project Management Tool

This repository contains a Kanban-based project management application.

## Repository Layout

- `kanban-app/` - main React + Vite application
- `package.json` (root) - convenience scripts that delegate into `kanban-app`

## Quick Start

```bash
npm install
npm run dev
```

The app will be available at the URL printed by Vite (for example `http://localhost:5175`).

## App Setup

Set up Supabase credentials in `kanban-app/.env`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

For full feature and folder documentation, see [kanban-app/README.md](kanban-app/README.md).
+