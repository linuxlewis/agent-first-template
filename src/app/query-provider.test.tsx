import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AppQueryProvider, createAppQueryClient } from "./query-provider.js";

describe("createAppQueryClient", () => {
	it("sets app query defaults", () => {
		const client = createAppQueryClient();
		expect(client.getDefaultOptions().queries?.retry).toBe(1);
		expect(client.getDefaultOptions().queries?.staleTime).toBe(10_000);
		expect(client.getDefaultOptions().mutations?.retry).toBe(0);
	});
});

describe("AppQueryProvider", () => {
	it("renders children", () => {
		expect(
			renderToString(
				<AppQueryProvider>
					<span>Child</span>
				</AppQueryProvider>,
			),
		).toContain("Child");
	});
});
