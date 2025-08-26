import { describe, it, expect, vi } from "vitest";
import { CsvService } from "../CsvService";
import { AnalysisService } from "../AnalysisService";

// Mock FileReader for testing
class MockFileReader {
  result: string | null = null;
  error: Error | null = null;
  onload: ((event: any) => void) | null = null;
  onerror: (() => void) | null = null;

  readAsText(file: File) {
    // Simulate async behavior
    setTimeout(() => {
      if (this.error) {
        this.onerror?.();
      } else {
        this.onload?.({ target: { result: this.result } });
      }
    }, 0);
  }
}

describe("AnalysisService Integration", () => {
  it("should work with data processed by CsvService", async () => {
    // Create a mock CSV file with test data
    const csvContent = `Date,Description,Type,Amount,Current balance,Status
2024-01-15,Salary Deposit,DEPOSIT,3000.00,3000.00,Posted
2024-01-20,Grocery Store,DEBIT CARD,-150.00,2850.00,Posted
2024-01-25,ATM Withdrawal,ATM,-100.00,2750.00,Posted
2024-02-01,Salary Deposit,DEPOSIT,3000.00,5750.00,Posted
2024-02-10,Restaurant,DBT,-75.00,5675.00,Posted
2024-02-15,Transfer to Savings,XFER,-500.00,5175.00,Posted`;

    const mockFile = new File([csvContent], "test.csv", { type: "text/csv" });

    // Mock FileReader to return our CSV content
    const mockReader = new MockFileReader();
    mockReader.result = csvContent;
    vi.spyOn(global, "FileReader").mockImplementation(() => mockReader);

    // Process CSV with CsvService
    const csvResult = await CsvService.validateAndParse(mockFile);

    expect(csvResult.isValid).toBe(true);
    expect(csvResult.transactions).toBeDefined();

    const transactions = csvResult.transactions!;

    // Test AnalysisService with processed data
    const monthlyData = AnalysisService.calculateMonthlySummary(
      transactions,
      false
    );
    expect(monthlyData).toHaveLength(2); // January and February

    // January data
    const jan = monthlyData.find((m) => m.month === "2024-01");
    expect(jan).toBeDefined();
    expect(jan!.totalIncome).toBe(3000);
    expect(jan!.totalExpenses).toBe(250); // 150 + 100
    expect(jan!.savings).toBe(2750);
    expect(jan!.transactionCount).toBe(3);

    // February data
    const feb = monthlyData.find((m) => m.month === "2024-02");
    expect(feb).toBeDefined();
    expect(feb!.totalIncome).toBe(3000);
    expect(feb!.totalExpenses).toBe(575); // 75 + 500
    expect(feb!.savings).toBe(2425);
    expect(feb!.transactionCount).toBe(3);

    // Test overall summary
    const overallSummary =
      AnalysisService.calculateOverallSummary(transactions);
    expect(overallSummary.totalIncome).toBe(6000);
    expect(overallSummary.totalExpenses).toBe(825);
    expect(overallSummary.netSavings).toBe(5175);
    expect(overallSummary.transactionCount).toBe(6);
    expect(overallSummary.dateRange.start).toBe("2024-01-15");
    expect(overallSummary.dateRange.end).toBe("2024-02-15");

    // Test type breakdown
    const typeBreakdown = AnalysisService.groupByTransactionType(transactions);
    expect(typeBreakdown).toHaveLength(3); // Debit Card, Withdrawal, Transfer

    const debitCard = typeBreakdown.find((t) => t.type === "Debit Card");
    expect(debitCard).toBeDefined();
    expect(debitCard!.amount).toBe(225); // 150 + 75
    expect(debitCard!.count).toBe(2);

    const transfer = typeBreakdown.find((t) => t.type === "Transfer");
    expect(transfer).toBeDefined();
    expect(transfer!.amount).toBe(500);
    expect(transfer!.count).toBe(1);

    const withdrawal = typeBreakdown.find((t) => t.type === "Withdrawal");
    expect(withdrawal).toBeDefined();
    expect(withdrawal!.amount).toBe(100);
    expect(withdrawal!.count).toBe(1);

    // Test balance history
    const balanceHistory = AnalysisService.generateBalanceHistory(transactions);
    expect(balanceHistory).toHaveLength(6);
    expect(balanceHistory[0].date).toBe("2024-01-15");
    expect(balanceHistory[0].balance).toBe(3000);
    expect(balanceHistory[balanceHistory.length - 1].date).toBe("2024-02-15");
    expect(balanceHistory[balanceHistory.length - 1].balance).toBe(5175);
  });

  it("should handle current month exclusion correctly", async () => {
    const currentDate = new Date();
    const currentMonth = currentDate.toISOString().slice(0, 7); // YYYY-MM
    const currentDay = currentDate.getDate().toString().padStart(2, "0");

    const csvContent = `Date,Description,Type,Amount,Current balance,Status
2024-01-15,Old Transaction,DEPOSIT,1000.00,1000.00,Posted
${currentMonth}-${currentDay},Current Month Transaction,DEBIT CARD,-50.00,950.00,Posted`;

    const mockFile = new File([csvContent], "test.csv", { type: "text/csv" });

    // Mock FileReader to return our CSV content
    const mockReader = new MockFileReader();
    mockReader.result = csvContent;
    vi.spyOn(global, "FileReader").mockImplementation(() => mockReader);

    const csvResult = await CsvService.validateAndParse(mockFile);
    expect(csvResult.isValid).toBe(true);

    const transactions = csvResult.transactions!;

    // Test with current month excluded (default)
    const monthlyDataExcluded =
      AnalysisService.calculateMonthlySummary(transactions);
    const currentMonthDataExcluded = monthlyDataExcluded.find(
      (m) => m.month === currentMonth
    );
    expect(currentMonthDataExcluded).toBeUndefined();

    // Test with current month included
    const monthlyDataIncluded = AnalysisService.calculateMonthlySummary(
      transactions,
      false
    );
    const currentMonthDataIncluded = monthlyDataIncluded.find(
      (m) => m.month === currentMonth
    );
    expect(currentMonthDataIncluded).toBeDefined();
    expect(currentMonthDataIncluded!.isCurrentMonth).toBe(true);
  });

  it("should handle calculated balance source correctly", async () => {
    const csvContent = `Date,Description,Type,Amount,Current balance,Status
2024-01-15,Transaction 1,DEPOSIT,1000.00,,Posted
2024-01-20,Transaction 2,DEBIT CARD,-100.00,,Posted`;

    const mockFile = new File([csvContent], "test.csv", { type: "text/csv" });

    // Mock FileReader to return our CSV content
    const mockReader = new MockFileReader();
    mockReader.result = csvContent;
    vi.spyOn(global, "FileReader").mockImplementation(() => mockReader);

    const csvResult = await CsvService.validateAndParse(mockFile);
    expect(csvResult.isValid).toBe(true);
    expect(csvResult.metadata.balanceSource).toBe("calculated");

    const transactions = csvResult.transactions!;

    const overallSummary =
      AnalysisService.calculateOverallSummary(transactions);
    // The balance source should come from the CSV metadata, not be detected by AnalysisService
    // In a real implementation, this would be passed from the CSV processing result
    expect(csvResult.metadata.balanceSource).toBe("calculated");

    const balanceHistory = AnalysisService.generateBalanceHistory(transactions);

    // The balance history should be generated correctly
    expect(balanceHistory).toHaveLength(2);
    expect(balanceHistory[0].date).toBe("2024-01-15");
    expect(balanceHistory[0].balance).toBe(1000);
    expect(balanceHistory[1].date).toBe("2024-01-20");
    expect(balanceHistory[1].balance).toBe(900);

    // Note: The AnalysisService doesn't need to detect calculated balances
    // That information comes from the CsvService metadata
    // In a real implementation, the balance source would be passed from CSV processing
  });
});
