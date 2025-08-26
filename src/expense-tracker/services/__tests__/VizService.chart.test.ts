import { describe, it, expect } from "vitest";
import { VizService } from "../VizService";
import type { MonthlyData, BalancePoint, TypeSummary } from "../../types";

describe("VizService - Chart Data Preparation", () => {
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

    it("should handle single month data", () => {
      const monthlyData: MonthlyData[] = [
        {
          month: "2024-12",
          totalIncome: 5000,
          totalExpenses: 4500,
          savings: 500,
          transactionCount: 20,
          isCurrentMonth: false,
        },
      ];

      const result = VizService.prepareMonthlyChartData(monthlyData);
      const chartData = result[0];

      expect(chartData.labels).toEqual(["Dic 2024"]);
      expect(chartData.datasets[0].data).toEqual([5000]);
      expect(chartData.datasets[1].data).toEqual([4500]);
      expect(chartData.datasets[2].data).toEqual([500]);
    });

    it("should handle all deficit months", () => {
      const monthlyData: MonthlyData[] = [
        {
          month: "2024-01",
          totalIncome: 1000,
          totalExpenses: 1500,
          savings: -500,
          transactionCount: 10,
          isCurrentMonth: false,
        },
        {
          month: "2024-02",
          totalIncome: 800,
          totalExpenses: 1200,
          savings: -400,
          transactionCount: 8,
          isCurrentMonth: false,
        },
      ];

      const result = VizService.prepareMonthlyChartData(monthlyData);
      const ahorrosDataset = result[0].datasets[2];

      // All savings should be red (deficit)
      expect(ahorrosDataset.backgroundColor).toEqual(["#ef4444", "#ef4444"]);
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

    it("should handle all original balance points", () => {
      const balanceHistory: BalancePoint[] = [
        {
          date: "2024-01-01",
          balance: 500,
          isCalculated: false,
        },
        {
          date: "2024-01-15",
          balance: 750,
          isCalculated: false,
        },
      ];

      const result = VizService.prepareBalanceChartData(balanceHistory);

      expect(result.datasets[0].data).toEqual([500, 750]);
      expect(result.datasets[1].data).toEqual([null, null]);
    });

    it("should handle all calculated balance points", () => {
      const balanceHistory: BalancePoint[] = [
        {
          date: "2024-01-01",
          balance: 500,
          isCalculated: true,
        },
        {
          date: "2024-01-15",
          balance: 750,
          isCalculated: true,
        },
      ];

      const result = VizService.prepareBalanceChartData(balanceHistory);

      expect(result.datasets[0].data).toEqual([null, null]);
      expect(result.datasets[1].data).toEqual([500, 750]);
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

    it("should handle many transaction types with color cycling", () => {
      const typeSummary: TypeSummary[] = Array.from({ length: 10 }, (_, i) => ({
        type: `Type ${i + 1}`,
        amount: 100 * (i + 1),
        count: i + 1,
        percentage: 10,
      }));

      const result = VizService.prepareTypeChartData(typeSummary);

      expect(result.labels).toHaveLength(10);
      expect(result.datasets[0].data).toHaveLength(10);
      expect(result.datasets[0].backgroundColor).toHaveLength(10);

      // Colors should cycle (8 colors available, so index 8 should be same as index 0)
      expect(result.datasets[0].backgroundColor[0]).toBe(
        result.datasets[0].backgroundColor[8]
      );
    });
  });
});
