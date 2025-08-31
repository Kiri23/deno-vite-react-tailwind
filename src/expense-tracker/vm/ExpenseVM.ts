/**
 * ExpenseVM - ViewModel for expense tracker state management
 *
 * Implements ref-based state management with subscribe/getState pattern
 * for orchestrating business logic and managing canonical state.
 *
 * Requirements: 3.1, 3.2, 3.3
 */

import type {
  RawTransaction,
  TransactionData,
  MonthlyData,
  ChartDataset,
  ValidationError,
} from "../types/index.ts";
import type { CsvPort, AnalysisPort, VizPort } from "../services/ports.ts";

/**
 * Complete state interface for the expense tracker ViewModel
 * Manages minimal canonical state with clear data pipeline stages
 */
export interface ExpenseState {
  // Data pipeline states (Requirements: 3.1)
  raw: RawTransaction[]; // CSV raw data
  normalized: TransactionData[]; // Post-normalization
  monthly: MonthlyData[]; // Aggregated by month

  // UI control states
  range: { from?: string; to?: string }; // Date range filter (YYYY-MM-DD)
  filters: { categories: string[] }; // Transaction type filters

  // Visualization states
  charts: {
    monthly: ChartDataset[];
    balance: ChartDataset;
    types: ChartDataset;
  };

  // Integrated narrative insights
  insights: {
    summaryText?: string;
    annotations?: Array<{
      target: string; // Chart element ID or table row
      text: string; // Contextual explanation
      type: "tooltip" | "caption" | "callout";
    }>;
  };

  // Loading and error states
  loading: {
    csv: boolean;
    analysis: boolean;
    charts: boolean;
  };

  errors: {
    csv?: ValidationError[];
    analysis?: string;
    charts?: string;
  };
}

/**
 * Command interface for orchestrating service calls
 * Commands handle the complete flow from CSV upload to visualization preparation
 */
export interface ExpenseCommands {
  /**
   * Set date range filter for analysis
   * @param range - Date range with optional from/to dates
   */
  setRange(range: ExpenseState["range"]): void;

  /**
   * Set transaction type filters
   * @param filters - Filter configuration with categories array
   */
  setFilters(filters: ExpenseState["filters"]): void;

  /**
   * Load and validate CSV file
   * @param file - CSV file to process
   */
  loadCsv(file: File): Promise<void>;

  /**
   * Normalize raw transaction data
   */
  normalize(): Promise<void>;

  /**
   * Run financial analysis on normalized data
   */
  analyze(): Promise<void>;

  /**
   * Build chart datasets from analysis results
   */
  buildCharts(): void;

  /**
   * Generate explanatory insights and narratives
   */
  explain(): void;

  /**
   * Reset all state to initial values
   */
  reset(): void;
}

/**
 * Service dependencies for the ViewModel
 */
export interface Services {
  csv: CsvPort;
  analysis: AnalysisPort;
  viz: VizPort;
}

/**
 * ViewModel instance interface with state access and command execution
 */
export interface ExpenseVM {
  /**
   * Get current state snapshot
   */
  getState(): ExpenseState;

  /**
   * Subscribe to state changes
   * @param listener - Callback function called on state changes
   * @returns Unsubscribe function
   */
  subscribe(listener: () => void): () => void;

  /**
   * Command interface for state mutations
   */
  commands: ExpenseCommands;
}

/**
 * Initial state factory
 */
function createInitialState(): ExpenseState {
  return {
    raw: [],
    normalized: [],
    monthly: [],
    range: {},
    filters: { categories: [] },
    charts: {
      monthly: [],
      balance: { labels: [], datasets: [] },
      types: { labels: [], datasets: [] },
    },
    insights: {},
    loading: {
      csv: false,
      analysis: false,
      charts: false,
    },
    errors: {},
  };
}

/**
 * Creates an ExpenseVM instance with ref-based state management
 *
 * Uses subscribe/getState pattern for React integration via useSyncExternalStore
 * Orchestrates service calls in correct sequence: import → normalize → analyze → buildCharts → explain
 *
 * @param services - Service port implementations for business logic
 * @returns ExpenseVM instance with state access and commands
 */
export function createExpenseVM(services: Services): ExpenseVM {
  // Ref-based state management (Requirement: 3.3)
  let state = createInitialState();
  const listeners = new Set<() => void>();

  /**
   * Update state and notify subscribers
   */
  function setState(updater: (prev: ExpenseState) => ExpenseState): void {
    state = updater(state);
    listeners.forEach((listener) => listener());
  }

  /**
   * Get current state snapshot
   */
  function getState(): ExpenseState {
    return state;
  }

  /**
   * Subscribe to state changes
   */
  function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  /**
   * Command implementations with service orchestration (Requirement: 3.2)
   */
  const commands: ExpenseCommands = {
    setRange(range: ExpenseState["range"]): void {
      setState((prev) => ({ ...prev, range }));
    },

    setFilters(filters: ExpenseState["filters"]): void {
      setState((prev) => ({ ...prev, filters }));
    },

    async loadCsv(file: File): Promise<void> {
      try {
        setState((prev) => ({
          ...prev,
          loading: { ...prev.loading, csv: true },
          errors: { ...prev.errors, csv: undefined },
        }));

        const result = await services.csv.validateAndParse(file);

        if (!result.isValid) {
          setState((prev) => ({
            ...prev,
            errors: { ...prev.errors, csv: result.errors },
            loading: { ...prev.loading, csv: false },
          }));
          return;
        }

        setState((prev) => ({
          ...prev,
          raw: result.transactions || [],
          loading: { ...prev.loading, csv: false },
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          errors: {
            ...prev.errors,
            csv: [
              {
                type: "file_too_large",
                message:
                  error instanceof Error ? error.message : "Unknown error",
              },
            ],
          },
          loading: { ...prev.loading, csv: false },
        }));
      }
    },

    async normalize(): Promise<void> {
      try {
        const currentState = getState();
        if (currentState.raw.length === 0) {
          throw new Error("No raw data to normalize");
        }

        const normalized = services.csv.normalizeTransactions(currentState.raw);

        setState((prev) => ({
          ...prev,
          normalized,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          errors: {
            ...prev.errors,
            analysis:
              error instanceof Error ? error.message : "Normalization failed",
          },
        }));
      }
    },

    async analyze(): Promise<void> {
      try {
        setState((prev) => ({
          ...prev,
          loading: { ...prev.loading, analysis: true },
          errors: { ...prev.errors, analysis: undefined },
        }));

        const currentState = getState();
        if (currentState.normalized.length === 0) {
          throw new Error("No normalized data to analyze");
        }

        // Apply filters if any
        let filteredTransactions = currentState.normalized;

        // Apply date range filter
        if (currentState.range.from || currentState.range.to) {
          filteredTransactions = filteredTransactions.filter((transaction) => {
            const transactionDate = transaction.Date;
            if (
              currentState.range.from &&
              transactionDate < currentState.range.from
            ) {
              return false;
            }
            if (
              currentState.range.to &&
              transactionDate > currentState.range.to
            ) {
              return false;
            }
            return true;
          });
        }

        // Apply category filters
        if (currentState.filters.categories.length > 0) {
          filteredTransactions = filteredTransactions.filter((transaction) =>
            currentState.filters.categories.includes(transaction.Type)
          );
        }

        // Calculate monthly summary (excludes current month by default)
        const monthly = services.analysis.calculateMonthlySummary(
          filteredTransactions,
          true // excludeCurrent
        );

        setState((prev) => ({
          ...prev,
          monthly,
          loading: { ...prev.loading, analysis: false },
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          errors: {
            ...prev.errors,
            analysis:
              error instanceof Error ? error.message : "Analysis failed",
          },
          loading: { ...prev.loading, analysis: false },
        }));
      }
    },

    buildCharts(): void {
      try {
        setState((prev) => ({
          ...prev,
          loading: { ...prev.loading, charts: true },
          errors: { ...prev.errors, charts: undefined },
        }));

        const currentState = getState();
        if (currentState.normalized.length === 0) {
          throw new Error("No data available for chart generation");
        }

        // Generate chart datasets
        const monthlyCharts = services.viz.prepareMonthlyChartData(
          currentState.monthly
        );

        const balanceHistory = services.analysis.generateBalanceHistory(
          currentState.normalized
        );
        const balanceChart =
          services.viz.prepareBalanceChartData(balanceHistory);

        const typeSummary = services.analysis.groupByTransactionType(
          currentState.normalized
        );
        const typesChart = services.viz.prepareTypeChartData(typeSummary);

        setState((prev) => ({
          ...prev,
          charts: {
            monthly: monthlyCharts,
            balance: balanceChart,
            types: typesChart,
          },
          loading: { ...prev.loading, charts: false },
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          errors: {
            ...prev.errors,
            charts:
              error instanceof Error
                ? error.message
                : "Chart generation failed",
          },
          loading: { ...prev.loading, charts: false },
        }));
      }
    },

    explain(): void {
      try {
        const currentState = getState();
        if (currentState.monthly.length === 0) {
          return; // No data to explain
        }

        // Generate textual summary
        const summaryText = services.viz.generateTextualSummary(
          currentState.monthly
        );

        // Create contextual annotations for charts and tables
        const annotations = currentState.monthly.map((month, index) => ({
          target: `month-${month.month}`,
          text: `${month.month}: ${
            month.savings >= 0 ? "Ahorro" : "Déficit"
          } de $${Math.abs(month.savings).toFixed(2)}`,
          type: "tooltip" as const,
        }));

        setState((prev) => ({
          ...prev,
          insights: {
            summaryText: summaryText.join(" "),
            annotations,
          },
        }));
      } catch (error) {
        // Insights are non-critical, log but don't update error state
        console.warn("Failed to generate insights:", error);
      }
    },

    reset(): void {
      setState(() => createInitialState());
    },
  };

  return {
    getState,
    subscribe,
    commands,
  };
}
