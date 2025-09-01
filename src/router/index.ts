import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routes";

// Create the router instance
export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
  context: {
    // This will be populated with services and other context
    // when we implement the AppContext in later tasks
  },
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Re-export everything
export * from "./routes";
export * from "./hooks";
export { default as RouterProvider } from "./RouterProvider";
export type Router = typeof router;
