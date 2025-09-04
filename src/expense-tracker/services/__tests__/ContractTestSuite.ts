/**
 * Shared contract test suite for service port validation
 *
 * This test suite ensures that both LocalService and RemoteService implementations
 * pass the same validation tests, guaranteeing swap compatibility.
 *
 * Requirements: 2.6
 */

import type {
  CsvPort,
  AnalysisPort,
  VizPort,
  ContractTestFixtures,
  ContractTestExpectations,
  ServiceContractTestSuite,
  ContractTestResult,
  ContractTestSuiteResult,
} from "../ports.ts";
import type {
  RawTransaction,
  TransactionData,
  CsvValidationResult,
  MonthlyData,
  OverallSummary,
  TypeSummary,
  BalancePoint,
  ChartDataset,
} from "../../types/index.ts";

/**
 * Creates standardized test fixtures for contract validation
 */
export function createContractTestFixtures(): ContractTestFixtures {
  // Valid CSV file content
  const validCsvContent = `Date,Description,Type,Amount,Current balance,Status
2024-01-15,Salary Deposit,DEPOSIT,3000.00,3000.00,Posted
2024-01-20,Grocery Store,DEBIT,-150.00,2850.00,Posted
2024-01-25,ATM Withdrawal,WITHDRAWAL,-100.00,2750.00,Posted
2024-02-01,Salary Deposit,DEPOSIT,3000.00,5750.00,Posted
2024-02-10,Restaurant,DEBIT,-75.00,5675.00,Posted
2024-02-15,Transfer to Savings,XFER,-500.00,5175.00,Posted`;

  // Invalid CSV file content (missing required columns)
  const invalidCsvContent = `Date,Description,Amount
2024-01-15,Test Transaction,100.00`;

  const validCsvFile = new File([validCsvContent], "valid-transactions.csv", {
    type: "text/csv",
  });

  const invalidCsvFile = new File(
    [invalidCsvContent],
    "invalid-transactions.csv",
    {
      type: "text/csv",
    }
  );

  // Raw transactions from CSV parsing
  const rawTransactions: RawTransaction[] = [
    {
      Date: "2024-01-15",
      Description: "Salary Deposit",
      Type: "DEPOSIT",
      Amount: 3000.0,
      "Current balance": 3000.0,
      Status: "Posted",
    },
    {
      Date: "2024-01-20",
      Description: "Grocery Store",
      Type: "DEBIT",
      Amount: -150.0,
      "Current balance": 2850.0,
      Status: "Posted",
    },
    {
      Date: "2024-01-25",
      Description: "ATM Withdrawal",
      Type: "WITHDRAWAL",
      Amount: -100.0,
      "Current balance": 2750.0,
      Status: "Posted",
    },
    {
      Date: "2024-02-01",
      Description: "Salary Deposit",
      Type: "DEPOSIT",
      Amount: 3000.0,
      "Current balance": 5750.0,
      Status: "Posted",
    },
    {
      Date: "2024-02-10",
      Description: "Restaurant",
      Type: "DEBIT",
      Amount: -75.0,
      "Current balance": 5675.0,
      Status: "Posted",
    },
    {
      Date: "2024-02-15",
      Description: "Transfer to Savings",
      Type: "XFER",
      Amount: -500.0,
      "Current balance": 5175.0,
      Status: "Posted",
    },
  ];

  // Normalized transactions (after processing)
  const normalizedTransactions: TransactionData[] = [
    {
      Date: "2024-01-15",
      Description: "Salary Deposit",
      Type: "Deposit",
      Amount: 3000.0,
      "Current balance": 3000.0,
      Status: "Posted",
    },
    {
      Date: "2024-01-20",
      Description: "Grocery Store",
      Type: "Debit Card",
      Amount: -150.0,
      "Current balance": 2850.0,
      Status: "Posted",
    },
    {
      Date: "2024-01-25",
      Description: "ATM Withdrawal",
      Type: "Withdrawal",
      Amount: -100.0,
      "Current balance": 2750.0,
      Status: "Posted",
    },
    {
      Date: "2024-02-01",
      Description: "Salary Deposit",
      Type: "Deposit",
      Amount: 3000.0,
      "Current balance": 5750.0,
      Status: "Posted",
    },
    {
      Date: "2024-02-10",
      Description: "Restaurant",
      Type: "Debit Card",
      Amount: -75.0,
      "Current balance": 5675.0,
      Status: "Posted",
    },
    {
      Date: "2024-02-15",
      Description: "Transfer to Savings",
      Type: "Transfer",
      Amount: -500.0,
      "Current balance": 5175.0,
      Status: "Posted",
    },
  ];

  // Monthly aggregated data
  const monthlyData: MonthlyData[] = [
    {
      month: "2024-01",
      totalIncome: 3000.0,
      totalExpenses: 250.0,
      savings: 2750.0,
      transactionCount: 3,
      isCurrentMonth: false,
    },
    {
      month: "2024-02",
      totalIncome: 3000.0,
      totalExpenses: 575.0,
      savings: 2425.0,
      transactionCount: 3,
      isCurrentMonth: false,
    },
  ];

  // Balance history points
  const balanceHistory: BalancePoint[] = [
    { date: "2024-01-15", balance: 3000.0, isCalculated: false },
    { date: "2024-01-20", balance: 2850.0, isCalculated: false },
    { date: "2024-01-25", balance: 2750.0, isCalculated: false },
    { date: "2024-02-01", balance: 5750.0, isCalculated: false },
    { date: "2024-02-10", balance: 5675.0, isCalculated: false },
    { date: "2024-02-15", balance: 5175.0, isCalculated: false },
  ];

  // Transaction type summary
  const typeSummary: TypeSummary[] = [
    {
      type: "Transfer",
      amount: 500.0,
      count: 1,
      percentage: 60.61,
    },
    {
      type: "Debit Card",
      amount: 225.0,
      count: 2,
      percentage: 27.27,
    },
    {
      type: "Withdrawal",
      amount: 100.0,
      count: 1,
      percentage: 12.12,
    },
  ];

  return {
    validCsvFile,
    invalidCsvFile,
    rawTransactions,
    normalizedTransactions,
    monthlyData,
    balanceHistory,
    typeSummary,
  };
}

/**
 * Creates expected results for contract test validation
 */
export function createContractTestExpectations(): ContractTestExpectations {
  return {
    csvValidation: {
      validFile: {
        isValid: true,
        transactions: [], // Will be populated by actual service
        metadata: {
          rowCount: 6,
          dateRange: { start: "2024-01-15", end: "2024-02-15" },
          balanceSource: "original",
        },
      },
      invalidFile: {
        isValid: false,
        errors: [
          {
            type: "missing_columns",
            message: "Faltan columnas requeridas en el archivo CSV",
            examples: ["Type", "Current balance", "Status"],
          },
        ],
        metadata: {
          rowCount: 0,
          dateRange: { start: "", end: "" },
          balanceSource: "original",
        },
      },
    },
    normalization: {
      dateNormalization: {
        "1/15/2024": "2024-01-15",
        "01-15-24": "2024-01-15",
        "Jan 15, 2024": "2024-01-15",
        "2024-01-15": "2024-01-15",
      },
      amountCanonicalization: {
        deposit_positive: { amount: 100, type: "Deposit", expected: 100 },
        deposit_negative: { amount: -100, type: "Deposit", expected: 100 },
        withdrawal_positive: {
          amount: 100,
          type: "Withdrawal",
          expected: -100,
        },
        withdrawal_negative: {
          amount: -100,
          type: "Withdrawal",
          expected: -100,
        },
        debit_positive: { amount: 100, type: "Debit Card", expected: -100 },
        debit_negative: { amount: -100, type: "Debit Card", expected: -100 },
        transfer_maintain: { amount: -500, type: "Transfer", expected: -500 },
      },
    },
    analysis: {
      monthlySummary: [], // Will be validated by structure and calculations
      overallSummary: {
        totalIncome: 6000.0,
        totalExpenses: 825.0,
        netSavings: 5175.0,
        transactionCount: 6,
        dateRange: { start: "2024-01-15", end: "2024-02-15" },
        balanceSource: "original",
      },
      balanceHistory: [], // Will be validated by structure and chronological order
      typeSummary: [], // Will be validated by structure and percentage calculations
    },
    visualization: {
      monthlyCharts: [], // Will be validated by structure and data consistency
      balanceChart: {
        labels: [],
        datasets: [],
      },
      typeChart: {
        labels: [],
        datasets: [],
      },
      textualSummary: [], // Will be validated by content and language
    },
  };
}

/**
 * Implementation of the shared contract test suite
 */
export class SharedContractTestSuite implements ServiceContractTestSuite {
  public readonly fixtures: ContractTestFixtures;
  public readonly expectations: ContractTestExpectations;

  constructor() {
    this.fixtures = createContractTestFixtures();
    this.expectations = createContractTestExpectations();
  }

  /**
   * Validates CsvPort implementation against contract requirements
   */
  async validateCsvPort(csvService: CsvPort): Promise<ContractTestResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const testCases: ContractTestResult["testCases"] = [];

    try {
      // Test 1: Method existence
      const startTime = performance.now();

      if (typeof csvService.validateAndParse !== "function") {
        errors.push("CsvPort missing validateAndParse method");
      }
      if (typeof csvService.normalizeTransactions !== "function") {
        errors.push("CsvPort missing normalizeTransactions method");
      }
      if (typeof csvService.normalizeDate !== "function") {
        errors.push("CsvPort missing normalizeDate method");
      }
      if (typeof csvService.canonicalizeAmount !== "function") {
        errors.push("CsvPort missing canonicalizeAmount method");
      }

      testCases.push({
        name: "Method existence validation",
        passed: errors.length === 0,
        error: errors.length > 0 ? errors.join(", ") : undefined,
        duration: performance.now() - startTime,
      });

      // Test 2: Date normalization
      const dateTestStart = performance.now();
      try {
        const dateTests = this.expectations.normalization.dateNormalization;
        for (const [input, expected] of Object.entries(dateTests)) {
          const result = csvService.normalizeDate(input);
          if (result !== expected) {
            errors.push(
              `Date normalization failed: ${input} -> ${result}, expected ${expected}`
            );
          }
        }
        testCases.push({
          name: "Date normalization",
          passed: true,
          duration: performance.now() - dateTestStart,
        });
      } catch (error) {
        errors.push(`Date normalization error: ${error}`);
        testCases.push({
          name: "Date normalization",
          passed: false,
          error: String(error),
          duration: performance.now() - dateTestStart,
        });
      }

      // Test 3: Amount canonicalization
      const amountTestStart = performance.now();
      try {
        const amountTests =
          this.expectations.normalization.amountCanonicalization;
        for (const [testName, testCase] of Object.entries(amountTests)) {
          const result = csvService.canonicalizeAmount(
            testCase.amount,
            testCase.type
          );
          if (result !== testCase.expected) {
            errors.push(
              `Amount canonicalization failed (${testName}): ${testCase.amount} (${testCase.type}) -> ${result}, expected ${testCase.expected}`
            );
          }
        }
        testCases.push({
          name: "Amount canonicalization",
          passed: true,
          duration: performance.now() - amountTestStart,
        });
      } catch (error) {
        errors.push(`Amount canonicalization error: ${error}`);
        testCases.push({
          name: "Amount canonicalization",
          passed: false,
          error: String(error),
          duration: performance.now() - amountTestStart,
        });
      }

      // Test 4: Transaction normalization
      const normalizationTestStart = performance.now();
      try {
        const normalized = csvService.normalizeTransactions(
          this.fixtures.rawTransactions
        );

        if (!Array.isArray(normalized)) {
          errors.push("normalizeTransactions must return an array");
        } else {
          // Validate structure
          for (const transaction of normalized) {
            if (
              !transaction.Date ||
              !transaction.Description ||
              !transaction.Type
            ) {
              errors.push("Normalized transaction missing required fields");
              break;
            }

            // Validate type normalization
            const validTypes = [
              "Debit Card",
              "Withdrawal",
              "Deposit",
              "Roundup",
              "Transfer",
              "Other",
            ];
            if (!validTypes.includes(transaction.Type)) {
              errors.push(`Invalid normalized type: ${transaction.Type}`);
            }
          }
        }

        testCases.push({
          name: "Transaction normalization",
          passed: errors.length === 0,
          duration: performance.now() - normalizationTestStart,
        });
      } catch (error) {
        errors.push(`Transaction normalization error: ${error}`);
        testCases.push({
          name: "Transaction normalization",
          passed: false,
          error: String(error),
          duration: performance.now() - normalizationTestStart,
        });
      }
    } catch (error) {
      errors.push(`CsvPort validation failed: ${error}`);
    }

    return {
      passed: errors.length === 0,
      errors,
      warnings,
      testCases,
    };
  }

  /**
   * Validates AnalysisPort implementation against contract requirements
   */
  async validateAnalysisPort(
    analysisService: AnalysisPort
  ): Promise<ContractTestResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const testCases: ContractTestResult["testCases"] = [];

    try {
      // Test 1: Method existence
      const startTime = performance.now();

      if (typeof analysisService.calculateMonthlySummary !== "function") {
        errors.push("AnalysisPort missing calculateMonthlySummary method");
      }
      if (typeof analysisService.calculateOverallSummary !== "function") {
        errors.push("AnalysisPort missing calculateOverallSummary method");
      }
      if (typeof analysisService.generateBalanceHistory !== "function") {
        errors.push("AnalysisPort missing generateBalanceHistory method");
      }
      if (typeof analysisService.groupByTransactionType !== "function") {
        errors.push("AnalysisPort missing groupByTransactionType method");
      }

      testCases.push({
        name: "Method existence validation",
        passed: errors.length === 0,
        error: errors.length > 0 ? errors.join(", ") : undefined,
        duration: performance.now() - startTime,
      });

      // Test 2: Monthly summary calculation
      const monthlyTestStart = performance.now();
      try {
        const monthlySummary = analysisService.calculateMonthlySummary(
          this.fixtures.normalizedTransactions
        );

        if (!Array.isArray(monthlySummary)) {
          errors.push("calculateMonthlySummary must return an array");
        } else {
          // Validate structure
          for (const month of monthlySummary) {
            if (
              typeof month.month !== "string" ||
              typeof month.totalIncome !== "number" ||
              typeof month.totalExpenses !== "number" ||
              typeof month.savings !== "number" ||
              typeof month.transactionCount !== "number" ||
              typeof month.isCurrentMonth !== "boolean"
            ) {
              errors.push("Monthly summary has invalid structure");
              break;
            }

            // Validate calculations
            if (
              Math.abs(
                month.savings - (month.totalIncome - month.totalExpenses)
              ) > 0.01
            ) {
              errors.push(
                `Monthly savings calculation error: ${month.savings} !== ${
                  month.totalIncome - month.totalExpenses
                }`
              );
            }
          }

          // Validate chronological order
          for (let i = 1; i < monthlySummary.length; i++) {
            if (monthlySummary[i].month < monthlySummary[i - 1].month) {
              errors.push("Monthly summary not in chronological order");
              break;
            }
          }
        }

        testCases.push({
          name: "Monthly summary calculation",
          passed: errors.length === 0,
          duration: performance.now() - monthlyTestStart,
        });
      } catch (error) {
        errors.push(`Monthly summary calculation error: ${error}`);
        testCases.push({
          name: "Monthly summary calculation",
          passed: false,
          error: String(error),
          duration: performance.now() - monthlyTestStart,
        });
      }

      // Test 3: Overall summary calculation
      const overallTestStart = performance.now();
      try {
        const overallSummary = analysisService.calculateOverallSummary(
          this.fixtures.normalizedTransactions
        );

        // Validate structure
        if (
          typeof overallSummary.totalIncome !== "number" ||
          typeof overallSummary.totalExpenses !== "number" ||
          typeof overallSummary.netSavings !== "number" ||
          typeof overallSummary.transactionCount !== "number" ||
          !overallSummary.dateRange ||
          typeof overallSummary.dateRange.start !== "string" ||
          typeof overallSummary.dateRange.end !== "string" ||
          !["original", "calculated"].includes(overallSummary.balanceSource)
        ) {
          errors.push("Overall summary has invalid structure");
        }

        // Validate calculations
        if (
          Math.abs(
            overallSummary.netSavings -
              (overallSummary.totalIncome - overallSummary.totalExpenses)
          ) > 0.01
        ) {
          errors.push(
            `Overall savings calculation error: ${
              overallSummary.netSavings
            } !== ${overallSummary.totalIncome - overallSummary.totalExpenses}`
          );
        }

        testCases.push({
          name: "Overall summary calculation",
          passed: errors.length === 0,
          duration: performance.now() - overallTestStart,
        });
      } catch (error) {
        errors.push(`Overall summary calculation error: ${error}`);
        testCases.push({
          name: "Overall summary calculation",
          passed: false,
          error: String(error),
          duration: performance.now() - overallTestStart,
        });
      }

      // Test 4: Balance history generation
      const balanceTestStart = performance.now();
      try {
        const balanceHistory = analysisService.generateBalanceHistory(
          this.fixtures.normalizedTransactions
        );

        if (!Array.isArray(balanceHistory)) {
          errors.push("generateBalanceHistory must return an array");
        } else {
          // Validate structure
          for (const point of balanceHistory) {
            if (
              typeof point.date !== "string" ||
              typeof point.balance !== "number" ||
              typeof point.isCalculated !== "boolean"
            ) {
              errors.push("Balance history point has invalid structure");
              break;
            }
          }

          // Validate chronological order
          for (let i = 1; i < balanceHistory.length; i++) {
            if (
              new Date(balanceHistory[i].date) <
              new Date(balanceHistory[i - 1].date)
            ) {
              errors.push("Balance history not in chronological order");
              break;
            }
          }
        }

        testCases.push({
          name: "Balance history generation",
          passed: errors.length === 0,
          duration: performance.now() - balanceTestStart,
        });
      } catch (error) {
        errors.push(`Balance history generation error: ${error}`);
        testCases.push({
          name: "Balance history generation",
          passed: false,
          error: String(error),
          duration: performance.now() - balanceTestStart,
        });
      }

      // Test 5: Transaction type grouping
      const typeTestStart = performance.now();
      try {
        const typeSummary = analysisService.groupByTransactionType(
          this.fixtures.normalizedTransactions
        );

        if (!Array.isArray(typeSummary)) {
          errors.push("groupByTransactionType must return an array");
        } else {
          // Validate structure
          for (const typeGroup of typeSummary) {
            if (
              typeof typeGroup.type !== "string" ||
              typeof typeGroup.amount !== "number" ||
              typeof typeGroup.count !== "number" ||
              typeof typeGroup.percentage !== "number"
            ) {
              errors.push("Type summary has invalid structure");
              break;
            }
          }

          // Validate percentages sum to ~100%
          const totalPercentage = typeSummary.reduce(
            (sum, item) => sum + item.percentage,
            0
          );
          if (Math.abs(totalPercentage - 100) > 1) {
            // Allow 1% tolerance for rounding
            warnings.push(
              `Type percentages sum to ${totalPercentage}%, expected ~100%`
            );
          }
        }

        testCases.push({
          name: "Transaction type grouping",
          passed: errors.length === 0,
          duration: performance.now() - typeTestStart,
        });
      } catch (error) {
        errors.push(`Transaction type grouping error: ${error}`);
        testCases.push({
          name: "Transaction type grouping",
          passed: false,
          error: String(error),
          duration: performance.now() - typeTestStart,
        });
      }
    } catch (error) {
      errors.push(`AnalysisPort validation failed: ${error}`);
    }

    return {
      passed: errors.length === 0,
      errors,
      warnings,
      testCases,
    };
  }

  /**
   * Validates VizPort implementation against contract requirements
   */
  async validateVizPort(vizService: VizPort): Promise<ContractTestResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const testCases: ContractTestResult["testCases"] = [];

    try {
      // Test 1: Method existence
      const startTime = performance.now();

      if (typeof vizService.prepareMonthlyChartData !== "function") {
        errors.push("VizPort missing prepareMonthlyChartData method");
      }
      if (typeof vizService.prepareBalanceChartData !== "function") {
        errors.push("VizPort missing prepareBalanceChartData method");
      }
      if (typeof vizService.prepareTypeChartData !== "function") {
        errors.push("VizPort missing prepareTypeChartData method");
      }
      if (typeof vizService.generateTextualSummary !== "function") {
        errors.push("VizPort missing generateTextualSummary method");
      }

      testCases.push({
        name: "Method existence validation",
        passed: errors.length === 0,
        error: errors.length > 0 ? errors.join(", ") : undefined,
        duration: performance.now() - startTime,
      });

      // Test 2: Monthly chart data preparation
      const monthlyChartTestStart = performance.now();
      try {
        const monthlyChartData = vizService.prepareMonthlyChartData(
          this.fixtures.monthlyData
        );

        if (!Array.isArray(monthlyChartData)) {
          errors.push("prepareMonthlyChartData must return an array");
        } else {
          // Validate chart structure
          for (const chart of monthlyChartData) {
            if (
              !chart.labels ||
              !Array.isArray(chart.labels) ||
              !chart.datasets ||
              !Array.isArray(chart.datasets)
            ) {
              errors.push("Monthly chart data has invalid structure");
              break;
            }

            // Validate datasets
            for (const dataset of chart.datasets) {
              if (
                !dataset.label ||
                !Array.isArray(dataset.data) ||
                !Array.isArray(dataset.backgroundColor)
              ) {
                errors.push("Monthly chart dataset has invalid structure");
                break;
              }
            }
          }
        }

        testCases.push({
          name: "Monthly chart data preparation",
          passed: errors.length === 0,
          duration: performance.now() - monthlyChartTestStart,
        });
      } catch (error) {
        errors.push(`Monthly chart data preparation error: ${error}`);
        testCases.push({
          name: "Monthly chart data preparation",
          passed: false,
          error: String(error),
          duration: performance.now() - monthlyChartTestStart,
        });
      }

      // Test 3: Balance chart data preparation
      const balanceChartTestStart = performance.now();
      try {
        const balanceChartData = vizService.prepareBalanceChartData(
          this.fixtures.balanceHistory
        );

        // Validate chart structure
        if (
          !balanceChartData.labels ||
          !Array.isArray(balanceChartData.labels) ||
          !balanceChartData.datasets ||
          !Array.isArray(balanceChartData.datasets)
        ) {
          errors.push("Balance chart data has invalid structure");
        } else {
          // Validate datasets
          for (const dataset of balanceChartData.datasets) {
            if (!dataset.label || !Array.isArray(dataset.data)) {
              errors.push("Balance chart dataset has invalid structure");
              break;
            }
          }
        }

        testCases.push({
          name: "Balance chart data preparation",
          passed: errors.length === 0,
          duration: performance.now() - balanceChartTestStart,
        });
      } catch (error) {
        errors.push(`Balance chart data preparation error: ${error}`);
        testCases.push({
          name: "Balance chart data preparation",
          passed: false,
          error: String(error),
          duration: performance.now() - balanceChartTestStart,
        });
      }

      // Test 4: Type chart data preparation
      const typeChartTestStart = performance.now();
      try {
        const typeChartData = vizService.prepareTypeChartData(
          this.fixtures.typeSummary
        );

        // Validate chart structure
        if (
          !typeChartData.labels ||
          !Array.isArray(typeChartData.labels) ||
          !typeChartData.datasets ||
          !Array.isArray(typeChartData.datasets)
        ) {
          errors.push("Type chart data has invalid structure");
        } else {
          // Validate datasets
          for (const dataset of typeChartData.datasets) {
            if (
              !dataset.label ||
              !Array.isArray(dataset.data) ||
              !Array.isArray(dataset.backgroundColor)
            ) {
              errors.push("Type chart dataset has invalid structure");
              break;
            }
          }
        }

        testCases.push({
          name: "Type chart data preparation",
          passed: errors.length === 0,
          duration: performance.now() - typeChartTestStart,
        });
      } catch (error) {
        errors.push(`Type chart data preparation error: ${error}`);
        testCases.push({
          name: "Type chart data preparation",
          passed: false,
          error: String(error),
          duration: performance.now() - typeChartTestStart,
        });
      }

      // Test 5: Textual summary generation
      const textualTestStart = performance.now();
      try {
        const textualSummary = vizService.generateTextualSummary(
          this.fixtures.monthlyData
        );

        if (!Array.isArray(textualSummary)) {
          errors.push("generateTextualSummary must return an array");
        } else {
          // Validate content
          for (const summary of textualSummary) {
            if (typeof summary !== "string" || summary.length === 0) {
              errors.push("Textual summary contains invalid entries");
              break;
            }
          }

          // Check for Spanish content (basic validation)
          const hasSpanishContent = textualSummary.some(
            (summary) =>
              summary.includes("mes") ||
              summary.includes("gastos") ||
              summary.includes("ingresos") ||
              summary.includes("ahorro")
          );

          if (!hasSpanishContent && textualSummary.length > 0) {
            warnings.push("Textual summary may not be in Spanish as expected");
          }
        }

        testCases.push({
          name: "Textual summary generation",
          passed: errors.length === 0,
          duration: performance.now() - textualTestStart,
        });
      } catch (error) {
        errors.push(`Textual summary generation error: ${error}`);
        testCases.push({
          name: "Textual summary generation",
          passed: false,
          error: String(error),
          duration: performance.now() - textualTestStart,
        });
      }
    } catch (error) {
      errors.push(`VizPort validation failed: ${error}`);
    }

    return {
      passed: errors.length === 0,
      errors,
      warnings,
      testCases,
    };
  }

  /**
   * Runs complete contract validation suite against all ports
   */
  async validateAllPorts(services: {
    csv: CsvPort;
    analysis: AnalysisPort;
    viz: VizPort;
  }): Promise<ContractTestSuiteResult> {
    const startTime = performance.now();

    const csvResult = await this.validateCsvPort(services.csv);
    const analysisResult = await this.validateAnalysisPort(services.analysis);
    const vizResult = await this.validateVizPort(services.viz);

    const totalTests =
      csvResult.testCases.length +
      analysisResult.testCases.length +
      vizResult.testCases.length;
    const passedTests =
      csvResult.testCases.filter((t) => t.passed).length +
      analysisResult.testCases.filter((t) => t.passed).length +
      vizResult.testCases.filter((t) => t.passed).length;
    const failedTests = totalTests - passedTests;

    const allPassed =
      csvResult.passed && analysisResult.passed && vizResult.passed;

    return {
      allPassed,
      csvPort: csvResult,
      analysisPort: analysisResult,
      vizPort: vizResult,
      summary: {
        totalTests,
        passedTests,
        failedTests,
        totalDuration: performance.now() - startTime,
      },
    };
  }
}

/**
 * Creates a new instance of the shared contract test suite
 */
export function createContractTestSuite(): ServiceContractTestSuite {
  return new SharedContractTestSuite();
}
