// Hook interfaces for the expense tracker

import type {
  TransactionData,
  MonthlyData,
  OverallSummary,
  BalancePoint,
  TypeSummary,
  CsvValidationResult,
} from "../types";

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

  // Actions
  processCSVFile: (file: File) => Promise<void>;
  toggleCurrentMonth: (show: boolean) => void;
  clearData: () => void;
}
