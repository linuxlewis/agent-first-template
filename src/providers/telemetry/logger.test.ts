import { describe, expect, it } from "vitest";
import { createLogger } from "./logger.js";

describe("createLogger", () => {
	it("binds the domain to child loggers", () => {
		expect(createLogger("tests").bindings()).toMatchObject({ domain: "tests" });
	});
});
