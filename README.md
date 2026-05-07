# Agent-First Template

A repository template optimized for AI agent-driven development. Humans steer, agents execute.

## Quick Start

Prerequisites: Node 24, pnpm 10, Docker, and Docker Compose.

```bash
pnpm install
pnpm start      # Start Docker Compose Postgres, API, and web for this worktree
pnpm health     # Print health checks and the allocated URLs
pnpm preview    # Build and run a pseudo-production stack
pnpm prod:up    # Build and run the production Docker Compose stack
pnpm prod:down  # Stop the production Docker Compose stack
pnpm test:unit  # Fast unit tests
pnpm api:generate # Regenerate OpenAPI spec and typed frontend client
pnpm test       # Unit, integration, and e2e tests
pnpm lint       # Biome + architectural linting
pnpm check:docs # Verify doc freshness
pnpm stop       # Stop the local stack and Docker Compose resources
```

Use `pnpm logs -- --service api --lines 120` to inspect API logs. Use `pnpm seed` to reset the example data while the stack is running.

For production-style Docker Compose usage, copy `.env.production.example` to `.env.production`, set a real `POSTGRES_PASSWORD`, then run:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

See [docs/production.md](./docs/production.md) for the production image, Compose, migration, and health-check details.

## Architecture

See [docs/architecture.md](./docs/architecture.md) for the full picture.

Each business domain follows a strict layered model. The React UI uses TanStack Query for server-state fetching, mutation, caching, and invalidation. HTTP route contracts generate the OpenAPI spec, typed frontend client, and TanStack Query helper factories; see [docs/openapi.md](./docs/openapi.md).

```
Types → Config → Repo → Service → Runtime → UI
```

Dependencies flow forward only. Cross-cutting concerns (database, logging, auth, feature flags) go through `src/providers/`.

## Parallel Development

Use `pnpm start`, `pnpm preview`, and `pnpm test` instead of hard-coded local ports. Stack commands allocate API, web, and Postgres ports dynamically from the current worktree path, then write the chosen URLs to `.stack/<worktree>/metadata.json`.

This lets multiple agents work in separate git worktrees on the same machine without fighting over ports.

When an agent needs the running app URL, use `pnpm health` or read `.stack/<worktree>/metadata.json`. Do not assume ports 3000, 4000, or 5432 are available.

## Starting A New Project From This Template

1. Create a new repository from this template.
2. Rename the package in [package.json](./package.json).
3. Update this README with the product name and local setup notes.
4. Replace or rename the example domain under `src/domains/example/`.
5. Add your first real domain by starting at the `types/` layer, then move forward through config, repo, service, runtime, and UI as needed.
6. Keep [AGENTS.md](./AGENTS.md), [docs/implementation.md](./docs/implementation.md), [docs/testing.md](./docs/testing.md), [docs/openapi.md](./docs/openapi.md), [docs/production.md](./docs/production.md), and [docs/react.md](./docs/react.md) current as the project develops.
7. Run `pnpm lint`, `pnpm test`, `pnpm build`, and `pnpm check:docs` before treating the template migration as complete.

## For Agents

Start with [AGENTS.md](./AGENTS.md) and [docs/implementation.md](./docs/implementation.md). Use [docs/testing.md](./docs/testing.md) for the testing procedure.

## For Humans

Your job is to:
1. Define intent (what should the system do?)
2. Review agent output
3. Encode taste into linters and docs
