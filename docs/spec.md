# Fundraising Website and Ordering Platform — Vibe Code Spec

Team specification for the agreed project. This document defines the MVP scope for the current development period.

## Gist

A full-stack web platform that centralizes food preorders for community fundraising events.

## Story

The fundraising organizing committee currently manages food orders through Facebook Messenger, WhatsApp, and personal chats. Volunteers manually record orders, calculate totals, verify payments, and prepare food for pickup, which is time-consuming and error-prone.
Customers also experience delays while waiting for replies or confirming whether their orders have been received. This platform provides a single website where customers can browse events, order food, upload payment confirmation, and receive order updates.

## Why

The current workflow relies heavily on manual communication, increasing the likelihood of missed orders, duplicate orders, and payment confusion. This platform improves efficiency, reduces administrative work for volunteers, and provides a better experience for customers while supporting future growth.

## Why Not

- Online payment gateway integration.
- Automatic payment verification.
- Messenger or WhatsApp integration.
- Native mobile applications.
- Advanced analytics or inventory prediction.
- AI making business decisions without backend validation.

## Tech Spec

### Frontend

- React
- TypeScript
- TailwindCSS

### Backend

- Express.js
- TypeScript
- Prisma ORM
- MySQL

### Storage

- Amazon S3 for payment screenshots

### AI

- OpenAI API for optional chatbot assistance

### Deployment

- Frontend: Netlify
- Backend: Render

### Data Flow

Customer → React UI → Express API → Prisma → MySQL
Payment screenshots → Amazon S3
Organizers manage orders through an authenticated dashboard.

## Definition of Done

- [ ] Customer can browse upcoming fundraising events.
- [ ] Customer can view event menus.
- [ ] Customer can add food items to an order.
- [ ] Customer can submit an order successfully.
- [ ] Customer can upload a payment screenshot.
- [ ] Organizer can view submitted orders.
- [ ] Organizer can verify payment manually.
- [ ] Organizer can update order status.
- [ ] Role-based authentication protects organizer functions.
- [ ] The application is deployed and accessible online.
