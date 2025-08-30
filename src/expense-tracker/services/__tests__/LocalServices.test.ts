import { describe, it, expect } from "vitest";
import { createLocalServices, LocalServiceFactory } from "../local";
import type { CsvPort, AnalysisPort, VizPort } from "../ports";

describe("Local Services", () => {
  describe("createLocalServices", () => {
    it("should create services that implement port interfaces", () => {
      const services = createLocalServices();

      expect(services.csv).toBeDefined();
      expect(services.analysis).toBeDefined();
      expect(services.viz).toBeDefined();

      // Check that services implement the port interfaces
      expect(typeof services.csv.validateAndParse).toBe("function");
      expect(typeof services.csv.normalizeTransactions).toBe("function");
      expect(typeof services.csv.normalizeDate).toBe("function");
      expect(typeof services.csv.canonicalizeAmount).toBe("function");

      expect(typeof services.analysis.calculateMonthlySummary).toBe("function");
      expect(typeof services.analysis.calculateOverallSummary).toBe("function");
      expect(typeof services.analysis.generateBalanceHistory).toBe("function");
      expect(typeof services.analysis.groupByTransactionType).toBe("function");

      expect(typeof services.viz.prepareMonthlyChartData).toBe("function");
      expect(typeof services.viz.prepareBalanceChartData).toBe("function");
      expect(typeof services.viz.prepareTypeChartData).toBe("function");
      expect(typeof services.viz.generateTextualSummary).toBe("function");
    });

    it("should create services that work with sample data", () => {
      const services = createLocalServices();

      // Test CSV service
      const normalizedDate = services.csv.normalizeDate("1/15/2024");
      expect(normalizedDate).toBe("2024-01-15");

      const canonicalAmount = services.csv.canonicalizeAmount(-100, "Deposit");
      expect(canonicalAmount).toBe(100);

      // Test analysis service
      const mockTransactions = [
        {
          Date: "2024-01-15",
          Description: "Test",
          Type: "Deposit" as const,
          Amount: 1000,
          "Current balance": 1000,
          Status: "Posted" as const,
        },
      ];

      const monthlySummary =
        services.analysis.calculateMonthlySummary(mockTransactions);
      expect(Array.isArray(monthlySummary)).toBe(true);

      // Test viz service
      const textualSummary = services.viz.generateTextualSummary([]);
      expect(Array.isArray(textualSummary)).toBe(true);
      expect(textualSummary[0]).toContain("No hay datos disponibles");
    });
  });

  describe("LocalServiceFactory", () => {
    it("should implement ServiceFactory interface", () => {
      const factory = new LocalServiceFactory();

      expect(factory.getServiceType()).toBe("local");
      expect(typeof factory.createServices).toBe("function");
      expect(typeof factory.validateContracts).toBe("function");
    });

    it("should create services through factory", () => {
      const factory = new LocalServiceFactory();
      const services = factory.createServices();

      expect(services.csv).toBeDefined();
      expect(services.analysis).toBeDefined();
      expect(services.viz).toBeDefined();
    });

    it("should return placeholder contract validation", async () => {
      const factory = new LocalServiceFactory();
      const result = await factory.validateContracts();

      expect(result.allPassed).toBe(true);
      expect(result.summary).toBeDefined();
    });
  });
});
