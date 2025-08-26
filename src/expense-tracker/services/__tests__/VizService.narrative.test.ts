import { describe, it, expect } from "vitest";
import { VizService } from "../VizService";
import type { MonthlyData } from "../../types";

describe("VizService - Textual Summary Generation", () => {
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

    it("should handle multiple months with different scenarios", () => {
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

    it("should generate period summary with total deficit", () => {
      const monthlyData: MonthlyData[] = [
        {
          month: "2024-01",
          totalIncome: 2000,
          totalExpenses: 2500,
          savings: -500,
          transactionCount: 10,
          isCurrentMonth: false,
        },
        {
          month: "2024-02",
          totalIncome: 1800,
          totalExpenses: 2200,
          savings: -400,
          transactionCount: 12,
          isCurrentMonth: false,
        },
      ];

      const result = VizService.generateTextualSummary(monthlyData);

      expect(result).toHaveLength(3);
      expect(result[2]).toBe(
        "Resumen del período: $3,800 de ingresos, $4,700 de gastos, déficit total de $900."
      );
    });

    it("should handle all months correctly", () => {
      const monthlyData: MonthlyData[] = [
        {
          month: "2024-01",
          totalIncome: 1000,
          totalExpenses: 900,
          savings: 100,
          transactionCount: 5,
          isCurrentMonth: false,
        },
        {
          month: "2024-02",
          totalIncome: 1000,
          totalExpenses: 900,
          savings: 100,
          transactionCount: 5,
          isCurrentMonth: false,
        },
        {
          month: "2024-03",
          totalIncome: 1000,
          totalExpenses: 900,
          savings: 100,
          transactionCount: 5,
          isCurrentMonth: false,
        },
        {
          month: "2024-04",
          totalIncome: 1000,
          totalExpenses: 900,
          savings: 100,
          transactionCount: 5,
          isCurrentMonth: false,
        },
        {
          month: "2024-05",
          totalIncome: 1000,
          totalExpenses: 900,
          savings: 100,
          transactionCount: 5,
          isCurrentMonth: false,
        },
        {
          month: "2024-06",
          totalIncome: 1000,
          totalExpenses: 900,
          savings: 100,
          transactionCount: 5,
          isCurrentMonth: false,
        },
        {
          month: "2024-07",
          totalIncome: 1000,
          totalExpenses: 900,
          savings: 100,
          transactionCount: 5,
          isCurrentMonth: false,
        },
        {
          month: "2024-08",
          totalIncome: 1000,
          totalExpenses: 900,
          savings: 100,
          transactionCount: 5,
          isCurrentMonth: false,
        },
        {
          month: "2024-09",
          totalIncome: 1000,
          totalExpenses: 900,
          savings: 100,
          transactionCount: 5,
          isCurrentMonth: false,
        },
        {
          month: "2024-10",
          totalIncome: 1000,
          totalExpenses: 900,
          savings: 100,
          transactionCount: 5,
          isCurrentMonth: false,
        },
        {
          month: "2024-11",
          totalIncome: 1000,
          totalExpenses: 900,
          savings: 100,
          transactionCount: 5,
          isCurrentMonth: false,
        },
        {
          month: "2024-12",
          totalIncome: 1000,
          totalExpenses: 900,
          savings: 100,
          transactionCount: 5,
          isCurrentMonth: false,
        },
      ];

      const result = VizService.generateTextualSummary(monthlyData);

      // Check all month names are correct in Spanish
      expect(result[0]).toContain("enero 2024");
      expect(result[1]).toContain("febrero 2024");
      expect(result[2]).toContain("marzo 2024");
      expect(result[3]).toContain("abril 2024");
      expect(result[4]).toContain("mayo 2024");
      expect(result[5]).toContain("junio 2024");
      expect(result[6]).toContain("julio 2024");
      expect(result[7]).toContain("agosto 2024");
      expect(result[8]).toContain("septiembre 2024");
      expect(result[9]).toContain("octubre 2024");
      expect(result[10]).toContain("noviembre 2024");
      expect(result[11]).toContain("diciembre 2024");
    });

    it("should format currency amounts correctly", () => {
      const monthlyData: MonthlyData[] = [
        {
          month: "2024-03",
          totalIncome: 1234.56,
          totalExpenses: 987.89,
          savings: 246.67,
          transactionCount: 10,
          isCurrentMonth: false,
        },
      ];

      const result = VizService.generateTextualSummary(monthlyData);

      // Should format without decimals for readability
      expect(result[0]).toBe(
        "En marzo 2024 ingresaste $1,235, gastaste $988, sobrante $247 (ahorros positivos)."
      );
    });

    it("should not generate period summary for single month", () => {
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

      expect(result).toHaveLength(1); // Only monthly summary, no period summary
    });
  });
});
