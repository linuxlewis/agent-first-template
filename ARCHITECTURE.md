# ARCHITECTURE.md

## Domain-Driven Layered Architecture

Every business domain is organized into six layers with **strict forward-only dependencies**.

```
Types → Config → Repo → Service → Runtime → UI
```

### Layer Responsibilities

| Layer | Purpose | May Import |
|-------|---------|------------|
| **types/** | Domain types, Zod schemas, constants | Nothing (leaf layer) |
| **config/** | Domain configuration, defaults, env parsing | types |
| **repo/** | Data access, database queries, external API clients | types, config |
| **service/** | Business logic, orchestration, domain rules | types, config, repo |
| **runtime/** | Server routes, background jobs, event handlers | types, config, repo, service |
| **ui/** | React components, hooks, pages | types, config (client-safe only) |

### Cross-Cutting Concerns (Providers)

Auth, telemetry, feature flags, and shared connectors (database, cache, queue) live in `src/providers/`. Any layer may import from providers — this is the **only** exception to the forward-only rule.

```
src/providers/
├── auth/          # Authentication & authorization
├── telemetry/     # Logging (Pino), tracing (OTel), metrics
└── feature-flags/ # Feature flag evaluation
```

### Dependency Rules (Enforced)

These rules are enforced by the custom linter at `lints/check-deps.ts`:

1. **No backward imports.** `types/` cannot import from `service/`. `repo/` cannot import from `runtime/`. Period.
2. **No cross-domain imports at lower layers.** `domainA/repo` cannot import `domainB/repo`. Cross-domain communication happens at the `service` layer or above.
3. **No direct cross-cutting imports.** Use `src/providers/`, not raw `pino` or `@opentelemetry/*` imports in domain code.
4. **UI only imports types and client-safe config.** No server-side code in the UI layer.

### Adding a New Domain

1. Create `src/domains/<name>/` with all six layer directories
2. Add types and Zod schemas first (types layer is the foundation)
3. Register routes in the runtime layer
4. Update [docs/catalog.md](./docs/catalog.md)

### File Conventions

- One export per file preferred (agents navigate better)
- Co-locate tests: `foo.ts` → `foo.test.ts`
- Max file size: 300 lines (enforced by linter)
- Schemas named `<Thing>Schema`, types inferred as `type Thing = z.infer<typeof ThingSchema>`
