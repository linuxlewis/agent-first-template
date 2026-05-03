import { describe, expect, it } from "vitest";
import { exampleConfig } from "./index.js";

describe("exampleConfig", () => {
	it("uses draft as the default status", () => {
		expect(exampleConfig.defaultStatus).toBe("draft");
	});
});
