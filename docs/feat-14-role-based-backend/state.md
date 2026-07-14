# Feature State Log

## [2026-07-12 05:30 PM] feat: add invitation status check and redirect used codes to login

### Summary of Changes

- Created `GET /api/invitations/check/:code` public endpoint to validate invitation codes.
- Added `checkStatus` method to `invitation.service.ts` — checks if code exists, is used, or is expired.
- Updated `RegisterPage.tsx` — checks invitation status on mount, redirects to `/login` with reason if invalid/used/expired.
- Updated `LoginPage.tsx` — displays redirect message from RegisterPage via location state.

### Impact & Dependencies

- Public endpoint (no auth required) — safe for pre-registration validation.
- No database changes required.

### Testing Status

- [x] AI Self-Review Done
- [x] Invitation Check Endpoint Verified
- [ ] Human Manual Test Pending

---

## [2026-07-12 04:00 PM] feat: implement role-based authentication and invitation system

### Summary of Changes

**Backend — Auth & User Management:**

- Created `auth.controller.ts` — register, login, refresh, me, logout endpoints with Zod validation.
- Created `auth.service.ts` — bcrypt password hashing (10 rounds), JWT access (15min) + refresh (7d) token pair, invitation-based registration flow.
- Created `invitation.controller.ts` — create, list, revoke invitation endpoints.
- Created `invitation.service.ts` — invitation code generation (12-char crypto), email restriction, role assignment (ADMIN/ORGANIZER), 7-day expiry.
- Created `user.controller.ts` — list, delete user endpoints with self-deletion prevention.
- Created `user.service.ts` — user listing and deletion logic.
- Created `user.repository.ts` — Prisma queries for User model.
- Created `invitation.repository.ts` — Prisma queries for Invitation model.

**Backend — Middleware:**

- Created `middleware/auth.ts` — JWT `authenticate` middleware with `req.user` augmentation.
- Created `middleware/authorize.ts` — `requireRole(...roles)` RBAC middleware.
- Created `middleware/ownership.ts` — `requireEventOwnership` / `requireEventOwnershipForBody` middleware.
- Created `middleware/rate-limit.ts` — in-memory login rate limiter (5 attempts per 15min per IP).
- Created `types/express.d.ts` — Express Request type augmentation for `req.user`.

**Backend — Database:**

- Updated `schema.prisma` — added `UserRole` enum, `User` model, `Invitation` model, `organizerId` field on Event model.
- Created `prisma/migrations/20260710002303_add_auth_models/migration.sql` — creates `users` and `invitations` tables.
- Created `prisma/migrations/20260712000000_add_organizer_to_events/migration.sql` — adds `organizerId` to events table.
- Created `prisma/seed.ts` — admin user seed script with bcrypt hashing.

**Backend — Routes:**

- Updated `routes.ts` — registered auth, invitation, and user routes with proper middleware (`authenticate`, `requireRole('ADMIN')`, `rateLimitLogin`).

**Frontend — Auth:**

- Created `contexts/AuthContext.tsx` — auth state management, login/register/logout, session restore from refresh token, auto-refresh interceptor.
- Created `lib/api.ts` — Axios instance with request interceptor (attach Bearer token) and response interceptor (auto-refresh on 401).
- Created `pages/LoginPage.tsx` — login form with role-based redirect (ADMIN → invitations, ORGANIZER → events).
- Created `pages/RegisterPage.tsx` — invitation-code-gated registration with password visibility toggle and confirm password validation.
- Created `components/ProtectedRoute.tsx` — redirects unauthenticated users to /login.

**Frontend — Admin:**

- Created `pages/admin/AdminLayout.tsx` — admin sidebar layout with role-gated navigation.
- Created `pages/admin/InvitationsPage.tsx` — invitation management UI (create, list, revoke).
- Created `pages/admin/UsersPage.tsx` — user management UI (list, delete).

**Frontend — UI Fixes:**

- Updated `components/layout/NavLayout.tsx` — fixed invalid `<li>` elements, added Admin link for authenticated ADMIN users, added Sign in/Sign out with proper styling.
- Updated `index.css` — added global `cursor: pointer` for all buttons.

### Impact & Dependencies

- Requires `bcrypt` and `jsonwebtoken` npm packages.
- Requires `JWT_SECRET` and `JWT_REFRESH_SECRET` environment variables.
- Database migrations must be applied: `npx prisma migrate deploy`.
- Admin seed must be run before first login: `ADMIN_EMAIL="..." ADMIN_PASSWORD="..." npm run seed`.

### Testing Status

- [x] AI Self-Review Done
- [x] S3 Upload Test Passed (payment screenshot)
- [x] Admin Seed Test Passed
- [x] Login API Test Passed (curl verified)
- [x] Invitation Check Endpoint Verified
- [x] Human Manual Test Pending
