import React from "react";
import { Outlet } from "@tanstack/react-router";
import { AppNavigation } from "../components/AppNavigation";

export function RootLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavigation />
      <Outlet />
    </div>
  );
}
