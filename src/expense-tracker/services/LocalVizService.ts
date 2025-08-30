import type {
  MonthlyData,
  BalancePoint,
  TypeSummary,
  ChartDataset,
} from "../types/index.ts";
import type { VizPort } from "./ports.ts";
import { VizService } from "./VizService.ts";

/**
 * LocalVizService implements VizPort interface using the existing VizService
 * This provides a clean port-based implementation for the modular architecture.
 *
 * Requirements: 1.1, 1.2, 2.2
 */
export class LocalVizService implements VizPort {
  /**
   * Prepares monthly data for bar chart visualization
   */
  prepareMonthlyChartData(monthlyData: MonthlyData[]): ChartDataset[] {
    return VizService.prepareMonthlyChartData(monthlyData);
  }

  /**
   * Prepares balance history for line chart visualization
   */
  prepareBalanceChartData(balanceHistory: BalancePoint[]): ChartDataset {
    return VizService.prepareBalanceChartData(balanceHistory);
  }

  /**
   * Prepares transaction type breakdown for pie/bar chart visualization
   */
  prepareTypeChartData(typeSummary: TypeSummary[]): ChartDataset {
    return VizService.prepareTypeChartData(typeSummary);
  }

  /**
   * Generates human-readable financial summaries in Spanish
   */
  generateTextualSummary(monthlyData: MonthlyData[]): string[] {
    return VizService.generateTextualSummary(monthlyData);
  }
}
