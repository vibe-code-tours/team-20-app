<!--
  Vibe Code Tours — Project Starter
  A ready-to-build repo with CI, security scanning, and team practices baked in.
  Click "Use this template" → "Create a new repository" to start your project.
  Then replace THIS README with your project's own (keep the Quickstart working).
-->

# Fundraising Website

A web-based preorder management platform that helps community fundraising events manage food orders, payment confirmations, and pickup preparation through a centralized website with optional AI-assisted ordering support.

![ci](../../actions/workflows/ci.yml/badge.svg) ![security](../../actions/workflows/security.yml/badge.svg)

<!-- A screenshot or GIF of the app goes here — it's the best README section. -->

---

## Prerequisites

### 1. Bun (Required)

```bash
curl -fsSL https://bun.sh/install | bash
```

Verify:

```bash
bun --version
```

### 2. MySQL

A running MySQL instance is required for the backend database.

### 3. Git

```bash
git --version
```

---

## Quickstart

Keep this Quickstart working — it's how a new teammate onboards in 5 minutes.

```bash
git clone <repo-url> && cd <repo>
cp .env.example .env                    # fill in real values LOCALLY — never commit .env
cd app && bun install                   # install dependencies in project folder
cd ../                                  # go back to root
cd app/packages/client && bun install   # install dependencies in client folder
cd ../../../                            # go back to root
cd app/packages/server && bun install   # install dependencies in server folder
cd ../../../                            # go back to root
```

Create a `.env` file inside `app/packages/server`:

```env
DATABASE_URL="mysql://user:your_password@localhost:3306/fundraising"
```

Replace your_password with your actual MySQL credentials.

Run database migrations

```bash
cd app/packages/server && bunx prisma migrate dev
cd ../../../
```

Add sample data

Reference files:
[Sample Data](./app/packages/server/docs/sample-data.sql)
[Sample Data](./app/packages/server/docs/migration_add_july2026_menu_items.sql)

Run both files from the project root:

```bash
mysql -u your_username -p your_database_name < app/packages/server/docs/sample-data.sql
mysql -u your_username -p your_database_name < app/packages/server/docs/migration_add_july2026_menu_items.sql
```

Replace your_username and your_database_name with your actual MySQL credentials.

From the project root, run both simultaneously:

```bash
cd app
bun run dev
```

This uses `concurrently` to start the backend on `http://localhost:3000` and the frontend on `http://localhost:5173` or `http://localhost:5174`.

Or start them individually:

```bash
# Backend only
cd app/packages/server && bun run dev

# Frontend only
cd app/packages/client && bun run dev
```

## Stack

### Frontend (`packages/client`)

- React
- TypeScript
- TailwindCSS

### Backend (`packages/server`)

- Express.js
- TypeScript
- Prisma ORM
- MySQL

### Tooling

- Prettier (code formatting)
- Husky + lint-staged (pre-commit hooks)
- ESLint (client and server)

### Storage

- Amazon S3 for payment screenshots

### AI

- OpenAI API for optional chatbot assistance

### Deployment

- Frontend: Netlify
- Backend: Render

## Project structure

| Path       | What                               |
| ---------- | ---------------------------------- |
| `app/`     | application code                   |
| `tests/`   | tests                              |
| `docs/`    | ARCHITECTURE.md + decision records |
| `.github/` | CI, security, PR/issue templates   |

## Team

<!-- Members + this week's roles (Anchor / Reviewer). Link your board. -->

---

## What's already set up for you

This repo was created from the **Vibe Code Tours project starter**. It ships with:

| File                                                                  | Gives you                                                                           |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `.github/workflows/ci.yml`                                            | lint · typecheck · test · build on every PR (stays green until you add each script) |
| `.github/workflows/security.yml`                                      | gitleaks (leaked keys) + semgrep (SAST) — advisory, report-only                     |
| `.github/dependabot.yml`                                              | weekly PRs for vulnerable / outdated dependencies                                   |
| `.env.example`                                                        | secret hygiene — copy to `.env`, never commit real keys                             |
| `.github/pull_request_template.md` · `ISSUE_TEMPLATE/` · `CODEOWNERS` | small reviewed PRs, one-owner issues                                                |
| `docs/ARCHITECTURE.md` · `docs/decisions/`                            | a 1-page overview + lightweight ADRs                                                |
| `working-agreement.md`                                                | how your team works (GitHub Flow + rotating roles)                                  |

**First thing to do:** follow [`SETUP.md`](./SETUP.md) — a ~1-hour checklist to turn it all on.

**Git rule:** branch → PR → 1 teammate review → merge. No push to `main`, no self-merge.

> A green pipeline ≠ secure. Scanners catch leaked keys, known-CVE deps, and injection
> patterns. They do **not** catch prompt-injection, over-scoped tokens, or hallucinated
> packages — a human still reviews for those.
