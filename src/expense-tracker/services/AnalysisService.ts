import type {
  TransactionData,
  MonthlyData,
  OverallSummary,
  TypeSummary,
  BalancePoint,
} from "../types";
import type { AnalysisService as IAnalysisService } from "./types";

/**
 * AnalysisService handles data aggregation and analysis for expense tracker transactions.
 * Provides monthly summaries, overall statistics, type breakdowns, and balance history.
 */
export class AnalysisService implements IAnalysisService {
  /**
   * Calculate monthly data aggregation with current month detection and exclusion logic
   * Task 3.1 implementation
   */
  static calculateMonthlySummary(
    transactions: TransactionData[],
    excludeCurrentMonth: boolean = true
  ): MonthlyData[] {
    if (transactions.length === 0) {
      return [];
    }

    // Get current month in YYYY-MM format for comparison
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    // Group transactions by month
    const monthlyGroups = new Map<string, TransactionData[]>();

    for (const transaction of transactions) {
      try {
        // Extract month from date (YYYY-MM-DD -> YYYY-MM)
        const month = transaction.Date.slice(0, 7);

        if (!monthlyGroups.has(month)) {
          monthlyGroups.set(month, []);
        }
        monthlyGroups.get(month)!.push(transaction);
      } catch (error) {
        // Skip transactions with invalid dates
        console.warn(
          `Skipping transaction with invalid date: ${transaction.Date}`
        );
        continue;
      }
    }

    // Calculate monthly summaries
    const monthlyData: MonthlyData[] = [];

    for (const [month, monthTransactions] of monthlyGroups.entries()) {
      const isCurrentMonth = month === currentMonth;

      // Skip current month if excludeCurrentMonth is true
      if (excludeCurrentMonth && isCurrentMonth) {
        continue;
      }

      // Calculate totals for this month
      let totalIncome = 0;
      let totalExpenses = 0;

      for (const transaction of monthTransactions) {
        if (transaction.Amount > 0) {
          totalIncome += transaction.Amount;
        } else {
          totalExpenses += Math.abs(transaction.Amount); // Store as positive for clarity
        }
      }

      // Calculate savings (income - expenses)
      const savings = totalIncome - totalExpenses;

      monthlyData.push({
        month,
        totalIncome,
        totalExpenses,
        savings,
        transactionCount: monthTransactions.length,
        isCurrentMonth,
      });
    }

    // Sort by month (chronological order)
    monthlyData.sort((a, b) => a.month.localeCompare(b.month));

    return monthlyData;
  }

  /**
   * Calculate overall summary for the entire period
   * Task 3.2 implementation
   */
  static calculateOverallSummary(
    transactions: TransactionData[]
  ): OverallSummary {
    if (transactions.length === 0) {
      return {
        totalIncome: 0,
        totalExpenses: 0,
        netSavings: 0,
        transactionCount: 0,
        dateRange: { start: "", end: "" },
        balanceSource: "original",
      };
    }

    // Calculate totals
    let totalIncome = 0;
    let totalExpenses = 0;

    for (const transaction of transactions) {
      if (transaction.Amount > 0) {
        totalIncome += transaction.Amount;
      } else {
        totalExpenses += Math.abs(transaction.Amount);
      }
    }

    const netSavings = totalIncome - totalExpenses;

    // Calculate date range (absolute start/end dates)
    const dates = transactions
      .map((t) => t.Date)
      .filter((date) => date && date.trim() !== "")
      .sort();

    const dateRange = {
      start: dates.length > 0 ? dates[0] : "",
      end: dates.length > 0 ? dates[dates.length - 1] : "",
    };

    // Determine balance source by checking if any transaction has calculated balance
    // This is a simple heuristic - in a real implementation, this would come from metadata
    const balanceSource: "original" | "calculated" = transactions.some(
      (t) => t["Current balance"] === 0 || isNaN(t["Current balance"])
    )
      ? "calculated"
      : "original";

    return {
      totalIncome,
      totalExpenses,
      netSavings,
      transactionCount: transactions.length,
      dateRange,
      balanceSource,
    };
  }

  /**
   * Group transactions by normalized type and calculate breakdown analysis
   * Task 3.3 implementation
   */
  static groupByTransactionType(
    transactions: TransactionData[]
  ): TypeSummary[] {
    if (transactions.length === 0) {
      return [];
    }

    // Filter to expense-only transactions (negative amounts)
    const expenseTransactions = transactions.filter((t) => t.Amount < 0);

    if (expenseTransactions.length === 0) {
      return [];
    }

    // Group by transaction type
    const typeGroups = new Map<string, { amount: number; count: number }>();

    for (const transaction of expenseTransactions) {
      const type = transaction.Type;
      const amount = Math.abs(transaction.Amount); // Convert to positive for clarity

      if (!typeGroups.has(type)) {
        typeGroups.set(type, { amount: 0, count: 0 });
      }

      const group = typeGroups.get(type)!;
      group.amount += amount;
      group.count += 1;
    }

    // Calculate total expenses for percentage calculation
    const totalExpenses = Array.from(typeGroups.values()).reduce(
      (sum, group) => sum + group.amount,
      0
    );

    // Create TypeSummary array
    const typeSummaries: TypeSummary[] = [];

    for (const [type, group] of typeGroups.entries()) {
      const percentage =
        totalExpenses > 0 ? (group.amount / totalExpenses) * 100 : 0;

      typeSummaries.push({
        type,
        amount: group.amount,
        count: group.count,
        percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
      });
    }

    // Sort by amount (highest first)
    typeSummaries.sort((a, b) => b.amount - a.amount);

    return typeSummaries;
  }

  /**
   * Generate balance history from transactions
   * Task 3.3 implementation (balance history for charts)
   */
  static generateBalanceHistory(
    transactions: TransactionData[]
  ): BalancePoint[] {
    if (transactions.length === 0) {
      return [];
    }

    // Sort transactions by date to ensure proper chronological order
    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime()
    );

    const balanceHistory: BalancePoint[] = [];

    for (const transaction of sortedTransactions) {
      // Determine if this balance was calculated (simple heuristic)
      const isCalculated =
        transaction["Current balance"] === 0 ||
        isNaN(transaction["Current balance"]);

      balanceHistory.push({
        date: transaction.Date,
        balance: transaction["Current balance"],
        isCalculated,
      });
    }

    return balanceHistory;
  }

  // Instance methods that delegate to static methods for interface compliance
  calculateMonthlySummary(
    transactions: TransactionData[],
    excludeCurrentMonth?: boolean
  ): MonthlyData[] {
    return AnalysisService.calculateMonthlySummary(
      transactions,
      excludeCurrentMonth
    );
  }

  calculateOverallSummary(transactions: TransactionData[]): OverallSummary {
    return AnalysisService.calculateOverallSummary(transactions);
  }

  groupByTransactionType(transactions: TransactionData[]): TypeSummary[] {
    return AnalysisService.groupByTransactionType(transactions);
  }

  generateBalanceHistory(transactions: TransactionData[]): BalancePoint[] {
    return AnalysisService.generateBalanceHistory(transactions);
  }
}
