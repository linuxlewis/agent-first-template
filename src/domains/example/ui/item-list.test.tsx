import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AppQueryProvider } from "../../../app/query-provider.js";
import { ItemList } from "./item-list.js";

describe("ItemList", () => {
	it("renders a deterministic loading state before browser effects run", () => {
		expect(
			renderToString(
				<AppQueryProvider>
					<ItemList />
				</AppQueryProvider>,
			),
		).toContain("Loading...");
	});
});
