import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Siempre fresh para real-time
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
