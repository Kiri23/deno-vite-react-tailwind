// Component prop interfaces for the expense tracker

import type {
  TransactionData,
  MonthlyData,
  OverallSummary,
  BalancePoint,
  TypeSummary,
  CsvValidationResult,
  ValidationError,
} from "../types";

// Main container component props
export interface ExpenseTrackerProps {}

// File upload component props
export interface FileUploadProps {
  onFileProcessed: (result: CsvValidationResult) => void;
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
