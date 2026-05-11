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
| database | B | Postgres provider wired through Docker Compose stack |
| telemetry | B | Pino logger, request IDs, route timings, and stack log files are wired; metrics/traces are future work |
| openapi | B | Route contracts generate `openapi.generated.json` and a typed frontend client; broader coverage should grow as domains are added |
| pwa | B | Vite production builds emit a web manifest, service worker, installability icons, and static asset MIME handling; offline API data is intentionally out of scope |
| production | B | Node 24 multi-stage Docker image and production Compose stack are documented; deployment hardening remains environment-specific |
| feature-flags | D | Placeholder |

## Known Gaps

- [ ] Telemetry does not yet include a metrics/traces backend beyond structured logs and Playwright traces
- [ ] No production metrics/traces backend

---

*Last updated: 2026-05-11*
