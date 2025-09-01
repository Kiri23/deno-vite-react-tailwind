/**
 * URL Search Synchronization Hook
 *
 * Provides bidirectional synchronization between ExpenseVM state and URL search parameters.
 * URL is the canonical source of truth for navigation state (range, filters).
 *
 * Requirements: 5.3, 5.4
 */

import { useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearch, useLocation } from "@tanstack/react-router";
import type { UseExpenseCoreReturn } from "./useExpenseCore.ts";
import type { AnalyzeSearch, VisualizeSearch } from "../../router/routes.tsx";

/**
 * URL synchronization configuration
 */
interface UrlSyncConfig {
  /**
   * Whether to sync range parameters (monthFrom, monthTo)
   */
  syncRange?: boolean;

  /**
   * Whether to sync filter parameters (categories)
   */
  syncFilters?: boolean;

  /**
   * Whether to sync excludeCurrent parameter
   */
  syncExcludeCurrent?: boolean;

  /**
   * Debounce delay for URL updates (ms)
   */
  debounceMs?: number;
}

/**
 * Default configuration for URL synchronization
 */
const DEFAULT_CONFIG: Required<UrlSyncConfig> = {
  syncRange: true,
  syncFilters: true,
  syncExcludeCurrent: true,
  debounceMs: 300,
};

/**
 * Hook return interface
 */
export interface UseUrlSearchSyncReturn {
  /**
   * Update URL search parameters programmatically
   */
  updateUrl: (params: Partial<AnalyzeSearch | VisualizeSearch>) => void;

  /**
   * Current search parameters from URL
   */
  currentSearch: AnalyzeSearch | VisualizeSearch | {};

  /**
   * Whether the hook is actively syncing (prevents infinite loops)
   */
  isSyncing: boolean;
}

/**
 * Bidirectional URL state synchronization hook
 *
 * Synchronizes ExpenseVM state with URL search parameters, making URL
 * the canonical source of truth for navigation state.
 *
 * @param core - ExpenseCore hook return with state and commands
 * @param config - Synchronization configuration options
 * @returns URL synchronization utilities
 */
export function useUrlSearchSync(
  core: UseExpenseCoreReturn,
  config: UrlSyncConfig = {}
): UseUrlSearchSyncReturn {
  const navigate = useNavigate();
  const location = useLocation();
  const search = useSearch({ strict: false });

  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Track syncing state to prevent infinite loops
  const isSyncingRef = useRef(false);

  /**
   * Convert VM state to URL search parameters
   */
  const vmStateToUrlParams = useCallback((): Partial<
    AnalyzeSearch | VisualizeSearch
  > => {
    const params: Partial<AnalyzeSearch | VisualizeSearch> = {};

    if (finalConfig.syncRange) {
      if (core.state.range.from) {
        params.monthFrom = core.state.range.from;
      }
      if (core.state.range.to) {
        params.monthTo = core.state.range.to;
      }
    }

    if (finalConfig.syncFilters && core.state.filters.categories.length > 0) {
      params.categories = core.state.filters.categories;
    }

    // Note: excludeCurrent is handled by the analysis service internally
    // but we can expose it as a URL parameter for user control
    if (finalConfig.syncExcludeCurrent) {
      params.excludeCurrent = true; // Default behavior from VM
    }

    return params;
  }, [core.state.range, core.state.filters, finalConfig]);

  /**
   * Convert URL search parameters to VM state updates
   */
  const urlParamsToVmState = useCallback(
    (searchParams: any) => {
      if (isSyncingRef.current) return; // Prevent infinite loops

      isSyncingRef.current = true;

      try {
        // Sync range parameters
        if (finalConfig.syncRange) {
          // Always sync range parameters, even if they're undefined (empty URL)
          // This ensures VM state matches URL state exactly
          core.commands.setRange({
            from: searchParams.monthFrom,
            to: searchParams.monthTo,
          });
        }

        // Sync filter parameters
        if (finalConfig.syncFilters) {
          const urlCategories = searchParams.categories || [];
          const currentCategories = core.state.filters.categories;

          // Check if categories have changed
          const categoriesChanged =
            urlCategories.length !== currentCategories.length ||
            urlCategories.some(
              (cat: string) => !currentCategories.includes(cat)
            );

          if (categoriesChanged) {
            core.commands.setFilters({
              categories: urlCategories,
            });
          }
        }
      } catch (error) {
        // Handle VM command failures gracefully
        console.warn("Failed to sync URL parameters to VM state:", error);
      } finally {
        // Reset syncing flag after a brief delay
        setTimeout(() => {
          isSyncingRef.current = false;
        }, 50);
      }
    },
    [core.commands, core.state.range, core.state.filters, finalConfig]
  );

  /**
   * Update URL search parameters programmatically
   */
  const updateUrl = useCallback(
    (params: Partial<AnalyzeSearch | VisualizeSearch>) => {
      navigate({
        search: params as any,
      });
    },
    [navigate]
  );

  /**
   * Sync URL parameters to VM state on mount and URL changes
   * URL is the canonical source of truth (Requirement: 5.4)
   */
  useEffect(() => {
    // Only sync on routes that support these parameters
    const isAnalyzeRoute = location.pathname === "/expenses/analyze";
    const isVisualizeRoute = location.pathname === "/expenses/visualize";

    if (isAnalyzeRoute || isVisualizeRoute) {
      urlParamsToVmState(search);
    }
  }, [search, location.pathname, urlParamsToVmState]);

  /**
   * Sync VM state to URL when state changes (but not during URL-driven updates)
   * This enables programmatic state changes to update the URL
   */
  useEffect(() => {
    const isAnalyzeRoute = location.pathname === "/expenses/analyze";
    const isVisualizeRoute = location.pathname === "/expenses/visualize";

    if (isAnalyzeRoute || isVisualizeRoute) {
      const vmParams = vmStateToUrlParams();

      // Check if VM state differs from current URL state
      const hasChanges =
        vmParams.monthFrom !== search.monthFrom ||
        vmParams.monthTo !== search.monthTo ||
        JSON.stringify(vmParams.categories || []) !==
          JSON.stringify(search.categories || []);

      // Also check if VM has meaningful state that should be reflected in URL
      const hasVmState =
        vmParams.monthFrom ||
        vmParams.monthTo ||
        (vmParams.categories && vmParams.categories.length > 0);

      if ((hasChanges || hasVmState) && !isSyncingRef.current) {
        // Debounce URL updates to prevent excessive navigation
        const timeoutId = setTimeout(() => {
          if (!isSyncingRef.current) {
            updateUrl(vmParams);
          }
        }, finalConfig.debounceMs);

        return () => clearTimeout(timeoutId);
      }
    }
  }, [
    core.state.range,
    core.state.filters,
    location.pathname,
    search,
    vmStateToUrlParams,
    updateUrl,
    finalConfig.debounceMs,
  ]);

  return {
    updateUrl,
    currentSearch: search,
    isSyncing: isSyncingRef.current,
  };
}

/**
 * Convenience hook for analyze route URL synchronization
 */
export function useAnalyzeUrlSync(core: UseExpenseCoreReturn) {
  return useUrlSearchSync(core, {
    syncRange: true,
    syncFilters: true,
    syncExcludeCurrent: true,
  });
}

/**
 * Convenience hook for visualize route URL synchronization
 */
export function useVisualizeUrlSync(core: UseExpenseCoreReturn) {
  return useUrlSearchSync(core, {
    syncRange: true,
    syncFilters: true,
    syncExcludeCurrent: true,
  });
}
