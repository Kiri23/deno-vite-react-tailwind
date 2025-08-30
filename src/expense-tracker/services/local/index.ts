import type {
  CsvPort,
  AnalysisPort,
  VizPort,
  ServiceFactory,
} from "../ports.ts";
import { LocalCsvService } from "../LocalCsvService.ts";
import { LocalAnalysisService } from "../LocalAnalysisService.ts";
import { LocalVizService } from "../LocalVizService.ts";

/**
 * Error thrown when service initialization fails
 */
export class ServiceInitializationError extends Error {
  constructor(serviceName: string, cause?: Error) {
    super(
      `Failed to initialize ${serviceName} service: ${
        cause?.message || "Unknown error"
      }`
    );
    this.name = "ServiceInitializationError";
    this.cause = cause;
  }
}

/**
 * Local service factory that creates port-based service implementations
 * using in-memory processing without external dependencies.
 *
 * Includes proper error handling and service initialization validation.
 *
 * Requirements: 2.2, 2.4
 */
export function createLocalServices(): {
  csv: CsvPort;
  analysis: AnalysisPort;
  viz: VizPort;
} {
  try {
    // Initialize services with error handling
    const csvService = new LocalCsvService();
    const analysisService = new LocalAnalysisService();
    const vizService = new LocalVizService();

    // Validate service initialization
    if (!csvService || typeof csvService.validateAndParse !== "function") {
      throw new ServiceInitializationError(
        "CSV",
        new Error("Invalid CsvPort implementation")
      );
    }

    if (
      !analysisService ||
      typeof analysisService.calculateMonthlySummary !== "function"
    ) {
      throw new ServiceInitializationError(
        "Analysis",
        new Error("Invalid AnalysisPort implementation")
      );
    }

    if (
      !vizService ||
      typeof vizService.prepareMonthlyChartData !== "function"
    ) {
      throw new ServiceInitializationError(
        "Visualization",
        new Error("Invalid VizPort implementation")
      );
    }

    return {
      csv: csvService,
      analysis: analysisService,
      viz: vizService,
    };
  } catch (error) {
    if (error instanceof ServiceInitializationError) {
      throw error;
    }
    throw new ServiceInitializationError("LocalServices", error as Error);
  }
}

/**
 * Local service factory implementation that provides dependency injection
 * and contract validation capabilities with proper error handling.
 */
export class LocalServiceFactory implements ServiceFactory {
  private _services: {
    csv: CsvPort;
    analysis: AnalysisPort;
    viz: VizPort;
  } | null = null;

  /**
   * Creates and returns local service port implementations with caching
   * Services are initialized once and reused for performance
   */
  createServices(): {
    csv: CsvPort;
    analysis: AnalysisPort;
    viz: VizPort;
  } {
    if (!this._services) {
      try {
        this._services = createLocalServices();
      } catch (error) {
        // Re-throw with additional context
        throw new ServiceInitializationError(
          "LocalServiceFactory",
          error as Error
        );
      }
    }
    return this._services;
  }

  /**
   * Returns the service implementation type for debugging/logging
   */
  getServiceType(): "local" | "remote" {
    return "local";
  }

  /**
   * Validates that all services implement their contracts correctly
   * Note: Contract validation will be implemented in task 15
   */
  async validateContracts(): Promise<any> {
    try {
      // Ensure services are initialized before validation
      const services = this.createServices();

      // Basic validation that services implement required methods
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

      const errors: string[] = [];

      // Validate CSV service methods
      for (const method of csvMethods) {
        if (typeof (services.csv as any)[method] !== "function") {
          errors.push(`CsvPort missing method: ${method}`);
        }
      }

      // Validate Analysis service methods
      for (const method of analysisMethods) {
        if (typeof (services.analysis as any)[method] !== "function") {
          errors.push(`AnalysisPort missing method: ${method}`);
        }
      }

      // Validate Viz service methods
      for (const method of vizMethods) {
        if (typeof (services.viz as any)[method] !== "function") {
          errors.push(`VizPort missing method: ${method}`);
        }
      }

      const allPassed = errors.length === 0;

      // TODO: Implement full contract validation in task 15
      return {
        allPassed,
        csvPort: {
          passed: !errors.some((e) => e.includes("CsvPort")),
          errors: errors.filter((e) => e.includes("CsvPort")),
          warnings: [],
          testCases: [],
        },
        analysisPort: {
          passed: !errors.some((e) => e.includes("AnalysisPort")),
          errors: errors.filter((e) => e.includes("AnalysisPort")),
          warnings: [],
          testCases: [],
        },
        vizPort: {
          passed: !errors.some((e) => e.includes("VizPort")),
          errors: errors.filter((e) => e.includes("VizPort")),
          warnings: [],
          testCases: [],
        },
        summary: {
          totalTests:
            csvMethods.length + analysisMethods.length + vizMethods.length,
          passedTests:
            csvMethods.length +
            analysisMethods.length +
            vizMethods.length -
            errors.length,
          failedTests: errors.length,
          totalDuration: 0,
        },
      };
    } catch (error) {
      return {
        allPassed: false,
        csvPort: {
          passed: false,
          errors: ["Service initialization failed"],
          warnings: [],
          testCases: [],
        },
        analysisPort: {
          passed: false,
          errors: ["Service initialization failed"],
          warnings: [],
          testCases: [],
        },
        vizPort: {
          passed: false,
          errors: ["Service initialization failed"],
          warnings: [],
          testCases: [],
        },
        summary: {
          totalTests: 0,
          passedTests: 0,
          failedTests: 1,
          totalDuration: 0,
        },
      };
    }
  }

  /**
   * Resets the service cache, forcing re-initialization on next access
   * Useful for testing or when service configuration changes
   */
  reset(): void {
    this._services = null;
  }
}
