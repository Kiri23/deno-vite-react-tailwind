import React from "react";
import { Link, useLocation } from "@tanstack/react-router";

interface NavigationItem {
  to: string;
  label: string;
  description: string;
}

const navigationItems: NavigationItem[] = [
  {
    to: "/expenses/import",
    label: "Importar",
    description: "Upload and validate CSV files",
  },
  {
    to: "/expenses/normalize",
    label: "Normalizar",
    description: "Review and normalize transaction data",
  },
  {
    to: "/expenses/analyze",
    label: "Analizar",
    description: "View monthly summaries and insights",
  },
  {
    to: "/expenses/visualize",
    label: "Visualizar",
    description: "Interactive charts and visualizations",
  },
];

export function ExpensesNavigation() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav
      className="border-t border-gray-200 pt-4"
      role="navigation"
      aria-label="Expense tracker navigation"
    >
      <div className="flex space-x-8 overflow-x-auto">
        {navigationItems.map((item) => {
          const isActive = currentPath === item.to;

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`
                flex flex-col items-center min-w-0 flex-shrink-0 px-3 py-2 rounded-lg transition-all duration-200
                ${
                  isActive
                    ? "bg-blue-50 text-blue-700 border-2 border-blue-200"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-2 border-transparent"
                }
              `}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="text-sm font-medium whitespace-nowrap">
                {item.label}
              </span>
              <span className="text-xs text-gray-500 mt-1 text-center max-w-24">
                {item.description}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
