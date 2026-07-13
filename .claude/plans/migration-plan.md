# Migration Plan: Bun → Node.js + Netlify Deployment

## Goal
Remove Bun dependency, migrate to Node.js, and make the project ready for deployment on Netlify (frontend + backend) + Aiven (MySQL). Both local development and deployment must work.

---

## Current State Summary

| Component | Current | Target |
|---|---|---|
| Runtime | Bun | Node.js |
| Package Manager | Bun workspaces | npm workspaces |
| Frontend | Vite (no Bun-specific code) | Same — no change needed |
| Backend | Express 5, `bun run index.ts` | Express 5, `npx tsx index.ts` |
| File Uploads | Multer → local `uploads/` dir | Multer → Aiven Object Storage (S3-compatible) |
| Database | MySQL (local) | Aiven MySQL |
| Deployment | None | Netlify Functions (serverless) |

---

## Phase 1: Remove Bun from Package Scripts

### 1.1 `app/packages/server/package.json`
Change scripts:
- `"start": "bun run index.ts"` → `"start": "npx tsx index.ts"`
- `"dev": "bun --watch run index.ts"` → `"dev": "npx tsx watch index.ts"`
- Add `"build": "npx prisma generate && npx tsc"` (for Netlify build)

Remove devDependency: `"@types/bun": "latest"`

### 1.2 `app/packages/client/package.json`
No changes needed — client doesn't use Bun.

### 1.3 `app/package.json` (root monorepo)
Change scripts:
- `"dev": "bun run index.ts"` → `"dev": "concurrently \"npm run dev --workspace=packages/server\" \"npm run dev --workspace=packages/client\""`
- Remove `"@types/bun": "latest"` from devDependencies
- Add `"tsx"` to devDependencies (for the server)

### 1.4 `app/packages/server/tsconfig.json`
Remove `"types": ["bun"]` — change to `"types": ["node"]` or remove the line entirely (tsx handles this).

### 1.5 `app/tsconfig.json` (root)
Same as above — remove `"types": ["bun"]`.

---

## Phase 2: Fix ESM Compatibility (`__dirname`)

Bun supports `__dirname` in ESM modules. Node.js does not. Two files use it:

### 2.1 `app/packages/server/index.ts`
```ts
// Before (Bun)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// After (Node.js ESM)
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

### 2.2 `app/packages/server/controllers/payment.controller.ts`
Same fix — add `import.meta.url` → `__dirname` conversion at the top.

### 2.3 `app/packages/server/services/chat.service.ts`
Same fix for `path.join(__dirname, '..', 'prompts', ...)`.

---

## Phase 3: Create Environment Files

### 3.1 `app/packages/server/.env` (LOCAL development — already exists)
```env
DATABASE_URL=mysql://root:123456@localhost:3306/fundraising
OPENAI_API_KEY=<YOUR_OPENAI_API_KEY>
NODE_ENV=development
```

### 3.2 `app/packages/server/.env.production` (production — NEW)
```env
DATABASE_URL=mysql://<AIVEN_USER>:<AIVEN_PASSWORD>@<AIVEN_HOST>:3306/<AIVEN_DB>?sslaccept=strict
OPENAI_API_KEY=<YOUR_OPENAI_API_KEY>
NODE_ENV=production
```
> **Note:** Aiven MySQL requires SSL. The `?sslaccept=strict` parameter is important.

### 3.3 `app/packages/server/.env.development` (alternative local — NEW)
Same as `.env` above, for explicit dev-mode clarity. Vite can load this via `envDir` if needed.

### 3.4 Update `.gitignore`
Ensure `.env.production` is ignored (it already covers `.env.*` in the root gitignore).

---

## Phase 4: Prisma for Aiven MySQL

### 4.1 `app/packages/server/prisma/schema.prisma`
No schema changes needed — already uses MySQL provider and reads from `DATABASE_URL`.

### 4.2 Connection Pooling for Serverless
Add connection limit to the Aiven DATABASE_URL:
```
mysql://user:pass@host:3306/dbname?connection_limit=5&sslaccept=strict
```
Or configure in code:
```ts
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
```

### 4.3 Prisma Generate at Build Time
For Netlify deployment, `prisma generate` must run during the build step (Phase 6).

---

## Phase 5: Adapt File Uploads (Critical)

### Problem
`multer.diskStorage` writes to local `uploads/` dir. In Netlify Functions, the filesystem is ephemeral — files vanish after the function completes.

### Solution: Aiven Object Storage (S3-compatible)
Use `@aws-sdk/client-s3` to upload to Aiven's S3-compatible object storage.

### 5.1 Install new dependency
```bash
cd app/packages/server && npm install @aws-sdk/client-s3 multer-s3
```

### 5.2 Rewrite `controllers/payment.controller.ts`
- Replace `multer.diskStorage` with `multer-s3` storage engine
- Store the S3 URL in `paymentScreenshotUrl` instead of `/uploads/filename`
- Aiven credentials: `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`

### 5.3 Remove `express.static('/uploads')` from `index.ts`
- File serving now comes from S3 URLs (already public or signed URLs)
- Remove the static middleware line

### 5.4 Remove `uploads/` directory
- No longer needed; add to `.gitignore` if not already

---

## Phase 6: Netlify Configuration

### 6.1 Create `app/netlify.toml`
```toml
[build]
  command = "npm install && npm run build --workspace=packages/client && npm run build --workspace=packages/server"
  functions = "packages/server/netlify/functions"
  publish = "packages/client/dist"

[functions]
  node_bundler = "esbuild"
  included_files = ["packages/server/prompts/**"]

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/server/:splat"
  status = 200
```

### 6.2 Create Netlify Function wrapper
`app/packages/server/netlify/functions/server.ts`:
```ts
import serverless from 'serverless-http';
import app from '../../index';  // export the Express app (see Phase 7)

export const handler = serverless(app);
```

### 6.3 Install serverless adapter
```bash
cd app/packages/server && npm install serverless-http
```

---

## Phase 7: Refactor Express Entry Point

### 7.1 `app/packages/server/index.ts`
Restructure to **export the Express app** instead of just calling `app.listen()`:

```ts
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import router from './routes';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
// Remove: app.use('/uploads', express.static(...)) — no longer needed
app.use(router);

// Only listen when running directly (local dev)
// When imported by Netlify Function, skip listen
const isLambda = !!process.env.NETLIFY;
if (!isLambda) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

export default app;
```

This way:
- **Local dev**: `npx tsx index.ts` → starts Express on port 3000
- **Netlify**: Function imports `app` → wraps with `serverless-http`

---

## Phase 8: Frontend API URL Configuration

### Current state
Client uses relative `/api/...` paths. Vite proxies to `localhost:3000` in dev.

### For Netlify deployment
- Frontend is served from Netlify CDN
- `/api/*` redirects go to Netlify Functions via `netlify.toml` redirects
- **No code changes needed** — relative paths work in both dev and production

### For local development
- Keep the Vite proxy in `vite.config.ts` — no change needed
- Run server on port 3000, Vite on port 5173

---

## Phase 9: Netlify Environment Variables

Set in Netlify dashboard (Site → Environment Variables):

| Variable | Example Value |
|---|---|
| `DATABASE_URL` | `mysql://user:pass@ava-xxx.aivencloud.com:3306/fundraising?sslaccept=strict` |
| `OPENAI_API_KEY` | `sk-...` |
| `NODE_ENV` | `production` |
| `S3_ENDPOINT` | `https://<bucket>.s3.amazonaws.com` (or Aiven S3 endpoint) |
| `S3_BUCKET` | `your-bucket-name` |
| `S3_ACCESS_KEY` | `AKIA...` |
| `S3_SECRET_KEY` | `...` |

---

## Execution Order

| Step | Task | Files Changed |
|---|---|---|
| 1 | Remove Bun from package scripts | `app/package.json`, `app/packages/server/package.json` |
| 2 | Remove `@types/bun`, add `tsx` | `app/package.json`, `app/packages/server/package.json` |
| 3 | Update tsconfig to remove Bun types | `app/tsconfig.json`, `app/packages/server/tsconfig.json` |
| 4 | Fix `__dirname` for ESM | `index.ts`, `payment.controller.ts`, `chat.service.ts` |
| 5 | Refactor Express to export app + skip listen in Lambda | `app/packages/server/index.ts` |
| 6 | Create `.env.production` | `app/packages/server/.env.production` (NEW) |
| 7 | Create `.env.development` | `app/packages/server/.env.development` (NEW) |
| 8 | Install `@aws-sdk/client-s3`, `multer-s3`, `serverless-http` | `app/packages/server/package.json` |
| 9 | Rewrite payment controller for S3 uploads | `app/packages/server/controllers/payment.controller.ts` |
| 10 | Remove `express.static('/uploads')` | `app/packages/server/index.ts` |
| 11 | Create `netlify.toml` | `app/netlify.toml` (NEW) |
| 12 | Create Netlify Function wrapper | `app/packages/server/netlify/functions/server.ts` (NEW) |
| 13 | Test locally with `npm run dev` | — |
| 14 | Test `prisma generate` + build | — |

---

## Local Development Flow (after migration)

```bash
cd app
npm install                    # Install all deps (workspaces)
npm run dev                    # Starts both server (port 3000) and client (port 5173)
```

- Server: `npx tsx watch packages/server/index.ts`
- Client: `vite` with proxy → `localhost:3000`
- Database: local MySQL (Aiven VPN or local instance)

## Deployment Flow

1. Push to GitHub
2. Netlify auto-builds:
   - `npm install` → `npm run build` (client) → `prisma generate` → `tsc` (server)
   - Functions deployed to `/.netlify/functions/server`
   - Static files deployed to CDN
3. Set env vars in Netlify dashboard
4. Done — `/api/*` routes work via Netlify Functions redirects
