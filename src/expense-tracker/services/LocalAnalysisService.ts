import type {
  TransactionData,
  MonthlyData,
  OverallSummary,
  TypeSummary,
  BalancePoint,
} from "../types";
import type { AnalysisPort } from "./ports";
import { AnalysisService } from "./AnalysisService";

/**
 * LocalAnalysisService implements AnalysisPort interface using the existing AnalysisService
 * This provides a clean port-based implementation for the modular architecture.
 *
 * Requirements: 1.1, 1.2, 2.2
 */
export class LocalAnalysisService implements AnalysisPort {
  /**
   * Calculates monthly financial summaries with current month exclusion logic
   */
  calculateMonthlySummary(
    transactions: TransactionData[],
    excludeCurrent: boolean = true
  ): MonthlyData[] {
    return AnalysisService.calculateMonthlySummary(
      transactions,
      excludeCurrent
    );
  }

  /**
   * Calculates overall summary statistics for the entire transaction period
   */
  calculateOverallSummary(transactions: TransactionData[]): OverallSummary {
    return AnalysisService.calculateOverallSummary(transactions);
  }

  /**
   * Generates balance history points for chart visualization
   */
  generateBalanceHistory(transactions: TransactionData[]): BalancePoint[] {
    return AnalysisService.generateBalanceHistory(transactions);
  }

  /**
   * Groups transactions by normalized type and calculates expense breakdowns
   */
  groupByTransactionType(transactions: TransactionData[]): TypeSummary[] {
    return AnalysisService.groupByTransactionType(transactions);
  }
}
