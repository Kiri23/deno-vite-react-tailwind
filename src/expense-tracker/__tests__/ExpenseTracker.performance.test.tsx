import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ExpenseTracker } from "../ExpenseTracker";
import { AppContextProvider } from "../../app/context";

// Helper function to render ExpenseTracker with required providers
function renderExpenseTracker() {
  return render(
    <AppContextProvider>
      <ExpenseTracker />
    </AppContextProvider>
  );
}

// Mock performance API
Object.defineProperty(window, "performance", {
  value: {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
  },
  writable: true,
});

// Mock navigator for device detection
Object.defineProperty(window, "navigator", {
  value: {
    hardwareConcurrency: 4,
    deviceMemory: 8,
  },
  writable: true,
});

// Mock the services
vi.mock("../services", () => ({
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
  })),
  ExpenseAnalysisService: vi.fn().mockImplementation(() => ({
    getAvailableMonths: vi.fn().mockReturnValue([]),
    getDefaultAnalysisMonth: vi.fn().mockReturnValue(null),
    analyzeMonth: vi.fn().mockReturnValue(null),
  })),
}));

// Mock the components to focus on performance
vi.mock("../components", () => ({
  FileUpload: ({
    onFileProcessed,
    maxFileSize,
  }: {
    onFileProcessed: (file: File) => void;
    maxFileSize: number;
  }) => (
    <div data-testid="file-upload" data-max-size={maxFileSize}>
      <button
        onClick={() => {
          const mockFile = new File(["test"], "test.csv", { type: "text/csv" });
          onFileProcessed(mockFile);
        }}
      >
        Upload File
      </button>
    </div>
  ),
  TransactionTable: ({ transactions }: { transactions: any[] }) => (
    <div data-testid="transaction-table">
      {transactions.length} transactions
    </div>
  ),
  ExpenseCharts: ({
    showCurrentMonth,
    onToggleCurrentMonth,
  }: {
    showCurrentMonth: boolean;
    onToggleCurrentMonth: (show: boolean) => void;
  }) => (
    <div data-testid="expense-charts">
      <button onClick={() => onToggleCurrentMonth(!showCurrentMonth)}>
        Toggle Current Month
      </button>
      Current month: {showCurrentMonth ? "shown" : "hidden"}
    </div>
  ),
  MonthlyTextSummary: ({ summaries }: { summaries: string[] }) => (
    <div data-testid="monthly-summary">{summaries.length} summaries</div>
  ),
}));

describe("ExpenseTracker Performance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset performance mock
    (window.performance.now as any).mockImplementation(() => Date.now());
  });

  it("detects slow devices and adjusts file size limits", () => {
    // Mock slow device
    Object.defineProperty(window, "navigator", {
      value: {
        hardwareConcurrency: 2,
        deviceMemory: 2,
      },
      writable: true,
    });

    renderExpenseTracker();

    const fileUpload = screen.getByTestId("file-upload");
    const maxSize = fileUpload.getAttribute("data-max-size");

    // Should reduce file size limit for slow devices (10MB instead of 20MB)
    expect(maxSize).toBe((10 * 1024 * 1024).toString());
  });

  it("shows device-specific optimizations in empty state", () => {
    // Mock slow device
    Object.defineProperty(window, "navigator", {
      value: {
        hardwareConcurrency: 2,
        deviceMemory: 2,
      },
      writable: true,
    });

    renderExpenseTracker();

    expect(
      screen.getByText("10 MB (reducido para este dispositivo)")
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Dispositivo con recursos limitados detectado/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Se aplicarán optimizaciones automáticas/)
    ).toBeInTheDocument();
  });

  it("handles high-performance devices appropriately", () => {
    // Mock high-performance device
    Object.defineProperty(window, "navigator", {
      value: {
        hardwareConcurrency: 8,
        deviceMemory: 16,
      },
      writable: true,
    });

    renderExpenseTracker();

    const fileUpload = screen.getByTestId("file-upload");
    const maxSize = fileUpload.getAttribute("data-max-size");

    // Should use full file size limit for high-performance devices (20MB)
    expect(maxSize).toBe((20 * 1024 * 1024).toString());

    // Should not show device limitation messages
    expect(
      screen.queryByText(/Dispositivo con recursos limitados/)
    ).not.toBeInTheDocument();
  });
});
