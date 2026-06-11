# Reviewer Guide

## Best 5-Minute Read

Start here if you want the fastest signal:

1. [README.md](../README.md)
2. [docs/requirements.md](./requirements.md)
3. [docs/architecture.md](./architecture.md)
4. Open the app and inspect the dashboard, employee list, and detail pane

## Best 15-Minute Read

Use this path if you want both product and engineering context:

1. [README.md](../README.md)
2. [docs/requirements.md](./requirements.md)
3. [docs/architecture.md](./architecture.md)
4. [docs/performance.md](./performance.md)
5. [docs/verification.md](./verification.md)
6. [docs/ai-worklog.md](./ai-worklog.md)

## What To Evaluate

### Product thinking

- Does the solution go beyond CRUD and help an HR manager answer compensation questions?
- Are the scope boundaries explicit and reasonable for the assignment?
- Do the salary-band and compa-ratio features feel grounded in the persona?

### Engineering judgment

- Is the data model clear enough to support both fast reads and revision history?
- Are domain rules centralized instead of duplicated between UI and API?
- Does the app remain readable even after analytics and export features were added?

### Quality signals

- Unit tests cover the core business rules instead of incidental UI details
- Seeded data is deterministic and interesting enough to make analytics credible
- Reviewer docs explain trade-offs, AI usage, and performance posture

## Recommended Demo Order

1. Dashboard summary and band-compliance section
2. Employee filtering and CSV export
3. Employee detail pane with pay band and compa-ratio
4. Salary revision workflow and revision history
5. Compensation Q&A and outlier review
