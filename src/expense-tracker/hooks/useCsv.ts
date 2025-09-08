/**
 * Specialized hook for CSV upload and normalization concerns
 *
 * Provides focused interface for CSV-related operations while
 * going through the ViewModel layer for proper state management.
 *
 * Requirements: 4.2, 4.3, 4.4
 */

import { useCallback } from "react";
import type { UseExpenseCoreReturn } from "./useExpenseCore.ts";

/**
 * CSV hook return interface
 */
export interface UseCsvReturn {
  /**
   * Raw transaction data from CSV parsing
   */
  raw: UseExpenseCoreReturn["state"]["raw"];

  /**
   * Normalized transaction data ready for analysis
   */
  normalized: UseExpenseCoreReturn["state"]["normalized"];

  /**
   * CSV loading state
   */
  isLoading: boolean;

  /**
   * CSV validation errors
   */
  errors: UseExpenseCoreReturn["state"]["errors"]["csv"];

  /**
   * Upload and process CSV file
   * @param file - CSV file to upload and process
   */
  uploadFile: (file: File) => Promise<void>;

  /**
   * Clear all CSV data and reset state
   */
  clearData: () => void;
}

/**
 * Specialized hook for CSV upload and normalization
 *
 * Handles the complete CSV processing pipeline:
 * 1. File upload and validation
 * 2. Data parsing and normalization
 * 3. Error handling and user feedback
 *
 * @param core - Core expense tracker state and commands
 * @returns CSV-specific state and operations
 */
export function useCsv(core: UseExpenseCoreReturn): UseCsvReturn {
  /**
   * Upload file with automatic normalization
   */
  const uploadFile = useCallback(
    async (file: File) => {
      console.log("xz useCsv.uploadFile: Starting upload for", file.name);

      try {
        // Load and validate CSV (returns normalized transactions)
        const transactions = await core.commands.loadCsv(file);

        console.log("xz useCsv.uploadFile: CSV loaded, immediate result:", {
          normalizedCount: transactions.length,
        });
        console.log("xz useCsv.uploadFile: core.state:", core.state);

        // Run analysis and build charts immediately without relying on re-render timing
        if (transactions.length > 0) {
          await core.commands.analyze();
          core.commands.buildCharts();
          core.commands.explain();
        }
      } catch (error) {
        console.error("xz useCsv.uploadFile: Error during upload:", error);
        throw error;
      }
    },
    [core.commands, core.state],
  );

  /**
   * Clear all data and reset to initial state
   */
  const clearData = useCallback(() => {
    core.commands.reset();
  }, [core.commands]);

  return {
    raw: core.state.raw,
    normalized: core.state.normalized,
    isLoading: core.state.loading.csv,
    errors: core.state.errors.csv,
    uploadFile,
    clearData,
  };
}
