/**
 * Example usage of useUrlSearchSync hook
 *
 * This file demonstrates how to use the URL synchronization hook
 * in different expense tracker views.
 */

import {
  useUrlSearchSync,
  useAnalyzeUrlSync,
  useVisualizeUrlSync,
} from "./useUrlSearchSync";
import { useExpenseCore } from "./useExpenseCore";
import { createLocalServices } from "../services/local/index";

/**
 * Example: Basic URL synchronization in analyze view
 */
export function ExampleAnalyzeView() {
  // Set up services and core hook
  const services = createLocalServices();
  const core = useExpenseCore(services);

  // Use URL synchronization for analyze route
  const { updateUrl, currentSearch } = useAnalyzeUrlSync(core);

  // Example: Update URL when user changes date range
  const handleDateRangeChange = (from: string, to: string) => {
    updateUrl({ monthFrom: from, monthTo: to });
  };

  // Example: Update URL when user changes category filters
  const handleCategoryFilterChange = (categories: string[]) => {
    updateUrl({ categories });
  };

  // The hook automatically syncs URL params to VM state
  // and VM state changes to URL params

  return {
    // Current state from VM (synced with URL)
    range: core.state.range,
    filters: core.state.filters,

    // URL search parameters
    currentSearch,

    // Functions to update URL
    handleDateRangeChange,
    handleCategoryFilterChange,
  };
}

/**
 * Example: Custom configuration for URL synchronization
 */
export function ExampleCustomSync() {
  const services = createLocalServices();
  const core = useExpenseCore(services);

  // Custom configuration - only sync range, not filters
  const { updateUrl } = useUrlSearchSync(core, {
    syncRange: true,
    syncFilters: false,
    debounceMs: 500, // Longer debounce
  });

  return { updateUrl };
}

/**
 * Example: Visualize view with chart type parameter
 */
export function ExampleVisualizeView() {
  const services = createLocalServices();
  const core = useExpenseCore(services);

  const { updateUrl, currentSearch } = useVisualizeUrlSync(core);

  // Example: Update chart type in URL
  const handleChartTypeChange = (
    chartType: "monthly" | "balance" | "types"
  ) => {
    updateUrl({ chartType });
  };

  return {
    currentSearch,
    handleChartTypeChange,
  };
}

/**
 * Example: Programmatic navigation with state
 */
export function ExampleProgrammaticNavigation() {
  const services = createLocalServices();
  const core = useExpenseCore(services);

  const { updateUrl } = useUrlSearchSync(core);

  // Example: Navigate to specific analysis with pre-set filters
  const navigateToQuarterlyAnalysis = () => {
    updateUrl({
      monthFrom: "2024-01-01",
      monthTo: "2024-03-31",
      categories: ["Debit Card", "Withdrawal"],
      excludeCurrent: true,
    });
  };

  return { navigateToQuarterlyAnalysis };
}
