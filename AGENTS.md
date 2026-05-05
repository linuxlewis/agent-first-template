# AGENTS.md

This is the map. Not the manual.

## Repository Overview

This is a TypeScript monorepo using pnpm workspaces. The application follows a domain-driven, layered architecture with strict dependency rules enforced by custom linters.

## Quick Navigation

| What | Where |
|------|-------|
| Feature implementation process | [docs/implementation.md](./docs/implementation.md) |
| Architecture & dependency rules | [docs/architecture.md](./docs/architecture.md) |
| Testing procedure | [docs/testing.md](./docs/testing.md) |
| React conventions | [docs/react.md](./docs/react.md) |
| Core beliefs & principles | [docs/beliefs.md](./docs/beliefs.md) |
| Quality tracking | [docs/quality.md](./docs/quality.md) |

## Stack

pnpm · TypeScript · Fastify + React/Vite · TanStack Query · PostgreSQL + Drizzle · Zod · Vitest · Playwright · Biome · GitHub Actions · Pino · Docker Compose

## Key Rules

1. **Layered architecture is law.** Each domain follows: Types → Config → Repo → Service → Runtime → UI. Dependencies flow forward only. See [docs/architecture.md](./docs/architecture.md).
2. **Parse at the boundary.** All external data (API inputs, DB rows, env vars) must be validated with Zod schemas before entering the domain.
3. **Structured logging only.** Use the Pino logger from `src/providers/telemetry`. No `console.log`.
4. **Cross-cutting via Providers.** Database, telemetry, auth, and feature flags enter through `src/providers/`. No direct imports of cross-cutting concerns in domain code.
5. **Tests follow the pyramid.** Favor fast co-located unit tests, add integration tests for database/runtime boundaries, and add e2e tests for critical user journeys. Use `pnpm test` for full validation.
6. **React stays explicit.** Do not use `useEffect` in application source. Use `useState`, TanStack Query, derived render state, and event handlers. See [docs/react.md](./docs/react.md).
7. **Docs live in the repo.** No external docs. If it's not in `docs/`, it doesn't exist.

## Common Commands

| Command | Purpose |
|---------|---------|
| `pnpm start` | Start the local Docker Postgres, API, and web stack |
| `pnpm preview` | Build the web app and run a pseudo-production stack |
| `pnpm stop` | Stop the local stack and Docker resources |
| `pnpm test:unit` | Run fast co-located unit tests |
| `pnpm test:integration` | Start the stack and run database/runtime integration tests |
| `pnpm test:e2e` | Start the stack and run browser e2e tests |
| `pnpm test` | Run unit, integration, and e2e tests |
| `pnpm lint` | Run Biome and architecture checks |

## Before You Start a Task

1. Read this file (you're here)
2. Read [docs/implementation.md](./docs/implementation.md)
3. Read the relevant domain's types layer first
4. Check [docs/quality.md](./docs/quality.md) and [docs/testing.md](./docs/testing.md) for known gaps and validation procedures in the area you're touching

## When You're Done

1. Run `pnpm lint && pnpm test:unit` for source-only changes
2. Run `pnpm test` for API, database, UI, or e2e changes
3. Update [docs/quality.md](./docs/quality.md) if you improved coverage or fixed gaps
4. If you made architectural decisions, add focused docs under `docs/`
