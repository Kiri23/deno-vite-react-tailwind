/**
 * Tests for AppContext service injection and configuration
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  createTestAppContext,
  Environment,
  isLocalServiceFactory,
} from "../context";
import { LocalServiceFactory } from "../../expense-tracker/services/local";

describe("AppContext", () => {
  describe("createTestAppContext", () => {
    it("should create a test context with default values", () => {
      const context = createTestAppContext();

      expect(context.services).toBeDefined();
      expect(context.config).toBeDefined();
      expect(context.logger).toBeDefined();
      expect(context.clock).toBeDefined();
      expect(context.serviceFactory).toBeDefined();
    });

    it("should use test environment by default", () => {
      const context = createTestAppContext();
      expect(context.config.environment).toBe("test");
    });

    it("should follow foundation.md standards for config", () => {
      const context = createTestAppContext();

      expect(context.config.currency).toBe("USD");
      expect(context.config.locale).toBe("es-US");
      expect(context.config.dateFmt).toBe("iso");
    });

    it("should allow config overrides", () => {
      const context = createTestAppContext({
        config: { dateFmt: "mdy" },
      });

      expect(context.config.dateFmt).toBe("mdy");
      expect(context.config.currency).toBe("USD"); // Should keep defaults
    });

    it("should provide mock services with expected methods", () => {
      const context = createTestAppContext();

      // CSV service methods
      expect(typeof context.services.csv.validateAndParse).toBe("function");
      expect(typeof context.services.csv.normalizeTransactions).toBe(
        "function"
      );
      expect(typeof context.services.csv.normalizeDate).toBe("function");
      expect(typeof context.services.csv.canonicalizeAmount).toBe("function");

      // Analysis service methods
      expect(typeof context.services.analysis.calculateMonthlySummary).toBe(
        "function"
      );
      expect(typeof context.services.analysis.calculateOverallSummary).toBe(
        "function"
      );
      expect(typeof context.services.analysis.generateBalanceHistory).toBe(
        "function"
      );
      expect(typeof context.services.analysis.groupByTransactionType).toBe(
        "function"
      );

      // Viz service methods
      expect(typeof context.services.viz.prepareMonthlyChartData).toBe(
        "function"
      );
      expect(typeof context.services.viz.prepareBalanceChartData).toBe(
        "function"
      );
      expect(typeof context.services.viz.prepareTypeChartData).toBe("function");
      expect(typeof context.services.viz.generateTextualSummary).toBe(
        "function"
      );
    });

    it("should provide mock logger with all methods", () => {
      const context = createTestAppContext();

      expect(typeof context.logger.info).toBe("function");
      expect(typeof context.logger.warn).toBe("function");
      expect(typeof context.logger.error).toBe("function");
      expect(typeof context.logger.debug).toBe("function");
    });

    it("should provide mock clock with timezone-aware methods", () => {
      const context = createTestAppContext();

      expect(typeof context.clock.now).toBe("function");
      expect(typeof context.clock.today).toBe("function");
      expect(typeof context.clock.currentMonth).toBe("function");

      // Test fixed values for deterministic testing
      expect(context.clock.now()).toEqual(new Date("2025-01-15T10:00:00Z"));
      expect(context.clock.today()).toBe("2025-01-15");
      expect(context.clock.currentMonth()).toBe("2025-01");
    });
  });

  describe("Environment utilities", () => {
    it("should detect environment correctly", () => {
      const env = Environment.detect();
      expect(["development", "production", "test"]).toContain(env);
    });

    it("should provide boolean checks for environment", () => {
      expect(typeof Environment.isDevelopment()).toBe("boolean");
      expect(typeof Environment.isProduction()).toBe("boolean");
      expect(typeof Environment.isTest()).toBe("boolean");
    });
  });

  describe("Service factory type guards", () => {
    it("should identify LocalServiceFactory correctly", () => {
      const factory = new LocalServiceFactory();
      expect(isLocalServiceFactory(factory)).toBe(true);
    });

    it("should return false for non-local factories", () => {
      const mockFactory = {
        createServices: () => ({} as any),
        getServiceType: () => "remote" as const,
        validateContracts: () => Promise.resolve({} as any),
      };
      expect(isLocalServiceFactory(mockFactory)).toBe(false);
    });
  });
});

describe("LocalServiceFactory integration", () => {
  let factory: LocalServiceFactory;

  beforeEach(() => {
    factory = new LocalServiceFactory();
  });

  it("should create services successfully", () => {
    const services = factory.createServices();

    expect(services.csv).toBeDefined();
    expect(services.analysis).toBeDefined();
    expect(services.viz).toBeDefined();
  });

  it("should return local service type", () => {
    expect(factory.getServiceType()).toBe("local");
  });

  it("should validate contracts (basic validation)", async () => {
    const result = await factory.validateContracts();

    expect(result).toBeDefined();
    expect(typeof result.allPassed).toBe("boolean");
    expect(result.csvPort).toBeDefined();
    expect(result.analysisPort).toBeDefined();
    expect(result.vizPort).toBeDefined();
    expect(result.summary).toBeDefined();
  });

  it("should cache services for performance", () => {
    const services1 = factory.createServices();
    const services2 = factory.createServices();

    // Should return the same instances (cached)
    expect(services1).toBe(services2);
  });

  it("should reset cache when requested", () => {
    const services1 = factory.createServices();
    factory.reset();
    const services2 = factory.createServices();

    // Should return different instances after reset
    expect(services1).not.toBe(services2);
  });
});
