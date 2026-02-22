# AGENTS.md

This is the map. Not the manual.

## Repository Overview

This is a TypeScript monorepo using pnpm workspaces. The application follows a domain-driven, layered architecture with strict dependency rules enforced by custom linters.

## Quick Navigation

| What | Where |
|------|-------|
| Architecture & dependency rules | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| Design documents | [docs/design/](./docs/design/) |
| Core beliefs & principles | [docs/beliefs.md](./docs/beliefs.md) |
| Quality tracking | [docs/quality.md](./docs/quality.md) |
| Documentation catalog | [docs/catalog.md](./docs/catalog.md) |
| Active plans | [plans/active/](./plans/active/) |
| Completed plans | [plans/completed/](./plans/completed/) |
| Technical debt | [plans/debt.md](./plans/debt.md) |

## Stack

pnpm · TypeScript · Fastify + React/Vite · PostgreSQL + Drizzle · Zod · Vitest · Biome · GitHub Actions · OTel + Pino · Docker Compose

## Key Rules

1. **Layered architecture is law.** Each domain follows: Types → Config → Repo → Service → Runtime → UI. Dependencies flow forward only. See [ARCHITECTURE.md](./ARCHITECTURE.md).
2. **Parse at the boundary.** All external data (API inputs, DB rows, env vars) must be validated with Zod schemas before entering the domain.
3. **Structured logging only.** Use the Pino logger from `src/providers/telemetry`. No `console.log`.
4. **Cross-cutting via Providers.** Auth, telemetry, feature flags enter through `src/providers/`. No direct imports of cross-cutting concerns in domain code.
5. **Tests are required.** Every module must have co-located tests. Run `pnpm test` before opening a PR.
6. **Plans live in the repo.** No external docs. If it's not in `plans/` or `docs/`, it doesn't exist.

## Before You Start a Task

1. Read this file (you're here)
2. Check [plans/active/](./plans/active/) for related work
3. Read the relevant domain's types layer first
4. Check [docs/quality.md](./docs/quality.md) for known gaps in the area you're touching

## When You're Done

1. Run `pnpm lint && pnpm test`
2. Update [docs/quality.md](./docs/quality.md) if you improved coverage or fixed gaps
3. If you made architectural decisions, document them in [docs/design/](./docs/design/)
