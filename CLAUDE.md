# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fundraising Website — a web-based preorder management platform for community fundraising events. Helps organize food orders, payment confirmations, and pickups with optional AI chatbot ordering support.

## Common Commands

### Development

```bash
# Run both frontend and backend
cd app && bun run dev

# Run individually
cd app/packages/client && bun run dev   # Frontend (Vite, port 5173/5174)
cd app/packages/server && bun run dev  # Backend (Express, port 3000)
```

### Database

```bash
cd app/packages/server && bunx prisma migrate dev  # Run migrations
```

### Linting & Formatting

```bash
# Lint
cd app/packages/client && bun run lint
cd app/packages/server && bun run lint

# Format (pre-commit hook runs this automatically)
cd app && bun run format
```

### Build

```bash
cd app/packages/client && bun run build  # Production build
```

## Architecture

```
[frontend] --> [backend] --> [data]
                   |
                   v
             [AI / LLM proxy]
```

### Backend (Express + Prisma + MySQL)

**Layered architecture:** Controller → Service → Repository

- `app/packages/server/index.ts` — Express entry point
- `app/packages/server/routes.ts` — All API routes defined here
- `app/packages/server/controllers/` — Request validation (Zod), error handling
- `app/packages/server/services/` — Business logic, orchestration
- `app/packages/server/repositories/` — Prisma queries, database transactions
- `app/packages/server/prisma.ts` — Singleton Prisma client (global cache pattern)

**Key patterns:**

- Stock management is transactional — order creation/cancellation/updates use `prisma.$transaction`
- Order numbers follow format: `ORD-YYYYMMDD-NNNN` (NZ timezone)
- Menu items have categories: `MAIN_DISH`, `SNACK`, `DESSERT`, `DRINK`
- Order statuses: `PENDING` → `CONFIRMED` → `COMPLETED` (or `CANCELLED`)

**External services:**

- OpenAI API (gpt-4o-mini) — chatbot and order extraction via `llm/client.ts`
- Multer — payment screenshot uploads
- Amazon S3 — payment screenshot storage (configured via env)

### Frontend (React + Vite + TailwindCSS)

- `app/packages/client/src/App.tsx` — React Router routes
- `app/packages/client/src/pages/` — Page components
- `app/packages/client/src/components/` — Reusable components
    - `chat/` — ChatBot with phase-based conversation flow (choose_event → show_menu → choose_items → collect_profile → confirm → placed)
    - `layout/` — NavLayout wrapper

**Key libraries:** react-router-dom, axios, react-hook-form, shadcn/ui, lucide-react

## Data Model (Prisma)

```
Event → MenuItem (1:N, cascade delete)
Event → Order (1:N, cascade delete)
Customer → Order (1:N)
Order → OrderItem (1:N)
MenuItem → OrderItem (1:N)
```

- `MenuItem` has `@@unique([eventId, itemCode])` constraint
- `Customer` identified by phone number (indexed)
- `OrderItem` stores `unitPrice` and `subtotal` at time of order

## Environment Variables

Required in `app/packages/server/.env`:

- `DATABASE_URL` — MySQL connection string
- `OPENAI_API_KEY` — OpenAI API key
- `PORT` — Server port (default: 3000)

## Git Workflow

### Git Workflow & Branching Strategy

Our team uses a Feature-Isolation Workflow. The develop branch is used exclusively for shared testing (Staging/Sandbox), while features are merged into main individually via Pull Requests (PR) from their respective feature branches.

### Branch Roles

- **main:** Production-ready code. Always stable and deployable.
- **develop:** Testing environment. Contains all ongoing features mixed together for staging.
- **<feat_branch>:** Isolated development branch for a specific feature/bugfix.

### Step-by-Step Guide for Developers and AI (Claude Code)

#### 1. Start a New Feature

Always branch out from the latest `main`, NOT from `develop`.

```bash
git checkout main
git pull origin main
git checkout -b feat/your-feature-name
```

#### 2. Testing Your Feature on Develop

When your feature is ready for the team to test, merge it into `develop`. Do not worry, this will not overwrite other features in `develop`.

```bash
# Switch to develop and update it
git checkout develop
git pull origin develop

# Merge your feature into develop
git merge feat/your-feature-name

# Push to deploy/test
git push origin develop
```

> Note: If there is a merge conflict on `develop`, resolve it locally before pushing.

#### 3. Deploying to Production (Merging to `main`)

Once the feature is tested and approved on `develop`, **DO NOT create a PR** from `develop` to `main`. Instead, create a PR from your **isolated feature branch** directly to `main`.

1. Go to GitHub.
2. Create a **Pull Request**.
3. Set **Base**: `main` ← **Compare:** `feat/your-feature-name`.

#### Important Rules to Follow

1. **Never PR** `develop` into `main` – doing so will accidentally push unfinished/unwanted testing features to production.
2. **Keep Feature Branches Clean – Never merge** `develop` back into your `<feat_branch>`. If you need updates from other merged features, pull from `main` instead.

#### Request a Code Review. Once approved, merge the PR and close it.

- Branch → PR → 1 teammate review → merge
- No direct pushes to `main`, no self-merges
- Pre-commit: lint-staged runs Prettier on staged files
- CI: lint → typecheck → test → build on every PR

## Team

- Client liaison: @sandarma
- CEO (Chief Everything Officer 😜) - @lwinmoe51
