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

describe("useExpenseTracker - New Architecture", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Initial State", () => {
    it("should initialize with empty state", () => {
      const { result } = renderHook(() => useExpenseTracker(), {
        wrapper: TestWrapper,
      });

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
      const { result } = renderHook(() => useExpenseTracker(), {
        wrapper: TestWrapper,
      });

      expect(typeof result.current.processCSVFile).toBe("function");
      expect(typeof result.current.toggleCurrentMonth).toBe("function");
      expect(typeof result.current.clearData).toBe("function");
    });
  });

  describe("Basic Functionality", () => {
    it("should handle file processing with new architecture", async () => {
      const { result } = renderHook(() => useExpenseTracker(), {
        wrapper: TestWrapper,
      });

      const mockFile = new File(["test,data"], "test.csv", {
        type: "text/csv",
      });

      await act(async () => {
        await result.current.processCSVFile(mockFile);
      });

      // Basic test that the hook works with the new architecture
      expect(result.current.isLoading).toBe(false);
    });

    it("should handle current month toggle", () => {
      const { result } = renderHook(() => useExpenseTracker(), {
        wrapper: TestWrapper,
      });

      act(() => {
        result.current.toggleCurrentMonth(true);
      });

      expect(result.current.showCurrentMonth).toBe(true);
    });

    it("should handle data clearing", () => {
      const { result } = renderHook(() => useExpenseTracker(), {
        wrapper: TestWrapper,
      });

      act(() => {
        result.current.clearData();
      });

      // Verify state is reset
      expect(result.current.transactions).toEqual([]);
      expect(result.current.monthlyData).toEqual([]);
      expect(result.current.summary).toBeNull();
      expect(result.current.showCurrentMonth).toBe(false);
    });
  });
});
