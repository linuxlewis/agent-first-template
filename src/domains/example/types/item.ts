/**
 * Item — core domain type for the example domain.
 *
 * This is the foundation layer. It imports nothing from other layers.
 * All other layers in this domain build on these types.
 */

import { z } from "zod";

export const ItemSchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1).max(255),
	description: z.string().max(2000).optional(),
	status: z.enum(["draft", "active", "archived"]),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

export type Item = z.infer<typeof ItemSchema>;

export const CreateItemSchema = ItemSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
});

export type CreateItem = z.infer<typeof CreateItemSchema>;
