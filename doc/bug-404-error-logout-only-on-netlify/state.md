# Feature State Log

## [2026-07-24 03:56 AM] fix: add SPA fallback redirect for Netlify client-side routing

### Summary of Changes

- Added `[[redirects]] from = "/*" to = "/index.html" status = 200` rule to `netlify.toml` — all non-API requests now serve `index.html` so React Router can handle client-side routes
- Kept the `/api/*` redirect rule before the catch-all (Netlify processes top-to-bottom, first match wins), ensuring API requests still reach the serverless function
- This fixes the 404 on:
  - `/login` page (appears after signout or on refresh)
  - Invitation/registration links for organizers
  - Any client-side route when the page is refreshed directly on Netlify

### Root Cause

Netlify serves static files by path. Client-side routes like `/login`, `/register`, `/invitations` don't exist as physical files in the build output — only `index.html` does. Without a catch-all redirect rule, Netlify returns its 404 error page for these paths. Local development works because Vite's dev server handles SPA routing natively.

### Impact & Dependencies

- Only file changed: `netlify.toml` (one additional redirect rule)
- No code changes to the app itself — purely a deployment configuration fix
- After deploying, a full redeploy is needed for the redirect to take effect on Netlify

### Testing Status

- [x] AI Self-Review Done
- [ ] Human Manual Test Pending

