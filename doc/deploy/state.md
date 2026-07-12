# Feature State Log

## [2026-07-12 03:45 PM] fix: resolve Netlify deployment build failures

### Summary of Changes

- Removed `bun.lock` file (was interfering with npm workspace resolution on Netlify)
- Removed Bun-specific `"module": "index.ts"` field from root `app/package.json` and `app/packages/server/package.json`
- Removed `"peerDependencies"` block from root and server `package.json` (not needed for npm)
- Added `--legacy-peer-deps` to npm install command in `netlify.toml` (fixes npm arborist workspace bug)
- Moved `netlify.toml` from `app/` to repo root with `base = "app"` (Netlify needs toml at repo root)
- Fixed Netlify build command paths to work from `app/` base directory

### Files Changed

| File | Change |
|---|---|
| `app/bun.lock` | Deleted |
| `app/package.json` | Removed `"module"` and `"peerDependencies"` |
| `app/packages/server/package.json` | Removed `"module"` and `"peerDependencies"` |
| `netlify.toml` | Moved to repo root, added `base = "app"`, added `--legacy-peer-deps` |
| `app/netlify.toml` | Deleted (moved to root) |

### Impact & Dependencies

- No local dev changes — `npm run dev` still works as before
- Netlify build should now succeed with clean npm install
- Requires push to trigger new Netlify deploy

### Testing Status

- [x] AI Self-Review Done
- [ ] Human Manual Test Pending

---

## [2026-07-12 03:15 PM] fix: resolve .txt import and multer-s3 version issues

### Summary of Changes

- Converted Bun-style `.txt` imports to `fs.readFileSync` in `chat.service.ts` (Node.js cannot import .txt files directly)
- Removed unused commented-out imports (`wonderworld_chatbot.txt`)
- Fixed `multer-s3` version from `^3.1.1` to `^3.0.1` (correct latest version)

### Impact & Dependencies

- Files changed: `chat.service.ts`, `app/packages/server/package.json`
- No breaking changes — purely compatibility fixes

### Testing Status

- [x] AI Self-Review Done
- [ ] Human Manual Test Pending

---

## [2026-07-12 03:00 PM] feat: implement Bun to Node.js migration and Netlify deployment config

### Summary of Changes

- Removed Bun from all package.json scripts, replaced with `npx tsx` for server runtime
- Removed `@types/bun` from devDependencies, added `tsx` to root devDependencies
- Updated `tsconfig.json` (root + server) to use `"types": ["node"]` instead of `["bun"]`
- Fixed ESM `__dirname` compatibility in `index.ts`, `payment.controller.ts`, `chat.service.ts` using `fileURLToPath`
- Refactored `index.ts` to export Express app and skip `app.listen()` in Lambda/Netlify environment
- Rewrote `payment.controller.ts` to use Aiven Object Storage (S3-compatible) via `multer-s3` instead of local disk
- Removed `express.static('/uploads')` middleware — files now served from S3 URLs
- Created `.env.development` (local MySQL) and `.env.production` (Aiven MySQL + S3)
- Created `netlify.toml` with build config, function routing, and `/api/*` redirects
- Created `netlify/functions/server.ts` — serverless wrapper using `serverless-http`
- Installed new dependencies: `@aws-sdk/client-s3`, `multer-s3`, `serverless-http`

### Impact & Dependencies

- Breaking: requires `npm install` (Bun node_modules must be cleaned first)
- Requires Aiven MySQL + Aiven Object Storage credentials in production `.env`
- Client code unchanged — relative `/api/...` paths work in both dev and Netlify
- Local dev flow: `cd app && npm run dev` (uses concurrently for server + client)

### Testing Status

- [x] AI Self-Review Done
- [ ] Human Manual Test Pending

---

## [2026-07-12 02:30 PM] feat: migration plan — Bun to Node.js + Netlify deployment

### Summary of Changes

- Researched entire codebase for Bun → Node.js migration feasibility
- Identified 4 critical blockers: `app.listen()` pattern, multer disk uploads, `express.static` for uploads, Bun runtime
- Created migration plan covering: package scripts, ESM compatibility, env files, Prisma/Aiven config, S3 file uploads, Netlify Functions setup
- Plan documented at `doc/deploy/bun_removal_migration_plan.md`

### Impact & Dependencies

- Affects: server `package.json`, root `package.json`, `tsconfig.json` files, `index.ts`, `payment.controller.ts`, `chat.service.ts`
- New dependencies needed: `@aws-sdk/client-s3`, `multer-s3`, `serverless-http`, `tsx`
- New files: `netlify.toml`, `.env.production`, `.env.development`, `netlify/functions/server.ts`
- Requires Aiven MySQL + Aiven Object Storage setup for production

### Testing Status

- [ ] AI Self-Review Done
- [ ] Human Manual Test Pending
