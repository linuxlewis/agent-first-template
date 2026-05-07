# Production Environment

Last verified: 2026-05-05

The production environment runs the API and built React app from one Node 24 container, with PostgreSQL provided by Docker Compose. The image uses a multi-stage Docker build: install/build stages include development tooling, while the runtime stage contains production dependencies, compiled server entries, migrations, and built web assets.

## Files

| What | Where |
|------|-------|
| Multi-stage production image | `Dockerfile` |
| Production Compose stack | `docker-compose.prod.yml` |
| Example production env file | `.env.production.example` |
| Production server entrypoint | `src/prod-server.ts` |
| Server build config | `src/server.vite.config.ts` |
| Static asset fallback | `src/static-assets.ts` |

## Runtime Shape

```text
browser
  |
  v
app container :4000
  |-- Fastify API routes under /api/*
  |-- /openapi.json
  |-- built React app and static assets
  |
  v
db container :5432
```

The app container runs this startup command:

```bash
node dist/server/db-migrate.mjs && node dist/server/prod-server.mjs
```

Migrations run before the server starts. They are idempotent through the `schema_migrations` table.

## Configuration

Copy the example file before running a real stack:

```bash
cp .env.production.example .env.production
```

Set at least `POSTGRES_PASSWORD` to a deployment-specific secret. The default values are for local smoke testing only.

| Variable | Default | Purpose |
|----------|---------|---------|
| `APP_PORT` | `8080` | Host port exposed for the app container |
| `POSTGRES_DB` | `app` | PostgreSQL database name |
| `POSTGRES_USER` | `app` | PostgreSQL user |
| `POSTGRES_PASSWORD` | `change-me` | PostgreSQL password |

The Compose file builds `DATABASE_URL` from the PostgreSQL variables and passes it to the app container.

## Commands

Build the image without starting containers:

```bash
pnpm build:image
```

Start production Compose locally:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

Or use the package script, which reads `.env.production`:

```bash
pnpm prod:up
```

Check health:

```bash
curl http://127.0.0.1:${APP_PORT:-8080}/healthz
```

Follow app logs:

```bash
pnpm prod:logs
```

Stop the stack:

```bash
pnpm prod:down
```

Remove the production database volume when you intentionally want to delete local production data:

```bash
docker compose -f docker-compose.prod.yml down -v
```

## Image Build

The `Dockerfile` has four stages:

1. `base`: Node 24 Alpine with Corepack and pnpm enabled.
2. `deps`: installs all dependencies from `pnpm-lock.yaml`.
3. `build`: runs `pnpm build`, which validates generated API artifacts, type-checks, builds the React app, and bundles production server entries.
4. `runtime`: installs production dependencies only, then copies `dist/` and `migrations/`.

The runtime container starts as the unprivileged `node` user.

## Production Server

`src/prod-server.ts` calls `buildServer({ staticRoot })`, so production uses the same Fastify app and domain route registration as local development. `src/static-assets.ts` serves files from `dist/app` and falls back to `index.html` for browser routes. Unknown `/api/*` routes still return JSON `404` responses instead of the app shell.

## Validation

Use this before treating production changes as complete:

```bash
pnpm lint
pnpm test:unit
pnpm build
pnpm build:image
pnpm check:docs
```

For full-stack production smoke testing, start `docker-compose.prod.yml`, then verify:

```bash
curl http://127.0.0.1:${APP_PORT:-8080}/healthz
curl http://127.0.0.1:${APP_PORT:-8080}/openapi.json
```
