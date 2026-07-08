# Architecture — Fundraising Website

> One page. Keep it true as the project grows. A teammate should be able to read
> this and find their way around in 5 minutes.

## What it does

We are building the Fundraising Website and Ordering Platform, a web application that helps community fundraising events manage food preorders more efficiently. The platform allows customers to browse events, order food online, upload payment screenshots, and track their orders, while organizers manage events, menus, orders, and payment verification from a centralized dashboard. The goal is to replace the current manual ordering process through Facebook Messenger, WhatsApp, and personal chats with a reliable and easy-to-use system.

- **User:** Volunteers organizing committee and community members ordering food.
- **Need:** Reduce manual order management, avoid missed or duplicate orders, simplify payment confirmation, and improve the customer ordering experience.
- **Client liaison (team member):** @sandarma

## Diagram

```
[ frontend ] --> [ backend ] --> [ data ]
                     |
                     v
               [ AI / LLM proxy ]
```

## Where things live

| Path                 | What                              |
| -------------------- | --------------------------------- |
| `app/`               | application code                  |
| `tests/`             | tests                             |
| `.github/workflows/` | CI + security                     |
| `docs/`              | this file, demo script, decisions |

## External services

<!-- LLM proxy, DB, auth, hosting/deploy target, analytics. Which keys they need
     (names only — real values live in .env / GitHub Secrets). -->

## How to run

<!-- Point to the README Quickstart; don't duplicate it here. -->

See the [README](../README.md) Quickstart.
