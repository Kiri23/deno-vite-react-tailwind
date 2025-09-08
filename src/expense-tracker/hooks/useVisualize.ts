/**
 * Specialized hook for chart visualization concerns
 *
 * Provides focused interface for chart data preparation and
 * visualization state management.
 *
 * Requirements: 4.2, 4.3, 4.4
 */

import { useCallback } from "react";
import type { UseExpenseCoreReturn } from "./useExpenseCore.ts";

/**
 * Visualization hook return interface
 */
export interface UseVisualizeReturn {
  /**
   * Chart datasets ready for rendering
   */
  charts: UseExpenseCoreReturn["state"]["charts"];

  /**
   * Chart generation loading state
   */
  isLoading: boolean;

  /**
   * Chart generation errors
   */
  error: UseExpenseCoreReturn["state"]["errors"]["charts"];

  /**
   * Build chart datasets from current analysis data
   */
  buildCharts: () => void;

  /**
   * Check if chart data is available
   */
  hasChartData: boolean;

  /**
   * Check if source data is available for chart generation
   */
  hasSourceData: boolean;
}

/**
 * Specialized hook for chart visualization
 *
 * Handles chart data preparation and visualization state:
 * 1. Chart dataset generation from analysis results
 * 2. Chart loading and error states
 * 3. Data availability checks
 *
 * @param core - Core expense tracker state and commands
 * @returns Visualization-specific state and operations
 */
export function useVisualize(core: UseExpenseCoreReturn): UseVisualizeReturn {
  /**
   * Build chart datasets from current data
   */
  const buildCharts = useCallback(() => {
    core.commands.buildCharts();
  }, [core.commands]);

  /**
   * Check if we have chart data available
   */
  const hasChartData =
    core.state.charts.monthly.length > 0 ||
    core.state.charts.balance.datasets.length > 0 ||
    core.state.charts.types.datasets.length > 0;

  /**
   * Check if we have source data for chart generation
   */
  const hasSourceData =
    core.state.normalized.length > 0 && core.state.monthly.length > 0;

  return {
    charts: core.state.charts,
    isLoading: core.state.loading.charts,
    error: core.state.errors.charts,
    buildCharts,
    hasChartData,
    hasSourceData,
  };
}
