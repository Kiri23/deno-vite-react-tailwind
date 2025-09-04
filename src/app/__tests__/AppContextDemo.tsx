/**
 * Demo component showing AppContext usage in React components
 * This demonstrates how services are injected and used through context
 */

import React from "react";
import {
  AppContextProvider,
  useServices,
  useAppConfig,
  useLogger,
  useClock,
} from "../index";

/**
 * Example component that uses injected services
 */
function ServiceConsumerComponent() {
  const services = useServices();
  const config = useAppConfig();
  const logger = useLogger();
  const clock = useClock();

  const handleTestServices = () => {
    logger.info("Testing services with config:", config);

    // Test CSV service
    const testDate = services.csv.normalizeDate("1/15/2025");
    logger.info("Normalized date:", testDate);

    // Test clock
    const today = clock.today();
    const currentMonth = clock.currentMonth();
    logger.info("Today:", today, "Current month:", currentMonth);
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Service Consumer Component</h3>
      <div className="space-y-2 text-sm">
        <p>
          <strong>Currency:</strong> {config.currency}
        </p>
        <p>
          <strong>Locale:</strong> {config.locale}
        </p>
        <p>
          <strong>Date Format:</strong> {config.dateFmt}
        </p>
        <p>
          <strong>Environment:</strong> {config.environment}
        </p>
        <p>
          <strong>Current Time:</strong> {clock.now().toISOString()}
        </p>
        <p>
          <strong>Today:</strong> {clock.today()}
        </p>
        <p>
          <strong>Current Month:</strong> {clock.currentMonth()}
        </p>
      </div>
      <button
        onClick={handleTestServices}
        className="mt-3 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Test Services
      </button>
    </div>
  );
}

/**
 * Demo showing AppContext provider wrapping components
 */
export function AppContextDemo() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">AppContext Demo</h2>

      <div className="space-y-6">
        {/* Default configuration */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Default Configuration</h3>
          <AppContextProvider>
            <ServiceConsumerComponent />
          </AppContextProvider>
        </div>

        {/* Custom configuration */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Custom Configuration</h3>
          <AppContextProvider
            config={{
              dateFmt: "mdy",
              environment: "development",
            }}
          >
            <ServiceConsumerComponent />
          </AppContextProvider>
        </div>

        {/* Production configuration */}
        <div>
          <h3 className="text-lg font-semibold mb-2">
            Production Configuration
          </h3>
          <AppContextProvider
            config={{
              environment: "production",
            }}
          >
            <ServiceConsumerComponent />
          </AppContextProvider>
        </div>
      </div>
    </div>
  );
}

/**
 * Example of a component that only needs specific context parts
 */
function ConfigOnlyComponent() {
  const config = useAppConfig();

  return (
    <div className="p-2 bg-gray-100 rounded">
      <p className="text-sm">
        Running in <strong>{config.environment}</strong> mode with{" "}
        <strong>{config.currency}</strong> currency
      </p>
    </div>
  );
}

/**
 * Example of a component that only needs services
 */
function ServicesOnlyComponent() {
  const services = useServices();

  const testNormalization = () => {
    const testDate = services.csv.normalizeDate("12/25/2024");
    const testAmount = services.csv.canonicalizeAmount(100, "Deposit");
    console.log("Normalized:", { date: testDate, amount: testAmount });
  };

  return (
    <div className="p-2 bg-green-100 rounded">
      <p className="text-sm mb-2">Services available: CSV, Analysis, Viz</p>
      <button
        onClick={testNormalization}
        className="px-2 py-1 bg-green-500 text-white text-xs rounded"
      >
        Test Normalization
      </button>
    </div>
  );
}

/**
 * Demo showing selective context usage
 */
export function SelectiveContextDemo() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Selective Context Usage</h2>

      <AppContextProvider>
        <div className="space-y-4">
          <ConfigOnlyComponent />
          <ServicesOnlyComponent />
        </div>
      </AppContextProvider>
    </div>
  );
}
