# Harness Engineering Readiness

Last verified: 2026-05-03

This document tracks the repository against the agent-first harness model described in OpenAI's Harness Engineering article: https://openai.com/index/harness-engineering/

The target state is not only "agents can edit code." The target is a repository where agents can understand the product, boot isolated full-stack environments, inspect browser behavior, query runtime signals, run meaningful checks, and turn repeated review feedback into durable guardrails.

## Implemented Harness

| Capability | Evidence | Assessment |
|------------|----------|------------|
| Small agent map | `AGENTS.md` points to architecture, testing, docs, and quality | Good shape for progressive disclosure |
| Layered domain model | `ARCHITECTURE.md` defines Types -> Config -> Repo -> Service -> Runtime -> UI | Strong foundation |
| Mechanical guardrails | `lints/check-deps.ts` runs through `pnpm lint` | Enforces layer shape, dependency direction, co-located tests, structured logging, and no app `console.*` |
| Docker Compose database | `docker-compose.yml`, `src/providers/database/`, `migrations/`, `scripts/db-migrate.ts` | Postgres is the full-stack database layer |
| Deterministic harness | `scripts/harness/` and `pnpm harness:test` | Boots per-worktree DB/API/web, migrates, seeds, tests, runs e2e, tears down, and keeps artifacts |
| Browser e2e | `playwright.config.ts`, `tests/e2e/item-flow.spec.ts` | Validates item create/reload/delete and API failure UI behavior |
| Agent-queryable logs | `pnpm harness:logs` and `.harness/<worktree>/logs/` | API logs include request ID, method, URL, status, and duration |
| CI artifacts | `.github/workflows/ci.yml` | Runs harness tests and uploads Playwright and harness artifacts |
| Repository-local docs | `docs/catalog.md`, `docs/testing.md`, and `docs/quality.md` | Testing procedures and quality state are versioned in repo |

## Remaining Gaps

| Gap | Evidence | Why It Matters For Agents |
|-----|----------|---------------------------|
| No metrics/traces backend | `docs/quality.md` tracks this as a known gap | Logs and Playwright traces cover many failures, but performance analysis would benefit from metrics and service traces |
| No production deployment config | `docs/quality.md` tracks this as a known gap | The harness validates local full-stack behavior, not production release mechanics |

## Implemented Backlog

### 1. Deterministic App Harness

Implemented as `scripts/harness/` with commands for `boot`, `health`, `seed`, `test`, `logs`, and `down`.

Implemented behavior:

- Allocate stable per-worktree ports for API, web, and database.
- Start Postgres, API, and Vite in the background.
- Wait for `/healthz` and the web root before returning.
- Write process IDs, ports, and log paths under `.harness/<worktree>/`.
- Provide teardown that works even after failed runs.

### 2. Browser-Legible E2E Testing

Implemented Playwright tests that exercise the current item flow from the browser:

- Empty state renders.
- Creating an item through the UI persists through API reload.
- Deleting an item removes it from the UI.
- Failed API responses produce visible error states.

CI uploads Playwright HTML reports, traces, screenshots, videos, and harness artifacts on every run.

### 3. Persistent Example Domain

Drizzle and Postgres are wired into the example domain:

- Schema and migration files are present.
- A database provider lives under `src/providers/database/`.
- The repo layer parses database rows with Zod before returning domain values.
- Integration tests run against an isolated Docker Compose test database when `DATABASE_URL` is present.

### 4. Agent-Queryable Runtime Signals

Local development now has an inspectable observability path:

- Structured Pino logs are written to per-harness log files.
- Request IDs and route timing are logged for HTTP requests.
- `pnpm harness:logs -- --query ...` provides lightweight local log filtering.
- Metrics and service traces remain future work behind providers.

### 5. Mechanical Guardrails

Custom checks now enforce:

- Validate required domain layer directories.
- Enforce co-located tests for non-test modules.
- Enforce no `console.*` outside approved scripts.
- Enforce docs catalog `Last verified` dates.
- Enforce that active and completed plan directories exist through tracked `.gitkeep` files.

### 6. Agent Review And Garbage Collection Loops

Recurring cleanup has an initial repo-local command:

- `pnpm quality:audit` reports layer source and test counts from code evidence.
- `pnpm check:docs` checks stale docs and broken catalog links.
- Keep durable cleanup guidance in `docs/quality.md` and focused design docs instead of relying on memory.

## Success Criteria

This repo is a full-stack agent harness because a fresh agent can run one documented command that:

1. Boots an isolated app stack for the current worktree.
2. Applies migrations and seeds known test data.
3. Runs unit, integration, and browser e2e tests.
4. Captures logs, screenshots, videos, and browser traces as local artifacts.
5. Tears down cleanly.
6. Leaves enough evidence for another agent to diagnose any failure without asking a human to reproduce it manually.
