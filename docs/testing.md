# Testing And Harness Procedures

Last verified: 2026-05-03

This repository uses tests as the main feedback loop for agents. New work should add the narrowest test that proves the behavior, then use the full harness when the change crosses API, database, browser, or runtime boundaries.

## Test Layers

| Layer | Command | Where Tests Live | Use When |
|-------|---------|------------------|----------|
| Unit | `pnpm test` | Co-located `*.test.ts` or `*.test.tsx` under `src/` | Pure domain rules, schemas, mapping, app factories, small UI render checks |
| Integration | `DATABASE_URL=... pnpm test` | Co-located `*.integration.test.ts` under `src/` | Repository, service, and runtime behavior that requires Postgres |
| Browser e2e | `pnpm e2e` | `tests/e2e/*.spec.ts` | User-visible flows, API/UI coordination, error states |
| Full harness | `pnpm harness:test` | Runs unit, integration, and e2e | PR validation and agent end-to-end confidence |

## Docker Compose Database

Postgres is the database layer. Agents should not replace it with in-memory substitutes for full-stack behavior.

Use the harness for a reproducible database:

```bash
pnpm harness:boot
pnpm harness:seed
pnpm harness:health
pnpm harness:logs -- --service api --lines 80
pnpm harness:down
```

`pnpm harness:boot` starts Docker Compose with a per-worktree project name and a per-worktree Postgres port, runs migrations, starts the API and web app, and writes metadata under `.harness/<worktree>/metadata.json`. `pnpm harness:seed` writes deterministic example data for exploratory testing.

The metadata includes `DATABASE_URL`, API URL, web URL, process IDs, and log file paths. Harness teardown stops processes and Docker resources but keeps logs and test artifacts for later inspection.

## Writing Unit Tests

- Place tests beside the source file: `foo.ts` gets `foo.test.ts`.
- Test domain schemas with valid and invalid input.
- Test row mappers and boundary parsers with realistic external shapes.
- Keep tests deterministic. Do not depend on test order or existing database state.
- Prefer app factories and injected dependencies over importing long-running entrypoints.

## Writing Integration Tests

- Name database tests `*.integration.test.ts`.
- Use `DATABASE_URL` from harness metadata or `pnpm harness:test`.
- Reset touched tables in `beforeEach`.
- Close database clients in `afterAll`.
- Parse database rows before asserting domain values.
- Skip only when `DATABASE_URL` is absent so local unit-only runs still work.

## Writing Browser E2E Tests

- Install browsers with `pnpm exec playwright install chromium` when running e2e locally for the first time. CI installs Chromium before `pnpm harness:test`.
- Put Playwright specs in `tests/e2e/`.
- Use `WEB_URL` and `API_ORIGIN`; the harness provides both.
- Reset state through API setup steps before each browser journey.
- Cover the user-visible success path and at least one user-visible failure state for new workflows.
- Let Playwright retain traces, screenshots, and video on failure; CI uploads those artifacts.

## Agent Procedure

For source-only changes:

```bash
pnpm lint
pnpm test
pnpm build
```

For full-stack changes:

```bash
pnpm harness:test
pnpm check:docs
```

When a harness run fails:

1. Inspect `.harness/<worktree>/metadata.json`.
2. Query recent API logs with `pnpm harness:logs -- --service api --lines 120`.
3. Inspect Playwright traces, screenshots, and videos under `test-results/` or `playwright-report/`.
4. Fix the missing capability, test, or guardrail before rerunning.
