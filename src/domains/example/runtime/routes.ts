/**
 * Item Routes — HTTP runtime layer.
 *
 * May import from: types, config, repo, service
 * Must NOT import from: ui
 *
 * Registers Fastify routes for the example domain.
 */

import type { FastifyInstance } from "fastify";
import { itemService } from "../service/item-service.js";

export async function registerItemRoutes(app: FastifyInstance) {
	app.get("/api/items", async () => {
		return itemService.listItems();
	});

	app.get<{ Params: { id: string } }>("/api/items/:id", async (request, reply) => {
		const item = await itemService.getItem(request.params.id);
		if (!item) {
			return reply.status(404).send({ error: "Item not found" });
		}
		return item;
	});

	app.post("/api/items", async (request, reply) => {
		try {
			const item = await itemService.createItem(request.body);
			return reply.status(201).send(item);
		} catch (err) {
			return reply.status(400).send({ error: "Invalid item data" });
		}
	});

	app.delete<{ Params: { id: string } }>("/api/items/:id", async (request, reply) => {
		const deleted = await itemService.deleteItem(request.params.id);
		if (!deleted) {
			return reply.status(404).send({ error: "Item not found" });
		}
		return reply.status(204).send();
	});
}
