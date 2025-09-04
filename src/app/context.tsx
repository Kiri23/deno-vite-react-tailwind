/**
 * AppContext for service injection and application configuration
 * Provides services through context as port interfaces with configuration
 * for currency, locale, date formatting, and testability dependencies.
 *
 * Requirements: 2.3, 2.4, 10.1
 */

import React, {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import type {
  CsvPort,
  AnalysisPort,
  VizPort,
  ServiceFactory,
} from "../expense-tracker/services/ports.ts";
import { LocalServiceFactory } from "../expense-tracker/services/local/index.ts";

/**
 * Application configuration interface following foundation.md standards
 */
export interface AppConfig {
  /** Currency code for formatting (USD per foundation.md) */
  currency: "USD";
  /** Locale for number and date formatting (es-US per foundation.md) */
  locale: "es-US";
  /** Date format preference for display */
  dateFmt: "iso" | "ymd" | "mdy";
  /** Environment mode for debugging and logging */
  environment: "development" | "production" | "test";
}

/**
 * Logger interface for structured logging with testability
 */
export interface Logger {
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  debug: (...args: any[]) => void;
}

/**
 * Clock interface for time operations with testability
 */
export interface Clock {
  /** Returns current date/time */
  now: () => Date;
  /** Returns current date in YYYY-MM-DD format */
  today: () => string;
  /** Returns current month in YYYY-MM format */
  currentMonth: () => string;
}

/**
 * Service container interface providing port-based service access
 */
export interface Services {
  csv: CsvPort;
  analysis: AnalysisPort;
  viz: VizPort;
}

/**
 * Complete application context interface
 */
export interface AppContext {
  /** Service port implementations */
  services: Services;
  /** Application configuration */
  config: AppConfig;
  /** Structured logger for debugging and monitoring */
  logger: Logger;
  /** Clock for time operations with testability */
  clock: Clock;
  /** Service factory for advanced operations */
  serviceFactory: ServiceFactory;
}

/**
 * Default application configuration following foundation.md standards
 */
const defaultConfig: AppConfig = {
  currency: "USD",
  locale: "es-US",
  dateFmt: "iso",
  environment: "development",
};

/**
 * Default logger implementation with environment-aware output
 */
const createDefaultLogger = (environment: AppConfig["environment"]): Logger => {
  const isProduction = environment === "production";
  const isTest = environment === "test";

  return {
    info: (...args: any[]) => {
      if (!isProduction && !isTest) {
        console.info("[INFO]", ...args);
      }
    },
    warn: (...args: any[]) => {
      if (!isTest) {
        console.warn("[WARN]", ...args);
      }
    },
    error: (...args: any[]) => {
      console.error("[ERROR]", ...args);
    },
    debug: (...args: any[]) => {
      if (environment === "development") {
        console.debug("[DEBUG]", ...args);
      }
    },
  };
};

/**
 * Default clock implementation with timezone-aware operations
 */
const createDefaultClock = (): Clock => ({
  now: () => new Date(),
  today: () => {
    const now = new Date();
    // Use America/New_York timezone per foundation.md
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(now); // Returns YYYY-MM-DD format
  },
  currentMonth: () => {
    const now = new Date();
    // Use America/New_York timezone per foundation.md
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
    });
    return formatter.format(now); // Returns YYYY-MM format
  },
});

/**
 * React context for application-wide dependency injection
 */
const AppContextReact = createContext<AppContext | null>(null);

/**
 * Hook to access the application context
 * Throws error if used outside of AppContextProvider
 */
export function useAppContext(): AppContext {
  const context = useContext(AppContextReact);
  if (!context) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
}

/**
 * Props for AppContextProvider component
 */
export interface AppContextProviderProps {
  children: ReactNode;
  /** Optional custom configuration (defaults to foundation.md standards) */
  config?: Partial<AppConfig>;
  /** Optional custom service factory (defaults to LocalServiceFactory) */
  serviceFactory?: ServiceFactory;
  /** Optional custom logger (defaults to console-based logger) */
  logger?: Logger;
  /** Optional custom clock (defaults to system clock) */
  clock?: Clock;
}

/**
 * Provider component that injects services and configuration into the React tree
 * Follows dependency inversion principle - UI depends on abstractions, not implementations
 */
export function AppContextProvider({
  children,
  config: customConfig,
  serviceFactory: customServiceFactory,
  logger: customLogger,
  clock: customClock,
}: AppContextProviderProps) {
  const contextValue = useMemo(() => {
    // Merge custom config with defaults
    const config: AppConfig = {
      ...defaultConfig,
      ...customConfig,
    };

    // Create or use provided dependencies
    const serviceFactory = customServiceFactory || new LocalServiceFactory();
    const logger = customLogger || createDefaultLogger(config.environment);
    const clock = customClock || createDefaultClock();

    // Initialize services through factory
    let services: Services;
    try {
      services = serviceFactory.createServices();
      logger.info("Services initialized successfully", {
        type: serviceFactory.getServiceType(),
      });
    } catch (error) {
      logger.error("Failed to initialize services", error);
      throw error;
    }

    return {
      services,
      config,
      logger,
      clock,
      serviceFactory,
    };
  }, [customConfig, customServiceFactory, customLogger, customClock]);

  return (
    <AppContextReact.Provider value={contextValue}>
      {children}
    </AppContextReact.Provider>
  );
}

/**
 * Hook to access only the services from the application context
 * Convenience hook for components that only need service access
 */
export function useServices(): Services {
  const { services } = useAppContext();
  return services;
}

/**
 * Hook to access only the configuration from the application context
 * Convenience hook for components that only need config access
 */
export function useAppConfig(): AppConfig {
  const { config } = useAppContext();
  return config;
}

/**
 * Hook to access only the logger from the application context
 * Convenience hook for components that need logging capabilities
 */
export function useLogger(): Logger {
  const { logger } = useAppContext();
  return logger;
}

/**
 * Hook to access only the clock from the application context
 * Convenience hook for components that need time operations
 */
export function useClock(): Clock {
  const { clock } = useAppContext();
  return clock;
}

/**
 * Creates a test context with mock dependencies for testing
 * Useful for unit tests that need controlled service behavior
 */
export function createTestAppContext(
  overrides: {
    services?: Partial<Services>;
    config?: Partial<AppConfig>;
    logger?: Partial<Logger>;
    clock?: Partial<Clock>;
  } = {}
): AppContext {
  // Create mock functions for testing (Deno-compatible)
  const mockFn = () => Promise.resolve();

  const mockServices: Services = {
    csv: {
      validateAndParse: mockFn as any,
      normalizeTransactions: (() => []) as any,
      normalizeDate: ((date: string) => date) as any,
      canonicalizeAmount: ((amount: number) => amount) as any,
    } as any,
    analysis: {
      calculateMonthlySummary: (() => []) as any,
      calculateOverallSummary: (() => ({})) as any,
      generateBalanceHistory: (() => []) as any,
      groupByTransactionType: (() => []) as any,
    } as any,
    viz: {
      prepareMonthlyChartData: (() => []) as any,
      prepareBalanceChartData: (() => ({})) as any,
      prepareTypeChartData: (() => ({})) as any,
      generateTextualSummary: (() => []) as any,
    } as any,
    ...overrides.services,
  };

  const mockLogger: Logger = {
    info: (() => {}) as any,
    warn: (() => {}) as any,
    error: (() => {}) as any,
    debug: (() => {}) as any,
    ...overrides.logger,
  };

  const mockClock: Clock = {
    now: (() => new Date("2025-01-15T10:00:00Z")) as any,
    today: (() => "2025-01-15") as any,
    currentMonth: (() => "2025-01") as any,
    ...overrides.clock,
  };

  const testConfig: AppConfig = {
    ...defaultConfig,
    environment: "test",
    ...overrides.config,
  };

  return {
    services: mockServices,
    config: testConfig,
    logger: mockLogger,
    clock: mockClock,
    serviceFactory: {
      createServices: () => mockServices,
      getServiceType: () => "local",
      validateContracts: mockFn as any,
    } as any,
  };
}

/**
 * Type guard to check if a service factory is a LocalServiceFactory
 */
export function isLocalServiceFactory(
  factory: ServiceFactory
): factory is LocalServiceFactory {
  return factory.getServiceType() === "local";
}

/**
 * Environment detection utilities for configuration
 */
export const Environment = {
  /**
   * Detects current environment from various sources
   */
  detect(): AppConfig["environment"] {
    try {
      // Try Deno environment first
      const denoEnv = (globalThis as any).Deno?.env?.get("NODE_ENV");
      if (denoEnv) {
        return denoEnv === "production"
          ? "production"
          : denoEnv === "test"
          ? "test"
          : "development";
      }

      // Fallback for other environments (Node.js, browser)
      const nodeEnv = (globalThis as any).process?.env?.NODE_ENV;
      if (nodeEnv) {
        return nodeEnv === "production"
          ? "production"
          : nodeEnv === "test"
          ? "test"
          : "development";
      }

      // Default to development
      return "development";
    } catch {
      return "development";
    }
  },

  /**
   * Checks if running in development mode
   */
  isDevelopment(): boolean {
    return this.detect() === "development";
  },

  /**
   * Checks if running in production mode
   */
  isProduction(): boolean {
    return this.detect() === "production";
  },

  /**
   * Checks if running in test mode
   */
  isTest(): boolean {
    return this.detect() === "test";
  },
};
