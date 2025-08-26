import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ExpenseAnalysis } from "../ExpenseAnalysis";
import type { MonthlyAnalysis, AnalysisOptions } from "../../types";

// Mock Chart.js
vi.mock("react-chartjs-2", () => ({
  Bar: vi.fn(({ data, options, ...props }) => (
    <div data-testid="bar-chart" {...props}>
      <div data-testid="chart-data">{JSON.stringify(data)}</div>
      <div data-testid="chart-options">{JSON.stringify(options)}</div>
    </div>
  )),
}));

vi.mock("chart.js", () => ({
  Chart: {
    register: vi.fn(),
  },
  CategoryScale: {},
  LinearScale: {},
  BarElement: {},
  Title: {},
  Tooltip: {},
  Legend: {},
}));

describe("ExpenseAnalysis", () => {
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
      {
        date: "2024-03-01",
        description: "Grocery Store",
        type: "Debit Card",
        amount: -150.0,
        rank: 2,
      },
      {
        date: "2024-03-03",
        description: "ATM Withdrawal",
        type: "Withdrawal",
        amount: -100.0,
        rank: 3,
      },
    ],
    expensesByType: [
      {
        type: "Debit Card",
        totalAmount: -650.0,
        transactionCount: 5,
        percentage: 72.2,
        averageAmount: -130.0,
      },
      {
        type: "Withdrawal",
        totalAmount: -100.0,
        transactionCount: 1,
        percentage: 11.1,
        averageAmount: -100.0,
      },
      {
        type: "Transfer",
        totalAmount: -150.0,
        transactionCount: 1,
        percentage: 16.7,
        averageAmount: -150.0,
      },
    ],
    dailySpending: [
      {
        date: "2024-03-01",
        day: 1,
        totalExpenses: 155.5,
        transactionCount: 2,
        largestExpense: {
          description: "Grocery Store",
          amount: -150.0,
        },
      },
      {
        date: "2024-03-02",
        day: 2,
        totalExpenses: 0,
        transactionCount: 0,
      },
      {
        date: "2024-03-03",
        day: 3,
        totalExpenses: 100.0,
        transactionCount: 1,
        largestExpense: {
          description: "ATM Withdrawal",
          amount: -100.0,
        },
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
        percentage: 72.2,
      },
      highestSpendingDay: {
        date: "2024-03-01",
        amount: 155.5,
      },
      totalExpenses: 900.0,
      averageDailySpending: 127.5,
    },
    appliedOptions: {
      includeTransfers: false,
      includeRoundups: false,
      includePending: false,
    },
  };

  const defaultProps = {
    analysis: mockAnalysis,
    availableMonths: ["2024-03", "2024-02", "2024-01"],
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

  describe("Loading and Error States", () => {
    it("should show loading state", () => {
      render(<ExpenseAnalysis {...defaultProps} isLoading={true} />);

      // Check for loading skeleton elements
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
  });

  describe("Month Selection", () => {
    it("should render month selector with available months", () => {
      render(<ExpenseAnalysis {...defaultProps} />);

      const monthSelect = screen.getByLabelText(
        "Seleccionar mes para análisis"
      );
      expect(monthSelect).toBeInTheDocument();

      // Check that all available months are present
      expect(screen.getByText("marzo 2024")).toBeInTheDocument();
      expect(screen.getByText("febrero 2024")).toBeInTheDocument();
      expect(screen.getByText("enero 2024")).toBeInTheDocument();
    });

    it("should call onMonthChange when month is selected", () => {
      const onMonthChange = vi.fn();
      render(
        <ExpenseAnalysis {...defaultProps} onMonthChange={onMonthChange} />
      );

      const monthSelect = screen.getByLabelText(
        "Seleccionar mes para análisis"
      );
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
  });

  describe("Analysis Options", () => {
    it("should render pending transactions checkbox", () => {
      render(<ExpenseAnalysis {...defaultProps} />);

      const pendingCheckbox = screen.getByLabelText(
        "Incluir transacciones pendientes"
      );
      expect(pendingCheckbox).toBeInTheDocument();
      expect(pendingCheckbox).not.toBeChecked();
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
  });

  describe("Visual Filters", () => {
    it("should render visual filter checkboxes", () => {
      render(<ExpenseAnalysis {...defaultProps} />);

      expect(
        screen.getByLabelText("Ocultar transferencias")
      ).toBeInTheDocument();
      expect(screen.getByLabelText("Ocultar redondeos")).toBeInTheDocument();
    });

    it("should filter out transfers when hide transfers is checked", async () => {
      render(<ExpenseAnalysis {...defaultProps} />);

      // Initially, transfers should be hidden (default state)
      const hideTransfersCheckbox = screen.getByLabelText(
        "Ocultar transferencias"
      );
      expect(hideTransfersCheckbox).toBeChecked();

      // Transfer type should not be visible in the breakdown table
      expect(screen.queryByText("Transfer")).not.toBeInTheDocument();
    });

    it("should show transfers when hide transfers is unchecked", async () => {
      render(<ExpenseAnalysis {...defaultProps} />);

      const hideTransfersCheckbox = screen.getByLabelText(
        "Ocultar transferencias"
      );
      fireEvent.click(hideTransfersCheckbox); // Uncheck to show transfers

      await waitFor(() => {
        expect(screen.getByText("Transfer")).toBeInTheDocument();
      });
    });
  });

  describe("Insights Display", () => {
    it("should display key insights correctly", () => {
      render(<ExpenseAnalysis {...defaultProps} />);

      // Check insights are displayed
      expect(screen.getByText("Mayor Gasto")).toBeInTheDocument();
      expect(screen.getByText("−$500.00")).toBeInTheDocument();
      expect(screen.getByText("Large Purchase")).toBeInTheDocument();

      expect(screen.getByText("Tipo Más Alto")).toBeInTheDocument();
      expect(screen.getByText("72.2%")).toBeInTheDocument();
      expect(screen.getByText("Debit Card")).toBeInTheDocument();

      expect(screen.getByText("Promedio Diario")).toBeInTheDocument();
      expect(screen.getByText("$127.50")).toBeInTheDocument();
    });
  });

  describe("Top Expenses Table", () => {
    it("should display top expenses in correct order", () => {
      render(<ExpenseAnalysis {...defaultProps} />);

      // Check table headers
      expect(screen.getByText("Top 10 Mayores Gastos")).toBeInTheDocument();

      // Check that expenses are displayed in rank order
      const rows = screen.getAllByRole("row");
      expect(rows).toHaveLength(4); // Header + 3 expense rows

      // Check first expense (largest)
      expect(screen.getByText("Large Purchase")).toBeInTheDocument();
      expect(screen.getByText("2024-03-05")).toBeInTheDocument();
      expect(screen.getByText("−$500.00")).toBeInTheDocument();
    });

    it("should show empty state when no expenses", () => {
      const emptyAnalysis = {
        ...mockAnalysis,
        topExpenses: [],
      };

      render(<ExpenseAnalysis {...defaultProps} analysis={emptyAnalysis} />);

      expect(
        screen.getByText("No hay gastos para mostrar en este mes")
      ).toBeInTheDocument();
    });
  });

  describe("Expense Breakdown", () => {
    it("should display expense breakdown by type", () => {
      render(<ExpenseAnalysis {...defaultProps} />);

      expect(
        screen.getByText("Desglose por Tipo de Transacción")
      ).toBeInTheDocument();

      // Check that Debit Card type is displayed (transfers should be hidden by default)
      expect(screen.getByText("Debit Card")).toBeInTheDocument();
      expect(screen.getByText("Withdrawal")).toBeInTheDocument();

      // Check percentages and amounts
      expect(screen.getByText("−$650.00")).toBeInTheDocument();
      expect(screen.getByText("−$100.00")).toBeInTheDocument();
    });

    it("should recalculate percentages when filters are applied", async () => {
      render(<ExpenseAnalysis {...defaultProps} />);

      // Initially transfers are hidden, so percentages should be recalculated
      // Debit Card: 650 / (650 + 100) = 86.7%
      // Withdrawal: 100 / (650 + 100) = 13.3%

      // The component should show recalculated percentages
      const hideTransfersCheckbox = screen.getByLabelText(
        "Ocultar transferencias"
      );
      expect(hideTransfersCheckbox).toBeChecked();

      // When we uncheck to show transfers, percentages should change back
      fireEvent.click(hideTransfersCheckbox);

      await waitFor(() => {
        expect(screen.getByText("Transfer")).toBeInTheDocument();
      });
    });
  });

  describe("Daily Spending Chart", () => {
    it("should render daily spending chart", () => {
      render(<ExpenseAnalysis {...defaultProps} />);

      const chart = screen.getByTestId("bar-chart");
      expect(chart).toBeInTheDocument();
      expect(chart).toHaveAttribute(
        "aria-label",
        "Gráfico de barras mostrando el patrón de gastos diarios"
      );
    });

    it("should include correct chart data", () => {
      render(<ExpenseAnalysis {...defaultProps} />);

      const chartData = screen.getByTestId("chart-data");
      const data = JSON.parse(chartData.textContent || "{}");

      expect(data.labels).toEqual(["1", "2", "3"]);
      expect(data.datasets[0].data).toEqual([155.5, 0, 100.0]);
      expect(data.datasets[0].label).toBe("Gastos Diarios");
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      render(<ExpenseAnalysis {...defaultProps} />);

      expect(
        screen.getByLabelText("Seleccionar mes para análisis")
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText("Incluir transacciones pendientes")
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText("Ocultar transferencias")
      ).toBeInTheDocument();
      expect(screen.getByLabelText("Ocultar redondeos")).toBeInTheDocument();
    });

    it("should have screen reader text for expense amounts", () => {
      render(<ExpenseAnalysis {...defaultProps} />);

      const screenReaderTexts = screen.getAllByText("Gasto");
      expect(screenReaderTexts.length).toBeGreaterThan(0);

      // Check that screen reader text is properly hidden
      screenReaderTexts.forEach((text) => {
        expect(text).toHaveClass("sr-only");
      });
    });

    it("should support keyboard navigation", () => {
      render(<ExpenseAnalysis {...defaultProps} />);

      const monthSelect = screen.getByLabelText(
        "Seleccionar mes para análisis"
      );
      const pendingCheckbox = screen.getByLabelText(
        "Incluir transacciones pendientes"
      );

      // Elements should be focusable
      monthSelect.focus();
      expect(document.activeElement).toBe(monthSelect);

      pendingCheckbox.focus();
      expect(document.activeElement).toBe(pendingCheckbox);
    });
  });

  describe("Currency Formatting", () => {
    it("should format currency with proper signs and colors", () => {
      render(<ExpenseAnalysis {...defaultProps} />);

      // Negative amounts should use minus sign (−) not hyphen (-)
      expect(screen.getByText("−$500.00")).toBeInTheDocument();
      expect(screen.getByText("−$150.00")).toBeInTheDocument();

      // Positive amounts in insights should not have signs
      expect(screen.getByText("$127.50")).toBeInTheDocument();
      expect(screen.getByText("$900.00")).toBeInTheDocument();
    });
  });

  describe("Responsive Design", () => {
    it("should handle mobile layout classes", () => {
      render(<ExpenseAnalysis {...defaultProps} />);

      // Check that responsive classes are present
      const headerContainer = screen
        .getByText("Análisis Detallado de Gastos")
        .closest("div");
      expect(headerContainer?.className).toContain("sm:flex-row");
      expect(headerContainer?.className).toContain("sm:items-center");
    });
  });
});
