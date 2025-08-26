import { describe, it, expect, beforeEach } from "vitest";
import { ExpenseAnalysisService } from "../ExpenseAnalysisService";
import type { TransactionData, AnalysisOptions } from "../../types";

describe("ExpenseAnalysisService", () => {
  let service: ExpenseAnalysisService;
  let mockTransactions: TransactionData[];

  beforeEach(() => {
    service = new ExpenseAnalysisService();

    // Create comprehensive test data for March 2024
    mockTransactions = [
      // March expenses (various types and amounts)
      {
        Date: "2024-03-01",
        Description: "Grocery Store",
        Type: "Debit Card",
        Amount: -150.0,
        "Current balance": 2850.0,
        Status: "Posted",
      },
      {
        Date: "2024-03-01",
        Description: "Coffee Shop",
        Type: "Debit Card",
        Amount: -5.5,
        "Current balance": 2844.5,
        Status: "Posted",
      },
      {
        Date: "2024-03-02",
        Description: "Gas Station",
        Type: "Debit Card",
        Amount: -45.0,
        "Current balance": 2799.5,
        Status: "Posted",
      },
      {
        Date: "2024-03-03",
        Description: "ATM Withdrawal",
        Type: "Withdrawal",
        Amount: -100.0,
        "Current balance": 2699.5,
        Status: "Posted",
      },
      {
        Date: "2024-03-05",
        Description: "Large Purchase",
        Type: "Debit Card",
        Amount: -500.0, // Largest expense
        "Current balance": 2199.5,
        Status: "Posted",
      },
      {
        Date: "2024-03-05",
        Description: "Transfer to Savings",
        Type: "Transfer",
        Amount: -200.0,
        "Current balance": 1999.5,
        Status: "Posted",
      },
      {
        Date: "2024-03-06",
        Description: "Roundup Transfer",
        Type: "Roundup",
        Amount: -2.5,
        "Current balance": 1997.0,
        Status: "Posted",
      },
      {
        Date: "2024-03-07",
        Description: "Pending Purchase",
        Type: "Debit Card",
        Amount: -75.0,
        "Current balance": 1922.0,
        Status: "Pending",
      },
      {
        Date: "2024-03-10",
        Description: "Salary Deposit",
        Type: "Deposit",
        Amount: 3000.0, // Income (positive)
        "Current balance": 4922.0,
        Status: "Posted",
      },
      // Tie-breaking test: same amount, different dates/descriptions
      {
        Date: "2024-03-15",
        Description: "Restaurant A",
        Type: "Debit Card",
        Amount: -50.0,
        "Current balance": 4872.0,
        Status: "Posted",
      },
      {
        Date: "2024-03-14", // Earlier date (should rank higher due to desc sort)
        Description: "Restaurant B",
        Type: "Debit Card",
        Amount: -50.0,
        "Current balance": 4822.0,
        Status: "Posted",
      },
      {
        Date: "2024-03-15", // Same date as Restaurant A
        Description: "Restaurant C", // Later alphabetically (should rank lower)
        Type: "Debit Card",
        Amount: -50.0,
        "Current balance": 4772.0,
        Status: "Posted",
      },
      // February transaction (should be excluded from March analysis)
      {
        Date: "2024-02-28",
        Description: "February Expense",
        Type: "Debit Card",
        Amount: -25.0,
        "Current balance": 2875.0,
        Status: "Posted",
      },
      // April transaction (should be excluded from March analysis)
      {
        Date: "2024-04-01",
        Description: "April Expense",
        Type: "Debit Card",
        Amount: -30.0,
        "Current balance": 4742.0,
        Status: "Posted",
      },
    ];
  });

  describe("analyzeMonth", () => {
    it("should analyze March 2024 with default options", () => {
      const result = service.analyzeMonth(mockTransactions, "2024-03", {});

      expect(result.month).toBe("2024-03");
      expect(result.isCurrentMonth).toBe(false);
      expect(result.appliedOptions).toEqual({
        includeTransfers: false,
        includeRoundups: false,
        includePending: false,
      });

      // Should exclude transfers, roundups, and pending by default
      expect(result.topExpenses).toHaveLength(8); // 8 posted non-transfer/roundup expenses
      expect(result.topExpenses[0].amount).toBe(-500.0); // Largest expense first
      expect(result.topExpenses[0].description).toBe("Large Purchase");
    });

    it("should include transfers when option is enabled", () => {
      const options: AnalysisOptions = { includeTransfers: true };
      const result = service.analyzeMonth(mockTransactions, "2024-03", options);

      // Should now include the transfer
      expect(result.topExpenses).toHaveLength(9);
      expect(
        result.topExpenses.some((e) => e.description === "Transfer to Savings")
      ).toBe(true);
    });

    it("should include roundups when option is enabled", () => {
      const options: AnalysisOptions = { includeRoundups: true };
      const result = service.analyzeMonth(mockTransactions, "2024-03", options);

      // Should now include the roundup
      expect(
        result.topExpenses.some((e) => e.description === "Roundup Transfer")
      ).toBe(true);
    });

    it("should include pending transactions when option is enabled", () => {
      const options: AnalysisOptions = { includePending: true };
      const result = service.analyzeMonth(mockTransactions, "2024-03", options);

      // Should now include the pending transaction
      expect(
        result.topExpenses.some((e) => e.description === "Pending Purchase")
      ).toBe(true);
    });

    it("should handle current month detection", () => {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const result = service.analyzeMonth(mockTransactions, currentMonth, {});

      expect(result.isCurrentMonth).toBe(true);
    });
  });

  describe("calculateTopExpenses", () => {
    it("should return top-10 expenses in correct order", () => {
      const result = service.analyzeMonth(mockTransactions, "2024-03", {});
      const topExpenses = result.topExpenses;

      expect(topExpenses).toHaveLength(8); // Only 8 qualifying expenses
      expect(topExpenses[0].amount).toBe(-500.0); // Largest
      expect(topExpenses[1].amount).toBe(-150.0); // Second largest
      expect(topExpenses[2].amount).toBe(-100.0); // Third largest

      // Check ranking
      topExpenses.forEach((expense, index) => {
        expect(expense.rank).toBe(index + 1);
      });
    });

    it("should handle tie-breaking correctly", () => {
      const result = service.analyzeMonth(mockTransactions, "2024-03", {});
      const topExpenses = result.topExpenses;

      // Find the -50.00 expenses for tie-breaking test
      const fiftyDollarExpenses = topExpenses.filter((e) => e.amount === -50.0);
      expect(fiftyDollarExpenses).toHaveLength(3);

      // Should be ordered by: date desc, then description asc
      // 1. 2024-03-15 Restaurant A (date desc wins over Restaurant C)
      // 2. 2024-03-15 Restaurant C (same date, but description asc)
      // 3. 2024-03-14 Restaurant B (earlier date)
      const sortedFifties = fiftyDollarExpenses.sort((a, b) => a.rank - b.rank);

      expect(sortedFifties[0].date).toBe("2024-03-15");
      expect(sortedFifties[0].description).toBe("Restaurant A");

      expect(sortedFifties[1].date).toBe("2024-03-15");
      expect(sortedFifties[1].description).toBe("Restaurant C");

      expect(sortedFifties[2].date).toBe("2024-03-14");
      expect(sortedFifties[2].description).toBe("Restaurant B");
    });

    it("should only include negative amounts (expenses)", () => {
      const result = service.analyzeMonth(mockTransactions, "2024-03", {});

      result.topExpenses.forEach((expense) => {
        expect(expense.amount).toBeLessThan(0);
      });

      // Should not include the salary deposit
      expect(
        result.topExpenses.some((e) => e.description === "Salary Deposit")
      ).toBe(false);
    });
  });

  describe("calculateExpensesByType", () => {
    it("should calculate correct percentages that sum to ~100%", () => {
      const result = service.analyzeMonth(mockTransactions, "2024-03", {});
      const expensesByType = result.expensesByType;

      // Calculate total percentage
      const totalPercentage = expensesByType.reduce(
        (sum, type) => sum + type.percentage,
        0
      );
      expect(totalPercentage).toBeCloseTo(100, 1); // Within 0.1%

      // Check that Debit Card has the highest percentage (most transactions)
      const debitCardType = expensesByType.find((t) => t.type === "Debit Card");
      expect(debitCardType).toBeDefined();
      expect(debitCardType!.percentage).toBeGreaterThan(50); // Should be majority
    });

    it("should use normalized transaction types", () => {
      const result = service.analyzeMonth(mockTransactions, "2024-03", {});
      const expensesByType = result.expensesByType;

      const typeNames = expensesByType.map((t) => t.type);
      expect(typeNames).toContain("Debit Card");
      expect(typeNames).toContain("Withdrawal");

      // Should not contain raw/unnormalized types
      expect(typeNames).not.toContain("DEBIT");
      expect(typeNames).not.toContain("ATM");
    });

    it("should calculate correct transaction counts and averages", () => {
      const result = service.analyzeMonth(mockTransactions, "2024-03", {});
      const debitCardType = result.expensesByType.find(
        (t) => t.type === "Debit Card"
      );

      expect(debitCardType).toBeDefined();
      expect(debitCardType!.transactionCount).toBe(7); // 7 debit card transactions (excluding pending)

      // Average should be total amount / count
      const expectedAverage =
        debitCardType!.totalAmount / debitCardType!.transactionCount;
      expect(debitCardType!.averageAmount).toBeCloseTo(expectedAverage, 2);
    });
  });

  describe("calculateDailySpending", () => {
    it("should fill missing days with zero", () => {
      const result = service.analyzeMonth(mockTransactions, "2024-03", {});
      const dailySpending = result.dailySpending;

      // March has 31 days
      expect(dailySpending).toHaveLength(31);

      // Check that days without transactions have zero spending
      const day4 = dailySpending.find((d) => d.day === 4);
      expect(day4).toBeDefined();
      expect(day4!.totalExpenses).toBe(0);
      expect(day4!.transactionCount).toBe(0);
      expect(day4!.largestExpense).toBeUndefined();
    });

    it("should calculate correct daily totals", () => {
      const result = service.analyzeMonth(mockTransactions, "2024-03", {});
      const dailySpending = result.dailySpending;

      // Day 1 has 2 transactions: -150.00 and -5.50
      const day1 = dailySpending.find((d) => d.day === 1);
      expect(day1).toBeDefined();
      expect(day1!.totalExpenses).toBe(155.5);
      expect(day1!.transactionCount).toBe(2);
      expect(day1!.largestExpense?.amount).toBe(-150.0);
      expect(day1!.largestExpense?.description).toBe("Grocery Store");

      // Day 5 has the largest single expense
      const day5 = dailySpending.find((d) => d.day === 5);
      expect(day5).toBeDefined();
      expect(day5!.largestExpense?.amount).toBe(-500.0);
    });

    it("should use correct date format (YYYY-MM-DD)", () => {
      const result = service.analyzeMonth(mockTransactions, "2024-03", {});
      const dailySpending = result.dailySpending;

      dailySpending.forEach((day) => {
        expect(day.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(day.date.startsWith("2024-03-")).toBe(true);
      });
    });
  });

  describe("calculateInsights", () => {
    it("should identify correct insights", () => {
      const result = service.analyzeMonth(mockTransactions, "2024-03", {});
      const insights = result.insights;

      // Largest expense
      expect(insights.largestExpense.amount).toBe(-500.0);
      expect(insights.largestExpense.description).toBe("Large Purchase");
      expect(insights.largestExpense.date).toBe("2024-03-05");

      // Highest type percentage (should be Debit Card)
      expect(insights.highestTypePercentage.type).toBe("Debit Card");
      expect(insights.highestTypePercentage.percentage).toBeGreaterThan(50);

      // Total expenses should be sum of all negative amounts (excluding transfers/roundups/pending)
      expect(insights.totalExpenses).toBeGreaterThan(0);

      // Average daily spending should be reasonable
      expect(insights.averageDailySpending).toBeGreaterThan(0);
    });

    it("should handle empty data gracefully", () => {
      const emptyResult = service.analyzeMonth([], "2024-03", {});
      const insights = emptyResult.insights;

      expect(insights.largestExpense.amount).toBe(0);
      expect(insights.largestExpense.description).toBe("");
      expect(insights.highestTypePercentage.percentage).toBe(0);
      expect(insights.totalExpenses).toBe(0);
      expect(insights.averageDailySpending).toBe(0);
    });
  });

  describe("getAvailableMonths", () => {
    it("should return available months excluding current month by default", () => {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const months = service.getAvailableMonths(mockTransactions, false);

      expect(months).toContain("2024-03");
      expect(months).toContain("2024-02");
      expect(months).toContain("2024-04");
      expect(months).not.toContain(currentMonth);
    });

    it("should include current month when requested", () => {
      const currentMonth = new Date().toISOString().slice(0, 7);

      // Add a transaction for current month
      const currentMonthTransaction: TransactionData = {
        Date: `${currentMonth}-15`,
        Description: "Current Month Expense",
        Type: "Debit Card",
        Amount: -25.0,
        "Current balance": 1000.0,
        Status: "Posted",
      };

      const transactionsWithCurrent = [
        ...mockTransactions,
        currentMonthTransaction,
      ];
      const months = service.getAvailableMonths(transactionsWithCurrent, true);

      expect(months).toContain(currentMonth);
    });

    it("should return months in descending order (most recent first)", () => {
      const months = service.getAvailableMonths(mockTransactions, false);

      // Should be sorted in descending order
      for (let i = 0; i < months.length - 1; i++) {
        expect(months[i] >= months[i + 1]).toBe(true);
      }
    });
  });

  describe("getDefaultAnalysisMonth", () => {
    it("should return the most recent complete month", () => {
      const defaultMonth = service.getDefaultAnalysisMonth(mockTransactions);

      // Should be the most recent month that's not the current month
      const availableMonths = service.getAvailableMonths(
        mockTransactions,
        false
      );
      expect(defaultMonth).toBe(availableMonths[0]);
    });

    it("should return null for empty data", () => {
      const defaultMonth = service.getDefaultAnalysisMonth([]);
      expect(defaultMonth).toBeNull();
    });
  });

  describe("filtering edge cases", () => {
    it("should handle months with only filtered-out transactions", () => {
      // Create transactions that are all transfers/roundups/pending
      const filteredTransactions: TransactionData[] = [
        {
          Date: "2024-05-01",
          Description: "Transfer Only",
          Type: "Transfer",
          Amount: -100.0,
          "Current balance": 1000.0,
          Status: "Posted",
        },
        {
          Date: "2024-05-02",
          Description: "Roundup Only",
          Type: "Roundup",
          Amount: -2.5,
          "Current balance": 997.5,
          Status: "Posted",
        },
        {
          Date: "2024-05-03",
          Description: "Pending Only",
          Type: "Debit Card",
          Amount: -50.0,
          "Current balance": 947.5,
          Status: "Pending",
        },
      ];

      const result = service.analyzeMonth(filteredTransactions, "2024-05", {});

      expect(result.topExpenses).toHaveLength(0);
      expect(result.expensesByType).toHaveLength(0);
      expect(result.insights.totalExpenses).toBe(0);
    });

    it("should maintain stable sorting with identical transactions", () => {
      // Create identical transactions to test stable sorting
      const identicalTransactions: TransactionData[] = [
        {
          Date: "2024-06-01",
          Description: "Identical Transaction",
          Type: "Debit Card",
          Amount: -100.0,
          "Current balance": 1000.0,
          Status: "Posted",
        },
        {
          Date: "2024-06-01",
          Description: "Identical Transaction",
          Type: "Debit Card",
          Amount: -100.0,
          "Current balance": 900.0,
          Status: "Posted",
        },
      ];

      const result = service.analyzeMonth(identicalTransactions, "2024-06", {});

      expect(result.topExpenses).toHaveLength(2);
      expect(result.topExpenses[0].rank).toBe(1);
      expect(result.topExpenses[1].rank).toBe(2);
    });
  });
});
