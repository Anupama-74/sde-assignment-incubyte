# Demo Script

## Goal

Record a short walkthrough that shows this is a designed product, not just a CRUD table.

Target length: `3-5 minutes`

## Flow

### 1. Open on the dashboard

Say:

`CompLens is a salary management product for a single HR manager handling 10,000 employees across multiple countries. I focused on safe salary editing plus compensation intelligence.`

Show:

- headcount
- payroll
- median compensation
- within-band rate
- outliers

### 2. Show the analytics section

Say:

`The brief says the HR manager should answer questions about how the company pays people, so I added salary distribution, pay equity, outlier detection, and salary-band compliance instead of stopping at CRUD.`

Show:

- payroll by country
- payroll by department
- salary distribution
- band-compliance cards
- employees needing review

### 3. Move to the employee directory

Say:

`The list is designed to remain usable at 10,000 rows via server-side pagination, filters, and sorting.`

Show:

- search
- country and department filters
- compa-ratio and band-status columns
- export CSV button

### 4. Open one employee

Say:

`Each employee detail view shows the compensation mix, the reference pay band for that country and level, and a revision-safe editing flow.`

Show:

- base, bonus, allowance, stock
- pay band min, midpoint, max
- band-status pill
- revision history

### 5. Record a salary revision

Say:

`I chose revision history over destructive updates so the system can preserve why compensation changed and when it became effective.`

Show:

- salary revision form
- reason
- effective date
- updated history entry

### 6. End with engineering signals

Say:

`The repo includes a one-page requirements doc, architecture notes, AI worklog, verification notes, and a deterministic 10,000-employee seed so the analytics remain reproducible.`
