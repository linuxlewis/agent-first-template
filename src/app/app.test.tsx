import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { App } from "./app.js";

describe("App", () => {
	it("renders the application shell", () => {
		expect(renderToString(<App />)).toContain("Agent-First Template");
	});
});
