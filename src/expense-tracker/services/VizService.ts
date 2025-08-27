import type {
  MonthlyData,
  BalancePoint,
  TypeSummary,
  ChartDataset,
} from "../types";
import type { VizService as IVizService } from "./types";
import { formatCurrency } from "../../utils/formatting/currency";

/**
 * VizService handles chart data preparation and textual summary generation.
 * Transforms analysis data into chart-ready formats with accessibility features.
 */
export class VizService implements IVizService {
  /**
   * Transform monthly data into chart-ready format for bar charts
   * Task 4.1 implementation
   */
  static prepareMonthlyChartData(monthlyData: MonthlyData[]): ChartDataset[] {
    if (monthlyData.length === 0) {
      return [];
    }

    // Extract labels (months in readable format)
    const labels = monthlyData.map((data) => {
      // Convert YYYY-MM to readable format (e.g., "Mar 2024")
      const [year, month] = data.month.split("-");
      const monthNames = [
        "Ene",
        "Feb",
        "Mar",
        "Abr",
        "May",
        "Jun",
        "Jul",
        "Ago",
        "Sep",
        "Oct",
        "Nov",
        "Dic",
      ];
      const monthIndex = parseInt(month, 10) - 1;
      return `${monthNames[monthIndex]} ${year}`;
    });

    // Prepare data for 3 series: Ingresos, Gastos, Ahorros
    const ingresosData = monthlyData.map((data) => data.totalIncome);
    const gastosData = monthlyData.map((data) => data.totalExpenses);
    const ahorrosData = monthlyData.map((data) => data.savings);

    // Color coding for savings: green for positive, red for deficit
    const ahorrosColors = monthlyData.map(
      (data) => (data.savings >= 0 ? "#10b981" : "#ef4444") // green-500 : red-500
    );

    const chartDataset: ChartDataset = {
      labels,
      datasets: [
        {
          label: "Ingresos",
          data: ingresosData,
          backgroundColor: ["#10b981"], // green-500
          borderColor: "#059669", // green-600
          borderWidth: 1,
        },
        {
          label: "Gastos",
          data: gastosData,
          backgroundColor: ["#f59e0b"], // amber-500
          borderColor: "#d97706", // amber-600
          borderWidth: 1,
        },
        {
          label: "Ahorros",
          data: ahorrosData,
          backgroundColor: ahorrosColors,
          borderColor: ahorrosColors.map(
            (color) => (color === "#10b981" ? "#059669" : "#dc2626") // darker variants
          ),
          borderWidth: 1,
        },
      ],
    };

    return [chartDataset];
  }

  /**
   * Transform balance points into line chart format
   * Task 4.2 implementation
   */
  static prepareBalanceChartData(balanceHistory: BalancePoint[]): ChartDataset {
    if (balanceHistory.length === 0) {
      return {
        labels: [],
        datasets: [],
      };
    }

    // Extract labels (dates in readable format)
    const labels = balanceHistory.map((point) => {
      // Convert YYYY-MM-DD to readable format (e.g., "15 Mar")
      // Parse date manually to avoid timezone issues
      const [year, month, day] = point.date.split("-");
      const dayNum = parseInt(day, 10);
      const monthNames = [
        "Ene",
        "Feb",
        "Mar",
        "Abr",
        "May",
        "Jun",
        "Jul",
        "Ago",
        "Sep",
        "Oct",
        "Nov",
        "Dic",
      ];
      const monthIndex = parseInt(month, 10) - 1;
      const monthName = monthNames[monthIndex];
      return `${dayNum} ${monthName}`;
    });

    // Separate calculated vs original balance points for different styling
    const originalBalanceData = balanceHistory.map((point) =>
      point.isCalculated ? null : point.balance
    );
    const calculatedBalanceData = balanceHistory.map((point) =>
      point.isCalculated ? point.balance : null
    );

    const chartDataset: ChartDataset = {
      labels,
      datasets: [
        {
          label: "Balance Original",
          data: originalBalanceData,
          backgroundColor: ["#3b82f6"], // blue-500
          borderColor: "#2563eb", // blue-600
          borderWidth: 2,
        },
        {
          label: "Balance Calculado",
          data: calculatedBalanceData,
          backgroundColor: ["#8b5cf6"], // violet-500
          borderColor: "#7c3aed", // violet-600
          borderWidth: 2,
        },
      ],
    };

    return chartDataset;
  }

  /**
   * Transform type summary into bar chart format
   * Task 4.2 implementation (part of balance/type charts)
   */
  static prepareTypeChartData(typeSummary: TypeSummary[]): ChartDataset {
    if (typeSummary.length === 0) {
      return {
        labels: [],
        datasets: [],
      };
    }

    // Extract labels (transaction types)
    const labels = typeSummary.map((summary) => summary.type);

    // Extract data (amounts)
    const amounts = typeSummary.map((summary) => summary.amount);

    // Generate colors for different types (using a color palette)
    const colors = [
      "#ef4444", // red-500
      "#f59e0b", // amber-500
      "#10b981", // green-500
      "#3b82f6", // blue-500
      "#8b5cf6", // violet-500
      "#ec4899", // pink-500
      "#14b8a6", // teal-500
      "#f97316", // orange-500
    ];

    const backgroundColors = typeSummary.map(
      (_, index) => colors[index % colors.length]
    );

    const borderColors = backgroundColors.map((color) => {
      // Generate darker border colors
      const colorMap: Record<string, string> = {
        "#ef4444": "#dc2626", // red-600
        "#f59e0b": "#d97706", // amber-600
        "#10b981": "#059669", // green-600
        "#3b82f6": "#2563eb", // blue-600
        "#8b5cf6": "#7c3aed", // violet-600
        "#ec4899": "#db2777", // pink-600
        "#14b8a6": "#0d9488", // teal-600
        "#f97316": "#ea580c", // orange-600
      };
      return colorMap[color] || color;
    });

    const chartDataset: ChartDataset = {
      labels,
      datasets: [
        {
          label: "Gastos por Tipo",
          data: amounts,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
        },
      ],
    };

    return chartDataset;
  }

  /**
   * Generate textual summaries in Spanish for monthly data
   * Task 4.3 implementation
   */
  static generateTextualSummary(monthlyData: MonthlyData[]): string[] {
    if (monthlyData.length === 0) {
      return ["No hay datos disponibles para generar resumen."];
    }

    const summaries: string[] = [];

    // Month names in Spanish
    const monthNames = [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre",
    ];

    for (const data of monthlyData) {
      // Parse month from YYYY-MM format
      const [year, monthNum] = data.month.split("-");
      const monthIndex = parseInt(monthNum, 10) - 1;
      const monthName = monthNames[monthIndex];

      // Use centralized currency formatting with compact notation for narratives

      // Round amounts for readability in narratives and format without decimals
      const income = formatCurrency(Math.round(data.totalIncome)).replace(
        ".00",
        ""
      );
      const expenses = formatCurrency(Math.round(data.totalExpenses)).replace(
        ".00",
        ""
      );
      const savings = formatCurrency(
        Math.round(Math.abs(data.savings))
      ).replace(".00", "");

      // Generate narrative based on savings (positive vs deficit)
      let narrative: string;
      if (data.savings >= 0) {
        narrative = `En ${monthName} ${year} ingresaste ${income}, gastaste ${expenses}, sobrante ${savings} (ahorros positivos).`;
      } else {
        narrative = `En ${monthName} ${year} ingresaste ${income}, gastaste ${expenses}, déficit de ${savings}.`;
      }

      summaries.push(narrative);
    }

    // Add period overview summary
    if (monthlyData.length > 1) {
      const totalIncome = monthlyData.reduce(
        (sum, data) => sum + data.totalIncome,
        0
      );
      const totalExpenses = monthlyData.reduce(
        (sum, data) => sum + data.totalExpenses,
        0
      );
      const totalSavings = totalIncome - totalExpenses;

      // Use centralized currency formatting with compact notation for period summary

      const periodSummary =
        totalSavings >= 0
          ? `Resumen del período: ${formatCurrency(
              Math.round(totalIncome)
            ).replace(".00", "")} de ingresos, ${formatCurrency(
              Math.round(totalExpenses)
            ).replace(".00", "")} de gastos, ${formatCurrency(
              Math.round(totalSavings)
            ).replace(".00", "")} de ahorros totales.`
          : `Resumen del período: ${formatCurrency(
              Math.round(totalIncome)
            ).replace(".00", "")} de ingresos, ${formatCurrency(
              Math.round(totalExpenses)
            ).replace(".00", "")} de gastos, déficit total de ${formatCurrency(
              Math.round(Math.abs(totalSavings))
            ).replace(".00", "")}.`;

      summaries.push(periodSummary);
    }

    return summaries;
  }

  // Instance methods that delegate to static methods for interface compliance
  prepareMonthlyChartData(monthlyData: MonthlyData[]): ChartDataset[] {
    return VizService.prepareMonthlyChartData(monthlyData);
  }

  prepareBalanceChartData(balanceHistory: BalancePoint[]): ChartDataset {
    return VizService.prepareBalanceChartData(balanceHistory);
  }

  prepareTypeChartData(typeSummary: TypeSummary[]): ChartDataset {
    return VizService.prepareTypeChartData(typeSummary);
  }

  generateTextualSummary(monthlyData: MonthlyData[]): string[] {
    return VizService.generateTextualSummary(monthlyData);
  }
}
