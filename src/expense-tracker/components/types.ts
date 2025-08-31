// Component prop interfaces for the expense tracker

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

// Re-export types that components need
export type {
  TransactionData,
  ValidationError,
  MonthlyData,
  OverallSummary,
  BalancePoint,
  TypeSummary,
  CsvValidationResult,
  MonthlyAnalysis,
  AnalysisOptions,
};

// Main container component props
export interface ExpenseTrackerProps {}

// File upload component props
export interface FileUploadProps {
  onFileProcessed: (file: File) => void;
  onError: (errors: ValidationError[]) => void;
  maxFileSize: number; // 20MB limit
}

// Transaction table component props
export interface TransactionTableProps {
  transactions: TransactionData[];
  summary: OverallSummary;
  dateRange: { start: string; end: string };
}

// Charts component props
export interface ExpenseChartsProps {
  monthlyData: MonthlyData[];
  balanceHistory: BalancePoint[];
  typeBreakdown: TypeSummary[];
  textualSummaries: string[];
  showCurrentMonth: boolean;
  onToggleCurrentMonth: (show: boolean) => void;
}

// Monthly text summary component props
export interface MonthlyTextSummaryProps {
  summaries: string[];
}

// Expense analysis component props
export interface ExpenseAnalysisProps {
  transactions: TransactionData[];
  monthlyData: MonthlyData[];
  selectedMonth?: string; // YYYY-MM format, default: último mes completo
  analysisOptions: AnalysisOptions;
  onMonthSelect: (month: string) => void;
  onOptionsChange: (options: AnalysisOptions) => void;
}
