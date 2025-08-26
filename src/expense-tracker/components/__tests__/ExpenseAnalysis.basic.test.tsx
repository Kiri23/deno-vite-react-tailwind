import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ExpenseAnalysis } from "../ExpenseAnalysis";
import type { MonthlyAnalysis, AnalysisOptions } from "../../types";

// Mock Chart.js
vi.mock("react-chartjs-2", () => ({
  Bar: vi.fn(() => <div data-testid="bar-chart">Mocked Chart</div>),
}));

vi.mock("chart.js", () => ({
  Chart: { register: vi.fn() },
  CategoryScale: {},
  LinearScale: {},
  BarElement: {},
  Title: {},
  Tooltip: {},
  Legend: {},
}));

describe("ExpenseAnalysis - Basic Functionality", () => {
  const mockAnalysis: MonthlyAnalysis = {
    month: "2024-03",
    isCurrentMonth: false,
    topExpenses: [
      {
        date: "2024-03-05",
        description: "Large Purchase",
        type: "Debit Card",
        amount: -500.0,
        rank: 1,
      },
    ],
    expensesByType: [
      {
        type: "Debit Card",
        totalAmount: -500.0,
        transactionCount: 1,
        percentage: 100.0,
        averageAmount: -500.0,
      },
    ],
    dailySpending: [
      {
        date: "2024-03-05",
        day: 5,
        totalExpenses: 500.0,
        transactionCount: 1,
      },
    ],
    insights: {
      largestExpense: {
        description: "Large Purchase",
        amount: -500.0,
        date: "2024-03-05",
      },
      highestTypePercentage: {
        type: "Debit Card",
        percentage: 100.0,
      },
      highestSpendingDay: {
        date: "2024-03-05",
        amount: 500.0,
      },
      totalExpenses: 500.0,
      averageDailySpending: 500.0,
    },
    appliedOptions: {
      includeTransfers: false,
      includeRoundups: false,
      includePending: false,
    },
  };

  const defaultProps = {
    analysis: mockAnalysis,
    availableMonths: ["2024-03", "2024-02"],
    selectedMonth: "2024-03",
    onMonthChange: vi.fn(),
    analysisOptions: {} as AnalysisOptions,
    onOptionsChange: vi.fn(),
    isLoading: false,
    error: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the main title", () => {
    render(<ExpenseAnalysis {...defaultProps} />);
    expect(
      screen.getByText("Análisis Detallado de Gastos")
    ).toBeInTheDocument();
  });

  it("should show loading state", () => {
    render(<ExpenseAnalysis {...defaultProps} isLoading={true} />);
    const loadingElements = document.querySelectorAll(".animate-pulse");
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  it("should show error state", () => {
    const errorMessage = "Failed to load analysis";
    render(<ExpenseAnalysis {...defaultProps} error={errorMessage} />);

    expect(screen.getByText("Error al cargar análisis")).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it("should show empty state when no data", () => {
    render(
      <ExpenseAnalysis
        {...defaultProps}
        selectedMonth={null}
        availableMonths={[]}
      />
    );

    expect(
      screen.getByText("No hay datos suficientes para análisis detallado")
    ).toBeInTheDocument();
  });

  it("should render month selector", () => {
    render(<ExpenseAnalysis {...defaultProps} />);

    const monthSelect = screen.getByLabelText("Seleccionar mes para análisis");
    expect(monthSelect).toBeInTheDocument();
  });

  it("should call onMonthChange when month is selected", () => {
    const onMonthChange = vi.fn();
    render(<ExpenseAnalysis {...defaultProps} onMonthChange={onMonthChange} />);

    const monthSelect = screen.getByLabelText("Seleccionar mes para análisis");
    fireEvent.change(monthSelect, { target: { value: "2024-02" } });

    expect(onMonthChange).toHaveBeenCalledWith("2024-02");
  });

  it("should show incomplete month badge for current month", () => {
    const currentMonthAnalysis = {
      ...mockAnalysis,
      isCurrentMonth: true,
    };

    render(
      <ExpenseAnalysis {...defaultProps} analysis={currentMonthAnalysis} />
    );

    expect(screen.getByText("Mes incompleto")).toBeInTheDocument();
  });

  it("should render analysis options", () => {
    render(<ExpenseAnalysis {...defaultProps} />);

    expect(
      screen.getByLabelText("Incluir transacciones pendientes")
    ).toBeInTheDocument();
  });

  it("should render visual filters", () => {
    render(<ExpenseAnalysis {...defaultProps} />);

    expect(screen.getByLabelText("Ocultar transferencias")).toBeInTheDocument();
    expect(screen.getByLabelText("Ocultar redondeos")).toBeInTheDocument();
  });

  it("should render insights section", () => {
    render(<ExpenseAnalysis {...defaultProps} />);

    expect(screen.getByText("Resumen del Mes")).toBeInTheDocument();
    expect(screen.getByText("Mayor Gasto")).toBeInTheDocument();
    expect(screen.getByText("Tipo Más Alto")).toBeInTheDocument();
  });

  it("should render top expenses table", () => {
    render(<ExpenseAnalysis {...defaultProps} />);

    expect(screen.getByText("Top 10 Mayores Gastos")).toBeInTheDocument();
    expect(screen.getAllByText("Large Purchase")).toHaveLength(2); // In insights and table
  });

  it("should render expense breakdown section", () => {
    render(<ExpenseAnalysis {...defaultProps} />);

    expect(
      screen.getByText("Desglose por Tipo de Transacción")
    ).toBeInTheDocument();
  });

  it("should render daily spending chart", () => {
    render(<ExpenseAnalysis {...defaultProps} />);

    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
  });

  it("should handle empty top expenses", () => {
    const emptyAnalysis = {
      ...mockAnalysis,
      topExpenses: [],
    };

    render(<ExpenseAnalysis {...defaultProps} analysis={emptyAnalysis} />);

    expect(
      screen.getByText("No hay gastos para mostrar en este mes")
    ).toBeInTheDocument();
  });

  it("should call onOptionsChange when pending option is toggled", () => {
    const onOptionsChange = vi.fn();
    render(
      <ExpenseAnalysis {...defaultProps} onOptionsChange={onOptionsChange} />
    );

    const pendingCheckbox = screen.getByLabelText(
      "Incluir transacciones pendientes"
    );
    fireEvent.click(pendingCheckbox);

    expect(onOptionsChange).toHaveBeenCalledWith({
      includePending: true,
    });
  });

  it("should have proper accessibility attributes", () => {
    render(<ExpenseAnalysis {...defaultProps} />);

    // Check ARIA labels
    expect(
      screen.getByLabelText("Seleccionar mes para análisis")
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Incluir transacciones pendientes")
    ).toBeInTheDocument();

    // Check chart accessibility
    const chart = screen.getByTestId("bar-chart");
    expect(chart).toBeInTheDocument();
  });
});
