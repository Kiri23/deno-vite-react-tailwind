import React from "react";
import { Outlet } from "@tanstack/react-router";
import { ExpensesNavigation } from "../components/ExpensesNavigation";

export function ExpensesLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with navigation */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Expense Tracker
              </h1>
            </div>
          </div>
          <ExpensesNavigation />
        </div>
      </header>

      {/* Main content area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[600px]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
