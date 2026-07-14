# Feature State Log

## [2026-07-12 09:15 AM] feat: implement user authentication controller

### Summary of Changes

- Created `login` and `register` logic inside the Auth controller.
- Added a custom middleware for JWT token verification.
- Linked new routes to `/api/v1/auth` in the main router.

### Impact & Dependencies

- Depends on `user.model.js`. No database schema changes required.

### Testing Status

- [x] AI Self-Review Done
- [ ] Human Manual Test Pending

---

## [YYYY-MM-DD HH:MM AM/PM] <type>: <Short Description for Commit>

### Summary of Changes

- (Briefly list out the changes made by AI or Human in a clear, concise manner)
- ...

### Impact & Dependencies

- (Mention side-effects, impacted files, or breaking changes if any)

### Testing Status

- [ ] AI Self-Review Done
- [ ] Human Manual Test Pending / Passed
