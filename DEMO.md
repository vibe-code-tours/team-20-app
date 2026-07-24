# Demo Script — Team 20

## 6-Minute Spoken Narration

```text
0:00–0:35 — Hook
Hi everyone, we’re Team 20, and we built Kone Sone Sine, a fundraising website that makes preorder management much easier for both customers and organizers. The problem we’re solving is simple: fundraising events usually depend on chat messages, spreadsheets, and manual follow-ups. That creates missed orders, slow payment checks, and extra work for the people running the event. Our app brings the whole flow into one place.

0:35–1:00 — Solution
We built a role-based system for customers, organizers, and admins. Customers can browse events, place orders, and track payment status. Organizers can manage orders, view analytics, and export data. Admins can invite new organizers and control access securely.

1:00–2:45 — Customer flow
Let’s start with the customer experience. On the home page, people immediately see the fundraising brand, upcoming events, and a clear call to action to browse events. From there, they open the event detail page, where they can check the date, location, and preorder deadline before committing.

Next, they go into the menu and build their order. The menu page shows items by category, lets the customer add items to the cart, and keeps the order summary visible on the side. In the checkout form, they enter their name, phone number, and any note for pickup. That makes the order easy to identify and follow up on later.

After placing the order, the customer uploads a payment screenshot. Once that’s submitted, the app confirms the payment with a success screen and gives the order an order number. From there, the customer can track the order at any time by entering that number. They can see the current status, the event details, the items they ordered, and their contact information all in one place. That means the customer never has to wonder whether the order was received.

2:45–4:05 — Organizer and admin flow
Now let’s switch to the organizer side. After logging in, the organizer lands on a dashboard overview with the most important numbers right away: total orders, revenue, pending orders, and completed orders. From the sidebar, they can jump into events, orders, menu management, analytics, and export.

That dashboard is designed for fast decision-making. Instead of digging through messages or spreadsheets, organizers can see what needs attention, what’s already completed, and how the event is performing. They can also export data when they need a clean download for reporting or sharing with the team.

Admins have a separate login and a separate dashboard, which keeps access clean and secure. On the admin side, we show invitations and users so the team can manage who gets access to the organizer tools.

4:05–5:10 — New organizer invitation and registration
This is one of the most important flows in the app. An admin can create a new invitation for a fresh organizer. The app generates a secure invitation code and a shareable registration link. That means the organizer onboarding process does not require manual account setup or password sharing.

The new organizer opens the link, enters the invitation code, fills in their name, email, and password, and creates their account. Once registration is successful, they land directly on their own organizer dashboard with the correct role already assigned. So the admin controls access, and the organizer can start working immediately.

5:10–5:45 — Tech highlight
One of our biggest challenges was deploying the full-stack app seamlessly. We chose Netlify with serverless functions as our deployment strategy. The Express backend is wrapped into Netlify Functions, so each API request runs as a serverless invocation instead of a long-running server. This means the app scales down to zero when idle—no cost—and scales up automatically under load. The React frontend is served as static assets from Netlify's CDN, with API calls proxied to the serverless backend. We also used OpenAI API for the chatbot and order extraction, kept order handling transactional so stock and state stay in sync, and added payment screenshot upload support to help organizers verify offline payments without losing the order trail.

5:45–6:00 — What's next and outro
Next, we’d like to add stronger payment verification, better notifications for order updates, and even richer analytics for organizers. Thanks for watching — that’s Team 20.
```

## Suggested Screenshot Order

### Customer Order Flow
- `screenshots/Customers Order Flow/01-home-page.png`
- `screenshots/Customers Order Flow/03-event-detail.png`
- `screenshots/Customers Order Flow/07-order-form-filled.png`
- `screenshots/Customers Order Flow/12-payment-success.png`
- `screenshots/Customers Order Flow/13-order-tracking.png`

### Admin Login Flow
- `screenshots/Admin Login Flow/01-login-page.png`
- `screenshots/Admin Login Flow/03-admin-invitations.png`

### Organizer Login Flow
- `screenshots/Organizer Login Flow/01-login-page.png`
- `screenshots/Organizer Login Flow/03-organizer-dashboard.png`
- `screenshots/Organizer Login Flow/05-organizer-orders.png`
- `screenshots/Organizer Login Flow/07-organizer-analytics.png`
- `screenshots/Organizer Login Flow/08-organizer-export.png`

### New Organizer Invitation & Registration Flow
- `screenshots/New Organizer Invitation & Registration Flow/03-invitations-page-admin.png`
- `screenshots/New Organizer Invitation & Registration Flow/06-invitation-created.png`
- `screenshots/New Organizer Invitation & Registration Flow/08-register-form-filled.png`
- `screenshots/New Organizer Invitation & Registration Flow/09-registration-success.png`
- `screenshots/New Organizer Invitation & Registration Flow/11-new-organizer-dashboard.png`
