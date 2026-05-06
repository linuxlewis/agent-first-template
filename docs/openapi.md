# OpenAPI And Typed Client

Last verified: 2026-05-05

The HTTP contract is generated from TypeScript route contract metadata and Zod schemas. Domain runtime layers own their route contracts because routes are the HTTP boundary, and the generated frontend client imports only client-safe domain types.

## Files

| What | Where |
|------|-------|
| OpenAPI document builder | `src/providers/openapi/` |
| App route contract registry | `src/api-contracts.ts` |
| Example domain route contracts | `src/domains/example/runtime/contract.ts` |
| Generated OpenAPI spec | `src/generated/openapi.generated.json` |
| Generated frontend client | `src/generated/api-client.generated.ts` |

## Commands

| Command | Purpose |
|---------|---------|
| `pnpm api:generate` | Regenerate the OpenAPI JSON document and frontend client |
| `pnpm api:check` | Fail when generated API artifacts are stale |

`pnpm build` runs `pnpm api:check` before TypeScript and Vite so stale generated API artifacts fail CI.

## Adding Or Changing Routes

1. Add or update request, response, and parameter schemas in the domain `types/` layer. Use JSON-serializable response schemas for HTTP payloads; for example, date-time fields should be strings in response schemas even if service-layer domain entities use `Date`.
2. Add or update the route contract in the domain `runtime/contract.ts`.
3. Implement the Fastify route in the domain `runtime/routes.ts`.
4. Run `pnpm api:generate`.
5. Use `src/generated/api-client.generated.ts` from UI code instead of hand-written `fetch` calls.

## Contract Shape

Each domain that exposes HTTP routes should have a `runtime/contract.ts` file that exports one readonly array named after the domain, such as `itemRouteContracts`. The array must satisfy `readonly ApiRouteContract[]`.

```ts
import type { ApiRouteContract } from "@providers/openapi/index.js";
import { z } from "zod";
import {
	CreateThingSchema,
	ThingIdSchema,
	ThingResponseSchema,
} from "../types/index.js";

const ErrorResponseSchema = z.object({
	error: z.string(),
});

const ThingParamsSchema = z.object({
	id: ThingIdSchema,
});

const thingTypeImports = [
	{
		kind: "type",
		module: "../domains/example/types/index.js",
		names: ["CreateThing", "ThingResponse"],
	},
] as const;

const thingResponseSchemaImports = [
	{
		kind: "value",
		module: "../domains/example/types/index.js",
		names: ["ThingResponseSchema"],
	},
] as const;

export const thingRouteContracts = [
	{
		method: "post",
		operationId: "createThing",
		path: "/api/things",
		requestBody: CreateThingSchema,
		responses: {
			201: { description: "Created thing", schema: ThingResponseSchema },
			400: { description: "Invalid thing data", schema: ErrorResponseSchema },
		},
		summary: "Create thing",
		tags: ["things"],
		client: {
			functionName: "createThing",
			imports: [...thingTypeImports, ...thingResponseSchemaImports],
			requestBodyType: "CreateThing",
			responseParser: "ThingResponseSchema",
			responseType: "ThingResponse",
		},
	},
] as const satisfies readonly ApiRouteContract[];
```

## Contract Fields

| Field | Required | Purpose |
|-------|----------|---------|
| `method` | Yes | Lowercase HTTP method: `get`, `post`, `put`, `patch`, or `delete`. |
| `operationId` | Yes | Stable OpenAPI operation name. Use a verb phrase like `createItem`; do not reuse within the app. |
| `path` | Yes | Fastify-style route path. Use `:id` path parameters; the OpenAPI builder converts them to `{id}`. |
| `pathParams` | When the path has params | Zod object for path params. Keys must match every `:param` segment in `path`. |
| `requestBody` | For JSON body routes | Zod schema for the request JSON body. Omit for bodyless routes. |
| `responses` | Yes | Map of HTTP status codes to response descriptions and optional Zod response schemas. Omit `schema` for empty responses like `204`. |
| `summary` | Yes | Short human-readable OpenAPI summary. |
| `tags` | Recommended | OpenAPI grouping tags, usually the domain or resource name. |
| `client` | For browser-callable routes | Metadata used to generate the frontend client function. Omit only for routes that should not be called from browser UI. |

## Client Metadata

`client` controls the generated function in `src/generated/api-client.generated.ts`.

| Field | Required | Purpose |
|-------|----------|---------|
| `functionName` | Yes | Method name on `apiClient`, such as `apiClient.createItem`. |
| `imports` | When client types or parsers are referenced | Type/value imports emitted into the generated client. Paths are relative to `src/generated/api-client.generated.ts`. |
| `pathParamsType` | When the path has params | TypeScript type for the generated `params` argument, usually `{ id: string }`. |
| `requestBodyType` | When `requestBody` exists | TypeScript type for the generated `body` argument. |
| `responseType` | Yes | Promise result type for the generated client method. Use `void` for `204`-only success responses. |
| `responseParser` | For JSON responses | Zod parser expression used by the generated client at the browser boundary, such as `ItemResponseSchema` or `ItemResponseSchema.array()`. |

Use `kind: "type"` imports for TypeScript-only names and `kind: "value"` imports for Zod schemas referenced by `responseParser`.

```ts
client: {
	functionName: "listItems",
	imports: [...itemTypeImports, ...itemResponseSchemaImports],
	responseParser: "ItemResponseSchema.array()",
	responseType: "ItemResponse[]",
}
```

For a `DELETE` route that returns `204`, omit `responseParser` and use `responseType: "void"`.

## Schema Rules

- Request schemas should describe the raw JSON sent by clients.
- Response schemas should describe the JSON returned over HTTP, not necessarily the service-layer domain entity. If the service uses `Date`, the response schema should usually use `z.iso.datetime()` because JSON carries strings.
- Error responses should use explicit schemas, commonly `z.object({ error: z.string() })`, so OpenAPI documents failure shapes too.
- Path parameter schemas should reuse domain value schemas such as `ItemIdSchema`.
- Do not import `repo`, `service`, or `ui` code from `runtime/contract.ts`; contracts should depend on `types` and provider contract types only.

## Registration

After adding a domain contract, register it in `src/api-contracts.ts`.

```ts
import { itemRouteContracts } from "./domains/example/runtime/contract.js";
import { thingRouteContracts } from "./domains/thing/runtime/contract.js";

export const apiRouteContracts = [...itemRouteContracts, ...thingRouteContracts] as const;
```

The server and generator both consume `apiRouteContracts`, so this is the single app-level registry for OpenAPI and client generation.

## Route Implementation

The contract does not register Fastify handlers. Keep handler implementation in the domain `runtime/routes.ts`, and make sure the actual route behavior matches the contract:

- same `method` and `path`
- same success status codes
- same request body validation
- same path parameter validation
- same error response shape

`/openapi.json` is served by `src/app-server.ts` from the registered contracts.

## Verification Checklist

When changing contracts, verify all of the following:

1. `runtime/contract.ts` has co-located tests for operation IDs, client function names, and any serialization-sensitive schemas.
2. `runtime/routes.ts` has tests or integration coverage for boundary validation and status codes.
3. `pnpm api:generate` updates both generated files.
4. `pnpm api:check` passes without rewriting artifacts.
5. UI code imports `apiClient` or generated exported types from `src/generated/api-client.generated.ts`.
