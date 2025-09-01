import React from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAnalyzeSearch, useCurrentRoute } from "./hooks";

/**
 * Example component demonstrating router usage
 * This shows how to:
 * 1. Use Link components for navigation
 * 2. Access and update search parameters
 * 3. Get current route information
 * 4. Programmatically navigate
 */
export function RouterExample() {
  const navigate = useNavigate();
  const { currentSearch, updateSearch } = useAnalyzeSearch();
  const routeInfo = useCurrentRoute();

  const handleAnalyzeWithFilters = () => {
    updateSearch({
      monthFrom: "2024-01",
      monthTo: "2024-12",
      excludeCurrent: true,
    });
  };

  const handleNavigateToVisualize = () => {
    navigate({
      to: "/expenses/visualize",
      search: {
        chartType: "monthly",
        excludeCurrent: true,
      },
    });
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">Router Example</h2>

      {/* Navigation Links */}
      <nav className="space-x-4">
        <Link to="/expenses/import" className="text-blue-600 hover:underline">
          Import CSV
        </Link>
        <Link
          to="/expenses/normalize"
          className="text-blue-600 hover:underline"
        >
          Normalize Data
        </Link>
        <Link
          to="/expenses/analyze"
          search={{ excludeCurrent: true }}
          className="text-blue-600 hover:underline"
        >
          Analyze (Exclude Current)
        </Link>
        <Link
          to="/expenses/visualize"
          search={{ chartType: "balance" }}
          className="text-blue-600 hover:underline"
        >
          Visualize Balance
        </Link>
      </nav>

      {/* Current Route Info */}
      <div className="bg-gray-100 p-4 rounded">
        <h3 className="font-medium">Current Route Info:</h3>
        <ul className="mt-2 space-y-1 text-sm">
          <li>Pathname: {routeInfo.pathname}</li>
          <li>Is Expenses Route: {routeInfo.isExpensesRoute ? "Yes" : "No"}</li>
          <li>Is Analyze Route: {routeInfo.isAnalyzeRoute ? "Yes" : "No"}</li>
        </ul>
      </div>

      {/* Search Parameters (only show on analyze route) */}
      {routeInfo.isAnalyzeRoute && (
        <div className="bg-blue-50 p-4 rounded">
          <h3 className="font-medium">Current Search Parameters:</h3>
          <pre className="mt-2 text-sm">
            {JSON.stringify(currentSearch, null, 2)}
          </pre>

          <div className="mt-4 space-x-2">
            <button
              onClick={handleAnalyzeWithFilters}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Set Date Range Filter
            </button>
            <button
              onClick={() =>
                updateSearch({ excludeCurrent: !currentSearch.excludeCurrent })
              }
              className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
            >
              Toggle Exclude Current
            </button>
          </div>
        </div>
      )}

      {/* Programmatic Navigation */}
      <div className="space-x-2">
        <button
          onClick={handleNavigateToVisualize}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Navigate to Visualize (Programmatic)
        </button>
      </div>
    </div>
  );
}
