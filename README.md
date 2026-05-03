# Agent-First Template

A repository template optimized for AI agent-driven development. Humans steer, agents execute.

Based on principles from [Harness Engineering](https://openai.com/index/harness-engineering/).

## Quick Start

```bash
pnpm install
pnpm harness:boot # Start Docker Compose Postgres, API, and web for this worktree
pnpm test       # Run tests
pnpm lint       # Biome + architectural linting
pnpm check:docs # Verify doc freshness
pnpm harness:test # Boot Docker Compose Postgres, run migrations, seed, test, e2e, and tear down
pnpm harness:down # Stop the local harness and Docker Compose resources
```

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full picture.

Each business domain follows a strict layered model:

```
Types → Config → Repo → Service → Runtime → UI
```

Dependencies flow forward only. Cross-cutting concerns (database, logging, auth, feature flags) go through `src/providers/`.

## For Agents

Start with [AGENTS.md](./AGENTS.md) — it's your map to the codebase. Use [docs/testing.md](./docs/testing.md) for the full harness and testing procedure.

## For Humans

Your job is to:
1. Define intent (what should the system do?)
2. Review agent output
3. Encode taste into linters and docs
