/**
 * Root application component.
 *
 * Domain UI components are imported here and composed into the app layout.
 * This file should stay thin — routing, layout shell, and provider wiring only.
 */

import { ItemList } from "../domains/example/ui/item-list.tsx";

export function App() {
	return (
		<div style={{ maxWidth: 800, margin: "0 auto", padding: "2rem" }}>
			<h1>Agent-First Template</h1>
			<p style={{ color: "#666" }}>This app was scaffolded for AI agent-driven development.</p>
			<hr />
			<ItemList />
		</div>
	);
}
