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
Remove `"types": ["bun"]` — change to `"types": ["node"]` or remove the line entirely.

### 1.5 `app/tsconfig.json` (root)
Same as above — remove `"types": ["bun"]`.

---

## Phase 2: Fix ESM Compatibility (`__dirname`)

Bun supports `__dirname` in ESM modules. Node.js does not. Three files use it:

### 2.1 `app/packages/server/index.ts`
Add at top:
```ts
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

### 2.2 `app/packages/server/controllers/payment.controller.ts`
Same fix — add `import.meta.url` → `__dirname` conversion.

### 2.3 `app/packages/server/services/chat.service.ts`
Same fix for `path.join(__dirname, '..', 'prompts', ...)`.

---

## Phase 3: Create Environment Files

### 3.1 `app/packages/server/.env` (LOCAL — already exists, keep as-is)
```env
DATABASE_URL=mysql://root:123456@localhost:3306/fundraising
OPENAI_API_KEY=<YOUR_OPENAI_API_KEY>
NODE_ENV=development
```

### 3.2 `app/packages/server/.env.production` (NEW)
```env
DATABASE_URL=mysql://<AIVEN_USER>:<AIVEN_PASSWORD>@<AIVEN_HOST>:3306/<AIVEN_DB>?sslaccept=strict
OPENAI_API_KEY=<YOUR_OPENAI_API_KEY>
NODE_ENV=production
S3_ENDPOINT=https://<bucket>.s3.amazonaws.com
S3_BUCKET=your-bucket-name
S3_ACCESS_KEY=AKIA...
S3_SECRET_KEY=...
```

### 3.3 `app/packages/server/.env.development` (NEW)
Same as `.env` for explicit dev-mode clarity.

---

## Phase 4: Prisma for Aiven MySQL

### 4.1 Schema
No changes needed — already uses MySQL provider with `DATABASE_URL`.

### 4.2 Connection Pooling
Add connection limit to Aiven DATABASE_URL:
```
mysql://user:pass@host:3306/dbname?connection_limit=5&sslaccept=strict
```

### 4.3 Prisma Generate
Must run during Netlify build step.

---

## Phase 5: Adapt File Uploads (Critical)

### Problem
`multer.diskStorage` writes to local `uploads/` dir. Ephemeral in serverless.

### Solution: Aiven Object Storage (S3-compatible)

### 5.1 Install dependencies
```bash
cd app/packages/server && npm install @aws-sdk/client-s3 multer-s3
```

### 5.2 Rewrite `controllers/payment.controller.ts`
- Replace `multer.diskStorage` with `multer-s3` storage engine
- Store S3 URL in `paymentScreenshotUrl`
- Aiven credentials: `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`

### 5.3 Remove `express.static('/uploads')` from `index.ts`
Files served from S3 URLs directly.

### 5.4 Remove `uploads/` directory from git

---

## Phase 6: Netlify Configuration

### 6.1 Create `app/netlify.toml`
```toml
[build]
  command = "npm install && npm run build --workspace=packages/client && cd packages/server && npx prisma generate && npx tsc"
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
`app/packages/server/netlify/functions/server.ts`

### 6.3 Install serverless adapter
```bash
cd app/packages/server && npm install serverless-http
```

---

## Phase 7: Refactor Express Entry Point

Restructure `index.ts` to **export the Express app** instead of just calling `app.listen()`:

```ts
const isLambda = !!process.env.NETLIFY;
if (!isLambda) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => { ... });
}
export default app;
```

- **Local dev**: `npx tsx index.ts` → starts Express on port 3000
- **Netlify**: Function imports `app` → wraps with `serverless-http`

---

## Phase 8: Frontend — No Code Changes

- Client uses relative `/api/...` paths
- Vite proxy works for local dev
- Netlify redirects handle production routing
- No `.env` needed on client side

---

## Execution Order

| Step | Task | Files Changed |
|---|---|---|
| 1 | Remove Bun from package scripts | `app/package.json`, `app/packages/server/package.json` |
| 2 | Remove `@types/bun`, add `tsx` | Same files |
| 3 | Update tsconfig | `app/tsconfig.json`, `app/packages/server/tsconfig.json` |
| 4 | Fix `__dirname` for ESM | `index.ts`, `payment.controller.ts`, `chat.service.ts` |
| 5 | Refactor Express entry point | `app/packages/server/index.ts` |
| 6 | Create env files | `.env.production`, `.env.development` (NEW) |
| 7 | Install new deps | `@aws-sdk/client-s3`, `multer-s3`, `serverless-http` |
| 8 | Rewrite payment controller | `payment.controller.ts` |
| 9 | Create Netlify config | `netlify.toml`, `netlify/functions/server.ts` (NEW) |
| 10 | Test locally | `npm run dev` |

## Local Development Flow (after migration)
```bash
cd app
npm install
npm run dev   # Starts both server (port 3000) and client (port 5173)
```

## Deployment Flow
1. Push to GitHub
2. Netlify auto-builds
3. Set env vars in Netlify dashboard
4. `/api/*` routes work via Netlify Functions redirects
