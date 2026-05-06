import { z } from "zod";

export type HttpMethod = "delete" | "get" | "patch" | "post" | "put";

export interface ApiResponseContract {
	description: string;
	schema?: z.ZodType;
}

export interface ApiClientImport {
	kind?: "type" | "value";
	module: string;
	names: readonly string[];
}

export interface ApiClientContract {
	functionName: string;
	imports?: readonly ApiClientImport[];
	pathParamsType?: string;
	requestBodyType?: string;
	responseParser?: string;
	responseType: string;
}

export interface ApiRouteContract {
	method: HttpMethod;
	operationId: string;
	path: string;
	requestBody?: z.ZodType;
	pathParams?: z.ZodObject;
	responses: Record<number, ApiResponseContract>;
	summary: string;
	tags?: readonly string[];
	client?: ApiClientContract;
}

export interface OpenApiDocumentOptions {
	routes: readonly ApiRouteContract[];
	title: string;
	version: string;
}

export interface OpenApiDocument {
	info: {
		title: string;
		version: string;
	};
	openapi: "3.1.0";
	paths: Record<string, Record<string, JsonObject>>;
}

type JsonObject = Record<string, unknown>;

export function createOpenApiDocument(options: OpenApiDocumentOptions): OpenApiDocument {
	const paths: Record<string, Record<string, JsonObject>> = {};

	for (const route of options.routes) {
		const path = toOpenApiPath(route.path);
		paths[path] ??= {};
		paths[path][route.method] = {
			operationId: route.operationId,
			summary: route.summary,
			tags: route.tags,
			parameters: route.pathParams ? pathParameters(route.pathParams) : undefined,
			requestBody: route.requestBody
				? {
						required: true,
						content: {
							"application/json": {
								schema: zodToJsonSchema(route.requestBody),
							},
						},
					}
				: undefined,
			responses: Object.fromEntries(
				Object.entries(route.responses).map(([status, response]) => [
					status,
					response.schema
						? {
								description: response.description,
								content: {
									"application/json": {
										schema: zodToJsonSchema(response.schema),
									},
								},
							}
						: { description: response.description },
				]),
			),
		};
	}

	return pruneUndefined({
		openapi: "3.1.0",
		info: {
			title: options.title,
			version: options.version,
		},
		paths,
	}) as OpenApiDocument;
}

function pathParameters(schema: z.ZodObject) {
	const jsonSchema = zodToJsonSchema(schema);
	const properties = objectRecord(jsonSchema.properties);
	const required = new Set(Array.isArray(jsonSchema.required) ? jsonSchema.required : []);
	return Object.entries(properties).map(([name, propertySchema]) => ({
		name,
		in: "path",
		required: required.has(name),
		schema: propertySchema,
	}));
}

function zodToJsonSchema(schema: z.ZodType): JsonObject {
	return stripJsonSchemaInternals(
		z.toJSONSchema(schema, {
			io: "output",
			target: "draft-2020-12",
		}),
	) as JsonObject;
}

function toOpenApiPath(path: string) {
	return path.replaceAll(/:([A-Za-z0-9_]+)/g, "{$1}");
}

function stripJsonSchemaInternals(value: unknown): unknown {
	if (Array.isArray(value)) return value.map(stripJsonSchemaInternals);
	if (!value || typeof value !== "object") return value;

	return Object.fromEntries(
		Object.entries(value)
			.filter(([key]) => key !== "$schema" && key !== "~standard")
			.map(([key, child]) => [key, stripJsonSchemaInternals(child)]),
	);
}

function pruneUndefined(value: unknown): unknown {
	if (Array.isArray(value)) return value.map(pruneUndefined);
	if (!value || typeof value !== "object") return value;

	return Object.fromEntries(
		Object.entries(value)
			.filter(([, child]) => child !== undefined)
			.map(([key, child]) => [key, pruneUndefined(child)]),
	);
}

function objectRecord(value: unknown): Record<string, unknown> {
	return value && typeof value === "object" && !Array.isArray(value)
		? (value as Record<string, unknown>)
		: {};
}
