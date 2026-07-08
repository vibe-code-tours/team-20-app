## Project Structure

```
app/
├── packages/
│   ├── client/           # React frontend (Vite + TailwindCSS + shadcn/ui)
│   │   └── src/
│   │       ├── components/
│   │       │   ├── chat/       # ChatBot, ChatMessages, ChatInput, TypingIndicator
│   │       │   └── ui/         # shadcn/ui components (Button, etc.)
│   │       ├── pages/          # HomePage, AboutPage
│   │       ├── assets/         # Images, sounds
│   │       └── lib/            # Utility functions
│   └── server/           # Express backend (Bun + Prisma + MySQL)
│       ├── controllers/        # Request handlers (chat, event, menuitem, order, customer)
│       ├── services/           # Business logic (chat, event, menuitem, order, customer)
│       ├── repositories/       # Database operations (conversation, event, menuitem, order, customer)
│       ├── llm/                # OpenAI client abstraction
│       ├── prompts/            # Chatbot system prompts and order extraction rules
│       ├── prisma/             # Schema, migrations
│       ├── docs/               # Sample data SQL scripts
│       └── routes.ts           # API route definitions
├── PROJECT_VISION.md
└── README.md
```

---

## Database Schema

The backend uses Prisma with MySQL. Core models:

| Model         | Purpose                                                                          |
| ------------- | -------------------------------------------------------------------------------- |
| **Event**     | Fundraising event (name, date, location, preOrderClose, info, iconUrl, hostedBy) |
| **MenuItem**  | Menu items per event (code, name, category, price, stockQty, soldOut, vendor)    |
| **Customer**  | Customer info (name, phone)                                                      |
| **Order**     | Order with unique order number, status, total                                    |
| **OrderItem** | Line items linking orders to menu items (qty, unitPrice, subtotal)               |

Menu categories: `MAIN_DISH`, `SNACK`, `DESSERT`, `DRINK`

Order statuses: `PENDING` → `CONFIRMED` → `COMPLETED` (or `CANCELLED`)

---

## API Endpoints

### Events

| Method   | Endpoint             | Description                           |
| -------- | -------------------- | ------------------------------------- |
| `POST`   | `/api/events`        | Create event                          |
| `GET`    | `/api/events`        | Get all events                        |
| `GET`    | `/api/events/active` | Get active (upcoming/ongoing) events  |
| `GET`    | `/api/events/:id`    | Get event by ID (includes menu items) |
| `PATCH`  | `/api/events/:id`    | Update event                          |
| `DELETE` | `/api/events/:id`    | Delete event                          |

### Menu Items

| Method   | Endpoint                          | Description                         |
| -------- | --------------------------------- | ----------------------------------- |
| `POST`   | `/api/menu-items`                 | Create single menu item             |
| `POST`   | `/api/menu-items/batch`           | Create multiple menu items in batch |
| `GET`    | `/api/events/:eventId/menu-items` | Get menu items for an event         |
| `PATCH`  | `/api/menu-items/:id`             | Update menu item                    |
| `DELETE` | `/api/menu-items/:id`             | Delete menu item                    |

### Orders

| Method  | Endpoint                            | Description                               |
| ------- | ----------------------------------- | ----------------------------------------- |
| `POST`  | `/api/orders`                       | Create order (with customer info + items) |
| `GET`   | `/api/orders/event/:eventId`        | Get all orders for an event               |
| `GET`   | `/api/orders/:orderNumber`          | Get order by order number                 |
| `GET`   | `/api/orders/id/:orderId`           | Get order by ID                           |
| `PATCH` | `/api/orders/:orderNumber`          | Update order details                      |
| `PATCH` | `/api/orders/:orderNumber/cancel`   | Cancel order                              |
| `PATCH` | `/api/orders/:orderNumber/confirm`  | Confirm order (mark as paid)              |
| `PATCH` | `/api/orders/:orderNumber/complete` | Complete order (picked up/delivered)      |
| `POST`  | `/api/orders/:orderNumber/payment`  | Upload payment screenshot                 |

### Chatbot

| Method | Endpoint                  | Description                                 |
| ------ | ------------------------- | ------------------------------------------- |
| `POST` | `/api/chat`               | Send message to AI chatbot                  |
| `POST` | `/api/chat/extract-order` | Extract order details from natural language |

---

## Pages

| Page               | Route                       | Description                               |
| ------------------ | --------------------------- | ----------------------------------------- |
| Home               | `/`                         | Hero, active events, how it works         |
| About Us           | `/about`                    | About the organization                    |
| Events             | `/events`                   | All events with upcoming/past filter      |
| Event Details      | `/events/:eventId`          | Event info, menu items, order CTA         |
| Menu & Ordering    | `/events/:eventId/order`    | Select items, quantity controls, checkout |
| Checkout           | `/checkout`                 | Order review                              |
| Order Confirmation | `/order-confirmation`       | Success page with order details           |
| Payment Upload     | `/payment-upload?order=...` | Drag & drop payment screenshot upload     |
| Contact            | `/contact`                  | Contact information                       |
| Chatbot            | `/chat`                     | AI-powered ordering assistant             |

## AI Integration

The chatbot uses OpenAI (GPT-4o-mini) or others to:

- Answer customer questions about events and menus
- Help customers find menu items
- Assist with creating order drafts via natural language
- Support multilingual interactions

AI acts only as an assistant — all business rules, pricing calculations, order validation, and database updates are controlled by backend services. The AI never directly modifies business data without backend validation.

Custom prompts are stored in `packages/server/prompts/` for chatbot behavior and order extraction rules.

---

## Current Progress

### What's Built

- [x] Monorepo setup with Bun workspaces
- [x] React frontend with Vite + TailwindCSS + shadcn/ui
- [x] Express backend with layered architecture (controllers → services → repositories)
- [x] Shared Prisma client singleton
- [x] Prisma schema with MySQL (Event, MenuItem, Customer, Order, OrderItem)
- [x] Event management API (CRUD)
- [x] Menu items management API (CRUD + batch creation)
- [x] Order management API (create, read, update, cancel, confirm, complete)
- [x] Customer management
- [x] Payment screenshot upload (local storage)
- [x] AI chatbot with OpenAI GPT-4o-mini integration
- [x] Chatbot order extraction from natural language
- [x] Custom prompts for chatbot behavior
- [x] ChatBot UI component (messages, input, typing indicator, auto-scroll, markdown rendering)
- [x] Code formatting (Prettier) and pre-commit hooks (Husky + lint-staged)
- [x] Project vision documentation

### What's Next (Phase 1)

- [ ] Home, About Us, Events, Event Details, Menu, and Checkout pages
- [ ] Payment screenshot upload
- [ ] Customer-facing order placement flow
- [ ] Order confirmation page
- [ ] Organizer order management dashboard
- [ ] Manual payment verification
- [ ] Role-based authorization

### Future (Phase 2+)

- [ ] Payment handling workflow
- [ ] Printable packing slips
- [ ] Pickup tracking
- [ ] Organizer dashboard
- [ ] Messenger / WhatsApp integration
- [ ] QR code pickup
- [ ] Analytics dashboard
- [ ] Customer notifications

---

## Development

### Code Formatting

```bash
bun run format
```

### Linting

````bash
cd app/packages/client && bun run lint
cd app/packages/server && bun run lint

### Git Hooks

Husky and lint-staged run automatically on commit. If hooks aren't active:

```bash
bunx husky install
````

---

## References

- [Architecture](./ARCHITECTURE.md)
- [Contributing](./CONTRIBUTING.md)
- [Interview Notes](./interview-notes.md)
- [Project Vision](./PROJECT_VISION.md)
- [Spec](./spec.md)
- [Team Proposal](./team-proposal.md)

---

## License

Private — not for public distribution.
