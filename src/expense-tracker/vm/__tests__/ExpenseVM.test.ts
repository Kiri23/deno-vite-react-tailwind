/**
 * ExpenseVM Tests
 *
 * Tests for the ref-based state management and command orchestration
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  createExpenseVM,
  type Services,
  type ExpenseState,
} from "../ExpenseVM.ts";
import type { CsvPort, AnalysisPort, VizPort } from "../../services/ports.ts";
import type {
  RawTransaction,
  TransactionData,
  MonthlyData,
} from "../../types/index.ts";

// Mock services
const createMockServices = (): Services => {
  const mockCsvService: CsvPort = {
    validateAndParse: vi.fn(),
    normalizeTransactions: vi.fn(),
    normalizeDate: vi.fn(),
    canonicalizeAmount: vi.fn(),
  };

  const mockAnalysisService: AnalysisPort = {
    calculateMonthlySummary: vi.fn(),
    calculateOverallSummary: vi.fn(),
    generateBalanceHistory: vi.fn(),
    groupByTransactionType: vi.fn(),
  };

  const mockVizService: VizPort = {
    prepareMonthlyChartData: vi.fn(),
    prepareBalanceChartData: vi.fn(),
    prepareTypeChartData: vi.fn(),
    generateTextualSummary: vi.fn(),
  };

  return {
    csv: mockCsvService,
    analysis: mockAnalysisService,
    viz: mockVizService,
  };
};

describe("ExpenseVM", () => {
  let services: Services;
  let vm: ReturnType<typeof createExpenseVM>;

  beforeEach(() => {
    services = createMockServices();
    vm = createExpenseVM(services);
  });

  describe("Initial State", () => {
    it("should have correct initial state", () => {
      const state = vm.getState();

      expect(state.raw).toEqual([]);
      expect(state.normalized).toEqual([]);
      expect(state.monthly).toEqual([]);
      expect(state.range).toEqual({});
      expect(state.filters).toEqual({ categories: [] });
      expect(state.charts.monthly).toEqual([]);
      expect(state.insights).toEqual({});
      expect(state.loading).toEqual({
        csv: false,
        analysis: false,
        charts: false,
      });
      expect(state.errors).toEqual({});
    });
  });

  describe("State Management", () => {
    it("should notify subscribers on state changes", () => {
      const listener = vi.fn();
      const unsubscribe = vm.subscribe(listener);

      vm.commands.setRange({ from: "2025-01-01", to: "2025-01-31" });

      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();
      vm.commands.setRange({ from: "2025-02-01", to: "2025-02-28" });

      expect(listener).toHaveBeenCalledTimes(1); // Should not be called after unsubscribe
    });

    it("should update range correctly", () => {
      const range = { from: "2025-01-01", to: "2025-01-31" };
      vm.commands.setRange(range);

      const state = vm.getState();
      expect(state.range).toEqual(range);
    });

    it("should update filters correctly", () => {
      const filters = { categories: ["Debit Card", "Withdrawal"] };
      vm.commands.setFilters(filters);

      const state = vm.getState();
      expect(state.filters).toEqual(filters);
    });
  });

  describe("CSV Loading", () => {
    it("should handle successful CSV loading", async () => {
      const mockFile = new File(["test"], "test.csv", { type: "text/csv" });
      const mockTransactions: RawTransaction[] = [
        {
          Date: "1/15/2025",
          Description: "Test Transaction",
          Type: "Debit Card",
          Amount: -50.0,
          "Current balance": 1000.0,
          Status: "Posted",
        },
      ];

      vi.mocked(services.csv.validateAndParse).mockResolvedValue({
        isValid: true,
        transactions: mockTransactions,
        metadata: {
          rowCount: 1,
          dateRange: { start: "2025-01-15", end: "2025-01-15" },
          balanceSource: "original",
        },
      });

      await vm.commands.loadCsv(mockFile);

      const state = vm.getState();
      expect(state.raw).toEqual(mockTransactions);
      expect(state.loading.csv).toBe(false);
      expect(state.errors.csv).toBeUndefined();
    });

    it("should handle CSV validation errors", async () => {
      const mockFile = new File(["invalid"], "test.csv", { type: "text/csv" });
      const mockErrors = [
        {
          type: "missing_columns" as const,
          message: "Missing required columns",
        },
      ];

      vi.mocked(services.csv.validateAndParse).mockResolvedValue({
        isValid: false,
        errors: mockErrors,
        metadata: {
          rowCount: 0,
          dateRange: { start: "", end: "" },
          balanceSource: "calculated",
        },
      });

      await vm.commands.loadCsv(mockFile);

      const state = vm.getState();
      expect(state.raw).toEqual([]);
      expect(state.errors.csv).toEqual(mockErrors);
      expect(state.loading.csv).toBe(false);
    });
  });

  describe("Data Normalization", () => {
    it("should normalize raw transactions", async () => {
      const mockRaw: RawTransaction[] = [
        {
          Date: "1/15/2025",
          Description: "Test Transaction",
          Type: "DBT",
          Amount: -50.0,
          "Current balance": 1000.0,
          Status: "Posted",
        },
      ];

      const mockNormalized: TransactionData[] = [
        {
          Date: "2025-01-15",
          Description: "Test Transaction",
          Type: "Debit Card",
          Amount: -50.0,
          "Current balance": 1000.0,
          Status: "Posted",
        },
      ];

      // Set up initial state with raw data
      vm.commands.reset();
      const initialState = vm.getState();
      initialState.raw = mockRaw;

      vi.mocked(services.csv.normalizeTransactions).mockReturnValue(
        mockNormalized
      );

      await vm.commands.normalize();

      const state = vm.getState();
      expect(state.normalized).toEqual(mockNormalized);
      expect(services.csv.normalizeTransactions).toHaveBeenCalledWith(mockRaw);
    });

    it("should handle normalization errors", async () => {
      vi.mocked(services.csv.normalizeTransactions).mockImplementation(() => {
        throw new Error("Normalization failed");
      });

      await vm.commands.normalize();

      const state = vm.getState();
      expect(state.errors.analysis).toBe("No raw data to normalize");
    });
  });

  describe("Analysis", () => {
    it("should perform analysis on normalized data", async () => {
      const mockNormalized: TransactionData[] = [
        {
          Date: "2025-01-15",
          Description: "Test Transaction",
          Type: "Debit Card",
          Amount: -50.0,
          "Current balance": 1000.0,
          Status: "Posted",
        },
      ];

      const mockMonthly: MonthlyData[] = [
        {
          month: "2025-01",
          totalIncome: 0,
          totalExpenses: 50.0,
          savings: -50.0,
          transactionCount: 1,
          isCurrentMonth: false,
        },
      ];

      // Set up state with normalized data
      vm.commands.reset();
      const state = vm.getState();
      state.normalized = mockNormalized;

      vi.mocked(services.analysis.calculateMonthlySummary).mockReturnValue(
        mockMonthly
      );

      await vm.commands.analyze();

      const finalState = vm.getState();
      expect(finalState.monthly).toEqual(mockMonthly);
      expect(services.analysis.calculateMonthlySummary).toHaveBeenCalledWith(
        mockNormalized,
        true // excludeCurrent
      );
    });
  });

  describe("Chart Building", () => {
    it("should build charts from analysis data", () => {
      const mockMonthly: MonthlyData[] = [
        {
          month: "2025-01",
          totalIncome: 0,
          totalExpenses: 50.0,
          savings: -50.0,
          transactionCount: 1,
          isCurrentMonth: false,
        },
      ];

      const mockNormalized: TransactionData[] = [
        {
          Date: "2025-01-15",
          Description: "Test Transaction",
          Type: "Debit Card",
          Amount: -50.0,
          "Current balance": 1000.0,
          Status: "Posted",
        },
      ];

      // Set up state
      vm.commands.reset();
      const state = vm.getState();
      state.monthly = mockMonthly;
      state.normalized = mockNormalized;

      const mockChartData = [{ labels: ["Jan"], datasets: [] }];
      const mockBalanceChart = { labels: [], datasets: [] };
      const mockTypesChart = { labels: [], datasets: [] };

      vi.mocked(services.viz.prepareMonthlyChartData).mockReturnValue(
        mockChartData
      );
      vi.mocked(services.viz.prepareBalanceChartData).mockReturnValue(
        mockBalanceChart
      );
      vi.mocked(services.viz.prepareTypeChartData).mockReturnValue(
        mockTypesChart
      );
      vi.mocked(services.analysis.generateBalanceHistory).mockReturnValue([]);
      vi.mocked(services.analysis.groupByTransactionType).mockReturnValue([]);

      vm.commands.buildCharts();

      const finalState = vm.getState();
      expect(finalState.charts.monthly).toEqual(mockChartData);
      expect(finalState.charts.balance).toEqual(mockBalanceChart);
      expect(finalState.charts.types).toEqual(mockTypesChart);
    });
  });

  describe("Insights Generation", () => {
    it("should generate insights from monthly data", () => {
      const mockMonthly: MonthlyData[] = [
        {
          month: "2025-01",
          totalIncome: 1000,
          totalExpenses: 500,
          savings: 500,
          transactionCount: 10,
          isCurrentMonth: false,
        },
      ];

      // Set up state
      vm.commands.reset();
      const state = vm.getState();
      state.monthly = mockMonthly;

      const mockSummary = ["Enero fue un mes de ahorro con $500 guardados"];
      vi.mocked(services.viz.generateTextualSummary).mockReturnValue(
        mockSummary
      );

      vm.commands.explain();

      const finalState = vm.getState();
      expect(finalState.insights.summaryText).toBe(
        "Enero fue un mes de ahorro con $500 guardados"
      );
      expect(finalState.insights.annotations).toHaveLength(1);
      expect(finalState.insights.annotations![0]).toEqual({
        target: "month-2025-01",
        text: "2025-01: Ahorro de $500.00",
        type: "tooltip",
      });
    });
  });

  describe("Reset", () => {
    it("should reset state to initial values", () => {
      // Modify state
      vm.commands.setRange({ from: "2025-01-01", to: "2025-01-31" });
      vm.commands.setFilters({ categories: ["Debit Card"] });

      // Reset
      vm.commands.reset();

      const state = vm.getState();
      expect(state.range).toEqual({});
      expect(state.filters).toEqual({ categories: [] });
      expect(state.raw).toEqual([]);
      expect(state.normalized).toEqual([]);
      expect(state.monthly).toEqual([]);
    });
  });
});
