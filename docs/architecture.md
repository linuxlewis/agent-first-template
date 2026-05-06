# Architecture

## Domain-Driven Layered Architecture

Every business domain is organized into six layers with **strict forward-only dependencies**.

```
Types → Config → Repo → Service → Runtime → UI
   │                                      │       ▲
   └── Zod request/response schemas ─────┘       │
                         │                       │
                         ▼                       │
              OpenAPI spec + typed API client
              + TanStack Query helpers ───────────┘
```

### Layer Responsibilities

| Layer | Purpose | May Import |
|-------|---------|------------|
| **types/** | Domain types, Zod schemas, constants | Nothing (leaf layer) |
| **config/** | Domain configuration, defaults, env parsing | types |
| **repo/** | Data access, database queries, external API clients | types, config |
| **service/** | Business logic, orchestration, domain rules | types, config, repo |
| **runtime/** | Server routes, route contracts, background jobs, event handlers | types, config, repo, service |
| **ui/** | React components, hooks, pages; uses generated API client and TanStack Query helpers for HTTP | types, config (client-safe only), generated client |

Route contracts live in `runtime/contract.ts` because they describe the HTTP boundary. They depend on lower-layer Zod schemas and provider contract types, then feed generated artifacts under `src/generated/`. UI code may import the generated client, generated TanStack Query option factories, generated query keys, and exported client-safe types, but it must not import runtime route modules directly.

### Cross-Cutting Concerns (Providers)

Database, telemetry, auth, feature flags, and shared connectors (cache, queue) live in `src/providers/`. Any layer may import from providers — this is the **only** exception to the forward-only rule.

```
src/providers/
├── database/      # Postgres client and lifecycle
├── openapi/       # Route contract to OpenAPI document builder
├── telemetry/     # Structured Pino logging; metrics/traces are future work
├── auth/          # Authentication & authorization
└── feature-flags/ # Feature flag evaluation
```

### Dependency Rules (Enforced)

These rules are enforced by the custom linter at `lints/check-deps.ts`:

1. **No backward imports.** `types/` cannot import from `service/`. `repo/` cannot import from `runtime/`. Period.
2. **No cross-domain imports at lower layers.** `domainA/repo` cannot import `domainB/repo`. Cross-domain communication happens at the `service` layer or above.
3. **No direct cross-cutting imports.** Use `src/providers/`, not raw `pino` or `@opentelemetry/*` imports in domain code.
4. **UI only imports types and client-safe config.** No server-side code in the UI layer.
5. **Generated API client is the UI HTTP boundary.** Browser code should use `src/generated/api-client.generated.ts`, preferably through generated TanStack Query helpers, not hand-written `fetch` wrappers for app routes.
6. **Co-located tests are required.** Source modules must have adjacent unit or integration tests unless they are approved entrypoints, generated files, or barrel files.
7. **Structured logging only.** Application code must not use `console.*`; use providers so stack logs stay queryable.

### Adding a New Domain

1. Create `src/domains/<name>/` with all six layer directories
2. Add types and Zod schemas first (types layer is the foundation)
3. Add route contracts and route handlers in the runtime layer
4. Register domain contracts in `src/api-contracts.ts`
5. Run `pnpm api:generate` when HTTP behavior changes
6. Add co-located tests for every source module
7. Add browser e2e coverage when the domain exposes user-visible flows
8. Update [implementation.md](./implementation.md), [testing.md](./testing.md), [openapi.md](./openapi.md), or domain-specific docs when behavior changes

### File Conventions

- One export per file preferred (agents navigate better)
- Co-locate tests: `foo.ts` → `foo.test.ts`; database tests use `foo.integration.test.ts`
- Max file size: 300 lines (enforced by linter)
- Schemas named `<Thing>Schema`, types inferred as `type Thing = z.infer<typeof ThingSchema>`
