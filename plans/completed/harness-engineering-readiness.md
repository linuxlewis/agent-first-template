# Harness Engineering Readiness Plan

Status: Completed
Created: 2026-05-03
Completed: 2026-05-03
Owner: agents

## Goal

Turn this template into a true agent-first full-stack harness: agents should be able to boot an isolated app, validate API/UI/database behavior, inspect runtime evidence, and iterate without human-operated reproduction steps.

## Context

The readiness audit lives in `docs/design/harness-engineering-readiness.md`. The implementation added Docker Compose-backed Postgres persistence, deterministic harness scripts, Playwright e2e testing, queryable harness logs, CI artifacts, and stronger mechanical guardrails.

## Workstreams

### Phase 1: Harness Command Surface

- [x] Add `scripts/harness/boot.ts` or equivalent shell-safe entrypoint.
- [x] Add `scripts/harness/down.ts`.
- [x] Add `scripts/harness/health.ts`.
- [x] Add package scripts: `harness:boot`, `harness:down`, `harness:health`, `harness:test`.
- [x] Record per-worktree runtime metadata under `.harness/`.
- [x] Replace or wrap `scripts/worktree-boot.sh` so it starts the full stack, not just dependencies.

Acceptance criteria:

- [x] A fresh checkout can run `pnpm harness:boot` and receive API/web URLs.
- [x] A second worktree can boot without port or database collisions through per-worktree ports and Docker Compose project names.
- [x] `pnpm harness:down` cleans up processes and Docker resources for that worktree while retaining artifacts.

### Phase 2: E2E Harness

- [x] Add Playwright and browser installation docs.
- [x] Add `playwright.config.ts` wired to the harness web URL.
- [x] Add e2e tests for the item create/list/delete flow.
- [x] Capture traces, screenshots, and video on failure.
- [x] Upload e2e artifacts from CI.

Acceptance criteria:

- [x] `pnpm e2e` runs against a booted local harness.
- [x] CI fails on e2e regressions and exposes artifacts agents can inspect.

### Phase 3: Persistent Full-Stack Example

- [x] Add a database provider in `src/providers/database/`.
- [x] Add Drizzle schema and migrations for `example` items.
- [x] Replace the in-memory item repo with Postgres-backed queries.
- [x] Parse database rows with Zod before returning domain objects.
- [x] Add integration tests for repo/service/runtime behavior.

Acceptance criteria:

- [x] Item data survives API server restart during a harness run because it is stored in Docker Compose Postgres.
- [x] Integration tests validate database-backed CRUD behavior.

### Phase 4: Agent-Legible Observability

- [x] Add request IDs and route timing logs.
- [x] Write API and web logs to `.harness/<worktree>/logs/`.
- [x] Add a `harness:logs` command for recent logs and simple filtering.
- [x] Document log fields in `docs/testing.md`.
- [x] Evaluate adding local metrics/traces after logs are queryable.

Acceptance criteria:

- [x] An agent can inspect logs from the latest failed e2e run without rerunning the app.
- [x] Logs include enough route/request context to correlate UI actions with API behavior.

### Phase 5: Stronger Guardrails

- [x] Expand `lints/check-deps.ts` to validate required domain layer directories.
- [x] Enforce co-located tests for source modules.
- [x] Enforce no `console.*` in app/domain/provider code.
- [x] Strengthen `scripts/check-doc-freshness.ts` to validate real dates.
- [x] Add a quality audit command that reports coverage by layer.

Acceptance criteria:

- [x] `pnpm lint && pnpm test && pnpm check:docs && pnpm e2e` is the standard PR gate.
- [x] The docs catalog cannot claim freshness with placeholder dates.

## Verification

- `pnpm lint`
- `pnpm test`
- `pnpm check:docs`
- `pnpm quality:audit`
- `pnpm build`
- `pnpm harness:test`

## Completion Definition

Complete. The repo now has a documented one-command local harness, browser e2e tests in CI with artifacts, Postgres-backed example persistence, queryable local logs, and mechanical checks that keep docs and architecture aligned with the code.
