# Feature State Log

## [2026-07-13 12:35 AM] fix: remove invalid Prisma constructor option

### Summary of Changes

- Removed `connectTimeout` from PrismaClient constructor (not a valid option)
- Kept `log: ['error', 'warn']` for debugging
- Transaction timeout 30000ms in `order.repository.ts` still applies

### Root Cause

- PrismaClient constructor does not accept `connectTimeout` in datasources config
- Valid options: `url` only. Connection timeout must be set in connection string or Prisma engine config
- Fixed by removing invalid config, keeping only `log` option

### Files Changed

| File | Change |
|---|---|
| `app/packages/server/prisma.ts` | Removed invalid `datasources.db.connectTimeout` |

### Testing Status

- [x] AI Self-Review Done
- [x] Tested locally - server starts, events load, orders create successfully

---

## [2026-07-13 02:25 PM] fix: Netlify body parsing - Buffer not decoded by express.json()

### Summary of Changes

- Added Buffer-to-JSON middleware in `index.ts` BEFORE `express.json()`
- Converts `req.body` from Buffer (Lambda event format) to parsed JSON
- Fixed React error #31 crash in `MenuOrderingPage.tsx` (error handler was rendering Zod error object)

### Root Cause

- `serverless-http` passes Lambda event body as a raw `Buffer` to Express
- `express.json()` middleware doesn't decode Buffers — it only parses strings
- Zod received a Buffer instead of an object, so ALL fields failed validation
- Frontend tried to render the Zod error object as React child → crash

### Test Results

- Local with Aiven: ✅ Orders create successfully
- Netlify: Pending deployment test

### Files Changed

| File | Change |
|---|---|
| `app/packages/server/index.ts` | Added Buffer-to-JSON middleware before express.json() |
| `app/packages/server/netlify/functions/server.ts` | Removed duplicate middleware |
| `app/packages/server/controllers/order.controller.ts` | Removed debug logging |
| `app/packages/client/src/pages/MenuOrderingPage.tsx` | Fixed error handler to extract string from Zod error object |

### Testing Status

- [x] AI Self-Review Done
- [x] Local tested
- [ ] Netlify deployment test pending

---

## [2026-07-12 04:45 AM] fix: make prompt path work in both local dev and Netlify deployment

### Summary of Changes

- Previous fix (`process.cwd().endsWith('app')`) broke local dev when running from `packages/server/` directory
- Replaced with `findPromptsDir()` function that tries 3 candidate paths and uses the first one that exists:
  1. `cwd/app/packages/server/prompts` — Netlify (cwd=/var/task)
  2. `cwd/packages/server/prompts` — Local from app/
  3. `cwd/prompts` — Local from packages/server/
- Works in all environments: Netlify, local from `app/`, local from `packages/server/`

### Root Cause

| Environment | `process.cwd()` | Previous path | Fixed path |
|---|---|---|---|
| Netlify | `/var/task` | `/var/task/app/packages/server/prompts` ✅ | Same ✅ |
| Local from `app/` | `.../app` | `.../app/packages/server/prompts` ✅ | Same ✅ |
| Local from `packages/server/` | `.../packages/server` | `.../packages/server/app/packages/server/prompts` ❌ | `.../packages/server/prompts` ✅ |

### Files Changed

| File | Change |
|---|---|
| `app/packages/server/services/chat.service.ts` | Replaced `endsWith('app')` logic with `findPromptsDir()` candidate search |

### Testing Status

- [x] AI Self-Review Done
- [x] Human Manual Test Pending — Local ✅ Netlify ✅

---

## [2026-07-12 04:30 AM] fix: resolve prompt file path and missing OPENAI_API_KEY for Netlify deployment

### Summary of Changes

- Fixed prompt file path resolution in `chat.service.ts` — on Netlify, `process.cwd()` returns `/var/task` but files are under `/var/task/app/...` (due to `base = "app"` in netlify.toml)
- Added smart detection: if `process.cwd()` ends with `app`, use it directly; otherwise append `app/` to the path
- Identified and documented that `OPENAI_API_KEY` environment variable must be set in Netlify dashboard (OpenAI client crashes at module load if missing)
- **API is now live and responding** at `https://fundraising-event-management.netlify.app/api/events/active`

### Root Causes of 502 Errors (in order)

| Error | Cause | Fix |
|---|---|---|
| `Missing credentials` | `OPENAI_API_KEY` not set in Netlify env vars | Added env var in Netlify dashboard |
| `ENOENT: prompts/chatbot.txt` | `process.cwd()` = `/var/task` but files at `/var/task/app/...` | Path detection for `app/` prefix |

### Files Changed

| File | Change |
|---|---|
| `app/packages/server/services/chat.service.ts` | Smart `serverBase` path detection for prompts directory |

### Testing Status

- [x] AI Self-Review Done
- [x] Human Manual Test Pending — API returns data ✅

---

## [2026-07-12 04:15 AM] fix: replace import.meta.url with CJS-compatible __dirname for Netlify esbuild

### Summary of Changes

- Removed `import.meta.url` based `__dirname` from `index.ts` and `chat.service.ts` (esbuild bundles to CJS where `import.meta` is empty/undefined, causing 502 Bad Gateway)
- Replaced with `process.cwd()` based path resolution — reliable in both local dev and Netlify Functions
- Removed unused `path` import and `__dirname` variable from `index.ts` (no longer needed)
- Verified prompt file paths resolve correctly: `process.cwd() + packages/server/prompts/`
- Verified function bundle loads without crash using esbuild local test
- Confirmed Netlify officially supports Express.js via `serverless-http` (per docs)

### Files Changed

| File | Change |
|---|---|
| `app/packages/server/index.ts` | Removed `import.meta.url` / `__dirname`, cleaned up unused imports |
| `app/packages/server/services/chat.service.ts` | Replaced `__dirname` with `process.cwd()` based `promptsDir` |

### Impact & Dependencies

- Fixes 502 Bad Gateway on all `/api/*` routes in Netlify deployment
- Local dev unaffected — `process.cwd()` resolves to same directory
- Verified with esbuild bundle test: function loads correctly

### Testing Status

- [x] AI Self-Review Done
- [ ] Human Manual Test Pending

---

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
