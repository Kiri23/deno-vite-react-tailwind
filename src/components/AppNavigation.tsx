import React from "react";
import { Link, useLocation } from "@tanstack/react-router";

export function AppNavigation() {
  const location = useLocation();
  const isExpensesRoute = location.pathname.startsWith("/expenses");
  const isTrackerRoute =
    location.pathname === "/" || location.pathname === "/tracker";

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Expense Tracker
            </h1>
            <div className="flex space-x-4">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isTrackerRoute
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Original Tracker
              </Link>
              <Link
                to="/expenses/import"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isExpensesRoute
                    ? "bg-green-100 text-green-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Modular Architecture
              </Link>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {isTrackerRoute && "Monolithic ExpenseTracker"}
            {isExpensesRoute && "Router-based Architecture"}
          </div>
        </div>
      </div>
    </nav>
  );
}
