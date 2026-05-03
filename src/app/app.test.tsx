import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { App } from "./app.js";
import { AppQueryProvider } from "./query-provider.js";

describe("App", () => {
	it("renders the application shell", () => {
		expect(
			renderToString(
				<AppQueryProvider>
					<App />
				</AppQueryProvider>,
			),
		).toContain("Agent-First Template");
	});
});
