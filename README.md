# ACME Pay Compass

`ACME Pay Compass` is a full-stack salary management system for a global HR manager who needs to manage compensation for 10,000 employees and answer questions about how the company pays people.

This submission optimizes for product clarity, operational realism, and maintainable code:

- Next.js + TypeScript for a single deployable app with both UI and API
- SQLite for deterministic local setup and fast tests
- Seeded 10,000-employee dataset with realistic multi-country compensation
- Analytics designed for HR questions, not just CRUD completeness
- Testable business logic separated from route handlers and UI components

## Product Scope

The app supports the workflows I believe matter most for the assignment's persona:

- Browse, search, filter, and sort 10,000 employees
- Inspect individual employee compensation details
- Update salary components with effective-date tracking and audit-friendly revision history
- Answer leadership questions through payroll analytics by country, department, and pay distribution

What I deliberately did not build is documented in [docs/requirements.md](./docs/requirements.md).

## Tech Stack

- `Next.js 15` with the App Router
- `TypeScript`
- `better-sqlite3`
- `Vitest`
- Hand-rolled UI components and CSS tokens for a distinct visual identity

## Local Setup

```bash
npm install
npm run seed
npm run dev
```

Open `http://localhost:3000`.

## Scripts

```bash
npm run dev
npm run build
npm run seed
npm run test
```

## Artifacts

- Requirements: [docs/requirements.md](./docs/requirements.md)
- Architecture notes: [docs/architecture.md](./docs/architecture.md)
- AI collaboration notes: [docs/ai-worklog.md](./docs/ai-worklog.md)

## Reviewer Notes

The important design choice here is not "how much UI can I ship" but "what is the smallest product that feels credible for a 10,000-employee org?" My answer is:

- fast local setup
- clear compensation data model
- analytics that answer business questions
- change history for salary edits
- tests around the business rules that are easiest to break
