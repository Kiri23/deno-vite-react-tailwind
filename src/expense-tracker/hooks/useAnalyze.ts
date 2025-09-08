/**
 * Specialized hook for financial analysis concerns
 *
 * Provides focused interface for analysis operations including
 * monthly summaries, filtering, and integrated insights.
 *
 * Requirements: 4.2, 4.3, 4.4
 */

import { useCallback } from "react";
import type { UseExpenseCoreReturn } from "./useExpenseCore.ts";
import type { ExpenseState } from "../vm/ExpenseVM.ts";

/**
 * Analysis hook return interface
 */
export interface UseAnalyzeReturn {
  /**
   * Monthly aggregated financial data
   */
  monthly: UseExpenseCoreReturn["state"]["monthly"];

  /**
   * Integrated narrative insights
   */
  insights: UseExpenseCoreReturn["state"]["insights"];

  /**
   * Current date range filter
   */
  range: UseExpenseCoreReturn["state"]["range"];

  /**
   * Current category filters
   */
  filters: UseExpenseCoreReturn["state"]["filters"];

  /**
   * Analysis loading state
   */
  isLoading: boolean;

  /**
   * Analysis errors
   */
  error: UseExpenseCoreReturn["state"]["errors"]["analysis"];

  /**
   * Run complete analysis pipeline
   */
  runAnalysis: () => Promise<void>;

  /**
   * Set date range filter
   * @param range - Date range with optional from/to dates
   */
  setRange: (range: ExpenseState["range"]) => void;

  /**
   * Set transaction category filters
   * @param filters - Filter configuration with categories array
   */
  setFilters: (filters: ExpenseState["filters"]) => void;

  /**
   * Check if analysis data is available
   */
  hasData: boolean;
}

/**
 * Specialized hook for financial analysis and insights
 *
 * Handles the complete analysis pipeline:
 * 1. Data filtering by date range and categories
 * 2. Monthly financial calculations
 * 3. Insight generation and narrative creation
 *
 * @param core - Core expense tracker state and commands
 * @returns Analysis-specific state and operations
 */
export function useAnalyze(core: UseExpenseCoreReturn): UseAnalyzeReturn {
  /**
   * Run complete analysis pipeline with insights
   */
  const runAnalysis = useCallback(async () => {
    // Run analysis regardless; commands handle guards
    await core.commands.analyze();
    core.commands.explain();
  }, [core.commands]);

  /**
   * Set date range and trigger re-analysis if data exists
   */
  const setRange = useCallback(
    (range: ExpenseState["range"]) => {
      core.commands.setRange(range);

      // Re-run analysis if we have data
      if (core.state.normalized.length > 0) {
        runAnalysis();
      }
    },
    [core.commands, core.state.normalized.length, runAnalysis],
  );

  /**
   * Set filters and trigger re-analysis if data exists
   */
  const setFilters = useCallback(
    (filters: ExpenseState["filters"]) => {
      core.commands.setFilters(filters);

      // Re-run analysis if we have data
      if (core.state.normalized.length > 0) {
        runAnalysis();
      }
    },
    [core.commands, core.state.normalized.length, runAnalysis],
  );

  return {
    monthly: core.state.monthly,
    insights: core.state.insights,
    range: core.state.range,
    filters: core.state.filters,
    isLoading: core.state.loading.analysis,
    error: core.state.errors.analysis,
    runAnalysis,
    setRange,
    setFilters,
    hasData: core.state.normalized.length > 0,
  };
}
