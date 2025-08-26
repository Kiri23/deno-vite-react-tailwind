import { describe, it, expect, beforeEach } from "vitest";
import { AnalysisService } from "../AnalysisService";
import type { TransactionData } from "../../types";

describe("AnalysisService", () => {
  let mockTransactions: TransactionData[];
  let currentMonthTransactions: TransactionData[];

  beforeEach(() => {
    // Mock transactions spanning multiple months
    mockTransactions = [
      {
        Date: "2024-01-15",
        Description: "Salary Deposit",
        Type: "Deposit",
        Amount: 3000,
        "Current balance": 3000,
        Status: "Posted",
      },
      {
        Date: "2024-01-20",
        Description: "Grocery Store",
        Type: "Debit Card",
        Amount: -150,
        "Current balance": 2850,
        Status: "Posted",
      },
      {
        Date: "2024-01-25",
        Description: "ATM Withdrawal",
        Type: "Withdrawal",
        Amount: -100,
        "Current balance": 2750,
        Status: "Posted",
      },
      {
        Date: "2024-02-01",
        Description: "Salary Deposit",
        Type: "Deposit",
        Amount: 3000,
        "Current balance": 5750,
        Status: "Posted",
      },
      {
        Date: "2024-02-10",
        Description: "Restaurant",
        Type: "Debit Card",
        Amount: -75,
        "Current balance": 5675,
        Status: "Posted",
      },
      {
        Date: "2024-02-15",
        Description: "Transfer to Savings",
        Type: "Transfer",
        Amount: -500,
        "Current balance": 5175,
        Status: "Posted",
      },
      {
        Date: "2024-03-01",
        Description: "Salary Deposit",
        Type: "Deposit",
        Amount: 3200,
        "Current balance": 8375,
        Status: "Posted",
      },
      {
        Date: "2024-03-05",
        Description: "Utilities",
        Type: "Debit Card",
        Amount: -120,
        "Current balance": 8255,
        Status: "Posted",
      },
    ];

    // Create transactions for current month (assuming current month is March 2024 for testing)
    const currentDate = new Date();
    const currentMonth = currentDate.toISOString().slice(0, 7); // YYYY-MM

    currentMonthTransactions = [
      ...mockTransactions,
      {
        Date: `${currentMonth}-10`,
        Description: "Current Month Transaction",
        Type: "Debit Card",
        Amount: -50,
        "Current balance": 8205,
        Status: "Posted",
      },
    ];
  });

  describe("calculateMonthlySummary", () => {
    it("should calculate monthly summaries correctly", () => {
      const result = AnalysisService.calculateMonthlySummary(
        mockTransactions,
        false
      );

      expect(result).toHaveLength(3);

      // January 2024
      const jan = result.find((m) => m.month === "2024-01");
      expect(jan).toBeDefined();
      expect(jan!.totalIncome).toBe(3000);
      expect(jan!.totalExpenses).toBe(250); // 150 + 100
      expect(jan!.savings).toBe(2750); // 3000 - 250
      expect(jan!.transactionCount).toBe(3);
      expect(jan!.isCurrentMonth).toBe(false);

      // February 2024
      const feb = result.find((m) => m.month === "2024-02");
      expect(feb).toBeDefined();
      expect(feb!.totalIncome).toBe(3000);
      expect(feb!.totalExpenses).toBe(575); // 75 + 500
      expect(feb!.savings).toBe(2425); // 3000 - 575
      expect(feb!.transactionCount).toBe(3);
      expect(feb!.isCurrentMonth).toBe(false);

      // March 2024
      const mar = result.find((m) => m.month === "2024-03");
      expect(mar).toBeDefined();
      expect(mar!.totalIncome).toBe(3200);
      expect(mar!.totalExpenses).toBe(120);
      expect(mar!.savings).toBe(3080); // 3200 - 120
      expect(mar!.transactionCount).toBe(2);
      expect(mar!.isCurrentMonth).toBe(false);
    });

    it("should exclude current month by default", () => {
      const result = AnalysisService.calculateMonthlySummary(
        currentMonthTransactions
      );

      // Should not include current month
      const currentMonth = new Date().toISOString().slice(0, 7);
      const currentMonthData = result.find((m) => m.month === currentMonth);
      expect(currentMonthData).toBeUndefined();
    });

    it("should include current month when excludeCurrentMonth is false", () => {
      const result = AnalysisService.calculateMonthlySummary(
        currentMonthTransactions,
        false
      );

      // Should include current month
      const currentMonth = new Date().toISOString().slice(0, 7);
      const currentMonthData = result.find((m) => m.month === currentMonth);
      expect(currentMonthData).toBeDefined();
      expect(currentMonthData!.isCurrentMonth).toBe(true);
    });

    it("should handle empty transactions array", () => {
      const result = AnalysisService.calculateMonthlySummary([]);
      expect(result).toEqual([]);
    });

    it("should sort results chronologically", () => {
      const result = AnalysisService.calculateMonthlySummary(
        mockTransactions,
        false
      );

      for (let i = 1; i < result.length; i++) {
        expect(result[i].month >= result[i - 1].month).toBe(true);
      }
    });

    it("should handle negative savings (deficit)", () => {
      const deficitTransactions: TransactionData[] = [
        {
          Date: "2024-01-15",
          Description: "Small Income",
          Type: "Deposit",
          Amount: 100,
          "Current balance": 100,
          Status: "Posted",
        },
        {
          Date: "2024-01-20",
          Description: "Large Expense",
          Type: "Debit Card",
          Amount: -500,
          "Current balance": -400,
          Status: "Posted",
        },
      ];

      const result = AnalysisService.calculateMonthlySummary(
        deficitTransactions,
        false
      );

      expect(result).toHaveLength(1);
      expect(result[0].totalIncome).toBe(100);
      expect(result[0].totalExpenses).toBe(500);
      expect(result[0].savings).toBe(-400); // Deficit
    });
  });

  describe("calculateOverallSummary", () => {
    it("should calculate overall summary correctly", () => {
      const result = AnalysisService.calculateOverallSummary(mockTransactions);

      expect(result.totalIncome).toBe(9200); // 3000 + 3000 + 3200
      expect(result.totalExpenses).toBe(945); // 150 + 100 + 75 + 500 + 120
      expect(result.netSavings).toBe(8255); // 9200 - 945
      expect(result.transactionCount).toBe(8);
      expect(result.dateRange.start).toBe("2024-01-15");
      expect(result.dateRange.end).toBe("2024-03-05");
      expect(result.balanceSource).toBe("original");
    });

    it("should handle empty transactions array", () => {
      const result = AnalysisService.calculateOverallSummary([]);

      expect(result.totalIncome).toBe(0);
      expect(result.totalExpenses).toBe(0);
      expect(result.netSavings).toBe(0);
      expect(result.transactionCount).toBe(0);
      expect(result.dateRange.start).toBe("");
      expect(result.dateRange.end).toBe("");
      expect(result.balanceSource).toBe("original");
    });

    it("should detect calculated balance source", () => {
      const transactionsWithCalculatedBalance: TransactionData[] = [
        {
          Date: "2024-01-15",
          Description: "Test Transaction",
          Type: "Deposit",
          Amount: 100,
          "Current balance": 0, // This indicates calculated balance
          Status: "Posted",
        },
      ];

      const result = AnalysisService.calculateOverallSummary(
        transactionsWithCalculatedBalance
      );
      expect(result.balanceSource).toBe("calculated");
    });

    it("should handle transactions with invalid dates", () => {
      const transactionsWithInvalidDates: TransactionData[] = [
        {
          Date: "",
          Description: "Invalid Date Transaction",
          Type: "Deposit",
          Amount: 100,
          "Current balance": 100,
          Status: "Posted",
        },
        {
          Date: "2024-01-15",
          Description: "Valid Date Transaction",
          Type: "Debit Card",
          Amount: -50,
          "Current balance": 50,
          Status: "Posted",
        },
      ];

      const result = AnalysisService.calculateOverallSummary(
        transactionsWithInvalidDates
      );
      expect(result.dateRange.start).toBe("2024-01-15");
      expect(result.dateRange.end).toBe("2024-01-15");
    });
  });

  describe("groupByTransactionType", () => {
    it("should group expense transactions by type correctly", () => {
      const result = AnalysisService.groupByTransactionType(mockTransactions);

      expect(result).toHaveLength(3); // Debit Card, Withdrawal, Transfer

      // Find Debit Card transactions
      const debitCard = result.find((t) => t.type === "Debit Card");
      expect(debitCard).toBeDefined();
      expect(debitCard!.amount).toBe(345); // 150 + 75 + 120
      expect(debitCard!.count).toBe(3);
      expect(debitCard!.percentage).toBeCloseTo(36.51, 1); // 345/945 * 100

      // Find Withdrawal transactions
      const withdrawal = result.find((t) => t.type === "Withdrawal");
      expect(withdrawal).toBeDefined();
      expect(withdrawal!.amount).toBe(100);
      expect(withdrawal!.count).toBe(1);
      expect(withdrawal!.percentage).toBeCloseTo(10.58, 1); // 100/945 * 100

      // Find Transfer transactions
      const transfer = result.find((t) => t.type === "Transfer");
      expect(transfer).toBeDefined();
      expect(transfer!.amount).toBe(500);
      expect(transfer!.count).toBe(1);
      expect(transfer!.percentage).toBeCloseTo(52.91, 1); // 500/945 * 100
    });

    it("should only include expense transactions (negative amounts)", () => {
      const result = AnalysisService.groupByTransactionType(mockTransactions);

      // Should not include Deposit transactions (positive amounts)
      const deposit = result.find((t) => t.type === "Deposit");
      expect(deposit).toBeUndefined();
    });

    it("should handle empty transactions array", () => {
      const result = AnalysisService.groupByTransactionType([]);
      expect(result).toEqual([]);
    });

    it("should handle transactions with only income (no expenses)", () => {
      const incomeOnlyTransactions: TransactionData[] = [
        {
          Date: "2024-01-15",
          Description: "Salary",
          Type: "Deposit",
          Amount: 3000,
          "Current balance": 3000,
          Status: "Posted",
        },
      ];

      const result = AnalysisService.groupByTransactionType(
        incomeOnlyTransactions
      );
      expect(result).toEqual([]);
    });

    it("should sort results by amount (highest first)", () => {
      const result = AnalysisService.groupByTransactionType(mockTransactions);

      for (let i = 1; i < result.length; i++) {
        expect(result[i].amount <= result[i - 1].amount).toBe(true);
      }
    });

    it("should calculate percentages that sum to 100%", () => {
      const result = AnalysisService.groupByTransactionType(mockTransactions);

      const totalPercentage = result.reduce(
        (sum, item) => sum + item.percentage,
        0
      );
      expect(totalPercentage).toBeCloseTo(100, 0); // Allow for rounding differences
    });
  });

  describe("generateBalanceHistory", () => {
    it("should generate balance history correctly", () => {
      const result = AnalysisService.generateBalanceHistory(mockTransactions);

      expect(result).toHaveLength(8);

      // Check first balance point
      expect(result[0].date).toBe("2024-01-15");
      expect(result[0].balance).toBe(3000);
      expect(result[0].isCalculated).toBe(false);

      // Check last balance point
      expect(result[result.length - 1].date).toBe("2024-03-05");
      expect(result[result.length - 1].balance).toBe(8255);
      expect(result[result.length - 1].isCalculated).toBe(false);
    });

    it("should sort balance history chronologically", () => {
      // Create unsorted transactions
      const unsortedTransactions = [...mockTransactions].reverse();
      const result =
        AnalysisService.generateBalanceHistory(unsortedTransactions);

      // Should be sorted by date
      for (let i = 1; i < result.length; i++) {
        expect(new Date(result[i].date) >= new Date(result[i - 1].date)).toBe(
          true
        );
      }
    });

    it("should detect calculated balances", () => {
      const transactionsWithCalculatedBalance: TransactionData[] = [
        {
          Date: "2024-01-15",
          Description: "Test Transaction",
          Type: "Deposit",
          Amount: 100,
          "Current balance": 0, // This indicates calculated balance
          Status: "Posted",
        },
      ];

      const result = AnalysisService.generateBalanceHistory(
        transactionsWithCalculatedBalance
      );
      expect(result[0].isCalculated).toBe(true);
    });

    it("should handle empty transactions array", () => {
      const result = AnalysisService.generateBalanceHistory([]);
      expect(result).toEqual([]);
    });

    it("should handle NaN balance values", () => {
      const transactionsWithNaNBalance: TransactionData[] = [
        {
          Date: "2024-01-15",
          Description: "Test Transaction",
          Type: "Deposit",
          Amount: 100,
          "Current balance": NaN,
          Status: "Posted",
        },
      ];

      const result = AnalysisService.generateBalanceHistory(
        transactionsWithNaNBalance
      );
      expect(result[0].isCalculated).toBe(true);
    });
  });

  describe("instance methods", () => {
    it("should work as instance methods", () => {
      const service = new AnalysisService();

      const monthlyResult = service.calculateMonthlySummary(
        mockTransactions,
        false
      );
      expect(monthlyResult).toHaveLength(3);

      const overallResult = service.calculateOverallSummary(mockTransactions);
      expect(overallResult.transactionCount).toBe(8);

      const typeResult = service.groupByTransactionType(mockTransactions);
      expect(typeResult).toHaveLength(3);

      const balanceResult = service.generateBalanceHistory(mockTransactions);
      expect(balanceResult).toHaveLength(8);
    });
  });
});
