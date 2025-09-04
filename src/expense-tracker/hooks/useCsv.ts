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
      console.log("useCsv.uploadFile: Starting upload for", file.name);

      // Load and validate CSV
      await core.commands.loadCsv(file);

      // We need to wait a bit for the state to update since it's async
      // This is a temporary fix - ideally the commands should return the new state
      await new Promise((resolve) => setTimeout(resolve, 100));

      console.log("useCsv.uploadFile: CSV loaded, state:", {
        rawCount: core.state.raw.length,
        errors: core.state.errors.csv,
      });

      // If successful, normalize the data
      if (core.state.raw.length > 0 && !core.state.errors.csv) {
        console.log("useCsv.uploadFile: Normalizing data...");
        await core.commands.normalize();

        // Wait for normalization to complete
        await new Promise((resolve) => setTimeout(resolve, 100));

        console.log("useCsv.uploadFile: Normalization completed, state:", {
          normalizedCount: core.state.normalized.length,
        });
      } else {
        console.warn("useCsv.uploadFile: Skipping normalization", {
          rawCount: core.state.raw.length,
          hasErrors: !!core.state.errors.csv,
        });
      }
    },
    [core.commands, core.state]
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
