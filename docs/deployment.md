# Deployment Notes

## Recommended Deployment Shape

This project is best deployed as a single Next.js application with a writable persistent volume for SQLite.

Recommended targets:

- `Railway`
- `Render`
- any VM or container host with a mounted disk

## Why Not Vercel For This Submission

The app uses SQLite as the primary datastore. That is a deliberate choice for local setup speed and deterministic review, but it means the deployment target should support a writable filesystem that persists across restarts.

Vercel is excellent for the UI layer, but not a great fit for a writable SQLite-backed app unless the database is moved to a managed external service.

## Docker Path

The repo includes:

- [Dockerfile](../Dockerfile)
- [docker-compose.yml](../docker-compose.yml)
- [app/api/health/route.ts](../app/api/health/route.ts)

Run locally with Docker:

```bash
docker compose up --build
```

Open:

- App: `http://localhost:3000`
- Health: `http://localhost:3000/api/health`

## Important Environment Variable

`DATABASE_FILE`

Default:

```bash
data/salary-management.sqlite
```

In containers:

```bash
/app/data/salary-management.sqlite
```

## First-Run Behavior

If the database file is empty, the app bootstraps the schema and the seed script populates `10,000` employees. The health endpoint can be used as a post-deploy smoke test to confirm the row counts.
