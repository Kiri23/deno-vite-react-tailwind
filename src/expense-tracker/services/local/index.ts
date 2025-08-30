import type { CsvPort, AnalysisPort, VizPort, ServiceFactory } from "../ports";
import { LocalCsvService } from "../LocalCsvService";
import { LocalAnalysisService } from "../LocalAnalysisService";
import { LocalVizService } from "../LocalVizService";

/**
 * Local service factory that creates port-based service implementations
 * using in-memory processing without external dependencies.
 *
 * Requirements: 2.2, 2.4
 */
export function createLocalServices(): {
  csv: CsvPort;
  analysis: AnalysisPort;
  viz: VizPort;
} {
  return {
    csv: new LocalCsvService(),
    analysis: new LocalAnalysisService(),
    viz: new LocalVizService(),
  };
}

/**
 * Local service factory implementation that provides dependency injection
 * and contract validation capabilities.
 */
export class LocalServiceFactory implements ServiceFactory {
  /**
   * Creates and returns local service port implementations
   */
  createServices(): {
    csv: CsvPort;
    analysis: AnalysisPort;
    viz: VizPort;
  } {
    return createLocalServices();
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
    // TODO: Implement contract validation in task 15
    return {
      allPassed: true,
      csvPort: { passed: true, errors: [], warnings: [], testCases: [] },
      analysisPort: { passed: true, errors: [], warnings: [], testCases: [] },
      vizPort: { passed: true, errors: [], warnings: [], testCases: [] },
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        totalDuration: 0,
      },
    };
  }
}
