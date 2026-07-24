# Feature State Log

## [2026-07-18 06:10 PM] fix: add phone number validation to prevent arbitrary text submission

### Summary of Changes

- Created `app/packages/server/utils/validations.ts` with shared `isValidPhone()` function (strips formatting, checks 7-15 digits)
- Added `.refine()` phone validation to Zod schemas in `customer.controller.ts` and `order.controller.ts` — backend now rejects invalid phone numbers with a clear error message
- Added `isPhoneValid()` and `validatePhone()` helpers to `MenuOrderingPage.tsx` — phone input shows inline error on invalid input, submit button is disabled until phone is valid
- Added phone format validation in `ChatBot.tsx` `handleCollectProfile()` — chatbot rejects invalid phone with a user-friendly prompt

### Impact & Dependencies

- Files changed:
    - `app/packages/server/utils/validations.ts` (new)
    - `app/packages/server/controllers/customer.controller.ts`
    - `app/packages/server/controllers/order.controller.ts`
    - `app/packages/client/src/pages/MenuOrderingPage.tsx`
    - `app/packages/client/src/components/chat/ChatBot.tsx`
- Validation logic: strips spaces, dashes, parentheses; checks digit count is 7-15 and all digits (with optional `+` prefix)
- Accepts NZ mobile (021, 022, 027…), landline (03, 04, 06, 07, 09), and international (+64, +1, etc.) formats

### Testing Status

- [x] AI Self-Review Done
- [x] Human Manual Test Pending
