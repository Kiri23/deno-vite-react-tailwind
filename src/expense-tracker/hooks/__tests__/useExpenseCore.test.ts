/**
 * Tests for useExpenseCore hook
 *
 * Tests the core React bridge hook that connects ExpenseVM to React
 * using useSyncExternalStore for proper state synchronization.
 */

import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useExpenseCore } from "../useExpenseCore";
import { createLocalServices } from "../../services/local/index";
import type { Services } from "../../vm/ExpenseVM";

describe("useExpenseCore", () => {
  let mockServices: Services;

  beforeEach(() => {
    // Use real local services for integration testing
    mockServices = createLocalServices();
  });

  describe("Initialization", () => {
    it("should initialize with empty state", () => {
      const { result } = renderHook(() => useExpenseCore(mockServices));

      expect(result.current.state.raw).toEqual([]);
      expect(result.current.state.normalized).toEqual([]);
      expect(result.current.state.monthly).toEqual([]);
      expect(result.current.state.loading.csv).toBe(false);
      expect(result.current.state.loading.analysis).toBe(false);
      expect(result.current.state.loading.charts).toBe(false);
    });

    it("should provide command interface", () => {
      const { result } = renderHook(() => useExpenseCore(mockServices));

      expect(result.current.commands).toBeDefined();
      expect(typeof result.current.commands.loadCsv).toBe("function");
      expect(typeof result.current.commands.normalize).toBe("function");
      expect(typeof result.current.commands.analyze).toBe("function");
      expect(typeof result.current.commands.buildCharts).toBe("function");
      expect(typeof result.current.commands.explain).toBe("function");
      expect(typeof result.current.commands.reset).toBe("function");
    });
  });

  describe("State Management", () => {
    it("should update state when commands are executed", async () => {
      const { result } = renderHook(() => useExpenseCore(mockServices));

      // Create a mock CSV file with content accessible to our mock FileReader
      const csvContent = `Date,Description,Type,Amount,Current balance,Status
2024-01-15,Test Transaction,DEPOSIT,100.00,1000.00,Posted`;
      const mockFile = Object.assign(
        new File([csvContent], "test.csv", { type: "text/csv" }),
        { content: csvContent }
      );

      // Execute loadCsv command
      await act(async () => {
        await result.current.commands.loadCsv(mockFile);
      });

      // State should be updated
      expect(result.current.state.raw.length).toBeGreaterThan(0);
    });

    it("should handle reset command", () => {
      const { result } = renderHook(() => useExpenseCore(mockServices));

      // Set some filters first
      act(() => {
        result.current.commands.setFilters({ categories: ["Deposit"] });
      });

      expect(result.current.state.filters.categories).toEqual(["Deposit"]);

      // Reset should clear everything
      act(() => {
        result.current.commands.reset();
      });

      expect(result.current.state.filters.categories).toEqual([]);
      expect(result.current.state.raw).toEqual([]);
      expect(result.current.state.normalized).toEqual([]);
    });
  });

  describe("Service Integration", () => {
    it("should maintain stable service references", () => {
      const { result, rerender } = renderHook(
        ({ services }) => useExpenseCore(services),
        { initialProps: { services: mockServices } }
      );

      const initialCommands = result.current.commands;

      // Re-render with same services
      rerender({ services: mockServices });

      // Commands should be stable (same reference)
      expect(result.current.commands).toBe(initialCommands);
    });

    it("should handle service errors gracefully", async () => {
      // Create services with mocked error
      const errorServices = {
        ...mockServices,
        csv: {
          ...mockServices.csv,
          validateAndParse: vi
            .fn()
            .mockRejectedValue(new Error("Service error")),
        },
      };

      const { result } = renderHook(() => useExpenseCore(errorServices));

      const invalidFile = new File(["invalid"], "test.csv", {
        type: "text/csv",
      });

      await act(async () => {
        await result.current.commands.loadCsv(invalidFile);
      });

      // Should handle error gracefully
      expect(result.current.state.errors.csv).toBeDefined();
      expect(result.current.state.loading.csv).toBe(false);
    });
  });
});
