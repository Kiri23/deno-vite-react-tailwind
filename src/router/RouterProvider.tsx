import { RouterProvider as TanStackRouterProvider } from "@tanstack/react-router";
import { router } from "./index";

interface RouterProviderProps {
  children?: React.ReactNode;
}

export function RouterProvider({ children }: RouterProviderProps) {
  return (
    <TanStackRouterProvider router={router}>{children}</TanStackRouterProvider>
  );
}

export default RouterProvider;
