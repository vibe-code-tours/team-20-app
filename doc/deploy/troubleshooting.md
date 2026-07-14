# Deployment Troubleshooting

## Netlify Build Errors

### ETARGET: No matching version found

**Error:**
```
npm error notarget No matching version found for @types/node@22.20.1.
```

**Cause:** `package-lock.json` pinned a version that wasn't available on npm at build time. Usually a timing issue — the version was published after the lock file was generated but before Netlify tried to install it.

**Fix:**
1. Clear Netlify build cache (Site settings → Build & deploy → Clear build cache)
2. Retry deploy

**Prevention:** We pinned `@types/node` to `22.15.35` and switched to `npm ci` in the build command. See `state.md` for details.

---

### General Netlify Build Checklist

When a Netlify build fails:

1. **Check the error** — is it a missing package, version mismatch, or command failure?
2. **Try clearing build cache** — most transient issues resolve with a cache clear
3. **Check `package-lock.json`** — is it committed? Does it match `package.json`?
4. **Run the build locally** — replicate Netlify's exact command:
   ```bash
   cd app
   npm ci --legacy-peer-deps
   cd packages/server && npx prisma generate
   cd ../client && npm run build
   ```
5. **Check npm registry** — `npm view <package>@<version>` to verify a version exists

---

### Common Pitfalls

| Mistake | Result | Fix |
|---|---|---|
| Pushing `package.json` without `package-lock.json` | Netlify resolves different versions | Always commit both |
| Using `npm install` in builds | Can silently upgrade deps | Use `npm ci` |
| `^` range on type packages | New patches can break builds | Pin exact versions for `@types/*` |
| Not clearing build cache | Stale cached deps cause errors | Clear cache before retrying |
