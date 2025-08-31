/**
 * Port-based service contracts for expense tracker modularization.
 * These interfaces define clear contracts that enable service implementation swapping
 * without breaking dependent code (ViewModels, hooks, UI components).
 *
 * Requirements: 2.1, 2.2, 2.6
 */

import type {
  RawTransaction,
  TransactionData,
  CsvValidationResult,
  MonthlyData,
  OverallSummary,
  TypeSummary,
  BalancePoint,
  ChartDataset,
} from "../types/index.ts";

/**
 * CsvPort - Contract for CSV processing and data normalization services
 * Handles file validation, parsing, and transaction normalization
 */
export interface CsvPort {
  /**
   * Validates and parses a CSV file, returning validation results and normalized transactions
   * @param file - The CSV file to process
   * @returns Promise resolving to validation result with transactions or errors
   */
  validateAndParse(file: File): Promise<CsvValidationResult>;

  /**
   * Normalizes raw transaction data according to foundation.md standards
   * @param raw - Array of raw transactions from CSV parsing
   * @returns Array of normalized transaction data
   */
  normalizeTransactions(raw: RawTransaction[]): TransactionData[];

  /**
   * Normalizes date strings to YYYY-MM-DD format with America/New_York timezone assumption
   * @param dateStr - Raw date string from CSV
   * @returns Normalized date string in YYYY-MM-DD format
   */
  normalizeDate(dateStr: string): string;

  /**
   * Canonicalizes transaction amounts based on type (deposits positive, withdrawals negative)
   * @param amount - Raw amount from CSV
   * @param type - Normalized transaction type
   * @returns Canonicalized amount following foundation.md rules
   */
  canonicalizeAmount(amount: number, type: string): number;
}

/**
 * AnalysisPort - Contract for financial data analysis and aggregation services
 * Handles monthly summaries, overall statistics, and transaction breakdowns
 */
export interface AnalysisPort {
  /**
   * Calculates monthly financial summaries with current month exclusion logic
   * @param transactions - Array of normalized transaction data
   * @param excludeCurrent - Whether to exclude current month from results (default: true)
   * @returns Array of monthly aggregated data
   */
  calculateMonthlySummary(
    transactions: TransactionData[],
    excludeCurrent?: boolean
  ): MonthlyData[];

  /**
   * Calculates overall summary statistics for the entire transaction period
   * @param transactions - Array of normalized transaction data
   * @returns Overall summary with totals, date range, and balance source metadata
   */
  calculateOverallSummary(transactions: TransactionData[]): OverallSummary;

  /**
   * Generates balance history points for chart visualization
   * @param transactions - Array of normalized transaction data
   * @returns Array of balance points with date and calculated/original flags
   */
  generateBalanceHistory(transactions: TransactionData[]): BalancePoint[];

  /**
   * Groups transactions by normalized type and calculates expense breakdowns
   * @param transactions - Array of normalized transaction data
   * @returns Array of type summaries with amounts, counts, and percentages
   */
  groupByTransactionType(transactions: TransactionData[]): TypeSummary[];
}

/**
 * VizPort - Contract for chart data preparation and narrative generation services
 * Transforms analysis data into chart-ready formats with accessibility features
 */
export interface VizPort {
  /**
   * Prepares monthly data for bar chart visualization
   * @param monthlyData - Array of monthly aggregated data
   * @returns Array of chart datasets ready for rendering
   */
  prepareMonthlyChartData(monthlyData: MonthlyData[]): ChartDataset[];

  /**
   * Prepares balance history for line chart visualization
   * @param balanceHistory - Array of balance points over time
   * @returns Chart dataset with original vs calculated balance series
   */
  prepareBalanceChartData(balanceHistory: BalancePoint[]): ChartDataset;

  /**
   * Prepares transaction type breakdown for pie/bar chart visualization
   * @param typeSummary - Array of expense summaries by transaction type
   * @returns Chart dataset with color-coded type breakdowns
   */
  prepareTypeChartData(typeSummary: TypeSummary[]): ChartDataset;

  /**
   * Generates human-readable financial summaries in Spanish
   * @param monthlyData - Array of monthly aggregated data
   * @returns Array of narrative strings describing financial patterns
   */
  generateTextualSummary(monthlyData: MonthlyData[]): string[];
}

/**
 * Shared contract test suite interfaces for port validation
 * These interfaces ensure LocalService and RemoteService implementations
 * pass the same test suite, guaranteeing swap compatibility
 *
 * Requirement: 2.6
 */

/**
 * Test data fixtures for contract validation
 */
export interface ContractTestFixtures {
  validCsvFile: File;
  invalidCsvFile: File;
  rawTransactions: RawTransaction[];
  normalizedTransactions: TransactionData[];
  monthlyData: MonthlyData[];
  balanceHistory: BalancePoint[];
  typeSummary: TypeSummary[];
}

/**
 * Expected results for contract test validation
 */
export interface ContractTestExpectations {
  csvValidation: {
    validFile: CsvValidationResult;
    invalidFile: CsvValidationResult;
  };
  normalization: {
    dateNormalization: Record<string, string>; // input -> expected output
    amountCanonicalization: Record<
      string,
      { amount: number; type: string; expected: number }
    >;
  };
  analysis: {
    monthlySummary: MonthlyData[];
    overallSummary: OverallSummary;
    balanceHistory: BalancePoint[];
    typeSummary: TypeSummary[];
  };
  visualization: {
    monthlyCharts: ChartDataset[];
    balanceChart: ChartDataset;
    typeChart: ChartDataset;
    textualSummary: string[];
  };
}

/**
 * Contract test suite interface that both LocalService and RemoteService must pass
 * This ensures implementation swapping doesn't break functionality
 */
export interface ServiceContractTestSuite {
  /**
   * Test fixtures and expected results for validation
   */
  fixtures: ContractTestFixtures;
  expectations: ContractTestExpectations;

  /**
   * Validates CsvPort implementation against contract requirements
   * @param csvService - CsvPort implementation to test
   * @returns Promise resolving to test results
   */
  validateCsvPort(csvService: CsvPort): Promise<ContractTestResult>;

  /**
   * Validates AnalysisPort implementation against contract requirements
   * @param analysisService - AnalysisPort implementation to test
   * @returns Promise resolving to test results
   */
  validateAnalysisPort(
    analysisService: AnalysisPort
  ): Promise<ContractTestResult>;

  /**
   * Validates VizPort implementation against contract requirements
   * @param vizService - VizPort implementation to test
   * @returns Promise resolving to test results
   */
  validateVizPort(vizService: VizPort): Promise<ContractTestResult>;

  /**
   * Runs complete contract validation suite against all ports
   * @param services - Object containing all service port implementations
   * @returns Promise resolving to comprehensive test results
   */
  validateAllPorts(services: {
    csv: CsvPort;
    analysis: AnalysisPort;
    viz: VizPort;
  }): Promise<ContractTestSuiteResult>;
}

/**
 * Individual contract test result
 */
export interface ContractTestResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
  testCases: {
    name: string;
    passed: boolean;
    error?: string;
    duration: number;
  }[];
}

/**
 * Complete contract test suite result
 */
export interface ContractTestSuiteResult {
  allPassed: boolean;
  csvPort: ContractTestResult;
  analysisPort: ContractTestResult;
  vizPort: ContractTestResult;
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    totalDuration: number;
  };
}

/**
 * Service factory interface for dependency injection
 * Used by AppContext to provide port implementations
 */
export interface ServiceFactory {
  /**
   * Creates and returns service port implementations
   * @returns Object containing all service ports
   */
  createServices(): {
    csv: CsvPort;
    analysis: AnalysisPort;
    viz: VizPort;
  };

  /**
   * Returns the service implementation type for debugging/logging
   */
  getServiceType(): "local" | "remote";

  /**
   * Validates that all services implement their contracts correctly
   * @returns Promise resolving to validation results
   */
  validateContracts(): Promise<ContractTestSuiteResult>;
}
