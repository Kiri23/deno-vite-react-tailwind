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

// Detailed expense analysis types
export interface AnalysisOptions {
  includeTransfers?: boolean; // Default: false
  includeRoundups?: boolean; // Default: false
  includePending?: boolean; // Default: false
}

export interface TopExpense {
  date: string; // YYYY-MM-DD (fecha absoluta)
  description: string;
  type: string; // Tipo normalizado
  amount: number; // Always negative for expenses
  rank: number; // 1-10
}

export interface DailySpending {
  date: string; // YYYY-MM-DD
  day: number; // 1-31 (día del mes)
  totalExpenses: number; // 0 si no hay gastos ese día
  transactionCount: number;
  largestExpense?: {
    description: string;
    amount: number;
  };
}

export interface ExpenseByType {
  type: string; // Tipo normalizado (Debit Card, etc.)
  totalAmount: number; // Monto total (negativo)
  transactionCount: number;
  percentage: number; // Porcentaje sobre total de egresos del mes
  averageAmount: number;
}

export interface MonthlyAnalysis {
  month: string; // YYYY-MM format
  isCurrentMonth: boolean; // Para mostrar badge "mes incompleto"
  topExpenses: TopExpense[]; // Top-10, solo egresos
  expensesByType: ExpenseByType[]; // Desglose por tipo normalizado
  dailySpending: DailySpending[]; // Patrón diario (1..28/29/30/31)
  insights: {
    largestExpense: {
      description: string;
      amount: number;
      date: string;
    };
    highestTypePercentage: {
      type: string;
      percentage: number;
    };
    highestSpendingDay: {
      date: string; // YYYY-MM-DD
      amount: number;
    };
    totalExpenses: number;
    averageDailySpending: number;
  };
  appliedOptions: AnalysisOptions; // Filtros aplicados
}
