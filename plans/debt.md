# Technical Debt

Track known debt items. Prioritize by impact on agent productivity.

## Active Debt

| ID | Area | Description | Impact | Added |
|----|------|-------------|--------|-------|
| D-003 | Deploy | No production deployment config | Manual deploys only | 2026-05-03 |
| D-008 | Observability | No local metrics/traces backend beyond structured logs and Playwright traces | Performance investigations still rely mostly on logs and browser artifacts | 2026-05-03 |

## Resolved

| ID | Area | Description | Resolved |
|----|------|-------------|----------|
| D-001 | Docs | Doc freshness check only validates links, not `Last verified` dates | 2026-05-03 |
| D-002 | Testing | No integration test harness | 2026-05-03 |
| D-004 | E2E | No browser e2e harness or artifacts | 2026-05-03 |
| D-005 | Harness | Worktree boot does not start and manage a full isolated stack | 2026-05-03 |
| D-006 | Persistence | Example domain uses in-memory storage while Postgres/Drizzle are listed in the stack | 2026-05-03 |
| D-007 | Observability | Logs are structured but not stored/queryable per harness run | 2026-05-03 |
