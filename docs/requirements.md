# One-Page Requirements

## Goal

Build a web-based salary management product for ACME's HR manager to replace spreadsheet-driven compensation operations for 10,000 employees across multiple countries.

The system should help the HR manager do two jobs well:

1. maintain salary data safely and efficiently
2. answer leadership questions about compensation patterns across the organization

## Primary User

`HR Manager`

This user is accountable for compensation hygiene, periodic updates, and reporting, but is not a technical user. The interface should emphasize confidence, visibility, and fast decision-making.

## In Scope

### Core compensation management

- View employees with search, filtering, sorting, and pagination
- Inspect compensation details for an employee, including stock grants
- Update compensation components with an effective date and reason
- Preserve immutable salary revision history for traceability

### Compensation analytics

- Total payroll and average/median compensation
- Breakdown by country and department
- Salary distribution across compensation bands
- Pay equity views by country and department
- Compensation outlier detection
- Visibility into recent salary changes
- Ability to identify highest-paid teams and outliers quickly
- Ability to ask common compensation questions in plain English without needing SQL

### Data readiness

- Seed script for 10,000 employees
- Deterministic sample data across multiple countries, departments, and salary bands

### Engineering readiness

- Full-stack app with backend + UI
- Fast unit tests around compensation calculations, filters, analytics, and update validation
- Artifact docs showing requirements, design thinking, and AI usage

## Deliberately Out of Scope

- Authentication and role-based access control
- Payroll execution, tax calculations, and payslip generation
- Bulk CSV import/export workflows
- Complex approval chains for salary changes
- Real-time collaboration or notifications
- Full audit event pipeline beyond revision history

## Why These Trade-offs

The assignment is evaluating engineering judgment, not feature count. For this persona, salary visibility and safe editing matter more than workflow sprawl.

I chose to go deep on:

- a realistic compensation model
- usable analytics
- compensation intelligence over plain CRUD
- clear salary revision traceability
- maintainable code boundaries

instead of going broad on adjacent HR systems.

## Success Criteria

The submission is successful if an HR manager can:

- find an employee quickly in a 10,000-person dataset
- understand how that employee is paid
- make a salary change safely with context
- answer questions like:
  - Which country has the highest payroll?
  - Which departments are most expensive?
  - How many salary changes happened recently?
  - What is our average and median compensation?
  - Which employees look like compensation outliers?
  - How is compensation distributed across salary bands?
