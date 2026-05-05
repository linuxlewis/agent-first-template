# React Conventions

Last verified: 2026-05-05

React code should be explicit, local, and easy for agents to modify without creating hidden synchronization paths.

## Core Rules

- Do not use `useEffect` in application source.
- Use `useState` for local interaction state: form inputs, open/closed controls, selected tabs, optimistic UI flags, and transient UI state.
- Use TanStack Query for server state: fetching, caching, invalidation, loading state, and mutations.
- Derive values during render when they can be computed from props, query results, or local state.
- Put side effects in event handlers, mutation callbacks, route handlers, or provider-level adapters instead of component lifecycle effects.

## Component Shape

- Keep components focused on one workflow or display concern.
- Prefer named function components.
- Keep state close to the component that owns the interaction.
- Extract a child component when state ownership or rendering branches become hard to scan.
- Parse API data before it reaches UI components; UI should render typed domain values.

## State Patterns

Use `useState` for state caused by user interaction:

```tsx
const [newName, setNewName] = useState("");
```

Use derived values for anything that can be calculated:

```tsx
const visibleItems = items.filter((item) => item.status !== "archived");
```

Use TanStack Query for remote data and mutations:

```tsx
const itemsQuery = useQuery({
	queryKey: ["items"],
	queryFn: fetchItems,
});
```

## Avoiding `useEffect`

Common replacements:

| Instead Of | Use |
|------------|-----|
| Fetching in `useEffect` | `useQuery` |
| Posting in `useEffect` | `useMutation` from an event handler |
| Syncing props into state | Derived render values or a controlled component |
| Resetting state after submit | Mutation success callback or the submit handler |
| Watching state to call another setter | A single event handler that updates both states |

If behavior appears to require `useEffect`, move the side effect to a clearer boundary first: a query, mutation, event handler, provider, or server route.
