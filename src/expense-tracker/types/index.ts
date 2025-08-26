// Core data interfaces for the expense tracker

// Raw transaction data from CSV (before normalization)
export interface RawTransaction {
  Date: string;
  Description: string;
  Type: string; // Before normalization
  Amount: number;
  "Current balance": number;
  Status: string;
}

// Normalized transaction data (after processing)
export interface TransactionData {
  Date: string; // Normalizado a YYYY-MM-DD, timezone fija America/New_York
  Description: string;
  Type:
    | "Debit Card"
    | "Withdrawal"
    | "Deposit"
    | "Roundup"
    | "Transfer"
    | "Other";
  Amount: number; // Convención única: Negativo = gasto, Positivo = ingreso
  "Current balance": number; // Usar valor original; si inconsistente, calcular sintético
  Status: "Posted" | "Pending";
}

// Monthly aggregated data
export interface MonthlyData {
  month: string; // YYYY-MM format
  totalIncome: number;
  totalExpenses: number;
  savings: number; // income - expenses (puede ser negativo en déficit)
  transactionCount: number;
  isCurrentMonth: boolean; // indica si pertenece al mes en curso (para exclusión opcional)
}

// Overall summary for the entire period
export interface OverallSummary {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  transactionCount: number;
  dateRange: {
    start: string; // Absolute date
    end: string; // Absolute date
  };
  balanceSource: "original" | "calculated"; // badge visible en UI para transparencia
}

// Transaction type breakdown
export interface TypeSummary {
  type: string;
  amount: number; // Total expenses for this type
  count: number;
  percentage: number; // Of total expenses
}

// Balance history point
export interface BalancePoint {
  date: string; // YYYY-MM-DD
  balance: number;
  isCalculated: boolean;
}

// Chart data structure
export interface ChartDataset {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor?: string;
    borderWidth?: number;
  }[];
}

// Validation error types
export interface ValidationError {
  type:
    | "missing_columns"
    | "invalid_date"
    | "invalid_amount"
    | "file_too_large";
  message: string;
  examples?: string[];
}

// CSV validation result
export interface CsvValidationResult {
  isValid: boolean;
  transactions?: RawTransaction[];
  errors?: ValidationError[];
  warnings?: string[];
  metadata: {
    rowCount: number;
    dateRange: { start: string; end: string };
    balanceSource: "original" | "calculated";
  };
}
