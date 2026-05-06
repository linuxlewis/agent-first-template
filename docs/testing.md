# Testing Procedure

Last verified: 2026-05-05

This repository uses a testing pyramid. Most behavior should be covered by fast unit tests, narrower integration tests should prove real boundaries, and e2e tests should cover the browser journeys that matter to users.

## Command Reference

| Command | Scope | Starts Stack | Use When |
|---------|-------|--------------|----------|
| `pnpm test:unit` | Co-located `*.test.ts` and `*.test.tsx`, excluding integration tests | No | Pure domain rules, schemas, mappers, service logic with fakes, and small UI render checks |
| `pnpm test:integration` | Co-located `*.integration.test.ts` and `*.integration.test.tsx` | Yes | Repository, database provider, route, and runtime behavior that needs Postgres or a real app boundary |
| `pnpm test:e2e` | `tests/e2e/*.spec.ts` | Yes | Browser-visible workflows, API/UI coordination, navigation, persistence, and failure states |
| `pnpm test` | Unit, integration, and e2e | Yes | PR validation and full confidence before merging full-stack changes |
| `pnpm test:watch` | Unit watch mode | No | Fast local feedback while editing source |
| `pnpm api:check` | Generated OpenAPI spec and frontend client freshness | No | API route contract, request/response schema, or generated client changes |

## Stack Commands

Use these when you want to inspect the running app outside a test run:

```bash
pnpm start
pnpm seed
pnpm health
pnpm logs -- --service api --lines 80
pnpm preview
pnpm stop
```

`pnpm start` starts Docker Compose Postgres, runs migrations, starts the API and Vite web server, and writes metadata under `.stack/<worktree>/metadata.json`. The metadata includes `DATABASE_URL`, API URL, web URL, process IDs, and log file paths.

`pnpm preview` builds the web app and serves the built assets with Vite preview while still using Docker Compose Postgres and the API server. Use it for pseudo-production smoke checks.

Ports are allocated dynamically per worktree. The stack computes stable seed ports from the repository path, scans for free ports, and records the chosen values in metadata. Do not hard-code local ports in tests, docs, or agent workflows; read `WEB_URL`, `API_ORIGIN`, and `DATABASE_URL` from the stack command environment or `.stack/<worktree>/metadata.json`.

`pnpm test:integration`, `pnpm test:e2e`, and `pnpm test` start the stack automatically when needed. If the stack is already running, they reuse it and leave it running. If they start it themselves, they stop it before exiting. Test artifacts and logs are kept under `.stack/`, `test-results/`, and `playwright-report/`.

## Writing Unit Tests

- Place unit tests beside the source file: `foo.ts` gets `foo.test.ts`.
- Test schemas with valid and invalid values.
- Test row mappers and boundary parsers with realistic external shapes.
- Test service logic with injected fakes instead of real databases or long-running entrypoints.
- Keep unit tests deterministic and fast. They should not depend on `DATABASE_URL`, Docker, network services, or test order.

## Writing Integration Tests

- Name database and runtime boundary tests `*.integration.test.ts`.
- Use the real Postgres database from the stack; do not replace full-stack behavior with in-memory substitutes.
- Reset touched tables in `beforeEach`.
- Close database clients in `afterAll`.
- Parse database rows before asserting domain values.
- Keep integration tests narrower than e2e tests. They should prove real adapters and runtime boundaries, not browser behavior.

## Writing E2E Tests

- Install browsers with `pnpm exec playwright install chromium` when running e2e locally for the first time. CI installs Chromium before `pnpm test`.
- Put Playwright specs in `tests/e2e/`.
- Use `WEB_URL` and `API_ORIGIN`; the test command provides both from stack metadata.
- Reset state through API setup steps before each browser journey.
- Cover critical user-visible success paths and at least one user-visible failure state for each workflow.
- Keep e2e coverage selective. Prefer one complete journey over many assertions that duplicate unit or integration coverage.

## Agent Procedure

For source-only changes:

```bash
pnpm lint
pnpm test:unit
pnpm build
```

For API, database, UI, or browser-visible changes:

```bash
pnpm lint
pnpm test
pnpm check:docs
```

Run `pnpm api:generate` after changing HTTP route contracts or API payload schemas. `pnpm build` includes `pnpm api:check`, so stale generated OpenAPI/client artifacts fail validation.

When a stack-backed run fails:

1. Inspect `.stack/<worktree>/metadata.json`.
2. Query recent API logs with `pnpm logs -- --service api --lines 120`.
3. Inspect Playwright traces, screenshots, and videos under `test-results/` or `playwright-report/`.
4. Fix the missing capability, test, or guardrail before rerunning.
