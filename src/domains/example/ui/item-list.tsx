/**
 * ItemList — UI component for the example domain.
 *
 * May import from: types, config (client-safe only)
 * Must NOT import from: repo, service, runtime
 *
 * Data fetching uses the API routes defined in the runtime layer.
 * UI components never import server-side code directly.
 */

import { useCallback, useEffect, useState } from "react";
import type { Item } from "../types/index.js";

export function ItemList() {
	const [items, setItems] = useState<Item[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [newName, setNewName] = useState("");

	const fetchItems = useCallback(async () => {
		try {
			const res = await fetch("/api/items");
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			setItems(await res.json());
			setError(null);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed to fetch items");
		} finally {
			setLoading(false);
		}
	}, []);

	async function createItem() {
		if (!newName.trim()) return;
		try {
			const res = await fetch("/api/items", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: newName, status: "draft" }),
			});
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			setNewName("");
			fetchItems();
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed to create item");
		}
	}

	async function deleteItem(id: string) {
		await fetch(`/api/items/${id}`, { method: "DELETE" });
		fetchItems();
	}

	useEffect(() => {
		fetchItems();
	}, [fetchItems]);

	if (loading) return <p>Loading...</p>;

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
								onClick={() => deleteItem(item.id)}
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
