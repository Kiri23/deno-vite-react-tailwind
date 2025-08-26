import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ExpenseCharts } from "../ExpenseCharts";
import type { MonthlyData, BalancePoint, TypeSummary } from "../types";

// Mock Chart.js components
vi.mock("react-chartjs-2", () => ({
  Bar: vi.fn(({ data, options, ...props }) => (
    <div
      data-testid="bar-chart"
      data-chart-data={JSON.stringify(data)}
      {...props}
    >
      Bar Chart Mock
    </div>
  )),
  Line: vi.fn(({ data, options, ...props }) => (
    <div
      data-testid="line-chart"
      data-chart-data={JSON.stringify(data)}
      {...props}
    >
      Line Chart Mock
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
  LineElement: {},
  PointElement: {},
  Title: {},
  Tooltip: {},
  Legend: {},
}));

describe("ExpenseCharts", () => {
  const mockMonthlyData: MonthlyData[] = [
    {
      month: "2024-01",
      totalIncome: 3000,
      totalExpenses: -2500,
      savings: 500,
      transactionCount: 15,
      isCurrentMonth: false,
    },
    {
      month: "2024-02",
      totalIncome: 3200,
      totalExpenses: -2800,
      savings: 400,
      transactionCount: 18,
      isCurrentMonth: false,
    },
    {
      month: "2024-03",
      totalIncome: 2800,
      totalExpenses: -3000,
      savings: -200,
      transactionCount: 12,
      isCurrentMonth: true,
    },
  ];

  const mockBalanceHistory: BalancePoint[] = [
    {
      date: "2024-01-01",
      balance: 1000,
      isCalculated: false,
    },
    {
      date: "2024-01-15",
      balance: 1500,
      isCalculated: false,
    },
    {
      date: "2024-02-01",
      balance: 1900,
      isCalculated: true,
    },
  ];

  const mockTypeBreakdown: TypeSummary[] = [
    {
      type: "Debit Card",
      amount: -1500,
      count: 10,
      percentage: 60,
    },
    {
      type: "Withdrawal",
      amount: -800,
      count: 5,
      percentage: 32,
    },
    {
      type: "Transfer",
      amount: -200,
      count: 2,
      percentage: 8,
    },
  ];

  const mockTextualSummaries = [
    "En enero ingresaste $3,000, gastaste $2,500, sobrante $500 (ahorros positivos)",
    "En febrero ingresaste $3,200, gastaste $2,800, sobrante $400 (ahorros positivos)",
  ];

  const mockOnToggleCurrentMonth = vi.fn();

  const defaultProps = {
    monthlyData: mockMonthlyData,
    balanceHistory: mockBalanceHistory,
    typeBreakdown: mockTypeBreakdown,
    textualSummaries: mockTextualSummaries,
    showCurrentMonth: false,
    onToggleCurrentMonth: mockOnToggleCurrentMonth,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders monthly bar chart", () => {
    render(<ExpenseCharts {...defaultProps} />);

    const barCharts = screen.getAllByTestId("bar-chart");
    expect(barCharts.length).toBeGreaterThan(0);

    // Check that the first bar chart (monthly data) is rendered
    const monthlyChart = barCharts[0];
    expect(monthlyChart).toBeInTheDocument();
    expect(monthlyChart).toHaveAttribute(
      "aria-label",
      "Gráfico de barras mostrando ingresos, gastos y ahorros mensuales"
    );
  });

  it("renders balance history line chart", () => {
    render(<ExpenseCharts {...defaultProps} />);

    const lineChart = screen.getByTestId("line-chart");
    expect(lineChart).toBeInTheDocument();
    expect(lineChart).toHaveAttribute(
      "aria-label",
      "Gráfico de línea mostrando el historial de balance de cuenta"
    );
  });

  it("renders type breakdown bar chart", () => {
    render(<ExpenseCharts {...defaultProps} />);

    const barCharts = screen.getAllByTestId("bar-chart");
    // Should have monthly chart and type breakdown chart
    expect(barCharts.length).toBe(2);

    const typeChart = barCharts[1];
    expect(typeChart).toHaveAttribute(
      "aria-label",
      "Gráfico de barras mostrando gastos por tipo de transacción"
    );
  });

  it("shows current month toggle when current month data exists", () => {
    render(<ExpenseCharts {...defaultProps} />);

    expect(screen.getByText("Incluir mes actual")).toBeInTheDocument();
    expect(
      screen.getByText("El mes actual puede estar incompleto")
    ).toBeInTheDocument();

    const toggle = screen.getByLabelText("Incluir mes actual en los gráficos");
    expect(toggle).toBeInTheDocument();
    expect(toggle).not.toBeChecked();
  });

  it("does not show current month toggle when no current month data exists", () => {
    const propsWithoutCurrentMonth = {
      ...defaultProps,
      monthlyData: mockMonthlyData.filter((data) => !data.isCurrentMonth),
    };

    render(<ExpenseCharts {...propsWithoutCurrentMonth} />);

    expect(screen.queryByText("Incluir mes actual")).not.toBeInTheDocument();
  });

  it("handles current month toggle", () => {
    render(<ExpenseCharts {...defaultProps} />);

    const toggle = screen.getByLabelText("Incluir mes actual en los gráficos");

    fireEvent.click(toggle);

    expect(mockOnToggleCurrentMonth).toHaveBeenCalledWith(true);
  });

  it("shows warning when current month is included", () => {
    const propsWithCurrentMonth = {
      ...defaultProps,
      showCurrentMonth: true,
    };

    render(<ExpenseCharts {...propsWithCurrentMonth} />);

    expect(
      screen.getByText("⚠️ El mes actual puede mostrar datos incompletos")
    ).toBeInTheDocument();
  });

  it("does not show warning when current month is not included", () => {
    render(<ExpenseCharts {...defaultProps} />);

    expect(
      screen.queryByText("⚠️ El mes actual puede mostrar datos incompletos")
    ).not.toBeInTheDocument();
  });

  it("filters out current month data when showCurrentMonth is false", () => {
    render(<ExpenseCharts {...defaultProps} />);

    const barCharts = screen.getAllByTestId("bar-chart");
    const monthlyChart = barCharts[0];
    const chartData = JSON.parse(
      monthlyChart.getAttribute("data-chart-data") || "{}"
    );

    // Should only have 2 months (excluding current month)
    expect(chartData.labels).toHaveLength(2);
    expect(chartData.datasets[0].data).toHaveLength(2);
  });

  it("includes current month data when showCurrentMonth is true", () => {
    const propsWithCurrentMonth = {
      ...defaultProps,
      showCurrentMonth: true,
    };

    render(<ExpenseCharts {...propsWithCurrentMonth} />);

    const barCharts = screen.getAllByTestId("bar-chart");
    const monthlyChart = barCharts[0];
    const chartData = JSON.parse(
      monthlyChart.getAttribute("data-chart-data") || "{}"
    );

    // Should have all 3 months (including current month)
    expect(chartData.labels).toHaveLength(3);
    expect(chartData.datasets[0].data).toHaveLength(3);
  });

  it("handles empty monthly data", () => {
    const emptyProps = {
      ...defaultProps,
      monthlyData: [],
    };

    render(<ExpenseCharts {...emptyProps} />);

    expect(
      screen.getByText("No hay suficientes datos para generar gráficos")
    ).toBeInTheDocument();
    expect(screen.queryByTestId("bar-chart")).not.toBeInTheDocument();
    expect(screen.queryByTestId("line-chart")).not.toBeInTheDocument();
  });

  it("handles empty balance history", () => {
    const propsWithoutBalance = {
      ...defaultProps,
      balanceHistory: [],
    };

    render(<ExpenseCharts {...propsWithoutBalance} />);

    // Should still render monthly chart but not balance chart
    expect(screen.getAllByTestId("bar-chart")).toHaveLength(2); // Monthly + Type breakdown
    expect(screen.queryByTestId("line-chart")).not.toBeInTheDocument();
  });

  it("handles empty type breakdown", () => {
    const propsWithoutTypes = {
      ...defaultProps,
      typeBreakdown: [],
    };

    render(<ExpenseCharts {...propsWithoutTypes} />);

    // Should render monthly and balance charts but not type breakdown
    expect(screen.getAllByTestId("bar-chart")).toHaveLength(1); // Only monthly
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("has proper chart data structure for monthly chart", () => {
    render(<ExpenseCharts {...defaultProps} />);

    const barCharts = screen.getAllByTestId("bar-chart");
    const monthlyChart = barCharts[0];
    const chartData = JSON.parse(
      monthlyChart.getAttribute("data-chart-data") || "{}"
    );

    // Check datasets structure
    expect(chartData.datasets).toHaveLength(3); // Ingresos, Gastos, Ahorros
    expect(chartData.datasets[0].label).toBe("Ingresos");
    expect(chartData.datasets[1].label).toBe("Gastos");
    expect(chartData.datasets[2].label).toBe("Ahorros");

    // Check data values (excluding current month)
    expect(chartData.datasets[0].data).toEqual([3000, 3200]); // Income
    expect(chartData.datasets[1].data).toEqual([2500, 2800]); // Expenses (absolute values)
    expect(chartData.datasets[2].data).toEqual([500, 400]); // Savings
  });

  it("has proper chart data structure for balance chart", () => {
    render(<ExpenseCharts {...defaultProps} />);

    const lineChart = screen.getByTestId("line-chart");
    const chartData = JSON.parse(
      lineChart.getAttribute("data-chart-data") || "{}"
    );

    expect(chartData.datasets).toHaveLength(1);
    expect(chartData.datasets[0].label).toBe("Balance de Cuenta");
    expect(chartData.datasets[0].data).toEqual([1000, 1500, 1900]);
  });

  it("has proper chart data structure for type breakdown chart", () => {
    render(<ExpenseCharts {...defaultProps} />);

    const barCharts = screen.getAllByTestId("bar-chart");
    const typeChart = barCharts[1];
    const chartData = JSON.parse(
      typeChart.getAttribute("data-chart-data") || "{}"
    );

    expect(chartData.datasets).toHaveLength(1);
    expect(chartData.datasets[0].label).toBe("Gastos por Tipo");
    expect(chartData.labels).toEqual(["Debit Card", "Withdrawal", "Transfer"]);
    expect(chartData.datasets[0].data).toEqual([1500, 800, 200]); // Absolute values
  });

  it("applies correct colors for positive and negative savings", () => {
    render(<ExpenseCharts {...defaultProps} />);

    const barCharts = screen.getAllByTestId("bar-chart");
    const monthlyChart = barCharts[0];
    const chartData = JSON.parse(
      monthlyChart.getAttribute("data-chart-data") || "{}"
    );

    const savingsDataset = chartData.datasets[2]; // Ahorros dataset

    // First two months have positive savings, should be green
    expect(savingsDataset.backgroundColor[0]).toContain("34, 197, 94"); // green
    expect(savingsDataset.backgroundColor[1]).toContain("34, 197, 94"); // green
  });

  it("formats month labels correctly", () => {
    render(<ExpenseCharts {...defaultProps} />);

    const barCharts = screen.getAllByTestId("bar-chart");
    const monthlyChart = barCharts[0];
    const chartData = JSON.parse(
      monthlyChart.getAttribute("data-chart-data") || "{}"
    );

    // Should format months in Spanish
    expect(chartData.labels).toEqual(["ene 2024", "feb 2024"]);
  });
});
