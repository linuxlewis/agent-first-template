# Agent-First Template

A repository template optimized for AI agent-driven development. Humans steer, agents execute.

Based on principles from [Harness Engineering](https://openai.com/index/harness-engineering/).

## Quick Start

```bash
pnpm install
pnpm dev        # Start dev servers
pnpm test       # Run tests
pnpm lint       # Biome + architectural linting
pnpm check:docs # Verify doc freshness
```

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full picture.

Each business domain follows a strict layered model:

```
Types → Config → Repo → Service → Runtime → UI
```

Dependencies flow forward only. Cross-cutting concerns (auth, logging, feature flags) go through `src/providers/`.

## For Agents

Start with [AGENTS.md](./AGENTS.md) — it's your map to the codebase.

## For Humans

Your job is to:
1. Define intent (what should the system do?)
2. Write plans (in `plans/active/`)
3. Review agent output
4. Encode taste into linters and docs
