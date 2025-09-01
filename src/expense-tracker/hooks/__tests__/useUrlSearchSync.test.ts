/**
 * Tests for useUrlSearchSync hook
 *
 * Validates bidirectional synchronization between ExpenseVM state and URL search parameters
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useUrlSearchSync,
  useAnalyzeUrlSync,
  useVisualizeUrlSync,
} from "../useUrlSearchSync";
import type { UseExpenseCoreReturn } from "../useExpenseCore";

// Mock TanStack Router hooks
const mockNavigate = vi.fn();
let mockSearch = {};
let mockLocation = { pathname: "/expenses/analyze" };

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
  useSearch: () => mockSearch,
  useLocation: () => mockLocation,
}));

// Mock ExpenseCore return
const createMockCore = (): UseExpenseCoreReturn => ({
  state: {
    raw: [],
    normalized: [],
    monthly: [],
    range: {},
    filters: { categories: [] },
    charts: {
      monthly: [],
      balance: { labels: [], datasets: [] },
      types: { labels: [], datasets: [] },
    },
    insights: {},
    loading: {
      csv: false,
      analysis: false,
      charts: false,
    },
    errors: {},
  },
  commands: {
    setRange: vi.fn(),
    setFilters: vi.fn(),
    loadCsv: vi.fn(),
    normalize: vi.fn(),
    analyze: vi.fn(),
    buildCharts: vi.fn(),
    explain: vi.fn(),
    reset: vi.fn(),
  },
});

describe("useUrlSearchSync", () => {
  let mockCore: UseExpenseCoreReturn;

  beforeEach(() => {
    mockCore = createMockCore();
    mockSearch = {};
    mockLocation = { pathname: "/expenses/analyze" };
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe("URL to VM synchronization", () => {
    it("should sync range parameters from URL to VM state", async () => {
      // Mock URL search with range parameters
      Object.assign(mockSearch, {
        monthFrom: "2024-01-01",
        monthTo: "2024-12-31",
      });

      renderHook(() => useUrlSearchSync(mockCore));

      // Wait for effect to run
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(mockCore.commands.setRange).toHaveBeenCalledWith({
        from: "2024-01-01",
        to: "2024-12-31",
      });
    });

    it("should sync filter parameters from URL to VM state", async () => {
      // Mock URL search with filter parameters
      Object.assign(mockSearch, {
        categories: ["Debit Card", "Withdrawal"],
      });

      renderHook(() => useUrlSearchSync(mockCore));

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(mockCore.commands.setFilters).toHaveBeenCalledWith({
        categories: ["Debit Card", "Withdrawal"],
      });
    });

    it("should handle empty URL parameters", async () => {
      // Mock empty URL search
      mockSearch = {};

      renderHook(() => useUrlSearchSync(mockCore));

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      // Should call setRange with undefined values for empty search
      expect(mockCore.commands.setRange).toHaveBeenCalledWith({
        from: undefined,
        to: undefined,
      });
    });

    it("should only sync on analyze and visualize routes", async () => {
      // Mock different route
      mockLocation.pathname = "/expenses/import";

      renderHook(() => useUrlSearchSync(mockCore));

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      // Should not call VM commands on non-sync routes
      expect(mockCore.commands.setRange).not.toHaveBeenCalled();
      expect(mockCore.commands.setFilters).not.toHaveBeenCalled();
    });
  });

  describe("VM to URL synchronization", () => {
    beforeEach(() => {
      vi.useRealTimers();
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should sync VM range state to URL parameters", async () => {
      // Set up VM state with range
      mockCore.state.range = {
        from: "2024-06-01",
        to: "2024-06-30",
      };

      renderHook(() => useUrlSearchSync(mockCore));

      // Fast-forward debounce timer
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(mockNavigate).toHaveBeenCalledWith({
        search: expect.any(Function),
      });
    });

    it("should sync VM filter state to URL parameters", async () => {
      // Set up VM state with filters
      mockCore.state.filters = {
        categories: ["Transfer", "Deposit"],
      };

      renderHook(() => useUrlSearchSync(mockCore));

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(mockNavigate).toHaveBeenCalledWith({
        search: expect.any(Function),
      });
    });

    it("should debounce URL updates", async () => {
      mockCore.state.range = { from: "2024-01-01" };

      renderHook(() => useUrlSearchSync(mockCore, { debounceMs: 500 }));

      // Should not navigate immediately
      expect(mockNavigate).not.toHaveBeenCalled();

      // Should navigate after debounce period
      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  describe("updateUrl function", () => {
    it("should provide updateUrl function for programmatic updates", () => {
      const { result } = renderHook(() => useUrlSearchSync(mockCore));

      expect(result.current.updateUrl).toBeInstanceOf(Function);
      expect(result.current.currentSearch).toBeDefined();
      expect(typeof result.current.isSyncing).toBe("boolean");
    });

    it("should update URL when updateUrl is called", () => {
      const { result } = renderHook(() => useUrlSearchSync(mockCore));

      act(() => {
        result.current.updateUrl({
          monthFrom: "2024-03-01",
          categories: ["ATM"],
        });
      });

      expect(mockNavigate).toHaveBeenCalledWith({
        search: expect.any(Function),
      });
    });
  });

  describe("configuration options", () => {
    it("should respect syncRange configuration", async () => {
      Object.assign(mockSearch, {
        monthFrom: "2024-01-01",
        monthTo: "2024-12-31",
      });

      renderHook(() => useUrlSearchSync(mockCore, { syncRange: false }));

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(mockCore.commands.setRange).not.toHaveBeenCalled();
    });

    it("should respect syncFilters configuration", async () => {
      Object.assign(mockSearch, {
        categories: ["Debit Card"],
      });

      renderHook(() => useUrlSearchSync(mockCore, { syncFilters: false }));

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(mockCore.commands.setFilters).not.toHaveBeenCalled();
    });
  });

  describe("convenience hooks", () => {
    it("should provide useAnalyzeUrlSync with correct configuration", () => {
      const { result } = renderHook(() => useAnalyzeUrlSync(mockCore));

      expect(result.current.updateUrl).toBeInstanceOf(Function);
      expect(result.current.currentSearch).toBeDefined();
    });

    it("should provide useVisualizeUrlSync with correct configuration", () => {
      const { result } = renderHook(() => useVisualizeUrlSync(mockCore));

      expect(result.current.updateUrl).toBeInstanceOf(Function);
      expect(result.current.currentSearch).toBeDefined();
    });
  });

  describe("infinite loop prevention", () => {
    it("should prevent infinite loops during synchronization", async () => {
      // Set up a scenario that could cause infinite loops
      mockSearch = {
        monthFrom: "2024-01-01",
      };

      // Start with different state to trigger sync
      mockCore.state.range = { from: "2024-02-01" };

      renderHook(() => useUrlSearchSync(mockCore));

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 200));
      });

      // Should call setRange to sync URL to VM state
      expect(mockCore.commands.setRange).toHaveBeenCalledWith({
        from: "2024-01-01",
        to: undefined,
      });
    });

    it("should track syncing state correctly", () => {
      const { result } = renderHook(() => useUrlSearchSync(mockCore));

      // Initially not syncing
      expect(result.current.isSyncing).toBe(false);
    });
  });

  describe("error handling", () => {
    it("should handle malformed URL parameters gracefully", async () => {
      // Mock malformed search parameters
      Object.assign(mockSearch, {
        monthFrom: "invalid-date",
        categories: "not-an-array",
      });

      expect(() => {
        renderHook(() => useUrlSearchSync(mockCore));
      }).not.toThrow();
    });

    it("should handle VM command failures gracefully", async () => {
      // Mock VM command that throws
      mockCore.commands.setRange = vi.fn().mockImplementation(() => {
        throw new Error("VM command failed");
      });

      Object.assign(mockSearch, {
        monthFrom: "2024-01-01",
      });

      expect(() => {
        renderHook(() => useUrlSearchSync(mockCore));
      }).not.toThrow();
    });
  });
});
