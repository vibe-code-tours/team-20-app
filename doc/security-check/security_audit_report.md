# Security Audit Report

**Date:** 2026-07-17
**Branch:** security-check
**Scope:** Full codebase security review
**Auditor:** Claude (AI-assisted security review)
**Confidence threshold:** ≥ 8/10

---

## Summary

| #   | Severity | Category      | File                              | Confidence |
| --- | -------- | ------------- | --------------------------------- | ---------- |
| 1   | HIGH     | auth_bypass   | routes.ts:169,191,194             | 10/10      |
| 2   | HIGH     | auth_bypass   | routes.ts:207,230,239,242         | 9/10       |
| 3   | HIGH     | auth_bypass   | routes.ts:277-301                 | 9/10       |
| 4   | MEDIUM   | idor          | routes.ts:100-105,115-119,149-153 | 9/10       |
| 5   | MEDIUM   | csv_injection | export.service.ts:21-35,55-63     | 9/10       |

**Root cause:** The application has authentication and role-based authorization middleware (`authenticate`, `requireRole`, `requireEventOwnership`) but inconsistently applies it. Admin and dashboard routes are protected; standalone CRUD routes for events, menu items, and orders are not.

---

## Vuln 1: Broken Access Control — Event Management Endpoints Unauthenticated

- **File:** `app/packages/server/routes.ts:169, 191, 194`
- **Severity:** HIGH
- **Category:** `auth_bypass`
- **Confidence:** 10/10

**Description:** The `POST /api/events`, `PATCH /api/events/:id`, and `DELETE /api/events/:id` endpoints have no `authenticate`, `requireRole`, or `requireEventOwnership` middleware. Any anonymous user can create, modify, or delete any event, including cascading to associated menu items and orders.

**Exploit Scenario:** Attacker sends `DELETE /api/events/1` with no auth header. The server deletes the event and all associated menu items and orders via cascade. Alternatively, `POST /api/events` creates fraudulent events, or `PATCH /api/events/:id` modifies event details of existing fundraisers.

**Fix:** Add `authenticate` and `requireRole('ADMIN', 'ORGANIZER')` middleware. For update/delete, also add `requireEventOwnership` to ensure only the event creator can modify it.

---

## Vuln 2: Broken Access Control — Menu Item Management Endpoints Unauthenticated

- **File:** `app/packages/server/routes.ts:207, 230, 239, 242`
- **Severity:** HIGH
- **Category:** `auth_bypass`
- **Confidence:** 9/10

**Description:** The `POST /api/menu-items`, `POST /api/menu-items/batch`, `PATCH /api/menu-items/:id`, and `DELETE /api/menu-items/:id` endpoints have no authentication middleware. Any anonymous user can create, modify, or delete menu items for any event, including manipulating prices and stock quantities.

**Exploit Scenario:** Attacker sends `PATCH /api/menu-items/1` with `{"price": 0.01}` to change a menu item's price to one cent, then places an order. Or `DELETE /api/menu-items/5` removes items from an event. Or `POST /api/menu-items` with a fake item to defraud the fundraiser.

**Fix:** Add `authenticate` and `requireRole('ADMIN', 'ORGANIZER')` middleware. For update/delete, add ownership verification that the menu item's parent event belongs to the requesting organizer.

---

## Vuln 3: Broken Access Control — Order State-Changing Endpoints Unauthenticated

- **File:** `app/packages/server/routes.ts:277-301`
- **Severity:** HIGH
- **Category:** `auth_bypass`
- **Confidence:** 9/10

**Description:** The `PATCH /api/orders/:orderNumber`, `PATCH /api/orders/:orderNumber/cancel`, `PATCH /api/orders/:orderNumber/confirm`, and `PATCH /api/orders/:orderNumber/complete` endpoints have no authentication middleware. Any anonymous user who knows or guesses an order number can modify, cancel, confirm, or complete any order.

**Exploit Scenario:** Order numbers follow the format `ORD-YYYYMMDD-NNNN` with a predictable sequential counter. An attacker enumerates order numbers for any date (`ORD-20260717-0001` through `ORD-20260717-9999`) and sends `PATCH /api/orders/ORD-20260717-0001/confirm` to mark arbitrary orders as paid (financial fraud), or `PATCH /api/orders/ORD-20260717-0001/cancel` to cancel other customers' orders.

**Fix:** Add `authenticate` middleware. For update/cancel, verify the requester is the original customer (or admin/organizer). For confirm/complete, require `requireRole('ADMIN', 'ORGANIZER')` and event ownership.

---

## Vuln 4: IDOR — Dashboard/Export Endpoints Lack Event Ownership Verification

- **File:** `app/packages/server/routes.ts:100-105, 115-119, 149-153`
- **Severity:** MEDIUM
- **Category:** `idor`
- **Confidence:** 9/10

**Description:** Three endpoints accept an `orderId` parameter (sequential auto-increment integer) and have `authenticate` + `requireRole('ADMIN', 'ORGANIZER')` but lack event ownership verification. An ORGANIZER for Event A can access, modify, and export data for orders belonging to Event B.

**Exploit Scenario:** Organizer Alice owns Event 1. Organizer Bob owns Event 2. Alice sends `PATCH /api/dashboard/orders/99/status` with `{"status": "COMPLETED"}` where order 99 belongs to Bob's event. The server processes it because Alice is a valid ORGANIZER and no event ownership check is performed. Alice can also read customer PII (names, phone numbers) and generate packing slips for Bob's orders.

**Fix:** For orderId-based routes, look up the order's `eventId`, then verify that the requesting organizer owns that event before processing.

---

## Vuln 5: CSV Formula Injection in Order/Menu Exports

- **File:** `app/packages/server/services/export.service.ts:21-35, 55-63`
- **Severity:** MEDIUM
- **Category:** `csv_injection`
- **Confidence:** 9/10

**Description:** The export endpoints generate CSV content via manual string concatenation with no sanitization. Fields starting with `=`, `+`, `-`, or `@` are interpreted as formulas by spreadsheet applications (Excel, LibreOffice Calc, Google Sheets). Since order creation is unauthenticated (Vuln 3), an attacker can inject malicious CSV formulas via customer name.

**Exploit Scenario:**

1. Attacker creates an order via `POST /api/orders` with `customer.name` set to `=cmd|'/C calc'!A0` or `=HYPERLINK("https://evil.com/phish","Click here")`.
2. Admin downloads CSV export from `/api/export/:eventId/orders`.
3. Admin opens the CSV in Excel, which executes the embedded formula — arbitrary command execution or phishing on the admin's machine.

**Additional issue:** Embedded double quotes are not escaped per RFC 4180 (e.g., `Test"Name` produces `"Test"Name"`, breaking CSV structure). The `customer.phone` field is also user-controlled and not quoted.

**Fix:** Sanitize all user-controlled fields by stripping or prefixing leading `=`, `+`, `-`, `@` characters. Properly escape embedded double quotes by doubling them (`""`). Consider using a CSV library like `csv-stringify` that handles escaping correctly.

---

## Excluded Findings

**Prompt Injection in LLM Chat Endpoints:** Excluded as false positive (confidence 9/10). The system prompt contains no sensitive information (public menu data and chatbot persona only). The LLM has zero write access to backend systems. Order extraction results are validated against the database before use. The 100-character input limit further limits exploitation. No meaningful attack surface exists.

**Missing Security Headers in netlify.toml (External Issue #45):** Excluded as hardening recommendation, not a vulnerability. The `netlify.toml` has no `[[headers]]` section, so the deployed site lacks X-Frame-Options, X-Content-Type-Options, CSP, Referrer-Policy, and Permissions-Policy headers.

- **Why it's not a vulnerability:** These are defense-in-depth hardening measures. Their absence does not create a concrete, directly exploitable attack path. No attacker can exploit the _lack_ of these headers to achieve RCE, data breach, or auth bypass. Per audit criteria: _"A lack of hardening measures is not a vulnerability."_
- **Why the issue creator is right to raise it:** These headers ARE OWASP-recommended best practices and should be added. Specifically:
    - `X-Frame-Options: DENY` — prevents clickjacking (site embedded in malicious iframes)
    - `X-Content-Type-Options: nosniff` — prevents MIME-type sniffing attacks
    - `Content-Security-Policy` — restricts resource loading, mitigating XSS (though React is already XSS-secure without `dangerouslySetInnerHTML`)
    - `Referrer-Policy` — controls referrer information leakage
    - `Permissions-Policy` — restricts access to browser features (camera, microphone, geolocation)
- **Recommendation:** Add the `[[headers]]` section to `netlify.toml` as a hardening improvement. This is a valid best-practice fix, not a security vulnerability.

---

## Areas Not Vulnerable

- **SQL Injection:** Not vulnerable. All database queries use Prisma's parameterized query builder.
- **XSS:** Not vulnerable. No `dangerouslySetInnerHTML` usage. ReactMarkdown defaults to not rendering raw HTML.
- **Command Injection:** Not vulnerable. No use of `child_process`, `exec`, or `eval` in server code.
- **Path Traversal in S3:** Not vulnerable. S3 keys are constructed server-side using order numbers and timestamps, not user input.
- **Hardcoded Secrets in Client Code:** Not found. No environment variable references in client source.
- **Unsafe Deserialization:** Not vulnerable. No use of `eval`, `unserialize`, or similar patterns.
