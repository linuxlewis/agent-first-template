# Feature Implementation Process

Last verified: 2026-05-05

Use this process when adding or changing application behavior. Keep changes small, preserve the layered architecture, and let tests follow the testing pyramid.

## 1. Orient

- Read the relevant domain's `types/` layer first. Domain schemas define the shape everything else must obey.
- Check [quality.md](./quality.md) for known gaps in the area you are touching.
- Check [testing.md](./testing.md) before choosing test coverage.
- Check [react.md](./react.md) before changing UI components or hooks.
- Check [openapi.md](./openapi.md) before changing HTTP routes, API payloads, or generated client usage.
- Prefer existing domain patterns over new abstractions.

## 2. Design The Change By Layer

Domain dependencies flow forward:

```text
Types -> Config -> Repo -> Service -> Runtime -> UI
```

For a new feature, usually work in this order:

1. `types/`: add or update Zod schemas, inferred types, constants, and boundary-safe value objects.
2. `config/`: add defaults or environment parsing when behavior needs configuration.
3. `repo/`: add database or external data access and parse returned rows before leaving the layer.
4. `service/`: add business rules and orchestration. Keep this testable with injected dependencies.
5. `runtime/`: add route contracts, routes, handlers, jobs, or adapters. Parse request input at the boundary.
6. `ui/`: add React components and hooks for browser-visible behavior. Use `useState` for local interaction state and TanStack Query for server state. Use the generated API client for HTTP calls. Do not use `useEffect`.

Skip layers that do not apply. Do not bypass lower layers just to make the change faster.

## 3. Keep API Contracts Generated

When a feature adds or changes HTTP behavior:

1. Define request, response, and path parameter schemas in the domain `types/` layer. Response schemas must describe JSON payloads, not internal service objects.
2. Add or update the domain route contract in `runtime/contract.ts`, including `method`, `operationId`, `path`, `responses`, and `client` metadata for browser-callable routes.
3. Register the contract from `src/api-contracts.ts`.
4. Run `pnpm api:generate` to refresh `src/generated/openapi.generated.json` and `src/generated/api-client.generated.ts`.
5. Use the generated TanStack Query helpers from UI code instead of hand-written `fetch`, `queryKey`, `queryFn`, or `mutationFn` wrappers.

Use [openapi.md](./openapi.md) for the exact contract shape, client metadata fields, and verification checklist.

Generated API artifacts are committed source artifacts. `pnpm build` runs `pnpm api:check`, so stale OpenAPI/client output should fail validation before merge.

## 4. Write Tests With The Pyramid

- Add or update co-located unit tests for most logic.
- Add integration tests when the behavior depends on Postgres, route wiring, provider behavior, migrations, or another real boundary.
- Add e2e tests for critical browser journeys and visible failure states.
- Add contract/generator tests when route metadata, generated OpenAPI output, or generated client behavior changes.
- Avoid duplicating the same assertion at every layer. Unit tests should cover combinations; e2e tests should prove the journey works.

## 5. Validate

For source-only changes:

```bash
pnpm lint
pnpm test:unit
pnpm build
```

For API, database, UI, or browser-visible changes:

```bash
pnpm lint
pnpm api:check
pnpm test
pnpm check:docs
```

For Docker, production startup, or image changes:

```bash
pnpm lint
pnpm test:unit
pnpm build
pnpm build:image
pnpm check:docs
```

Use `pnpm start`, `pnpm seed`, `pnpm health`, `pnpm logs`, and `pnpm stop` when you need to inspect the running stack manually. Use `pnpm preview` for a built pseudo-production smoke check.

## 6. Update Documentation

- Update [testing.md](./testing.md) when commands or test expectations change.
- Update [react.md](./react.md) when UI patterns or component rules change.
- Update [openapi.md](./openapi.md) when API contract generation or generated client conventions change.
- Update [production.md](./production.md) when production image, Compose, runtime, or deployment commands change.
- Update [quality.md](./quality.md) when you improve coverage or identify a durable gap.
- Update [architecture.md](./architecture.md) only when the layer model or dependency rules change.
- Add a focused design note only for decisions that future agents must understand to modify the feature safely.
