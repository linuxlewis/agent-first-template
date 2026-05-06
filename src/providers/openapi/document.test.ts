import { describe, expect, it } from "vitest";
import { z } from "zod";
import { createOpenApiDocument } from "./document.js";

describe("createOpenApiDocument", () => {
	it("converts route contracts into OpenAPI paths, params, request bodies, and responses", () => {
		const document = createOpenApiDocument({
			title: "Test API",
			version: "0.0.0",
			routes: [
				{
					method: "post",
					operationId: "createWidget",
					path: "/api/widgets/:id",
					pathParams: z.object({ id: z.string().uuid() }),
					requestBody: z.object({ name: z.string().min(1) }),
					responses: {
						201: {
							description: "Created",
							schema: z.object({ id: z.string().uuid(), name: z.string() }),
						},
					},
					summary: "Create widget",
					tags: ["widgets"],
				},
			],
		});

		const post = document.paths["/api/widgets/{id}"].post;
		expect(post).toMatchObject({
			operationId: "createWidget",
			parameters: [
				{
					name: "id",
					in: "path",
					required: true,
					schema: { type: "string", format: "uuid", pattern: expect.any(String) },
				},
			],
			requestBody: {
				content: {
					"application/json": {
						schema: { required: ["name"] },
					},
				},
			},
			responses: {
				"201": {
					content: {
						"application/json": {
							schema: { required: ["id", "name"] },
						},
					},
				},
			},
		});
	});
});
