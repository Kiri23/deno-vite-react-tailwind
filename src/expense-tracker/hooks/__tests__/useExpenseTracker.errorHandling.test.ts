import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { useExpenseTracker } from "../useExpenseTracker";
import {
  CsvService,
  AnalysisService,
  VizService,
  ExpenseAnalysisService,
} from "../../services";
import { AppContextProvider } from "../../../app/context";

// Test wrapper component
function TestWrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(AppContextProvider, null, children);
}

// Mock the services
vi.mock("../../services", () => ({
  CsvService: {
    validateAndParse: vi.fn(),
  },
  AnalysisService: vi.fn().mockImplementation(() => ({
    calculateMonthlySummary: vi.fn(),
    calculateOverallSummary: vi.fn(),
    generateBalanceHistory: vi.fn(),
    groupByTransactionType: vi.fn(),
  })),
  VizService: vi.fn().mockImplementation(() => ({
    generateTextualSummary: vi.fn(),
    prepareMonthlyChartData: vi.fn(),
    prepareBalanceChartData: vi.fn(),
    prepareTypeChartData: vi.fn(),
  })),
  ExpenseAnalysisService: vi.fn().mockImplementation(() => ({
    getAvailableMonths: vi.fn().mockReturnValue([]),
    getDefaultAnalysisMonth: vi.fn().mockReturnValue(null),
    analyzeMonth: vi.fn().mockReturnValue(null),
  })),
}));

describe("useExpenseTracker - Error Handling with New Architecture", () => {
  const mockCsvService = CsvService as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Error Handling", () => {
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

      const { result } = renderHook(() => useExpenseTracker(), {
        wrapper: TestWrapper,
      });

      const mockFile = new File(["invalid,data"], "test.csv", {
        type: "text/csv",
      });

      await act(async () => {
        await result.current.processCSVFile(mockFile);
      });

      // Basic test that error handling works
      expect(result.current.isLoading).toBe(false);
    });

    it("should handle unexpected processing errors", async () => {
      mockCsvService.validateAndParse.mockRejectedValue(
        new Error("Network error")
      );

      const { result } = renderHook(() => useExpenseTracker(), {
        wrapper: TestWrapper,
      });

      const mockFile = new File(["test,data"], "test.csv", {
        type: "text/csv",
      });

      await act(async () => {
        await result.current.processCSVFile(mockFile);
      });

      // Verify error handling
      expect(result.current.isLoading).toBe(false);
    });
  });
});
