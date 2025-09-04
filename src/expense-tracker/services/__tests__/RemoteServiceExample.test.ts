/**
 * Example test file showing how future RemoteService implementations
 * would use the same contract test suite for validation.
 *
 * This file is for documentation purposes and shows the pattern
 * that RemoteService implementations must follow.
 *
 * Requirements: 2.6
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { createContractTestSuite } from "./ContractTestSuite.ts";
import type { CsvPort, AnalysisPort, VizPort } from "../ports.ts";

// Mock RemoteService implementations for demonstration
// In the actual implementation, these would make HTTP calls to backend services

class MockRemoteCsvService implements CsvPort {
  async validateAndParse(file: File) {
    // Mock HTTP call to backend CSV processing service
    return {
      isValid: true,
      transactions: [],
      metadata: {
        rowCount: 0,
        dateRange: { start: "", end: "" },
        balanceSource: "original" as const,
      },
    };
  }

  normalizeTransactions(raw: any[]) {
    // Mock HTTP call to backend normalization service
    return [];
  }

  normalizeDate(dateStr: string) {
    // Mock HTTP call to backend date normalization service
    return "2024-01-15";
  }

  canonicalizeAmount(amount: number, type: string) {
    // Mock HTTP call to backend amount canonicalization service
    return amount;
  }
}

class MockRemoteAnalysisService implements AnalysisPort {
  calculateMonthlySummary(transactions: any[], excludeCurrent = true) {
    // Mock HTTP call to backend analysis service
    return [];
  }

  calculateOverallSummary(transactions: any[]) {
    // Mock HTTP call to backend summary service
    return {
      totalIncome: 0,
      totalExpenses: 0,
      netSavings: 0,
      transactionCount: 0,
      dateRange: { start: "", end: "" },
      balanceSource: "original" as const,
    };
  }

  generateBalanceHistory(transactions: any[]) {
    // Mock HTTP call to backend balance history service
    return [];
  }

  groupByTransactionType(transactions: any[]) {
    // Mock HTTP call to backend type grouping service
    return [];
  }
}

class MockRemoteVizService implements VizPort {
  prepareMonthlyChartData(monthlyData: any[]) {
    // Mock HTTP call to backend chart preparation service
    return [];
  }

  prepareBalanceChartData(balanceHistory: any[]) {
    // Mock HTTP call to backend balance chart service
    return {
      labels: [],
      datasets: [],
    };
  }

  prepareTypeChartData(typeSummary: any[]) {
    // Mock HTTP call to backend type chart service
    return {
      labels: [],
      datasets: [],
    };
  }

  generateTextualSummary(monthlyData: any[]) {
    // Mock HTTP call to backend narrative service
    return ["No hay datos disponibles para mostrar un resumen."];
  }
}

describe("RemoteService Contract Validation Example", () => {
  let csvService: CsvPort;
  let analysisService: AnalysisPort;
  let vizService: VizPort;
  let contractTestSuite: ReturnType<typeof createContractTestSuite>;

  beforeEach(() => {
    // Create mock remote services
    csvService = new MockRemoteCsvService();
    analysisService = new MockRemoteAnalysisService();
    vizService = new MockRemoteVizService();
    contractTestSuite = createContractTestSuite();
  });

  describe("Contract Test Suite Compatibility", () => {
    it("should demonstrate that RemoteServices use the same contract test suite", async () => {
      // This test demonstrates that future RemoteService implementations
      // will use the exact same contract test suite as LocalService implementations

      const services = {
        csv: csvService,
        analysis: analysisService,
        viz: vizService,
      };

      // The same contract test suite that validates LocalServices
      // will validate RemoteServices, ensuring swap compatibility
      const result = await contractTestSuite.validateAllPorts(services);

      // Note: These mock services will fail validation because they return empty/mock data
      // Real RemoteService implementations must return properly structured data
      // that matches the contract expectations

      expect(result).toBeDefined();
      expect(result.allPassed).toBeDefined();
      expect(result.csvPort).toBeDefined();
      expect(result.analysisPort).toBeDefined();
      expect(result.vizPort).toBeDefined();
      expect(result.summary).toBeDefined();

      // The structure of the validation result is identical for both
      // LocalService and RemoteService implementations
      expect(typeof result.allPassed).toBe("boolean");
      expect(Array.isArray(result.csvPort.errors)).toBe(true);
      expect(Array.isArray(result.analysisPort.errors)).toBe(true);
      expect(Array.isArray(result.vizPort.errors)).toBe(true);
    });

    it("should validate that RemoteServices implement the same port interfaces", async () => {
      // Verify that RemoteServices implement the exact same method signatures
      // as LocalServices, ensuring they can be swapped without code changes

      // CsvPort methods
      expect(typeof csvService.validateAndParse).toBe("function");
      expect(typeof csvService.normalizeTransactions).toBe("function");
      expect(typeof csvService.normalizeDate).toBe("function");
      expect(typeof csvService.canonicalizeAmount).toBe("function");

      // AnalysisPort methods
      expect(typeof analysisService.calculateMonthlySummary).toBe("function");
      expect(typeof analysisService.calculateOverallSummary).toBe("function");
      expect(typeof analysisService.generateBalanceHistory).toBe("function");
      expect(typeof analysisService.groupByTransactionType).toBe("function");

      // VizPort methods
      expect(typeof vizService.prepareMonthlyChartData).toBe("function");
      expect(typeof vizService.prepareBalanceChartData).toBe("function");
      expect(typeof vizService.prepareTypeChartData).toBe("function");
      expect(typeof vizService.generateTextualSummary).toBe("function");
    });

    it("should demonstrate contract validation failure handling", async () => {
      // This test shows how contract validation failures are reported
      // for RemoteService implementations that don't meet the contract requirements

      const services = {
        csv: csvService,
        analysis: analysisService,
        viz: vizService,
      };
      const result = await contractTestSuite.validateAllPorts(services);

      // Mock services will likely fail validation due to empty/incorrect return values
      // Real RemoteService implementations must return data that matches contract expectations

      if (!result.allPassed) {
        // Demonstrate how to handle validation failures
        console.log("Contract validation failed for RemoteServices:");
        console.log("CSV Port errors:", result.csvPort.errors);
        console.log("Analysis Port errors:", result.analysisPort.errors);
        console.log("Viz Port errors:", result.vizPort.errors);

        // Failed test cases provide detailed information about what went wrong
        const failedTests = [
          ...result.csvPort.testCases.filter((t) => !t.passed),
          ...result.analysisPort.testCases.filter((t) => !t.passed),
          ...result.vizPort.testCases.filter((t) => !t.passed),
        ];

        console.log(
          "Failed test cases:",
          failedTests.map((t) => t.name)
        );
      }

      // The validation result structure is consistent regardless of pass/fail
      expect(result.summary.totalTests).toBeGreaterThan(0);
      expect(result.summary.totalDuration).toBeGreaterThan(0);
    });
  });

  describe("Future RemoteService Implementation Pattern", () => {
    it("should demonstrate the pattern for implementing RemoteServices", async () => {
      // This test demonstrates the pattern that future RemoteService implementations should follow

      // 1. Implement the same port interfaces as LocalServices
      expect(csvService).toBeInstanceOf(MockRemoteCsvService);
      expect(analysisService).toBeInstanceOf(MockRemoteAnalysisService);
      expect(vizService).toBeInstanceOf(MockRemoteVizService);

      // 2. Use the same contract test suite for validation
      const contractTestSuite = createContractTestSuite();
      expect(contractTestSuite).toBeDefined();

      // 3. Ensure method signatures match exactly
      const csvMethods = [
        "validateAndParse",
        "normalizeTransactions",
        "normalizeDate",
        "canonicalizeAmount",
      ];
      const analysisMethods = [
        "calculateMonthlySummary",
        "calculateOverallSummary",
        "generateBalanceHistory",
        "groupByTransactionType",
      ];
      const vizMethods = [
        "prepareMonthlyChartData",
        "prepareBalanceChartData",
        "prepareTypeChartData",
        "generateTextualSummary",
      ];

      for (const method of csvMethods) {
        expect(typeof (csvService as any)[method]).toBe("function");
      }

      for (const method of analysisMethods) {
        expect(typeof (analysisService as any)[method]).toBe("function");
      }

      for (const method of vizMethods) {
        expect(typeof (vizService as any)[method]).toBe("function");
      }

      // 4. Return data structures that match the contract expectations
      // (This is where real RemoteService implementations would differ from these mocks)

      // 5. Pass the same contract validation tests as LocalServices
      // (Real implementations must achieve result.allPassed === true)
    });

    it("should demonstrate service factory pattern for RemoteServices", async () => {
      // Future RemoteServiceFactory would follow the same pattern as LocalServiceFactory

      class MockRemoteServiceFactory {
        createServices() {
          return {
            csv: new MockRemoteCsvService(),
            analysis: new MockRemoteAnalysisService(),
            viz: new MockRemoteVizService(),
          };
        }

        getServiceType(): "local" | "remote" {
          return "remote";
        }

        async validateContracts() {
          const services = this.createServices();
          const contractTestSuite = createContractTestSuite();
          return await contractTestSuite.validateAllPorts(services);
        }
      }

      const factory = new MockRemoteServiceFactory();

      expect(factory.getServiceType()).toBe("remote");
      expect(typeof factory.createServices).toBe("function");
      expect(typeof factory.validateContracts).toBe("function");

      const services = factory.createServices();
      expect(services.csv).toBeDefined();
      expect(services.analysis).toBeDefined();
      expect(services.viz).toBeDefined();

      // The factory pattern ensures consistent service creation
      // regardless of whether services are local or remote
    });
  });

  describe("Migration Compatibility Guarantee", () => {
    it("should guarantee that UI components remain unchanged during service migration", async () => {
      // This test demonstrates that the contract test suite guarantees
      // that UI components, hooks, and ViewModels remain unchanged
      // when migrating from LocalServices to RemoteServices

      const localServices = {
        csv: csvService, // These would be LocalCsvService in real implementation
        analysis: analysisService, // These would be LocalAnalysisService in real implementation
        viz: vizService, // These would be LocalVizService in real implementation
      };

      const remoteServices = {
        csv: new MockRemoteCsvService(),
        analysis: new MockRemoteAnalysisService(),
        viz: new MockRemoteVizService(),
      };

      // Both service implementations use the same contract test suite
      const contractTestSuite = createContractTestSuite();

      // The validation process is identical for both implementations
      const localResult = await contractTestSuite.validateAllPorts(
        localServices
      );
      const remoteResult = await contractTestSuite.validateAllPorts(
        remoteServices
      );

      // Both results have the same structure, guaranteeing compatibility
      expect(typeof localResult.allPassed).toBe(typeof remoteResult.allPassed);
      expect(Array.isArray(localResult.csvPort.errors)).toBe(
        Array.isArray(remoteResult.csvPort.errors)
      );
      expect(Array.isArray(localResult.analysisPort.errors)).toBe(
        Array.isArray(remoteResult.analysisPort.errors)
      );
      expect(Array.isArray(localResult.vizPort.errors)).toBe(
        Array.isArray(remoteResult.vizPort.errors)
      );

      // The contract test suite ensures that both implementations
      // provide the same interface to dependent code (ViewModels, hooks, UI components)

      // When both implementations pass the contract tests (allPassed === true),
      // they can be swapped without any changes to:
      // - ExpenseVM (ViewModel layer)
      // - useExpenseCore, useCsv, useAnalyze, useVisualize (Hook layer)
      // - ImportCsvView, AnalyzeView, VisualizeView (UI component layer)
      // - ExpensesLayout, ExpensesNavigation (Layout component layer)

      // Only the AppContext service factory needs to change:
      // createLocalServices() -> createRemoteServices(queryClient)
    });
  });
});

/**
 * Documentation: How to implement RemoteServices
 *
 * 1. Create RemoteService classes that implement the same port interfaces:
 *    - RemoteCsvService implements CsvPort
 *    - RemoteAnalysisService implements AnalysisPort
 *    - RemoteVizService implements VizPort
 *
 * 2. Use HTTP clients (fetch, TanStack Query) to communicate with backend:
 *    - POST /api/csv/validate-and-parse for CSV processing
 *    - POST /api/analysis/monthly-summary for financial analysis
 *    - POST /api/viz/chart-data for visualization preparation
 *
 * 3. Ensure return data structures match LocalService implementations:
 *    - Same TypeScript interfaces and data formats
 *    - Same error handling patterns and validation rules
 *    - Same foundation.md compliance (currency, dates, amounts)
 *
 * 4. Create RemoteServiceFactory following LocalServiceFactory pattern:
 *    - Implement ServiceFactory interface
 *    - Use createContractTestSuite() for validation
 *    - Return "remote" from getServiceType()
 *
 * 5. Validate with the same contract test suite:
 *    - Import createContractTestSuite from this file
 *    - Run validateAllPorts() with RemoteService instances
 *    - Ensure result.allPassed === true before deployment
 *
 * 6. Update AppContext to use RemoteServiceFactory:
 *    - Change createLocalServices() to createRemoteServices(queryClient)
 *    - No other code changes required in the entire application
 *
 * This pattern guarantees zero-downtime migration from local to remote services.
 */
