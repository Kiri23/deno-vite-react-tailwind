import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ExpenseTracker } from "../ExpenseTracker";

// Mock Chart.js
vi.mock("react-chartjs-2", () => ({
  Bar: vi.fn(() => <div data-testid="bar-chart">Mocked Chart</div>),
  Line: vi.fn(() => <div data-testid="line-chart">Mocked Chart</div>),
}));

vi.mock("chart.js", () => ({
  Chart: { register: vi.fn() },
  CategoryScale: {},
  LinearScale: {},
  BarElement: {},
  LineElement: {},
  PointElement: {},
  Title: {},
  Tooltip: {},
  Legend: {},
}));

// Mock the services
vi.mock("../services", () => ({
  CsvService: {
    validateAndParse: vi.fn(),
  },
  AnalysisService: vi.fn().mockImplementation(() => ({
    calculateMonthlySummary: vi.fn().mockReturnValue([]),
    calculateOverallSummary: vi.fn().mockReturnValue({
      totalIncome: 1000,
      totalExpenses: 800,
      netSavings: 200,
      transactionCount: 10,
      dateRange: { start: "2024-01-01", end: "2024-03-31" },
      balanceSource: "original",
    }),
    generateBalanceHistory: vi.fn().mockReturnValue([]),
    groupByTransactionType: vi.fn().mockReturnValue([]),
  })),
  VizService: vi.fn().mockImplementation(() => ({
    generateTextualSummary: vi.fn().mockReturnValue([]),
  })),
  ExpenseAnalysisService: vi.fn().mockImplementation(() => ({
    getAvailableMonths: vi.fn().mockReturnValue(["2024-03", "2024-02"]),
    getDefaultAnalysisMonth: vi.fn().mockReturnValue("2024-03"),
    analyzeMonth: vi.fn().mockReturnValue({
      month: "2024-03",
      isCurrentMonth: false,
      topExpenses: [],
      expensesByType: [],
      dailySpending: [],
      insights: {
        largestExpense: { description: "", amount: 0, date: "" },
        highestTypePercentage: { type: "", percentage: 0 },
        highestSpendingDay: { date: "", amount: 0 },
        totalExpenses: 0,
        averageDailySpending: 0,
      },
      appliedOptions: {
        includeTransfers: false,
        includeRoundups: false,
        includePending: false,
      },
    }),
  })),
}));

describe("ExpenseTracker Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the main title and upload section", () => {
    render(<ExpenseTracker />);

    expect(screen.getByText("Seguimiento de Gastos")).toBeInTheDocument();
    expect(screen.getByText("Cargar archivo CSV")).toBeInTheDocument();
  });

  it("should show empty state when no data is loaded", () => {
    render(<ExpenseTracker />);

    expect(
      screen.getByText("¡Comienza tu análisis financiero!")
    ).toBeInTheDocument();
    expect(screen.getByText(/Carga un archivo CSV/)).toBeInTheDocument();
  });

  it("should have proper accessibility structure", () => {
    render(<ExpenseTracker />);

    // Check for skip link
    expect(
      screen.getByText("Saltar al contenido principal")
    ).toBeInTheDocument();

    // Check for main content area
    expect(screen.getByRole("main")).toBeInTheDocument();

    // Check for proper headings
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Seguimiento de Gastos"
    );
  });

  it("should show performance indicator for slow devices", () => {
    // Mock slow device detection
    Object.defineProperty(navigator, "hardwareConcurrency", {
      writable: true,
      value: 2,
    });

    Object.defineProperty(navigator, "deviceMemory", {
      writable: true,
      value: 1,
    });

    render(<ExpenseTracker />);

    // The component should detect this as a slow device and adjust accordingly
    expect(
      screen.getByText(/10 MB \(reducido para este dispositivo\)/)
    ).toBeInTheDocument();
  });

  it("should handle clear data functionality", async () => {
    render(<ExpenseTracker />);

    // Initially, clear data button should not be visible
    expect(screen.queryByText("Limpiar datos")).not.toBeInTheDocument();
  });

  it("should render with proper ARIA labels and roles", () => {
    render(<ExpenseTracker />);

    // Check for proper ARIA structure
    const main = screen.getByRole("main");
    expect(main).toHaveAttribute("id", "main-content");

    // Check for sections with proper labeling
    const uploadSection = screen.getByRole("region", {
      name: /Cargar archivo CSV/,
    });
    expect(uploadSection).toBeInTheDocument();
  });

  it("should handle keyboard navigation", () => {
    render(<ExpenseTracker />);

    const skipLink = screen.getByText("Saltar al contenido principal");
    expect(skipLink).toHaveClass("sr-only");

    // Focus should make the skip link visible
    skipLink.focus();
    expect(skipLink).toHaveClass("focus:not-sr-only");
  });

  it("should show loading state appropriately", () => {
    render(<ExpenseTracker />);

    // Initially should not show loading
    expect(screen.queryByText("Procesando archivo...")).not.toBeInTheDocument();
  });

  it("should handle responsive design classes", () => {
    render(<ExpenseTracker />);

    const headerContainer = screen
      .getByText("Seguimiento de Gastos")
      .closest("div")?.parentElement;
    expect(headerContainer?.className).toContain("sm:flex-row");
  });
});
