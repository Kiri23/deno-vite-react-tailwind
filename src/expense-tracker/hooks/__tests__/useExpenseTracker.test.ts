import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useExpenseTracker } from "../useExpenseTracker";
import {
  CsvService,
  AnalysisService,
  VizService,
  ExpenseAnalysisService,
} from "../../services";

// Mock the services
vi.mock("../../services", () => {
  const CsvServiceMock = vi.fn().mockImplementation(() => ({
    normalizeTransactions: vi.fn(),
  }));
  CsvServiceMock.validateAndParse = vi.fn();

  return {
    CsvService: CsvServiceMock,
    AnalysisService: vi.fn(),
    VizService: vi.fn(),
    ExpenseAnalysisService: vi.fn().mockImplementation(() => ({
      getAvailableMonths: vi.fn().mockReturnValue([]),
      getDefaultAnalysisMonth: vi.fn().mockReturnValue(null),
      analyzeMonth: vi.fn().mockReturnValue(null),
    })),
  };
});

describe("useExpenseTracker", () => {
  const mockCsvService = CsvService as any;
  const mockAnalysisService = vi.mocked(AnalysisService);
  const mockVizService = vi.mocked(VizService);

  // Mock data
  const mockTransactions = [
    {
      Date: "2024-01-15",
      Description: "Grocery Store",
      Type: "Debit Card",
      Amount: -50.0,
      "Current balance": 1000.0,
      Status: "Posted",
    },
    {
      Date: "2024-01-20",
      Description: "Salary",
      Type: "Deposit",
      Amount: 2000.0,
      "Current balance": 3000.0,
      Status: "Posted",
    },
  ];

  const mockMonthlyData = [
    {
      month: "2024-01",
      totalIncome: 2000,
      totalExpenses: 50,
      savings: 1950,
      transactionCount: 2,
      isCurrentMonth: false,
    },
  ];

  const mockSummary = {
    totalIncome: 2000,
    totalExpenses: 50,
    netSavings: 1950,
    transactionCount: 2,
    dateRange: { start: "2024-01-15", end: "2024-01-20" },
    balanceSource: "original" as const,
  };

  const mockBalanceHistory = [
    { date: "2024-01-15", balance: 1000, isCalculated: false },
    { date: "2024-01-20", balance: 3000, isCalculated: false },
  ];

  const mockTypeBreakdown = [
    { type: "Debit Card", amount: 50, count: 1, percentage: 100 },
  ];

  const mockTextualSummaries = [
    "En enero 2024 ingresaste $2,000, gastaste $50, sobrante $1,950 (ahorros positivos).",
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Initial State", () => {
    it("should initialize with empty state", () => {
      const { result } = renderHook(() => useExpenseTracker());

      expect(result.current.transactions).toEqual([]);
      expect(result.current.monthlyData).toEqual([]);
      expect(result.current.summary).toBeNull();
      expect(result.current.balanceHistory).toEqual([]);
      expect(result.current.typeBreakdown).toEqual([]);
      expect(result.current.textualSummaries).toEqual([]);
      expect(result.current.showCurrentMonth).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.validationResult).toBeNull();
    });

    it("should provide action functions", () => {
      const { result } = renderHook(() => useExpenseTracker());

      expect(typeof result.current.processCSVFile).toBe("function");
      expect(typeof result.current.toggleCurrentMonth).toBe("function");
      expect(typeof result.current.clearData).toBe("function");
    });
  });

  describe("processCSVFile", () => {
    it("should successfully process a valid CSV file", async () => {
      // Setup mocks
      mockCsvService.validateAndParse.mockResolvedValue({
        isValid: true,
        transactions: mockTransactions,
        metadata: {
          rowCount: 2,
          dateRange: { start: "2024-01-15", end: "2024-01-20" },
          balanceSource: "original",
        },
      });

      const mockAnalysisInstance = {
        calculateMonthlySummary: vi.fn().mockReturnValue(mockMonthlyData),
        calculateOverallSummary: vi.fn().mockReturnValue(mockSummary),
        generateBalanceHistory: vi.fn().mockReturnValue(mockBalanceHistory),
        groupByTransactionType: vi.fn().mockReturnValue(mockTypeBreakdown),
      };
      mockAnalysisService.mockImplementation(() => mockAnalysisInstance);

      const mockVizInstance = {
        generateTextualSummary: vi.fn().mockReturnValue(mockTextualSummaries),
        prepareMonthlyChartData: vi.fn().mockReturnValue([]),
        prepareBalanceChartData: vi.fn().mockReturnValue([]),
        prepareTypeChartData: vi.fn().mockReturnValue([]),
      };
      mockVizService.mockImplementation(() => mockVizInstance);

      const { result } = renderHook(() => useExpenseTracker());
      const mockFile = new File(["test,data"], "test.csv", {
        type: "text/csv",
      });

      // Process file
      await act(async () => {
        await result.current.processCSVFile(mockFile);
      });

      // Verify state updates
      expect(result.current.transactions).toEqual(mockTransactions);
      expect(result.current.monthlyData).toEqual(mockMonthlyData);
      expect(result.current.summary).toEqual(mockSummary);
      expect(result.current.balanceHistory).toEqual(mockBalanceHistory);
      expect(result.current.typeBreakdown).toEqual(mockTypeBreakdown);
      expect(result.current.textualSummaries).toEqual(mockTextualSummaries);
      expect(result.current.isLoading).toBe(false);

      // Verify service calls
      expect(mockCsvService.validateAndParse).toHaveBeenCalledWith(mockFile);
      expect(mockAnalysisInstance.calculateMonthlySummary).toHaveBeenCalledWith(
        mockTransactions,
        true // excludeCurrentMonth = !showCurrentMonth (false)
      );
      expect(mockAnalysisInstance.calculateOverallSummary).toHaveBeenCalledWith(
        mockTransactions
      );
      expect(mockAnalysisInstance.generateBalanceHistory).toHaveBeenCalledWith(
        mockTransactions
      );
      expect(mockAnalysisInstance.groupByTransactionType).toHaveBeenCalledWith(
        mockTransactions
      );
      expect(mockVizInstance.generateTextualSummary).toHaveBeenCalledWith(
        mockMonthlyData
      );
    });

    it("should handle CSV validation errors", async () => {
      const mockErrors = [
        {
          type: "missing_columns" as const,
          message: "Faltan columnas requeridas: Date, Amount",
          examples: ["Date", "Amount"],
        },
      ];

      mockCsvService.validateAndParse.mockResolvedValue({
        isValid: false,
        errors: mockErrors,
        metadata: {
          rowCount: 0,
          dateRange: { start: "", end: "" },
          balanceSource: "original",
        },
      });

      const { result } = renderHook(() => useExpenseTracker());
      const mockFile = new File(["invalid,data"], "test.csv", {
        type: "text/csv",
      });

      await act(async () => {
        await result.current.processCSVFile(mockFile);
      });

      // Verify error state
      expect(result.current.validationResult?.isValid).toBe(false);
      expect(result.current.validationResult?.errors?.[0].type).toBe(
        "missing_columns"
      );
      expect(result.current.validationResult?.errors?.[0].message).toBe(
        "Faltan columnas requeridas: Date, Amount"
      );
      // Enhanced error handling now provides more detailed examples
      expect(result.current.validationResult?.errors?.[0].examples).toContain(
        "Verifica que el archivo incluya: Date, Description, Type, Amount, Current balance, Status"
      );
      expect(result.current.transactions).toEqual([]);
      expect(result.current.monthlyData).toEqual([]);
      expect(result.current.summary).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it("should handle unexpected processing errors", async () => {
      mockCsvService.validateAndParse.mockRejectedValue(
        new Error("Network error")
      );

      const { result } = renderHook(() => useExpenseTracker());
      const mockFile = new File(["test,data"], "test.csv", {
        type: "text/csv",
      });

      await act(async () => {
        await result.current.processCSVFile(mockFile);
      });

      // Verify error handling
      expect(result.current.validationResult?.isValid).toBe(false);
      expect(result.current.validationResult?.errors?.[0].message).toContain(
        "Network error"
      );
      expect(result.current.transactions).toEqual([]);
      expect(result.current.isLoading).toBe(false);
    });

    it("should set loading state during processing", async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockCsvService.validateAndParse.mockReturnValue(promise);

      const { result } = renderHook(() => useExpenseTracker());
      const mockFile = new File(["test,data"], "test.csv", {
        type: "text/csv",
      });

      // Start processing
      act(() => {
        result.current.processCSVFile(mockFile);
      });

      // Verify loading state
      expect(result.current.isLoading).toBe(true);

      // Resolve promise
      await act(async () => {
        resolvePromise!({
          isValid: true,
          transactions: mockTransactions,
          metadata: {
            rowCount: 2,
            dateRange: { start: "2024-01-15", end: "2024-01-20" },
            balanceSource: "original",
          },
        });
      });

      // Verify loading state cleared
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("toggleCurrentMonth", () => {
    it("should toggle current month setting and recalculate data", async () => {
      // First, process a file to have data
      mockCsvService.validateAndParse.mockResolvedValue({
        isValid: true,
        transactions: mockTransactions,
        metadata: {
          rowCount: 2,
          dateRange: { start: "2024-01-15", end: "2024-01-20" },
          balanceSource: "original",
        },
      });

      const mockAnalysisInstance = {
        calculateMonthlySummary: vi.fn().mockReturnValue(mockMonthlyData),
        calculateOverallSummary: vi.fn().mockReturnValue(mockSummary),
        generateBalanceHistory: vi.fn().mockReturnValue(mockBalanceHistory),
        groupByTransactionType: vi.fn().mockReturnValue(mockTypeBreakdown),
      };
      mockAnalysisService.mockImplementation(() => mockAnalysisInstance);

      const mockVizInstance = {
        generateTextualSummary: vi.fn().mockReturnValue(mockTextualSummaries),
        prepareMonthlyChartData: vi.fn().mockReturnValue([]),
        prepareBalanceChartData: vi.fn().mockReturnValue([]),
        prepareTypeChartData: vi.fn().mockReturnValue([]),
      };
      mockVizService.mockImplementation(() => mockVizInstance);

      const { result } = renderHook(() => useExpenseTracker());
      const mockFile = new File(["test,data"], "test.csv", {
        type: "text/csv",
      });

      // Process file first
      await act(async () => {
        await result.current.processCSVFile(mockFile);
      });

      // Clear previous calls
      vi.clearAllMocks();
      mockAnalysisService.mockImplementation(() => mockAnalysisInstance);
      mockVizService.mockImplementation(() => mockVizInstance);

      // Toggle current month
      act(() => {
        result.current.toggleCurrentMonth(true);
      });

      // Verify state change
      expect(result.current.showCurrentMonth).toBe(true);

      // Verify recalculation with new setting
      expect(mockAnalysisInstance.calculateMonthlySummary).toHaveBeenCalledWith(
        mockTransactions,
        false // excludeCurrentMonth = !show (true)
      );
      expect(mockVizInstance.generateTextualSummary).toHaveBeenCalledWith(
        mockMonthlyData
      );
    });

    it("should not recalculate if no transactions exist", () => {
      const { result } = renderHook(() => useExpenseTracker());

      act(() => {
        result.current.toggleCurrentMonth(true);
      });

      expect(result.current.showCurrentMonth).toBe(true);
      // Services should not be called since there are no transactions
      expect(mockAnalysisService).not.toHaveBeenCalled();
      expect(mockVizService).not.toHaveBeenCalled();
    });
  });

  describe("clearData", () => {
    it("should reset all state to initial values", async () => {
      // First, process a file to have data
      mockCsvService.validateAndParse.mockResolvedValue({
        isValid: true,
        transactions: mockTransactions,
        metadata: {
          rowCount: 2,
          dateRange: { start: "2024-01-15", end: "2024-01-20" },
          balanceSource: "original",
        },
      });

      const mockAnalysisInstance = {
        calculateMonthlySummary: vi.fn().mockReturnValue(mockMonthlyData),
        calculateOverallSummary: vi.fn().mockReturnValue(mockSummary),
        generateBalanceHistory: vi.fn().mockReturnValue(mockBalanceHistory),
        groupByTransactionType: vi.fn().mockReturnValue(mockTypeBreakdown),
      };
      mockAnalysisService.mockImplementation(() => mockAnalysisInstance);

      const mockVizInstance = {
        generateTextualSummary: vi.fn().mockReturnValue(mockTextualSummaries),
        prepareMonthlyChartData: vi.fn().mockReturnValue([]),
        prepareBalanceChartData: vi.fn().mockReturnValue([]),
        prepareTypeChartData: vi.fn().mockReturnValue([]),
      };
      mockVizService.mockImplementation(() => mockVizInstance);

      const { result } = renderHook(() => useExpenseTracker());
      const mockFile = new File(["test,data"], "test.csv", {
        type: "text/csv",
      });

      // Process file first
      await act(async () => {
        await result.current.processCSVFile(mockFile);
      });

      // Verify data exists
      expect(result.current.transactions).toEqual(mockTransactions);
      expect(result.current.monthlyData).toEqual(mockMonthlyData);

      // Clear data
      act(() => {
        result.current.clearData();
      });

      // Verify all state is reset
      expect(result.current.transactions).toEqual([]);
      expect(result.current.monthlyData).toEqual([]);
      expect(result.current.summary).toBeNull();
      expect(result.current.balanceHistory).toEqual([]);
      expect(result.current.typeBreakdown).toEqual([]);
      expect(result.current.textualSummaries).toEqual([]);
      expect(result.current.showCurrentMonth).toBe(false);
      expect(result.current.validationResult).toBeNull();
    });
  });

  describe("Service Integration", () => {
    it("should maintain proper data flow between services", async () => {
      mockCsvService.validateAndParse.mockResolvedValue({
        isValid: true,
        transactions: mockTransactions,
        metadata: {
          rowCount: 2,
          dateRange: { start: "2024-01-15", end: "2024-01-20" },
          balanceSource: "original",
        },
      });

      const mockAnalysisInstance = {
        calculateMonthlySummary: vi.fn().mockReturnValue(mockMonthlyData),
        calculateOverallSummary: vi.fn().mockReturnValue(mockSummary),
        generateBalanceHistory: vi.fn().mockReturnValue(mockBalanceHistory),
        groupByTransactionType: vi.fn().mockReturnValue(mockTypeBreakdown),
      };
      mockAnalysisService.mockImplementation(() => mockAnalysisInstance);

      const mockVizInstance = {
        generateTextualSummary: vi.fn().mockReturnValue(mockTextualSummaries),
        prepareMonthlyChartData: vi.fn().mockReturnValue([]),
        prepareBalanceChartData: vi.fn().mockReturnValue([]),
        prepareTypeChartData: vi.fn().mockReturnValue([]),
      };
      mockVizService.mockImplementation(() => mockVizInstance);

      const { result } = renderHook(() => useExpenseTracker());
      const mockFile = new File(["test,data"], "test.csv", {
        type: "text/csv",
      });

      await act(async () => {
        await result.current.processCSVFile(mockFile);
      });

      // Verify service instantiation and method calls
      expect(mockAnalysisService).toHaveBeenCalledTimes(1);
      expect(mockVizService).toHaveBeenCalledTimes(1);

      // Verify data flow: CsvService -> AnalysisService -> VizService
      expect(mockAnalysisInstance.calculateMonthlySummary).toHaveBeenCalledWith(
        mockTransactions,
        true
      );
      expect(mockVizInstance.generateTextualSummary).toHaveBeenCalledWith(
        mockMonthlyData
      );
    });
  });
});
