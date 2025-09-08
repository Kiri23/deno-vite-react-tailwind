// Hook interfaces for the expense tracker

import type {
  TransactionData,
  MonthlyData,
  OverallSummary,
  BalancePoint,
  TypeSummary,
  CsvValidationResult,
  MonthlyAnalysis,
  AnalysisOptions,
} from "../types/index.ts";

// useExpenseTracker hook return interface
export interface UseExpenseTrackerReturn {
  // State
  transactions: TransactionData[];
  monthlyData: MonthlyData[];
  summary: OverallSummary | null;
  balanceHistory: BalancePoint[];
  typeBreakdown: TypeSummary[];
  textualSummaries: string[];
  showCurrentMonth: boolean;
  isLoading: boolean;
  validationResult: CsvValidationResult | null;

  // Expense Analysis State
  selectedAnalysisMonth: string | null;
  analysisOptions: AnalysisOptions;
  monthlyAnalysis: MonthlyAnalysis | null;
  availableAnalysisMonths: string[];
  isAnalysisLoading: boolean;
  analysisError: string | null;

  // Actions
  processCSVFile: (file: File) => Promise<{
    transactions: TransactionData[];
    monthlyData: MonthlyData[];
    summary: OverallSummary | null;
  }>;
  toggleCurrentMonth: (show: boolean) => void;
  clearData: () => void;

  // Expense Analysis Actions
  setSelectedAnalysisMonth: (month: string) => void;
  setAnalysisOptions: (options: AnalysisOptions) => void;
}
