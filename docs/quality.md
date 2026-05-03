# Quality Tracking

Track the health of each domain and architectural layer. Update this when you improve or identify gaps.

## Grading Scale

- **A** — Well-tested, documented, clean architecture
- **B** — Functional, some test gaps or missing docs
- **C** — Works but needs attention (tech debt, poor coverage)
- **D** — Fragile, missing tests, known issues
- **F** — Broken or placeholder only

## Domain Grades

| Domain | Types | Config | Repo | Service | Runtime | UI | Overall | Notes |
|--------|-------|--------|------|---------|---------|----|---------|----|
| example | B | B | B | B | B | B | B | Docker Compose-backed full-stack example with unit, integration, and e2e coverage |

## Cross-Cutting

| Provider | Grade | Notes |
|----------|-------|-------|
| auth | D | Placeholder |
| database | B | Postgres provider wired through Docker Compose harness |
| telemetry | B | Pino logger, request IDs, route timings, and per-harness queryable logs are wired; metrics/traces are future work |
| feature-flags | D | Placeholder |

## Known Gaps

- [ ] Telemetry does not yet include a metrics/traces backend beyond structured logs and Playwright traces
- [ ] No production deployment config

---

*Last updated: 2026-05-03*
