# Feature State Log

## [2026-07-23 10:33 AM] fix: resolve security, SEO, and UI/UX audit findings (#38, #39, #40)

### Summary of Changes

- **#38.1:** Changed `ADMIN_PASSWORD=<ADMIN_PASSWORD>` to `<YOUR_ADMIN_PASSWORD>` in `.env.example` to match placeholder convention of other entries
- **#38.2:** Ran `npm audit` — found 6 vulnerabilities (3 moderate, 3 high); details below
- **#39.1:** Added `<meta name="description">` tag to `app/packages/client/index.html` for SEO
- **#40.1:** Switched `focus:` to `focus-visible:` in EventSelector.tsx so focus rings only show for keyboard users

### npm Audit Results (#38.2)

| Vulnerability | Severity | Package | Affects | Fix Available |
|---|---|---|---|---|
| Path traversal on Windows in serve-static | Moderate | `@hono/node-server` | Windows only (via shadcn → @modelcontextprotocol/sdk) | `npm audit fix --force` (breaking) |
| AsyncLocalStorage context lost under concurrent load | High | `effect` | Prisma 6.13.0–6.19.2 | Upgrade Prisma to ≥6.19.3 |

**Note:** Fixes require `--force` (breaking changes). Current Prisma is pinned at 6.16.2 — updating needs careful testing.

### Files Changed

- `app/packages/server/.env.example` — fixed placeholder text
- `app/packages/client/index.html` — added meta description
- `app/packages/client/src/components/dashboard/EventSelector.tsx` — `focus` → `focus-visible`

### Issues Verified as No-Change-Needed

- **#39.2:** `EventCard.tsx` already has `alt={event.name}` on the `<img>` tag
- **#40.2:** Suggests `next/image` — not applicable (this is a Vite + React project, not Next.js)

### Testing Status

- [x] AI Self-Review Done
- [ ] Human Manual Test Pending

---
