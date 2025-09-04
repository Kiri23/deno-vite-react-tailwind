/**
 * Contract validation tests for service port implementations
 *
 * This test file demonstrates how to use the shared contract test suite
 * to validate that LocalService implementations comply with port contracts.
 * Future RemoteService implementations must pass the same test suite.
 *
 * Requirements: 2.6
 */

import { describe, it, expect, beforeEach } from "vitest";
import { createLocalServices } from "../local/index.ts";
import { createContractTestSuite } from "./ContractTestSuite.ts";
import type { CsvPort, AnalysisPort, VizPort } from "../ports.ts";

describe("Service Contract Validation", () => {
  let csvService: CsvPort;
  let analysisService: AnalysisPort;
  let vizService: VizPort;
  let contractTestSuite: ReturnType<typeof createContractTestSuite>;

  beforeEach(() => {
    const services = createLocalServices();
    csvService = services.csv;
    analysisService = services.analysis;
    vizService = services.viz;
    contractTestSuite = createContractTestSuite();
  });

  describe("LocalCsvService Contract Validation", () => {
    it("should pass all CsvPort contract tests", async () => {
      const result = await contractTestSuite.validateCsvPort(csvService);

      // Log detailed results for debugging
      if (!result.passed) {
        console.error("CsvPort contract validation failed:");
        console.error("Errors:", result.errors);
        console.error(
          "Test cases:",
          result.testCases.filter((t) => !t.passed)
        );
      }

      expect(result.passed).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.testCases.length).toBeGreaterThan(0);

      // Verify all test cases passed
      const failedTests = result.testCases.filter((t) => !t.passed);
      expect(failedTests).toHaveLength(0);
    });

    it("should validate method signatures correctly", async () => {
      const result = await contractTestSuite.validateCsvPort(csvService);

      const methodTest = result.testCases.find(
        (t) => t.name === "Method existence validation"
      );
      expect(methodTest).toBeDefined();
      expect(methodTest!.passed).toBe(true);
    });

    it("should validate date normalization correctly", async () => {
      const result = await contractTestSuite.validateCsvPort(csvService);

      const dateTest = result.testCases.find(
        (t) => t.name === "Date normalization"
      );
      expect(dateTest).toBeDefined();
      expect(dateTest!.passed).toBe(true);
    });

    it("should validate amount canonicalization correctly", async () => {
      const result = await contractTestSuite.validateCsvPort(csvService);

      const amountTest = result.testCases.find(
        (t) => t.name === "Amount canonicalization"
      );
      expect(amountTest).toBeDefined();
      expect(amountTest!.passed).toBe(true);
    });

    it("should validate transaction normalization correctly", async () => {
      const result = await contractTestSuite.validateCsvPort(csvService);

      const normalizationTest = result.testCases.find(
        (t) => t.name === "Transaction normalization"
      );
      expect(normalizationTest).toBeDefined();
      expect(normalizationTest!.passed).toBe(true);
    });
  });

  describe("LocalAnalysisService Contract Validation", () => {
    it("should pass all AnalysisPort contract tests", async () => {
      const result = await contractTestSuite.validateAnalysisPort(
        analysisService
      );

      // Log detailed results for debugging
      if (!result.passed) {
        console.error("AnalysisPort contract validation failed:");
        console.error("Errors:", result.errors);
        console.error(
          "Test cases:",
          result.testCases.filter((t) => !t.passed)
        );
      }

      expect(result.passed).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.testCases.length).toBeGreaterThan(0);

      // Verify all test cases passed
      const failedTests = result.testCases.filter((t) => !t.passed);
      expect(failedTests).toHaveLength(0);
    });

    it("should validate method signatures correctly", async () => {
      const result = await contractTestSuite.validateAnalysisPort(
        analysisService
      );

      const methodTest = result.testCases.find(
        (t) => t.name === "Method existence validation"
      );
      expect(methodTest).toBeDefined();
      expect(methodTest!.passed).toBe(true);
    });

    it("should validate monthly summary calculations", async () => {
      const result = await contractTestSuite.validateAnalysisPort(
        analysisService
      );

      const monthlyTest = result.testCases.find(
        (t) => t.name === "Monthly summary calculation"
      );
      expect(monthlyTest).toBeDefined();
      expect(monthlyTest!.passed).toBe(true);
    });

    it("should validate overall summary calculations", async () => {
      const result = await contractTestSuite.validateAnalysisPort(
        analysisService
      );

      const overallTest = result.testCases.find(
        (t) => t.name === "Overall summary calculation"
      );
      expect(overallTest).toBeDefined();
      expect(overallTest!.passed).toBe(true);
    });

    it("should validate balance history generation", async () => {
      const result = await contractTestSuite.validateAnalysisPort(
        analysisService
      );

      const balanceTest = result.testCases.find(
        (t) => t.name === "Balance history generation"
      );
      expect(balanceTest).toBeDefined();
      expect(balanceTest!.passed).toBe(true);
    });

    it("should validate transaction type grouping", async () => {
      const result = await contractTestSuite.validateAnalysisPort(
        analysisService
      );

      const typeTest = result.testCases.find(
        (t) => t.name === "Transaction type grouping"
      );
      expect(typeTest).toBeDefined();
      expect(typeTest!.passed).toBe(true);
    });
  });

  describe("LocalVizService Contract Validation", () => {
    it("should pass all VizPort contract tests", async () => {
      const result = await contractTestSuite.validateVizPort(vizService);

      // Log detailed results for debugging
      if (!result.passed) {
        console.error("VizPort contract validation failed:");
        console.error("Errors:", result.errors);
        console.error(
          "Test cases:",
          result.testCases.filter((t) => !t.passed)
        );
      }

      expect(result.passed).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.testCases.length).toBeGreaterThan(0);

      // Verify all test cases passed
      const failedTests = result.testCases.filter((t) => !t.passed);
      expect(failedTests).toHaveLength(0);
    });

    it("should validate method signatures correctly", async () => {
      const result = await contractTestSuite.validateVizPort(vizService);

      const methodTest = result.testCases.find(
        (t) => t.name === "Method existence validation"
      );
      expect(methodTest).toBeDefined();
      expect(methodTest!.passed).toBe(true);
    });

    it("should validate monthly chart data preparation", async () => {
      const result = await contractTestSuite.validateVizPort(vizService);

      const monthlyChartTest = result.testCases.find(
        (t) => t.name === "Monthly chart data preparation"
      );
      expect(monthlyChartTest).toBeDefined();
      expect(monthlyChartTest!.passed).toBe(true);
    });

    it("should validate balance chart data preparation", async () => {
      const result = await contractTestSuite.validateVizPort(vizService);

      const balanceChartTest = result.testCases.find(
        (t) => t.name === "Balance chart data preparation"
      );
      expect(balanceChartTest).toBeDefined();
      expect(balanceChartTest!.passed).toBe(true);
    });

    it("should validate type chart data preparation", async () => {
      const result = await contractTestSuite.validateVizPort(vizService);

      const typeChartTest = result.testCases.find(
        (t) => t.name === "Type chart data preparation"
      );
      expect(typeChartTest).toBeDefined();
      expect(typeChartTest!.passed).toBe(true);
    });

    it("should validate textual summary generation", async () => {
      const result = await contractTestSuite.validateVizPort(vizService);

      const textualTest = result.testCases.find(
        (t) => t.name === "Textual summary generation"
      );
      expect(textualTest).toBeDefined();
      expect(textualTest!.passed).toBe(true);
    });
  });

  describe("Complete Contract Validation Suite", () => {
    it("should pass all contract tests for all services", async () => {
      const services = {
        csv: csvService,
        analysis: analysisService,
        viz: vizService,
      };
      const result = await contractTestSuite.validateAllPorts(services);

      // Log detailed results for debugging
      if (!result.allPassed) {
        console.error("Complete contract validation failed:");
        console.error("CSV Port:", result.csvPort.errors);
        console.error("Analysis Port:", result.analysisPort.errors);
        console.error("Viz Port:", result.vizPort.errors);
        console.error("Summary:", result.summary);
      }

      expect(result.allPassed).toBe(true);
      expect(result.summary.failedTests).toBe(0);
      expect(result.summary.totalTests).toBeGreaterThan(0);
      expect(result.summary.passedTests).toBe(result.summary.totalTests);
    });

    it("should provide comprehensive test coverage", async () => {
      const services = {
        csv: csvService,
        analysis: analysisService,
        viz: vizService,
      };
      const result = await contractTestSuite.validateAllPorts(services);

      // Verify we have tests for all major contract areas
      expect(result.csvPort.testCases.length).toBeGreaterThanOrEqual(4); // Method existence, date norm, amount canon, transaction norm
      expect(result.analysisPort.testCases.length).toBeGreaterThanOrEqual(5); // Method existence, monthly, overall, balance, type
      expect(result.vizPort.testCases.length).toBeGreaterThanOrEqual(5); // Method existence, monthly chart, balance chart, type chart, textual

      // Verify performance tracking
      expect(result.summary.totalDuration).toBeGreaterThan(0);

      // Verify all individual test cases have duration tracking
      const allTestCases = [
        ...result.csvPort.testCases,
        ...result.analysisPort.testCases,
        ...result.vizPort.testCases,
      ];

      for (const testCase of allTestCases) {
        expect(testCase.duration).toBeGreaterThanOrEqual(0);
      }
    });

    it("should be suitable for validating future RemoteService implementations", async () => {
      // This test verifies that the contract test suite is comprehensive enough
      // to validate future RemoteService implementations

      const services = {
        csv: csvService,
        analysis: analysisService,
        viz: vizService,
      };
      const result = await contractTestSuite.validateAllPorts(services);

      // Verify contract coverage includes all critical areas
      const csvTestNames = result.csvPort.testCases.map((t) => t.name);
      expect(csvTestNames).toContain("Method existence validation");
      expect(csvTestNames).toContain("Date normalization");
      expect(csvTestNames).toContain("Amount canonicalization");
      expect(csvTestNames).toContain("Transaction normalization");

      const analysisTestNames = result.analysisPort.testCases.map(
        (t) => t.name
      );
      expect(analysisTestNames).toContain("Method existence validation");
      expect(analysisTestNames).toContain("Monthly summary calculation");
      expect(analysisTestNames).toContain("Overall summary calculation");
      expect(analysisTestNames).toContain("Balance history generation");
      expect(analysisTestNames).toContain("Transaction type grouping");

      const vizTestNames = result.vizPort.testCases.map((t) => t.name);
      expect(vizTestNames).toContain("Method existence validation");
      expect(vizTestNames).toContain("Monthly chart data preparation");
      expect(vizTestNames).toContain("Balance chart data preparation");
      expect(vizTestNames).toContain("Type chart data preparation");
      expect(vizTestNames).toContain("Textual summary generation");

      // Verify error reporting is comprehensive
      expect(typeof result.csvPort.passed).toBe("boolean");
      expect(Array.isArray(result.csvPort.errors)).toBe(true);
      expect(Array.isArray(result.csvPort.warnings)).toBe(true);
      expect(Array.isArray(result.csvPort.testCases)).toBe(true);

      // This test passing means the contract test suite is ready to validate
      // any future RemoteService implementation that implements the same ports
      expect(result.allPassed).toBe(true);
    });
  });

  describe("Data Consistency Validation", () => {
    it("should validate foundation.md compliance for currency formatting", async () => {
      // Test that services follow foundation.md standards
      const services = {
        csv: csvService,
        analysis: analysisService,
        viz: vizService,
      };
      const result = await contractTestSuite.validateAllPorts(services);

      // The contract test suite validates that:
      // 1. Amount canonicalization follows foundation.md rules
      // 2. Date normalization uses YYYY-MM-DD format
      // 3. Balance source metadata is properly tracked
      // 4. Textual summaries are in Spanish as specified

      expect(result.allPassed).toBe(true);

      // Verify specific foundation.md compliance through contract tests
      const csvResult = result.csvPort;
      const amountTest = csvResult.testCases.find(
        (t) => t.name === "Amount canonicalization"
      );
      expect(amountTest?.passed).toBe(true);

      const dateTest = csvResult.testCases.find(
        (t) => t.name === "Date normalization"
      );
      expect(dateTest?.passed).toBe(true);
    });

    it("should validate error handling consistency", async () => {
      // Test that all services handle errors consistently
      const services = {
        csv: csvService,
        analysis: analysisService,
        viz: vizService,
      };

      // The contract test suite includes error handling validation
      // by testing with invalid inputs and edge cases
      const result = await contractTestSuite.validateAllPorts(services);

      expect(result.allPassed).toBe(true);

      // Verify that services don't throw unhandled exceptions
      // (this is tested implicitly by the contract test suite)
      expect(result.csvPort.errors).toHaveLength(0);
      expect(result.analysisPort.errors).toHaveLength(0);
      expect(result.vizPort.errors).toHaveLength(0);
    });

    it("should validate method signature consistency", async () => {
      // Test that all services implement the exact method signatures defined in ports
      const services = {
        csv: csvService,
        analysis: analysisService,
        viz: vizService,
      };
      const result = await contractTestSuite.validateAllPorts(services);

      // Method existence validation is the first test for each port
      const csvMethodTest = result.csvPort.testCases.find(
        (t) => t.name === "Method existence validation"
      );
      const analysisMethodTest = result.analysisPort.testCases.find(
        (t) => t.name === "Method existence validation"
      );
      const vizMethodTest = result.vizPort.testCases.find(
        (t) => t.name === "Method existence validation"
      );

      expect(csvMethodTest?.passed).toBe(true);
      expect(analysisMethodTest?.passed).toBe(true);
      expect(vizMethodTest?.passed).toBe(true);

      // This ensures that any RemoteService implementation will have
      // the exact same method signatures as LocalService
      expect(result.allPassed).toBe(true);
    });
  });
});
