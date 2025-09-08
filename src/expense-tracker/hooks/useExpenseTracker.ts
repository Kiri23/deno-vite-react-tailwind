import { useState, useCallback, useMemo, useEffect } from "react";
import { useServices } from "../../app/context.tsx";
import { useExpenseCore } from "./useExpenseCore.ts";
import { useCsv } from "./useCsv.ts";
import { useAnalyze } from "./useAnalyze.ts";
import { useVisualize } from "./useVisualize.ts";
import { ExpenseAnalysisService } from "../services";
import type { UseExpenseTrackerReturn } from "./types";
import type {
  TransactionData,
  MonthlyData,
  OverallSummary,
  BalancePoint,
  TypeSummary,
  CsvValidationResult,
  ValidationError,
  MonthlyAnalysis,
  AnalysisOptions,
} from "../types";

/**
 * Enhanced error details with user-friendly messages and recovery suggestions
 */
function enhanceValidationErrors(errors: ValidationError[]): ValidationError[] {
  return errors.map((error) => {
    switch (error.type) {
      case "file_too_large":
        return {
          ...error,
          examples: [
            "Divide el archivo en períodos más pequeños (por ejemplo, por trimestre)",
            "Elimina columnas innecesarias antes de exportar",
            "Usa formato CSV sin formato adicional",
          ],
        };

      case "missing_columns":
        return {
          ...error,
          examples: [
            "Verifica que el archivo incluya: Date, Description, Type, Amount, Current balance, Status",
            "Asegúrate de exportar todas las columnas desde tu banco",
            "Revisa que los nombres de columnas coincidan exactamente",
          ],
        };

      case "invalid_date":
        return {
          ...error,
          examples: [
            "Las fechas deben estar en formato MM/DD/YYYY o YYYY-MM-DD",
            "Verifica que no haya celdas vacías en la columna Date",
            "Asegúrate de que las fechas sean válidas (mes 1-12, día 1-31)",
          ],
        };

      case "invalid_amount":
        return {
          ...error,
          examples: [
            "Los montos deben ser números (ej: 150.50, -25.00)",
            "Elimina símbolos de moneda ($) si están presentes",
            "Verifica que no haya texto en la columna Amount",
          ],
        };

      default:
        return {
          ...error,
          examples: [
            "Verifica el formato del archivo CSV",
            "Intenta exportar el archivo nuevamente desde tu banco",
            "Asegúrate de que el archivo no esté corrupto",
          ],
        };
    }
  });
}

/**
 * Custom hook for expense tracker functionality using new architecture
 * Orchestrates the new VM-based architecture while maintaining the same interface
 * Enhanced with detailed error handling and user feedback
 *
 * Requirements: 8.2, 8.3, 8.4
 */
export function useExpenseTracker(): UseExpenseTrackerReturn {
  // Get services from context (new architecture)
  const services = useServices();

  // Initialize core VM and specialized hooks
  const core = useExpenseCore(services);
  const csv = useCsv(core);
  const analyze = useAnalyze(core);
  const visualize = useVisualize(core);
  console.log("xz useExpenseTracker: core:", core);

  // Legacy service for expense analysis (still needed for detailed analysis)
  const expenseAnalysisService = useMemo(
    () => new ExpenseAnalysisService(),
    []
  );

  // UI state that's not managed by VM
  const [showCurrentMonth, setShowCurrentMonth] = useState<boolean>(false);

  // Expense Analysis state (legacy functionality)
  const [selectedAnalysisMonth, setSelectedAnalysisMonth] = useState<
    string | null
  >(null);
  const [analysisOptions, setAnalysisOptions] = useState<AnalysisOptions>({
    includeTransfers: false,
    includeRoundups: false,
    includePending: false,
  });
  const [monthlyAnalysis, setMonthlyAnalysis] =
    useState<MonthlyAnalysis | null>(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Derive legacy data from VM state
  const transactions = core.state.normalized;
  console.log("xz useExpenseTracker: transactions:", transactions);
  const monthlyData = core.state.monthly;
  const textualSummaries = core.state.insights.summaryText
    ? [core.state.insights.summaryText]
    : [];

  // Generate legacy data structures from VM state
  const summary = useMemo((): OverallSummary | null => {
    if (transactions.length === 0) return null;

    // Use analysis service to generate overall summary
    try {
      return services.analysis.calculateOverallSummary(transactions);
    } catch (error) {
      console.warn("Failed to generate overall summary:", error);
      return null;
    }
  }, [transactions, services.analysis]);

  const balanceHistory = useMemo((): BalancePoint[] => {
    if (transactions.length === 0) return [];

    try {
      return services.analysis.generateBalanceHistory(transactions);
    } catch (error) {
      console.warn("Failed to generate balance history:", error);
      return [];
    }
  }, [transactions, services.analysis]);

  const typeBreakdown = useMemo((): TypeSummary[] => {
    if (transactions.length === 0) return [];

    try {
      return services.analysis.groupByTransactionType(transactions);
    } catch (error) {
      console.warn("Failed to generate type breakdown:", error);
      return [];
    }
  }, [transactions, services.analysis]);

  // Create validation result from VM state
  const validationResult = useMemo((): CsvValidationResult | null => {
    if (core.state.errors.csv) {
      return {
        isValid: false,
        errors: enhanceValidationErrors(core.state.errors.csv),
        metadata: {
          rowCount: core.state.raw.length,
          dateRange: { start: "", end: "" },
          balanceSource: "original",
        },
      };
    }

    if (transactions.length > 0) {
      return {
        isValid: true,
        transactions: core.state.raw,
        metadata: {
          rowCount: transactions.length,
          dateRange: {
            start: transactions[0]?.Date || "",
            end: transactions[transactions.length - 1]?.Date || "",
          },
          balanceSource: "original",
        },
      };
    }

    return null;
  }, [core.state.errors.csv, core.state.raw, transactions]);

  // Computed values for expense analysis
  const availableAnalysisMonths = useMemo(() => {
    return expenseAnalysisService.getAvailableMonths(transactions, false);
  }, [transactions, expenseAnalysisService]);

  // Auto-select default analysis month when transactions change
  useEffect(() => {
    if (transactions.length > 0 && !selectedAnalysisMonth) {
      const defaultMonth =
        expenseAnalysisService.getDefaultAnalysisMonth(transactions);
      setSelectedAnalysisMonth(defaultMonth);
    }
  }, [transactions, selectedAnalysisMonth, expenseAnalysisService]);

  // Generate monthly analysis when month or options change
  useEffect(() => {
    if (selectedAnalysisMonth && transactions.length > 0) {
      setIsAnalysisLoading(true);
      setAnalysisError(null);

      try {
        const analysis = expenseAnalysisService.analyzeMonth(
          transactions,
          selectedAnalysisMonth,
          analysisOptions
        );
        setMonthlyAnalysis(analysis);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Error desconocido";
        setAnalysisError(`Error al generar análisis: ${errorMessage}`);
        setMonthlyAnalysis(null);
      } finally {
        setIsAnalysisLoading(false);
      }
    } else {
      setMonthlyAnalysis(null);
    }
  }, [
    selectedAnalysisMonth,
    analysisOptions,
    transactions,
    expenseAnalysisService,
  ]);

  /**
   * Process CSV file through the new VM architecture
   * Maintains the same interface but uses the new pipeline
   */
  const processCSVFile = useCallback(
    async (file: File): Promise<void> => {
      console.log("xz processCSVFile: Starting with file:", file.name);
      try {
        // Use the new CSV hook for file processing
        await csv.uploadFile(file);
        console.log("xz useExpenseTracker: processCSVFile: core.state:", core.state);

        // If successful, run analysis and build charts
        if (core.state.normalized.length > 0) {
          console.log("xz processCSVFile: Running analysis and building charts");
          await analyze.runAnalysis();
          visualize.buildCharts();
        }
      } catch (error) {
        console.error("xz Error processing CSV file:", error);
        // Errors are handled by the VM and exposed through state
      }
    },
    [csv, core.state.normalized.length, analyze, visualize]
  );

  /**
   * Toggle current month inclusion and recalculate data
   * Implements current month toggle functionality using VM
   */
  const toggleCurrentMonth = useCallback(
    (show: boolean): void => {
      setShowCurrentMonth(show);

      // Update VM filters to include/exclude current month
      // This is a simplified approach - in a full implementation,
      // we might want to add current month handling to the VM
      if (transactions.length > 0) {
        // Re-run analysis with new setting
        analyze.runAnalysis();
      }
    },
    [transactions.length, analyze]
  );

  /**
   * Clear all data and reset state
   * Uses the new VM reset functionality
   */
  const clearData = useCallback((): void => {
    csv.clearData();
    setShowCurrentMonth(false);
    setSelectedAnalysisMonth(null);
    setMonthlyAnalysis(null);
    setAnalysisError(null);
  }, [csv]);

  // Determine loading state from VM
  const isLoading =
    core.state.loading.csv ||
    core.state.loading.analysis ||
    core.state.loading.charts;

  return {
    // State (mapped from VM state)
    transactions,
    monthlyData,
    summary,
    balanceHistory,
    typeBreakdown,
    textualSummaries,
    showCurrentMonth,
    isLoading,
    validationResult,

    // Expense Analysis State (legacy)
    selectedAnalysisMonth,
    analysisOptions,
    monthlyAnalysis,
    availableAnalysisMonths,
    isAnalysisLoading,
    analysisError,

    // Actions (using new architecture)
    processCSVFile,
    toggleCurrentMonth,
    clearData,

    // Expense Analysis Actions (legacy)
    setSelectedAnalysisMonth,
    setAnalysisOptions,
  };
}
