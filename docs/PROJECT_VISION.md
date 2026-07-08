# PROJECT VISION

## Project Name

Fundraising Website and Ordering Platform

---

# Project Purpose

This project is an traditional and AI-assisted preorder management platform designed for fundraising food events organized by non-profit communities.

The main goal is to reduce manual workload for organizers while improving the ordering experience for customers.

This project is also a learning journey for:

- AI-assisted software development
- full-stack architecture
- production deployment
- prompt engineering
- scalable backend design

---

# Main Problems We Want To Solve

There is no official website and their current ordering workflow is handled manually through:

- Facebook Messenger
- WhatsApp
- SMS
- personal chats

This may creates problems such as:

- missed orders
- duplicate orders
- manual total calculation
- payment confusion
- difficult order tracking
- time-consuming packing preparation
- slow customer support

The platform should centralize and simplify these workflows.

---

# Main Users

## 1. Customers

Customers should be able to:

- visit the website (Home Page, About Us Page, Events Page, Contact Us Page)
- see the active or past events
- order food naturally through website UI like traditional way by clicking menus or chatbot UI or active event's info and menu page
- edit or cancel orders before deadlines
- upload payment screenshots
- check order and pickup status

---

## 2. Organizers

Organizers should be able to via website:

- manage events
- manage menu items
- update stock availability
- verify payments based on screenshots
- generate packing lists
- manage pickup workflows
- view order summaries

Organizers should have limited permissions.

---

## 3. Admin / Developer

Admin has full system control.

Responsibilities:

- manage organizers
- approve critical actions
- manage AI behavior
- manage platform settings
- oversee system architecture
- monitor deployments and reliability

---

# Product Philosophy

This platform should:

- reduce operational chaos
- simplify volunteer coordination
- improve reliability
- remain easy to use for non-technical users

The system should prioritize:

- clarity
- maintainability
- reliability
- scalability

over unnecessary complexity.

---

# AI Philosophy

AI should act as an assistant, NOT the source of truth.

AI responsibilities:

- understand customer intent
- assist chatbot conversations
- help order modifications
- improve multilingual interactions

AI should NOT:

- directly control business rules
- validate payments automatically
- bypass backend validation
- manipulate database state without verification

All important business logic must be validated by the backend.

---

# MVP Goals

The MVP should focus on solving real operational pain points first.

Core MVP features:

(Phase 1)

- Create the website using ReactJS, TypeScript, Tailwind, Express, Prisma, MySQL
- In page navigation, includes home, about us, events, event details, menu details and ordering, checkout
- no payment page, but can upload payment screenshot
- manual payment approval
- Active event + menu list fetch
- Chat order draft
- Place order (customer name/phone + items)
- Edit/cancel before cutoff date
- Organizer view order list + confirm manually

(Phase 2)

- Handling Payment
- Printable Packing slip generation per customer
- Pickup tracking
- Organizer dashboard

The goal is NOT full automation.

The goal is reducing manual work significantly.

---

# Long-Term Vision

Future features may include:

- Messenger integration
- WhatsApp integration
- payment workflow
- QR code pickup
- AI organizer commands
- analytics dashboard
- inventory prediction
- customer notifications
- automated reminders

---

# Technical Stack

## Frontend

- React
- TypeScript
- TailwindCSS

## Backend

- Express.js
- TypeScript
- Prisma ORM
- MySQL

## AI

- OpenAI API

## File Storage

- Amazon S3 (Simple Storage Service)

## Deployment

- Frontend: Netlify
- Backend: Render

---

# Backend Architecture Principles

The backend should follow clean and scalable architecture.

## Core Principles

- Keep controllers thin
- Business logic belongs in services
- Database logic belongs in repositories
- Avoid duplicated logic
- Use reusable modules
- Prefer composition over large files
- Keep features modular
- Use strict typing
- Validate inputs carefully

---

# Folder Structure Direction

Current architecture:

- controllers
- services
- repositories

Long-term direction:
feature-based modular architecture.

Example:

src/modules/

- auth
- chatbot
- events
- menu
- orders
- payments
- pickups

Each module should contain:

- controller
- service
- repository
- routes
- dto
- types

---

# Database Principles

- Backend is always the source of truth
- Avoid storing derived data unnecessarily
- Use timestamps consistently
- Use clear relational structure

---

# Security Principles

- Validate all requests
- Protect organizer/admin routes
- Never trust client-side totals
- Sanitize uploads
- Protect API keys, DB password
- Use role-based authorization
- Add rate limiting when needed

---

# Development Philosophy

This project should be developed incrementally.

Rules:

- Build feature-by-feature
- Avoid premature optimization
- Avoid overengineering
- Prioritize maintainability
- Review AI-generated code carefully
- Test features locally before merging
- Keep commits small and meaningful

---

# AI-Assisted Development Rules

When using Codex/Copilot:

- explain context clearly
- define exact requirements
- request architecture first
- implement small scoped tasks
- review diffs carefully
- avoid massive one-shot prompts

AI should support engineering decisions, not replace them.

---

# Success Criteria

The platform is successful if:

- organizers save significant manual time
- customers can order easily
- volunteers can prepare orders faster
- workflows become more organized
- the system remains maintainable as it grows

---

# Personal Learning Goals

This project is also intended to help learn:

- production full-stack development
- scalable backend architecture
- AI integration patterns
- prompt engineering
- deployment workflows
- real-world product thinking
- collaborative AI-assisted development

---
