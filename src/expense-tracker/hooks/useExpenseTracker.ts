import { useState, useCallback, useMemo, useEffect } from "react";
import {
  CsvService,
  AnalysisService,
  VizService,
  ExpenseAnalysisService,
} from "../services";
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
function getErrorDetails(error: unknown, file: File): ValidationError {
  const errorMessage =
    error instanceof Error ? error.message : "Error desconocido";

  // Categorize errors and provide specific guidance
  if (errorMessage.includes("NetworkError") || errorMessage.includes("fetch")) {
    return {
      type: "missing_columns", // Using existing type
      message:
        "Error de conexión al procesar el archivo. Verifica tu conexión a internet e intenta nuevamente.",
      examples: ["Revisa tu conexión", "Intenta con un archivo más pequeño"],
    };
  }

  if (errorMessage.includes("Memory") || errorMessage.includes("memory")) {
    return {
      type: "file_too_large",
      message:
        "El archivo es demasiado grande para procesar en este dispositivo. Intenta dividir el archivo en períodos más pequeños.",
      examples: [
        "Divide el archivo por meses",
        "Usa un archivo de máximo 10MB",
      ],
    };
  }

  if (errorMessage.includes("timeout") || errorMessage.includes("Timeout")) {
    return {
      type: "missing_columns", // Using existing type
      message:
        "El procesamiento del archivo tomó demasiado tiempo. Intenta con un archivo más pequeño.",
      examples: [
        "Reduce el número de transacciones",
        "Divide el archivo por trimestres",
      ],
    };
  }

  // Generic error with recovery suggestions
  return {
    type: "missing_columns", // Using existing type
    message: `Error inesperado al procesar el archivo: ${errorMessage}`,
    examples: [
      "Verifica que el archivo no esté corrupto",
      "Intenta exportar el CSV nuevamente desde tu banco",
      "Asegúrate de que el archivo tenga las columnas requeridas",
    ],
  };
}

/**
 * Enhance validation result with user-friendly messages and recovery suggestions
 */
function enhanceValidationResult(
  result: CsvValidationResult,
  file: File
): CsvValidationResult {
  if (result.isValid) {
    return result;
  }

  const enhancedErrors = result.errors?.map((error) => {
    switch (error.type) {
      case "file_too_large":
        return {
          ...error,
          message: `${error.message} El archivo actual es de ${(
            file.size /
            1024 /
            1024
          ).toFixed(1)} MB.`,
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

  return {
    ...result,
    errors: enhancedErrors,
  };
}

/**
 * Distinguish between blocking errors and warnings
 */
function categorizeValidationIssues(result: CsvValidationResult): {
  blockingErrors: ValidationError[];
  warnings: string[];
  canProceed: boolean;
} {
  const blockingErrors: ValidationError[] = [];
  const warnings: string[] = [...(result.warnings || [])];

  // Categorize errors
  result.errors?.forEach((error) => {
    switch (error.type) {
      case "file_too_large":
      case "missing_columns":
        blockingErrors.push(error);
        break;

      case "invalid_date":
      case "invalid_amount":
        // These can be warnings if we have some valid data
        if (result.transactions && result.transactions.length > 0) {
          warnings.push(`Advertencia: ${error.message}`);
        } else {
          blockingErrors.push(error);
        }
        break;

      default:
        blockingErrors.push(error);
    }
  });

  const canProceed = Boolean(
    blockingErrors.length === 0 &&
      result.transactions &&
      result.transactions.length > 0
  );

  return {
    blockingErrors,
    warnings,
    canProceed,
  };
}

/**
 * Custom hook for expense tracker functionality
 * Orchestrates CsvService, AnalysisService, and VizService
 * Manages state for transactions, monthly data, summaries, and UI controls
 * Enhanced with detailed error handling and user feedback
 */
export function useExpenseTracker(): UseExpenseTrackerReturn {
  // Service instances
  const expenseAnalysisService = useMemo(
    () => new ExpenseAnalysisService(),
    []
  );

  // Core data state
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [summary, setSummary] = useState<OverallSummary | null>(null);
  const [balanceHistory, setBalanceHistory] = useState<BalancePoint[]>([]);
  const [typeBreakdown, setTypeBreakdown] = useState<TypeSummary[]>([]);
  const [textualSummaries, setTextualSummaries] = useState<string[]>([]);

  // UI state
  const [showCurrentMonth, setShowCurrentMonth] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [validationResult, setValidationResult] =
    useState<CsvValidationResult | null>(null);

  // Expense Analysis state
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
   * Helper function to clear all data state
   */
  const clearAllData = useCallback((): void => {
    setTransactions([]);
    setMonthlyData([]);
    setSummary(null);
    setBalanceHistory([]);
    setTypeBreakdown([]);
    setTextualSummaries([]);

    // Clear analysis state
    setSelectedAnalysisMonth(null);
    setMonthlyAnalysis(null);
    setAnalysisError(null);
  }, []);

  /**
   * Process CSV file through the complete service pipeline
   * Integrates CsvService, AnalysisService, and VizService
   * Enhanced with detailed error handling and user feedback
   */
  const processCSVFile = useCallback(
    async (file: File): Promise<void> => {
      setIsLoading(true);

      try {
        // Step 1: Validate and parse CSV using CsvService
        const csvResult = await CsvService.validateAndParse(file);

        // Enhanced validation result with user-friendly error messages
        const enhancedResult = enhanceValidationResult(csvResult, file);

        // Categorize validation issues
        const { blockingErrors, warnings, canProceed } =
          categorizeValidationIssues(enhancedResult);

        // Update validation result with categorized issues
        const finalResult = {
          ...enhancedResult,
          isValid: canProceed,
          errors: blockingErrors,
          warnings: warnings,
        };
        setValidationResult(finalResult);

        // If we have blocking errors, clear existing data and stop processing
        if (!canProceed) {
          clearAllData();
          return;
        }

        const normalizedTransactions = enhancedResult.transactions!;
        setTransactions(normalizedTransactions);

        // Step 2: Generate analysis data using AnalysisService
        const analysisService = new AnalysisService();

        try {
          // Calculate monthly summaries (exclude current month by default)
          const monthlyAnalysis = analysisService.calculateMonthlySummary(
            normalizedTransactions,
            !showCurrentMonth // Exclude current month when showCurrentMonth is false
          );
          setMonthlyData(monthlyAnalysis);

          // Calculate overall summary
          const overallSummary = analysisService.calculateOverallSummary(
            normalizedTransactions
          );
          setSummary(overallSummary);

          // Generate balance history
          const balancePoints = analysisService.generateBalanceHistory(
            normalizedTransactions
          );
          setBalanceHistory(balancePoints);

          // Calculate transaction type breakdown
          const typeAnalysis = analysisService.groupByTransactionType(
            normalizedTransactions
          );
          setTypeBreakdown(typeAnalysis);

          // Step 3: Generate textual summaries using VizService
          const vizService = new VizService();
          const narratives = vizService.generateTextualSummary(monthlyAnalysis);
          setTextualSummaries(narratives);
        } catch (analysisError) {
          // Handle analysis errors - these are non-blocking but should be reported
          const errorMessage =
            analysisError instanceof Error
              ? analysisError.message
              : "Error desconocido";

          // Add analysis error as a warning to existing validation result
          const updatedResult = {
            ...finalResult,
            warnings: [
              ...warnings,
              `Error durante el análisis de datos: ${errorMessage}. Los datos básicos están disponibles pero algunos gráficos pueden no funcionar correctamente.`,
            ],
          };
          setValidationResult(updatedResult);

          // Keep the transaction data even if analysis fails
          // This allows users to at least see the raw data
        }
      } catch (error) {
        // Handle unexpected errors during processing
        const errorDetails = getErrorDetails(error, file);

        setValidationResult({
          isValid: false,
          errors: [errorDetails],
          metadata: {
            rowCount: 0,
            dateRange: { start: "", end: "" },
            balanceSource: "original",
          },
        });

        // Clear all data on error
        clearAllData();
      } finally {
        setIsLoading(false);
      }
    },
    [showCurrentMonth, clearAllData]
  );

  /**
   * Toggle current month inclusion and recalculate data
   * Implements current month toggle functionality
   */
  const toggleCurrentMonth = useCallback(
    (show: boolean): void => {
      setShowCurrentMonth(show);

      // If we have transactions, recalculate monthly data with new setting
      if (transactions.length > 0) {
        const analysisService = new AnalysisService();

        // Recalculate monthly summaries with new current month setting
        const monthlyAnalysis = analysisService.calculateMonthlySummary(
          transactions,
          !show // Exclude current month when show is false
        );
        setMonthlyData(monthlyAnalysis);

        // Regenerate textual summaries with updated monthly data
        const vizService = new VizService();
        const narratives = vizService.generateTextualSummary(monthlyAnalysis);
        setTextualSummaries(narratives);
      }
    },
    [transactions]
  );

  /**
   * Clear all data and reset state
   * Provides clean slate for new file uploads
   */
  const clearData = useCallback((): void => {
    clearAllData();
    setShowCurrentMonth(false);
    setValidationResult(null);
  }, [clearAllData]);

  return {
    // State
    transactions,
    monthlyData,
    summary,
    balanceHistory,
    typeBreakdown,
    textualSummaries,
    showCurrentMonth,
    isLoading,
    validationResult,

    // Expense Analysis State
    selectedAnalysisMonth,
    analysisOptions,
    monthlyAnalysis,
    availableAnalysisMonths,
    isAnalysisLoading,
    analysisError,

    // Actions
    processCSVFile,
    toggleCurrentMonth,
    clearData,

    // Expense Analysis Actions
    setSelectedAnalysisMonth,
    setAnalysisOptions,
  };
}
