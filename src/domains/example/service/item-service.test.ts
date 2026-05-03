import { beforeEach, describe, expect, it, vi } from "vitest";
import { itemRepo } from "../repo/item-repo.js";
import { itemService } from "./item-service.js";

vi.mock("../repo/item-repo.js", () => ({
	itemRepo: {
		create: vi.fn(),
		delete: vi.fn(),
		findAll: vi.fn(),
		findById: vi.fn(),
	},
}));

describe("itemService", () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("parses create input before writing to the repo", async () => {
		vi.mocked(itemRepo.create).mockResolvedValue({
			id: "550e8400-e29b-41d4-a716-446655440000",
			name: "Created",
			status: "draft",
			createdAt: new Date("2026-01-01T00:00:00Z"),
			updatedAt: new Date("2026-01-01T00:00:00Z"),
		});

		await itemService.createItem({ name: "Created", status: "draft" });

		expect(itemRepo.create).toHaveBeenCalledWith({ name: "Created", status: "draft" });
	});

	it("rejects invalid create input", async () => {
		await expect(itemService.createItem({ name: "", status: "draft" })).rejects.toThrow();
		expect(itemRepo.create).not.toHaveBeenCalled();
	});
});
