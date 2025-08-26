import React, { useCallback, useMemo, lazy, Suspense } from "react";
import { useExpenseTracker } from "./hooks";
import { FileUpload, TransactionTable, MonthlyTextSummary } from "./components";
import type { ValidationError } from "./types";

// Lazy load the ExpenseCharts component for better performance
const ExpenseCharts = lazy(() =>
  import("./components").then((module) => ({ default: module.ExpenseCharts }))
);

/**
 * Error Boundary component for handling unexpected errors
 */
class ExpenseTrackerErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ExpenseTracker Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 text-xl mb-2">⚠️</div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Error inesperado
          </h3>
          <p className="text-red-700 mb-4">
            Ocurrió un error al procesar la aplicación. Por favor, recarga la
            página e intenta nuevamente.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Recargar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Loading component with progress indicator and accessibility features
 */
function LoadingState({
  message = "Procesando archivo...",
}: {
  message?: string;
}) {
  return (
    <div
      className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center"
      role="status"
      aria-live="polite"
      aria-label="Cargando contenido"
    >
      <div
        className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
        aria-hidden="true"
      ></div>
      <h3 className="text-lg font-semibold text-blue-800 mb-2">{message}</h3>
      <p className="text-blue-700">
        Analizando transacciones y generando visualizaciones
      </p>
      <span className="sr-only">Cargando, por favor espera...</span>
    </div>
  );
}

/**
 * Chart loading fallback component
 */
function ChartLoadingFallback() {
  return (
    <div
      className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center"
      role="status"
      aria-live="polite"
    >
      <div
        className="animate-pulse bg-gray-300 h-64 rounded mb-4"
        aria-hidden="true"
      ></div>
      <p className="text-gray-600">Cargando gráficos...</p>
      <span className="sr-only">
        Cargando visualizaciones, por favor espera...
      </span>
    </div>
  );
}

/**
 * Error display component with actionable messages and accessibility features
 */
function ErrorDisplay({ errors }: { errors: ValidationError[] }) {
  return (
    <div
      className="bg-red-50 border border-red-200 rounded-lg p-6"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start">
        <div className="text-red-600 text-xl mr-3" aria-hidden="true">
          ❌
        </div>
        <div className="flex-1">
          <h3
            className="text-lg font-semibold text-red-800 mb-3"
            id="error-heading"
          >
            Error al procesar el archivo
          </h3>
          {errors.map((error, index) => (
            <div key={index} className="mb-4 last:mb-0">
              <p
                className="text-red-700 font-medium mb-2"
                aria-describedby="error-heading"
              >
                {error.message}
              </p>
              {error.examples && error.examples.length > 0 && (
                <div className="bg-red-100 rounded p-3">
                  <p
                    className="text-sm font-medium text-red-800 mb-2"
                    id={`suggestions-${index}`}
                  >
                    Sugerencias:
                  </p>
                  <ul
                    className="text-sm text-red-700 space-y-1"
                    aria-labelledby={`suggestions-${index}`}
                  >
                    {error.examples.map((example, exampleIndex) => (
                      <li key={exampleIndex} className="flex items-start">
                        <span className="text-red-500 mr-2" aria-hidden="true">
                          •
                        </span>
                        <span>{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Warning display component for non-blocking issues with accessibility features
 */
function WarningDisplay({ warnings }: { warnings: string[] }) {
  if (warnings.length === 0) return null;

  return (
    <div
      className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start">
        <div className="text-yellow-600 text-lg mr-3" aria-hidden="true">
          ⚠️
        </div>
        <div className="flex-1">
          <h4
            className="font-medium text-yellow-800 mb-2"
            id="warnings-heading"
          >
            Advertencias
          </h4>
          <ul
            className="text-sm text-yellow-700 space-y-1"
            aria-labelledby="warnings-heading"
          >
            {warnings.map((warning, index) => (
              <li key={index} className="flex items-start">
                <span className="text-yellow-500 mr-2" aria-hidden="true">
                  •
                </span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/**
 * Balance source badge component with accessibility features
 */
function BalanceSourceBadge({ source }: { source: "original" | "calculated" }) {
  if (source === "original") return null;

  return (
    <div
      className="inline-flex items-center bg-orange-100 text-orange-800 text-sm font-medium px-3 py-1 rounded-full"
      role="status"
      aria-label="Balance calculado sintéticamente debido a inconsistencias en los datos originales"
    >
      <span className="mr-2" aria-hidden="true">
        🧮
      </span>
      Balance calculado
    </div>
  );
}

/**
 * Current month toggle component with enhanced accessibility
 */
const CurrentMonthToggle = React.memo(function CurrentMonthToggle({
  showCurrentMonth,
  onToggle,
  hasCurrentMonthData,
}: {
  showCurrentMonth: boolean;
  onToggle: (show: boolean) => void;
  hasCurrentMonthData: boolean;
}) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onToggle(!showCurrentMonth);
      }
    },
    [onToggle, showCurrentMonth]
  );

  if (!hasCurrentMonthData) return null;

  return (
    <div className="flex items-center space-x-3">
      <label className="flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={showCurrentMonth}
          onChange={(e) => onToggle(e.target.checked)}
          className="sr-only"
          aria-describedby="current-month-description"
        />
        <div
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 ${
            showCurrentMonth ? "bg-blue-600" : "bg-gray-300"
          }`}
          role="switch"
          aria-checked={showCurrentMonth}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          aria-labelledby="current-month-label"
          aria-describedby="current-month-description"
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              showCurrentMonth ? "translate-x-6" : "translate-x-1"
            }`}
            aria-hidden="true"
          />
        </div>
        <span
          id="current-month-label"
          className="ml-3 text-sm font-medium text-gray-700"
        >
          Incluir mes actual
        </span>
      </label>
      {showCurrentMonth && (
        <div
          className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded"
          role="status"
          aria-live="polite"
        >
          <span aria-hidden="true">⚠️</span> Mes incompleto
        </div>
      )}
      <div id="current-month-description" className="sr-only">
        Toggle para incluir o excluir el mes actual en los análisis. El mes
        actual puede estar incompleto y puede afectar la precisión de los
        cálculos.
      </div>
    </div>
  );
});

/**
 * Performance monitoring hook for large file processing
 */
function usePerformanceMonitoring() {
  const [processingTime, setProcessingTime] = React.useState<number | null>(
    null
  );
  const [isSlowDevice, setIsSlowDevice] = React.useState(false);

  React.useEffect(() => {
    // Detect slow devices based on hardware concurrency and memory
    const navigator = window.navigator as any;
    const cores = navigator.hardwareConcurrency || 1;
    const memory = navigator.deviceMemory || 1;

    // Consider device slow if it has <= 2 cores or <= 2GB RAM
    setIsSlowDevice(cores <= 2 || memory <= 2);
  }, []);

  const startTiming = useCallback(() => {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      setProcessingTime(duration);
    };
  }, []);

  return { processingTime, isSlowDevice, startTiming };
}

/**
 * Main ExpenseTracker container component
 * Integrates all child components and manages global state with performance optimizations
 */
export function ExpenseTracker() {
  const {
    transactions,
    monthlyData,
    summary,
    balanceHistory,
    typeBreakdown,
    textualSummaries,
    showCurrentMonth,
    isLoading,
    validationResult,
    processCSVFile,
    toggleCurrentMonth,
    clearData,
  } = useExpenseTracker();

  const { processingTime, isSlowDevice, startTiming } =
    usePerformanceMonitoring();

  // Memoized computations for performance
  const hasCurrentMonthData = useMemo(
    () => monthlyData.some((data) => data.isCurrentMonth),
    [monthlyData]
  );

  const hasValidData = useMemo(
    () => transactions.length > 0 && validationResult?.isValid,
    [transactions.length, validationResult?.isValid]
  );

  const shouldShowCharts = useMemo(
    () => hasValidData && (monthlyData.length > 0 || balanceHistory.length > 0),
    [hasValidData, monthlyData.length, balanceHistory.length]
  );

  // Memoized handlers to prevent unnecessary re-renders
  const handleFileProcessed = useCallback(
    async (file: File) => {
      console.log(
        "ExpenseTracker.handleFileProcessed: Starting with file:",
        file.name,
        file.size
      );
      const endTiming = startTiming();
      try {
        await processCSVFile(file);
        console.log(
          "ExpenseTracker.handleFileProcessed: processCSVFile completed successfully"
        );
      } finally {
        endTiming();
      }
    },
    [processCSVFile, startTiming]
  );

  const handleClearData = useCallback(() => {
    clearData();
  }, [clearData]);

  const handleToggleCurrentMonth = useCallback(
    (show: boolean) => {
      toggleCurrentMonth(show);
    },
    [toggleCurrentMonth]
  );

  return (
    <ExpenseTrackerErrorBoundary>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Skip to main content link for keyboard navigation */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-50"
          >
            Saltar al contenido principal
          </a>

          {/* Header */}
          <header className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Seguimiento de Gastos
                </h1>
                <p className="text-gray-600">
                  Analiza tus transacciones bancarias y visualiza tus patrones
                  financieros
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                {summary && (
                  <BalanceSourceBadge source={summary.balanceSource} />
                )}
                <CurrentMonthToggle
                  showCurrentMonth={showCurrentMonth}
                  onToggle={handleToggleCurrentMonth}
                  hasCurrentMonthData={hasCurrentMonthData}
                />
                {transactions.length > 0 && (
                  <button
                    onClick={handleClearData}
                    className="text-sm text-gray-500 hover:text-gray-700 focus:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 underline rounded px-2 py-1"
                    aria-label="Limpiar todos los datos cargados y volver al estado inicial"
                  >
                    Limpiar datos
                  </button>
                )}
              </div>
            </div>

            {/* Performance indicator for slow devices */}
            {isSlowDevice && processingTime && processingTime > 5000 && (
              <div
                className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg"
                role="status"
                aria-live="polite"
              >
                <p className="text-sm text-blue-700">
                  <span aria-hidden="true">⚡</span> Procesamiento completado en{" "}
                  {(processingTime / 1000).toFixed(1)}s. Para archivos grandes,
                  considera usar la versión de escritorio para mejor
                  rendimiento.
                </p>
              </div>
            )}
          </header>

          {/* Main content area */}
          <main id="main-content">
            {/* Loading State */}
            {isLoading && (
              <LoadingState
                message={
                  isSlowDevice
                    ? "Procesando archivo (esto puede tomar más tiempo en este dispositivo)..."
                    : "Procesando archivo..."
                }
              />
            )}

            {/* Error Display */}
            {validationResult &&
              !validationResult.isValid &&
              validationResult.errors && (
                <ErrorDisplay errors={validationResult.errors} />
              )}

            {/* Warning Display */}
            {validationResult && validationResult.warnings && (
              <WarningDisplay warnings={validationResult.warnings} />
            )}

            {/* File Upload Section */}
            {transactions.length === 0 && !isLoading && (
              <section
                className="bg-white rounded-lg shadow-sm p-6 mb-6"
                aria-labelledby="upload-heading"
              >
                <h2
                  id="upload-heading"
                  className="text-xl font-semibold text-gray-900 mb-4"
                >
                  Cargar archivo CSV
                </h2>
                <FileUpload
                  onFileProcessed={handleFileProcessed}
                  maxFileSize={
                    isSlowDevice ? 10 * 1024 * 1024 : 20 * 1024 * 1024
                  } // Reduce limit for slow devices
                />
              </section>
            )}

            {/* Main Content - Only show when we have valid data */}
            {hasValidData && (
              <>
                {/* Monthly Text Summary */}
                {textualSummaries.length > 0 && (
                  <section
                    className="bg-white rounded-lg shadow-sm p-6 mb-6"
                    aria-labelledby="summary-heading"
                  >
                    <h2
                      id="summary-heading"
                      className="text-xl font-semibold text-gray-900 mb-4"
                    >
                      Resumen Mensual
                    </h2>
                    <MonthlyTextSummary summaries={textualSummaries} />
                  </section>
                )}

                {/* Charts Section */}
                {shouldShowCharts && (
                  <section
                    className="bg-white rounded-lg shadow-sm p-6 mb-6"
                    aria-labelledby="charts-heading"
                  >
                    <h2
                      id="charts-heading"
                      className="text-xl font-semibold text-gray-900 mb-6"
                    >
                      Visualizaciones
                    </h2>
                    <Suspense fallback={<ChartLoadingFallback />}>
                      <ExpenseCharts
                        monthlyData={monthlyData}
                        balanceHistory={balanceHistory}
                        typeBreakdown={typeBreakdown}
                        textualSummaries={textualSummaries}
                        showCurrentMonth={showCurrentMonth}
                        onToggleCurrentMonth={handleToggleCurrentMonth}
                      />
                    </Suspense>
                  </section>
                )}

                {/* Transaction Table */}
                <section
                  className="bg-white rounded-lg shadow-sm p-6"
                  aria-labelledby="transactions-heading"
                >
                  <h2
                    id="transactions-heading"
                    className="text-xl font-semibold text-gray-900 mb-4"
                  >
                    Detalle de Transacciones
                  </h2>
                  <TransactionTable
                    transactions={transactions}
                    summary={summary!}
                    dateRange={summary!.dateRange}
                  />
                </section>
              </>
            )}

            {/* Empty State - When no data and not loading */}
            {transactions.length === 0 &&
              !isLoading &&
              (!validationResult || validationResult.isValid) && (
                <section
                  className="bg-white rounded-lg shadow-sm p-12 text-center"
                  aria-labelledby="empty-state-heading"
                >
                  <div
                    className="text-gray-400 text-6xl mb-4"
                    aria-hidden="true"
                  >
                    📊
                  </div>
                  <h3
                    id="empty-state-heading"
                    className="text-xl font-semibold text-gray-900 mb-2"
                  >
                    ¡Comienza tu análisis financiero!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Carga un archivo CSV con tus transacciones bancarias para
                    ver análisis detallados de tus ingresos, gastos y ahorros.
                  </p>
                  <div className="text-sm text-gray-500">
                    <p className="mb-2">
                      <strong>Columnas requeridas:</strong> Date, Description,
                      Type, Amount, Current balance, Status
                    </p>
                    <p>
                      <strong>Tamaño máximo:</strong>{" "}
                      {isSlowDevice
                        ? "10 MB (reducido para este dispositivo)"
                        : "20 MB"}
                    </p>
                    {isSlowDevice && (
                      <p className="mt-2 text-blue-600">
                        <span aria-hidden="true">💡</span> Dispositivo con
                        recursos limitados detectado. Se aplicarán
                        optimizaciones automáticas.
                      </p>
                    )}
                  </div>
                </section>
              )}
          </main>
        </div>
      </div>
    </ExpenseTrackerErrorBoundary>
  );
}
