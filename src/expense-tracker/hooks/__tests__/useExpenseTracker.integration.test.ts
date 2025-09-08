import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import React from "react";
import { useExpenseTracker } from "../useExpenseTracker";
import { AppContextProvider } from "../../../app/context";

// Test wrapper component
function TestWrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(AppContextProvider, null, children);
}

describe("useExpenseTracker - New Architecture Integration", () => {
  it("should initialize with the new architecture", () => {
    const { result } = renderHook(() => useExpenseTracker(), {
      wrapper: TestWrapper,
    });

    // Basic test to verify the hook works with the new architecture
    expect(result.current.transactions).toEqual([]);
    expect(result.current.monthlyData).toEqual([]);
    expect(result.current.summary).toBeNull();
    expect(result.current.balanceHistory).toEqual([]);
    expect(result.current.typeBreakdown).toEqual([]);
    expect(result.current.textualSummaries).toEqual([]);
    expect(result.current.showCurrentMonth).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.validationResult).toBeNull();

    // Verify action functions exist
    expect(typeof result.current.processCSVFile).toBe("function");
    expect(typeof result.current.toggleCurrentMonth).toBe("function");
    expect(typeof result.current.clearData).toBe("function");
  });
});
