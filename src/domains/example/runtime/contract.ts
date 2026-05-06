import type { ApiRouteContract } from "@providers/openapi/index.js";
import { z } from "zod";
import { CreateItemSchema, ItemIdSchema, ItemResponseSchema } from "../types/index.js";

const ErrorResponseSchema = z.object({
	error: z.string(),
});

const ItemParamsSchema = z.object({
	id: ItemIdSchema,
});

const itemTypeImports = [
	{
		kind: "type",
		module: "../domains/example/types/index.js",
		names: ["CreateItem", "ItemResponse"],
	},
] as const;

const itemResponseSchemaImports = [
	{
		kind: "value",
		module: "../domains/example/types/index.js",
		names: ["ItemResponseSchema"],
	},
] as const;

export const itemRouteContracts = [
	{
		method: "get",
		operationId: "listItems",
		path: "/api/items",
		responses: {
			200: { description: "Items", schema: z.array(ItemResponseSchema) },
		},
		summary: "List items",
		tags: ["items"],
		client: {
			functionName: "listItems",
			imports: [...itemTypeImports, ...itemResponseSchemaImports],
			responseParser: "ItemResponseSchema.array()",
			responseType: "ItemResponse[]",
		},
	},
	{
		method: "get",
		operationId: "getItem",
		path: "/api/items/:id",
		pathParams: ItemParamsSchema,
		responses: {
			200: { description: "Item", schema: ItemResponseSchema },
			400: { description: "Invalid item id", schema: ErrorResponseSchema },
			404: { description: "Item not found", schema: ErrorResponseSchema },
		},
		summary: "Get item",
		tags: ["items"],
		client: {
			functionName: "getItem",
			imports: [...itemTypeImports, ...itemResponseSchemaImports],
			pathParamsType: "{ id: string }",
			responseParser: "ItemResponseSchema",
			responseType: "ItemResponse",
		},
	},
	{
		method: "post",
		operationId: "createItem",
		path: "/api/items",
		requestBody: CreateItemSchema,
		responses: {
			201: { description: "Created item", schema: ItemResponseSchema },
			400: { description: "Invalid item data", schema: ErrorResponseSchema },
		},
		summary: "Create item",
		tags: ["items"],
		client: {
			functionName: "createItem",
			imports: [...itemTypeImports, ...itemResponseSchemaImports],
			requestBodyType: "CreateItem",
			responseParser: "ItemResponseSchema",
			responseType: "ItemResponse",
		},
	},
	{
		method: "delete",
		operationId: "deleteItem",
		path: "/api/items/:id",
		pathParams: ItemParamsSchema,
		responses: {
			204: { description: "Deleted item" },
			400: { description: "Invalid item id", schema: ErrorResponseSchema },
			404: { description: "Item not found", schema: ErrorResponseSchema },
		},
		summary: "Delete item",
		tags: ["items"],
		client: {
			functionName: "deleteItem",
			pathParamsType: "{ id: string }",
			responseType: "void",
		},
	},
] as const satisfies readonly ApiRouteContract[];
