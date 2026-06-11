# Performance Notes

## What Matters For This Assignment

The assignment dataset size is `10,000` employees, so the practical question is not internet-scale architecture. It is whether the chosen design remains fast, deterministic, and easy to review at that workload.

## Current Performance Posture

- Server-side pagination keeps the list view bounded
- Search, filtering, and sorting happen in SQLite instead of in the browser
- Analytics are computed over a deterministic local dataset so outputs are stable
- CSV export reuses the filtered employee query instead of introducing a separate path
- SQLite is enough for this scope and drastically lowers setup friction

## Measured Local Results

Measured on `June 11, 2026` in this workspace:

| Check | Result |
|---|---|
| `npm run seed` | `1.99s` wall-clock |
| `npm run test` | `4.39s` wall-clock |
| `npm run build` | `22.64s` wall-clock |
| First-load shared JS | `102 kB` |

## Seeded Dataset Snapshot

The deterministic dataset rebuilt during verification produced:

| Metric | Value |
|---|---|
| Employees | `10,000` |
| Salary revisions | `5,497` |
| Revised in last 90 days | `469` |
| Under band | `152` |
| Within band | `9,186` |
| Over band | `662` |
| Average compa-ratio | `102.5%` |
| Median compa-ratio | `102.2%` |

## Scaling Trade-off

For this assessment I intentionally chose:

- `SQLite` for reviewer convenience and deterministic setup
- `offset pagination` for a clearer HR-facing page model
- `single app deployment` to reduce infrastructure and context switching

If this product needed multi-user production behavior, I would move to:

- Postgres
- background jobs for large exports
- cached aggregate snapshots for heavier analytics
- authentication and role-aware permissions

## Notes For Reviewers

The interesting engineering decision here is not raw throughput. It is choosing the simplest architecture that still behaves credibly for a 10,000-row org dataset.
