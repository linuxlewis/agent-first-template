/**
 * ItemList — UI component for the example domain.
 *
 * May import from: types, config (client-safe only)
 * Must NOT import from: repo, service, runtime
 *
 * Data fetching uses the API routes defined in the runtime layer.
 * UI components never import server-side code directly.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
	ApiClientError,
	apiMutations,
	apiQueries,
	apiQueryKeys,
} from "../../../generated/api-client.generated.js";

export function ItemList() {
	const [newName, setNewName] = useState("");
	const queryClient = useQueryClient();

	const itemsQuery = useQuery(apiQueries.listItems());

	const createMutation = useMutation({
		...apiMutations.createItem(),
		onSuccess: async () => {
			setNewName("");
			await queryClient.invalidateQueries({ queryKey: apiQueryKeys.listItems() });
		},
	});

	const deleteMutation = useMutation({
		...apiMutations.deleteItem(),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: apiQueryKeys.listItems() });
		},
	});

	const error = getErrorMessage(itemsQuery.error ?? createMutation.error ?? deleteMutation.error);

	function createItem() {
		if (!newName.trim()) return;
		createMutation.mutate({ name: newName, status: "draft" });
	}

	if (itemsQuery.isLoading) return <p>Loading...</p>;

	const items = itemsQuery.data ?? [];
	return (
		<div>
			<h2>Items</h2>

			{error && <p style={{ color: "red" }}>{error}</p>}

			<div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
				<input
					type="text"
					value={newName}
					onChange={(e) => setNewName(e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && createItem()}
					placeholder="New item name..."
					style={{ flex: 1, padding: "0.5rem" }}
				/>
				<button type="button" onClick={createItem}>
					Add
				</button>
			</div>

			{items.length === 0 ? (
				<p style={{ color: "#999" }}>No items yet. Create one above.</p>
			) : (
				<ul style={{ listStyle: "none", padding: 0 }}>
					{items.map((item) => (
						<li
							key={item.id}
							style={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								padding: "0.5rem",
								borderBottom: "1px solid #eee",
							}}
						>
							<span>
								<strong>{item.name}</strong>{" "}
								<span style={{ color: "#999", fontSize: "0.85em" }}>({item.status})</span>
							</span>
							<button
								type="button"
								onClick={() => deleteMutation.mutate({ id: item.id })}
								style={{ color: "red", cursor: "pointer" }}
							>
								Delete
							</button>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

function getErrorMessage(error: unknown) {
	if (!error) return null;
	if (error instanceof ApiClientError) return `HTTP ${error.status}`;
	return error instanceof Error ? error.message : "Request failed";
}
