# Feature Implementation Process

Last verified: 2026-05-05

Use this process when adding or changing application behavior. Keep changes small, preserve the layered architecture, and let tests follow the testing pyramid.

## 1. Orient

- Read the relevant domain's `types/` layer first. Domain schemas define the shape everything else must obey.
- Check [quality.md](./quality.md) for known gaps in the area you are touching.
- Check [testing.md](./testing.md) before choosing test coverage.
- Check [react.md](./react.md) before changing UI components or hooks.
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
5. `runtime/`: add routes, handlers, jobs, or adapters. Parse request input at the boundary.
6. `ui/`: add React components and hooks for browser-visible behavior. Use `useState` for local interaction state and TanStack Query for server state. Do not use `useEffect`.

Skip layers that do not apply. Do not bypass lower layers just to make the change faster.

## 3. Write Tests With The Pyramid

- Add or update co-located unit tests for most logic.
- Add integration tests when the behavior depends on Postgres, route wiring, provider behavior, migrations, or another real boundary.
- Add e2e tests for critical browser journeys and visible failure states.
- Avoid duplicating the same assertion at every layer. Unit tests should cover combinations; e2e tests should prove the journey works.

## 4. Validate

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

Use `pnpm start`, `pnpm seed`, `pnpm health`, `pnpm logs`, and `pnpm stop` when you need to inspect the running stack manually. Use `pnpm preview` for a built pseudo-production smoke check.

## 5. Update Documentation

- Update [testing.md](./testing.md) when commands or test expectations change.
- Update [react.md](./react.md) when UI patterns or component rules change.
- Update [quality.md](./quality.md) when you improve coverage or identify a durable gap.
- Update [architecture.md](./architecture.md) only when the layer model or dependency rules change.
- Add a focused design note only for decisions that future agents must understand to modify the feature safely.
