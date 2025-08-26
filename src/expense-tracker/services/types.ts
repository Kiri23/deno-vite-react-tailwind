// Service interfaces for the expense tracker

import type {
  RawTransaction,
  TransactionData,
  CsvValidationResult,
  MonthlyData,
  OverallSummary,
  TypeSummary,
  BalancePoint,
  ChartDataset,
} from "../types";

// CSV Service interface
export interface CsvService {
  validateAndParse(file: File): Promise<CsvValidationResult>;
  normalizeTransactionTypes(transactions: RawTransaction[]): TransactionData[];
  calculateSyntheticBalance(transactions: TransactionData[]): TransactionData[];
}

// Analysis Service interface
export interface AnalysisService {
  calculateMonthlySummary(
    transactions: TransactionData[],
    excludeCurrentMonth?: boolean
  ): MonthlyData[];
  calculateOverallSummary(transactions: TransactionData[]): OverallSummary;
  groupByTransactionType(transactions: TransactionData[]): TypeSummary[];
  generateBalanceHistory(transactions: TransactionData[]): BalancePoint[];
}

// Visualization Service interface
export interface VizService {
  prepareMonthlyChartData(monthlyData: MonthlyData[]): ChartDataset[];
  prepareBalanceChartData(balanceHistory: BalancePoint[]): ChartDataset;
  prepareTypeChartData(typeSummary: TypeSummary[]): ChartDataset;
  generateTextualSummary(monthlyData: MonthlyData[]): string[];
}
