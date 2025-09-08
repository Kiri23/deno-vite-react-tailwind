import React from "react";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { AppContextProvider } from "./app/context";
import { AuthProvider } from "./contexts/AuthContext";
import { UserDataProvider } from "./contexts/UserDataContext";
import { routeTree } from "./router/routes";

// Create router instance
const router = createRouter({ routeTree });

// Register router for TypeScript
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function App() {
  return (
    <AuthProvider>
      <UserDataProvider>
        <AppContextProvider>
          <RouterProvider router={router} />
        </AppContextProvider>
      </UserDataProvider>
    </AuthProvider>
  );
}

export default App;
