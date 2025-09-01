import { useNavigate, useSearch, useLocation } from "@tanstack/react-router";
import { useCallback } from "react";
import type {
  AnalyzeSearch,
  VisualizeSearch,
  NormalizeSearch,
  ImportSearch,
} from "./types";

// Generic hook for updating search parameters
export function useUpdateSearch<T extends Record<string, any>>() {
  const navigate = useNavigate();
  const currentSearch = useSearch({ strict: false });

  const updateSearch = useCallback(
    (updates: Partial<T>) => {
      navigate({
        search: updates as any,
      });
    },
    [navigate]
  );

  return { currentSearch: currentSearch as T, updateSearch };
}

// Specific hooks for each route's search parameters
export function useAnalyzeSearch() {
  return useUpdateSearch<AnalyzeSearch>();
}

export function useVisualizeSearch() {
  return useUpdateSearch<VisualizeSearch>();
}

export function useNormalizeSearch() {
  return useUpdateSearch<NormalizeSearch>();
}

export function useImportSearch() {
  return useUpdateSearch<ImportSearch>();
}

// Hook to get current route information
export function useCurrentRoute() {
  const location = useLocation();

  return {
    pathname: location.pathname,
    isExpensesRoute: location.pathname.startsWith("/expenses"),
    isImportRoute: location.pathname === "/expenses/import",
    isNormalizeRoute: location.pathname === "/expenses/normalize",
    isAnalyzeRoute: location.pathname === "/expenses/analyze",
    isVisualizeRoute: location.pathname === "/expenses/visualize",
  };
}
