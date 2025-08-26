import { describe, it, expect } from "vitest";
import { VizService } from "../VizService";
import type { MonthlyData, BalancePoint, TypeSummary } from "../../types";

describe("VizService", () => {
  describe("prepareMonthlyChartData", () => {
    it("should return empty array for empty monthly data", () => {
      const result = VizService.prepareMonthlyChartData([]);
      expect(result).toEqual([]);
    });

    it("should transform monthly data into chart format with 3 series", () => {
      const monthlyData: MonthlyData[] = [
        {
          month: "2024-03",
          totalIncome: 3200,
          totalExpenses: 2800,
          savings: 400,
          transactionCount: 15,
          isCurrentMonth: false,
        },
        {
          month: "2024-04",
          totalIncome: 2900,
          totalExpenses: 3100,
          savings: -200,
          transactionCount: 18,
          isCurrentMonth: false,
        },
      ];

      const result = VizService.prepareMonthlyChartData(monthlyData);

      expect(result).toHaveLength(1);
      const chartData = result[0];

      // Check labels are formatted correctly
      expect(chartData.labels).toEqual(["Mar 2024", "Abr 2024"]);

      // Check we have 3 datasets
      expect(chartData.datasets).toHaveLength(3);

      // Check Ingresos dataset
      const ingresosDataset = chartData.datasets[0];
      expect(ingresosDataset.label).toBe("Ingresos");
      expect(ingresosDataset.data).toEqual([3200, 2900]);
      expect(ingresosDataset.backgroundColor).toEqual(["#10b981"]);

      // Check Gastos dataset
      const gastosDataset = chartData.datasets[1];
      expect(gastosDataset.label).toBe("Gastos");
      expect(gastosDataset.data).toEqual([2800, 3100]);
      expect(gastosDataset.backgroundColor).toEqual(["#f59e0b"]);

      // Check Ahorros dataset with color coding
      const ahorrosDataset = chartData.datasets[2];
      expect(ahorrosDataset.label).toBe("Ahorros");
      expect(ahorrosDataset.data).toEqual([400, -200]);
      expect(ahorrosDataset.backgroundColor).toEqual(["#10b981", "#ef4444"]); // green for positive, red for negative
    });
  });

  describe("prepareBalanceChartData", () => {
    it("should return empty chart for empty balance history", () => {
      const result = VizService.prepareBalanceChartData([]);
      expect(result).toEqual({
        labels: [],
        datasets: [],
      });
    });

    it("should transform balance points into line chart format", () => {
      const balanceHistory: BalancePoint[] = [
        {
          date: "2024-03-01",
          balance: 1000,
          isCalculated: false,
        },
        {
          date: "2024-03-15",
          balance: 1200,
          isCalculated: true,
        },
        {
          date: "2024-03-30",
          balance: 950,
          isCalculated: false,
        },
      ];

      const result = VizService.prepareBalanceChartData(balanceHistory);

      // Check labels are formatted correctly
      expect(result.labels).toEqual(["1 Mar", "15 Mar", "30 Mar"]);

      // Check we have 2 datasets (original and calculated)
      expect(result.datasets).toHaveLength(2);

      // Check Original Balance dataset
      const originalDataset = result.datasets[0];
      expect(originalDataset.label).toBe("Balance Original");
      expect(originalDataset.data).toEqual([1000, null, 950]); // null for calculated points

      // Check Calculated Balance dataset
      const calculatedDataset = result.datasets[1];
      expect(calculatedDataset.label).toBe("Balance Calculado");
      expect(calculatedDataset.data).toEqual([null, 1200, null]); // null for original points
    });
  });

  describe("prepareTypeChartData", () => {
    it("should return empty chart for empty type summary", () => {
      const result = VizService.prepareTypeChartData([]);
      expect(result).toEqual({
        labels: [],
        datasets: [],
      });
    });

    it("should transform type summary into bar chart format", () => {
      const typeSummary: TypeSummary[] = [
        {
          type: "Debit Card",
          amount: 1500,
          count: 10,
          percentage: 60,
        },
        {
          type: "Withdrawal",
          amount: 800,
          count: 4,
          percentage: 32,
        },
        {
          type: "Transfer",
          amount: 200,
          count: 2,
          percentage: 8,
        },
      ];

      const result = VizService.prepareTypeChartData(typeSummary);

      // Check labels
      expect(result.labels).toEqual(["Debit Card", "Withdrawal", "Transfer"]);

      // Check dataset
      expect(result.datasets).toHaveLength(1);
      const dataset = result.datasets[0];
      expect(dataset.label).toBe("Gastos por Tipo");
      expect(dataset.data).toEqual([1500, 800, 200]);

      // Check colors are assigned
      expect(dataset.backgroundColor).toHaveLength(3);
      expect(dataset.borderColor).toHaveLength(3);
    });
  });

  describe("generateTextualSummary", () => {
    it("should return no data message for empty monthly data", () => {
      const result = VizService.generateTextualSummary([]);
      expect(result).toEqual([
        "No hay datos disponibles para generar resumen.",
      ]);
    });

    it("should generate Spanish narratives for positive savings", () => {
      const monthlyData: MonthlyData[] = [
        {
          month: "2024-03",
          totalIncome: 3200,
          totalExpenses: 2800,
          savings: 400,
          transactionCount: 15,
          isCurrentMonth: false,
        },
      ];

      const result = VizService.generateTextualSummary(monthlyData);

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(
        "En marzo 2024 ingresaste $3,200, gastaste $2,800, sobrante $400 (ahorros positivos)."
      );
    });

    it("should generate Spanish narratives for deficit months", () => {
      const monthlyData: MonthlyData[] = [
        {
          month: "2024-04",
          totalIncome: 2900,
          totalExpenses: 3100,
          savings: -200,
          transactionCount: 18,
          isCurrentMonth: false,
        },
      ];

      const result = VizService.generateTextualSummary(monthlyData);

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(
        "En abril 2024 ingresaste $2,900, gastaste $3,100, déficit de $200."
      );
    });

    it("should handle multiple months with period summary", () => {
      const monthlyData: MonthlyData[] = [
        {
          month: "2024-01",
          totalIncome: 5000,
          totalExpenses: 4500,
          savings: 500,
          transactionCount: 20,
          isCurrentMonth: false,
        },
        {
          month: "2024-02",
          totalIncome: 3000,
          totalExpenses: 3500,
          savings: -500,
          transactionCount: 15,
          isCurrentMonth: false,
        },
      ];

      const result = VizService.generateTextualSummary(monthlyData);

      expect(result).toHaveLength(3); // 2 monthly + 1 period summary

      expect(result[0]).toBe(
        "En enero 2024 ingresaste $5,000, gastaste $4,500, sobrante $500 (ahorros positivos)."
      );
      expect(result[1]).toBe(
        "En febrero 2024 ingresaste $3,000, gastaste $3,500, déficit de $500."
      );

      // Period summary should show net result
      expect(result[2]).toBe(
        "Resumen del período: $8,000 de ingresos, $8,000 de gastos, $0 de ahorros totales."
      );
    });
  });
});
