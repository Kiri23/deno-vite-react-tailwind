import type {
  TransactionData,
  AnalysisOptions,
  MonthlyAnalysis,
  TopExpense,
  ExpenseByType,
  DailySpending,
} from "../types";

/**
 * ExpenseAnalysisService - Detailed expense analysis for specific months
 *
 * Provides granular analysis including:
 * - Top-10 largest expenses (only negative amounts)
 * - Expense breakdown by normalized type with percentages
 * - Daily spending patterns with zero-fill for missing days
 * - Filtering options for transfers, roundups, and pending transactions
 */
export class ExpenseAnalysisService {
  /**
   * Analyze expenses for a specific month
   * @param transactions Normalized transaction data
   * @param month Target month in YYYY-MM format
   * @param options Filtering options (defaults: all false)
   * @returns Detailed monthly analysis
   */
  analyzeMonth(
    transactions: TransactionData[],
    month: string,
    options: AnalysisOptions = {}
  ): MonthlyAnalysis {
    const {
      includeTransfers = false,
      includeRoundups = false,
      includePending = false,
    } = options;

    // Filter transactions for the target month
    let monthlyTransactions = transactions.filter((t) =>
      t.Date.startsWith(month)
    );

    // Apply filtering options
    if (!includePending) {
      monthlyTransactions = monthlyTransactions.filter(
        (t) => t.Status !== "Pending"
      );
    }

    if (!includeTransfers) {
      monthlyTransactions = monthlyTransactions.filter(
        (t) => t.Type !== "Transfer"
      );
    }

    if (!includeRoundups) {
      monthlyTransactions = monthlyTransactions.filter(
        (t) => t.Type !== "Roundup"
      );
    }

    // Check if this is the current month
    const currentMonth = new Date().toISOString().slice(0, 7);
    const isCurrentMonth = month === currentMonth;

    // Calculate components
    const topExpenses = this.calculateTopExpenses(monthlyTransactions);
    const expensesByType = this.calculateExpensesByType(monthlyTransactions);
    const dailySpending = this.calculateDailySpending(
      monthlyTransactions,
      month
    );
    const insights = this.calculateInsights(monthlyTransactions, dailySpending);

    return {
      month,
      isCurrentMonth,
      topExpenses,
      expensesByType,
      dailySpending,
      insights,
      appliedOptions: {
        includeTransfers,
        includeRoundups,
        includePending,
      },
    };
  }

  /**
   * Calculate top-10 largest expenses (only negative amounts)
   * Tie-breaking: date desc, then description asc
   */
  private calculateTopExpenses(transactions: TransactionData[]): TopExpense[] {
    const expenses = transactions
      .filter((t) => t.Amount < 0) // Only expenses (negative amounts)
      .sort((a, b) => {
        // Primary sort: amount (most negative first)
        const amountDiff = a.Amount - b.Amount;
        if (amountDiff !== 0) return amountDiff;

        // Tie-breaker 1: date desc
        const dateDiff = b.Date.localeCompare(a.Date);
        if (dateDiff !== 0) return dateDiff;

        // Tie-breaker 2: description asc
        return a.Description.localeCompare(b.Description);
      })
      .slice(0, 10) // Top-10
      .map((t, index) => ({
        date: t.Date,
        description: t.Description,
        type: t.Type,
        amount: t.Amount,
        rank: index + 1,
      }));

    return expenses;
  }

  /**
   * Calculate expense breakdown by normalized type with percentages
   * Percentages should sum to ≈100% of total expenses
   */
  private calculateExpensesByType(
    transactions: TransactionData[]
  ): ExpenseByType[] {
    const expenses = transactions.filter((t) => t.Amount < 0);
    const totalExpenses = Math.abs(
      expenses.reduce((sum, t) => sum + t.Amount, 0)
    );

    if (totalExpenses === 0) {
      return [];
    }

    // Group by type
    const typeGroups = expenses.reduce((groups, t) => {
      const type = t.Type;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(t);
      return groups;
    }, {} as Record<string, TransactionData[]>);

    // Calculate breakdown
    const breakdown = Object.entries(typeGroups).map(
      ([type, typeTransactions]) => {
        const totalAmount = typeTransactions.reduce(
          (sum, t) => sum + t.Amount,
          0
        );
        const transactionCount = typeTransactions.length;
        const percentage = (Math.abs(totalAmount) / totalExpenses) * 100;
        const averageAmount = totalAmount / transactionCount;

        return {
          type,
          totalAmount,
          transactionCount,
          percentage,
          averageAmount,
        };
      }
    );

    // Sort by total amount (most negative first)
    return breakdown.sort((a, b) => a.totalAmount - b.totalAmount);
  }

  /**
   * Calculate daily spending pattern with zero-fill for missing days
   * Returns spending for each day of the month (1..28/29/30/31)
   */
  private calculateDailySpending(
    transactions: TransactionData[],
    month: string
  ): DailySpending[] {
    const expenses = transactions.filter((t) => t.Amount < 0);

    // Get the number of days in the month
    const [year, monthNum] = month.split("-").map(Number);
    const daysInMonth = new Date(year, monthNum, 0).getDate();

    // Group expenses by day
    const dailyGroups = expenses.reduce((groups, t) => {
      const day = parseInt(t.Date.split("-")[2], 10);
      if (!groups[day]) {
        groups[day] = [];
      }
      groups[day].push(t);
      return groups;
    }, {} as Record<number, TransactionData[]>);

    // Create daily spending array with zero-fill
    const dailySpending: DailySpending[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dayTransactions = dailyGroups[day] || [];
      const totalExpenses = Math.abs(
        dayTransactions.reduce((sum, t) => sum + t.Amount, 0)
      );
      const transactionCount = dayTransactions.length;

      // Find largest expense for the day
      let largestExpense: { description: string; amount: number } | undefined;
      if (dayTransactions.length > 0) {
        const largest = dayTransactions.reduce((max, t) =>
          t.Amount < max.Amount ? t : max
        );
        largestExpense = {
          description: largest.Description,
          amount: largest.Amount,
        };
      }

      const dateStr = `${month}-${day.toString().padStart(2, "0")}`;

      dailySpending.push({
        date: dateStr,
        day,
        totalExpenses,
        transactionCount,
        largestExpense,
      });
    }

    return dailySpending;
  }

  /**
   * Calculate insights for the monthly analysis
   */
  private calculateInsights(
    transactions: TransactionData[],
    dailySpending: DailySpending[]
  ) {
    const expenses = transactions.filter((t) => t.Amount < 0);

    if (expenses.length === 0) {
      return {
        largestExpense: { description: "", amount: 0, date: "" },
        highestTypePercentage: { type: "", percentage: 0 },
        highestSpendingDay: { date: "", amount: 0 },
        totalExpenses: 0,
        averageDailySpending: 0,
      };
    }

    // Largest expense overall
    const largestExpense = expenses.reduce((max, t) =>
      t.Amount < max.Amount ? t : max
    );

    // Highest spending day
    const highestSpendingDay = dailySpending.reduce((max, day) =>
      day.totalExpenses > max.totalExpenses ? day : max
    );

    // Calculate expense breakdown for highest type percentage
    const expensesByType = this.calculateExpensesByType(transactions);
    const highestTypePercentage =
      expensesByType.length > 0
        ? expensesByType[0]
        : { type: "", percentage: 0 };

    // Total expenses and average
    const totalExpenses = Math.abs(
      expenses.reduce((sum, t) => sum + t.Amount, 0)
    );
    const daysWithSpending = dailySpending.filter(
      (d) => d.totalExpenses > 0
    ).length;
    const averageDailySpending =
      daysWithSpending > 0 ? totalExpenses / daysWithSpending : 0;

    return {
      largestExpense: {
        description: largestExpense.Description,
        amount: largestExpense.Amount,
        date: largestExpense.Date,
      },
      highestTypePercentage: {
        type: highestTypePercentage.type,
        percentage: highestTypePercentage.percentage,
      },
      highestSpendingDay: {
        date: highestSpendingDay.date,
        amount: highestSpendingDay.totalExpenses,
      },
      totalExpenses,
      averageDailySpending,
    };
  }

  /**
   * Get available months from transaction data (excluding current month by default)
   * @param transactions All transaction data
   * @param includeCurrentMonth Whether to include the current month
   * @returns Array of available months in YYYY-MM format, sorted desc
   */
  getAvailableMonths(
    transactions: TransactionData[],
    includeCurrentMonth: boolean = false
  ): string[] {
    const currentMonth = new Date().toISOString().slice(0, 7);

    const months = new Set<string>();
    transactions.forEach((t) => {
      const month = t.Date.slice(0, 7); // YYYY-MM
      if (includeCurrentMonth || month !== currentMonth) {
        months.add(month);
      }
    });

    return Array.from(months).sort().reverse(); // Most recent first
  }

  /**
   * Get the default analysis month (last complete month)
   * @param transactions All transaction data
   * @returns Default month in YYYY-MM format, or null if no data
   */
  getDefaultAnalysisMonth(transactions: TransactionData[]): string | null {
    const availableMonths = this.getAvailableMonths(transactions, false);
    return availableMonths.length > 0 ? availableMonths[0] : null;
  }
}
