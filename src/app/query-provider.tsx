import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

export function createAppQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				retry: 1,
				staleTime: 10_000,
			},
			mutations: {
				retry: 0,
			},
		},
	});
}

const queryClient = createAppQueryClient();

export function AppQueryProvider({ children }: { children: ReactNode }) {
	return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
