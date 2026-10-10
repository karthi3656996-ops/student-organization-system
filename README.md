# Skyline Student Organization Management System

> **Odoo x NMIT Bangalore Hackathon 2026**  
> *Build one unified system to run events, members, and money in one place.*

---

## 1. Project Overview

The **Skyline Student Association Management System** replaces spreadsheets, cash door transactions, physical receipt notebooks, and fragmented WhatsApp groups with a single, responsive digital operating platform.

### Core Modules & Problem Scenarios Addressed
1. **Member Onboarding & Directory:** Fast on-campus table and online self-registration, member profiles, and instant door status verification.
2. **Membership Fees & Renewal:** Dues tracking, automated benefits entitlement (ticket and merchandise discounts), annual expiration, and 30-day renewal reminders.
3. **Event Ticketing & Spring Gala:** Online ticket sales accessible 24/7 on phones with digital pass generation.
4. **Differential Pricing:** Automatic member-discounted ticket rates vs. guest / general admission rates.
5. **Contactless Attendance & Capacity:** Hard seat limits, <1s camera QR check-in terminal, and post-event turnout reporting.
6. **Announcements & Mailing:** Searchable bulletin board archive eliminating lost chat messages, linked with automated member email broadcasts.
7. **Merchandise Commerce & Inventory:** Branded hoodies and T-shirts with real-time stock counters per size variant (XS-XXL) preventing overselling.
8. **Fundraisers & Volunteer Kanban:** Campaign target tracking (e.g. Bake Sale) with task assignments (who is baking, buying supplies, or managing the table).
9. **Expense Reimbursements & Receipts:** Digital receipt photo uploads and two-step Treasurer approval workflows replacing paper receipts.
10. **Unified Treasury Ledger & Semester Reports:** Real-time formula ($\text{Net Balance} = \text{Inflow} - \text{Outflow}$) with one-click exportable semester-end financial summaries.

---

## 2. Technology Stack

- **Frontend & Backend Framework:** [Next.js](https://nextjs.org/) (App Router, Full-stack TypeScript)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with dark navy theme (`#0B0F19`) and blue/violet gradients
- **Icons:** [Lucide React](https://lucide.dev/)
- **ORM & Data Layer:** [Prisma ORM](https://www.prisma.io/)
- **Database:** SQLite (local development in `prisma/dev.db`) / PostgreSQL (production)
- **Validation:** [Zod](https://zod.dev/)

---

## 3. Local Development Setup

### Prerequisites
- Node.js (v18.x, v20.x, or v22.x+ recommended)
- npm (v9.x+)

### Installation & Run Steps
```bash
# 1. Clone the repository (if not already cloned)
git clone https://github.com/karthi3656996-ops/student-organization-system.git
cd student-organization-system

# 2. Install dependencies
npm install

# 3. Synchronize database schema and generate Prisma client
npx prisma db push

# 4. Start local development server
npm run dev

# 5. Open http://localhost:3000 in your browser
```

### Production Build & Lint Checks
```bash
# Verify TypeScript and build production bundle
npm run build

# Run code linter
npm run lint
```

---

## 4. Team Collaboration Plan

- **Karthi (Team Lead):** Architecture, UI Layout, Treasury Ledger, Merch Inventory, Fundraisers Kanban.
  - Branch: `feature/karthi-finance-dashboard`
- **Serena:** Member Registration, Membership Dues, Expiry & Reminders, Announcements Bulletin.
  - Branch: `feature/serena-membership`
- **Jasmitha:** Event Management, Member vs. Guest Ticket Tiers, QR Gate Check-in & Turnout Analytics.
  - Branch: `feature/jasmitha-events-ticketing`

---

## 5. License & Credits

Developed for the **Odoo x NMIT Bangalore Hackathon 2026** by the Skyline Student Association Dev Team.
