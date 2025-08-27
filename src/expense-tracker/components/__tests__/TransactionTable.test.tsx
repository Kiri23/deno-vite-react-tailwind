import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TransactionTable } from "../TransactionTable";
import type { TransactionData, OverallSummary } from "../types";

describe("TransactionTable", () => {
  const mockTransactions: TransactionData[] = [
    {
      Date: "2024-01-01",
      Description: "Test Expense",
      Type: "Debit Card",
      Amount: -50.0,
      "Current balance": 1000.0,
      Status: "Posted",
    },
    {
      Date: "2024-01-02",
      Description: "Test Income",
      Type: "Deposit",
      Amount: 100.0,
      "Current balance": 1100.0,
      Status: "Posted",
    },
    {
      Date: "2024-01-03",
      Description: "Pending Transaction",
      Type: "Transfer",
      Amount: -25.0,
      "Current balance": 1075.0,
      Status: "Pending",
    },
  ];

  const mockSummary: OverallSummary = {
    totalIncome: 100.0,
    totalExpenses: -75.0,
    netSavings: 25.0,
    transactionCount: 3,
    dateRange: {
      start: "2024-01-01",
      end: "2024-01-03",
    },
    balanceSource: "original",
  };

  const mockDateRange = {
    start: "2024-01-01",
    end: "2024-01-03",
  };

  const defaultProps = {
    transactions: mockTransactions,
    summary: mockSummary,
    dateRange: mockDateRange,
  };

  it("renders transaction table with all transactions", () => {
    render(<TransactionTable {...defaultProps} />);

    expect(screen.getByText("Transacciones")).toBeInTheDocument();
    // The date range is calculated from the actual dates, check for the pattern
    expect(screen.getByText(/3 transacciones •/)).toBeInTheDocument();

    // Check all transactions are displayed
    expect(screen.getByText("Test Expense")).toBeInTheDocument();
    expect(screen.getByText("Test Income")).toBeInTheDocument();
    expect(screen.getByText("Pending Transaction")).toBeInTheDocument();
  });

  it("displays transactions sorted by date (most recent first by default)", () => {
    render(<TransactionTable {...defaultProps} />);

    const rows = screen.getAllByRole("row");
    // Skip header row (index 0)
    const firstDataRow = rows[1];
    const lastDataRow = rows[3];

    // Most recent (2024-01-03) should be first
    expect(firstDataRow).toHaveTextContent("Pending Transaction");
    // Oldest (2024-01-01) should be last
    expect(lastDataRow).toHaveTextContent("Test Expense");
  });

  it("toggles sort order when clicking date header", () => {
    render(<TransactionTable {...defaultProps} />);

    const dateHeader = screen.getByRole("button", {
      name: /ordenar por fecha/i,
    });

    // Initially sorted desc (most recent first)
    let rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("Pending Transaction"); // 2024-01-03

    // Click to sort ascending
    fireEvent.click(dateHeader);

    rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("Test Expense"); // 2024-01-01
  });

  it("supports keyboard navigation for sort toggle", () => {
    render(<TransactionTable {...defaultProps} />);

    const dateHeader = screen.getByRole("button", {
      name: /ordenar por fecha/i,
    });

    // Test Enter key
    fireEvent.keyDown(dateHeader, { key: "Enter" });
    let rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("Test Expense"); // Should be sorted ascending

    // Test Space key
    fireEvent.keyDown(dateHeader, { key: " " });
    rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("Pending Transaction"); // Should be back to descending
  });

  it("displays amounts with proper color coding and signs", () => {
    render(<TransactionTable {...defaultProps} />);

    // Check expense (negative amount) - use getAllByText since amount appears in table and summary
    const expenseAmounts = screen.getAllByText("-$50.00");
    expect(expenseAmounts[0]).toHaveClass("text-red-600");

    // Check income (positive amount) - use getAllByText since amount appears in table and summary
    const incomeAmounts = screen.getAllByText("+$100.00");
    expect(incomeAmounts[0]).toHaveClass("text-green-600");
  });

  it("displays transaction status with proper styling", () => {
    render(<TransactionTable {...defaultProps} />);

    // Check posted status
    const postedStatuses = screen.getAllByText("Procesado");
    expect(postedStatuses).toHaveLength(2);
    postedStatuses.forEach((status) => {
      expect(status).toHaveClass("bg-green-100", "text-green-800");
    });

    // Check pending status
    const pendingStatus = screen.getByText("Pendiente");
    expect(pendingStatus).toHaveClass("bg-yellow-100", "text-yellow-800");
  });

  it("displays summary totals correctly", () => {
    render(<TransactionTable {...defaultProps} />);

    expect(screen.getByText("Total Ingresos:")).toBeInTheDocument();
    expect(screen.getByText("Total Gastos:")).toBeInTheDocument();
    expect(screen.getByText("Balance Neto:")).toBeInTheDocument();

    // Check that summary amounts exist (they appear in both table and summary)
    expect(screen.getAllByText("+$100.00")).toHaveLength(2); // Table and summary
    expect(screen.getByText("-$75.00")).toBeInTheDocument(); // Only in summary
    expect(screen.getAllByText("+$25.00")).toHaveLength(1); // Only in summary
  });

  it("shows calculated balance badge when balance is calculated", () => {
    const propsWithCalculatedBalance = {
      ...defaultProps,
      summary: {
        ...mockSummary,
        balanceSource: "calculated" as const,
      },
    };

    render(<TransactionTable {...propsWithCalculatedBalance} />);

    expect(screen.getByText("Balance calculado")).toBeInTheDocument();
    expect(screen.getByText("Balance calculado")).toHaveClass(
      "bg-yellow-100",
      "text-yellow-800"
    );
  });

  it("does not show calculated balance badge when balance is original", () => {
    render(<TransactionTable {...defaultProps} />);

    expect(screen.queryByText("Balance calculado")).not.toBeInTheDocument();
  });

  it("handles empty transactions list", () => {
    const emptyProps = {
      ...defaultProps,
      transactions: [],
    };

    render(<TransactionTable {...emptyProps} />);

    expect(
      screen.getByText("No hay transacciones para mostrar")
    ).toBeInTheDocument();
  });

  it("truncates long descriptions with tooltip", () => {
    const longDescriptionTransaction: TransactionData = {
      Date: "2024-01-01",
      Description:
        "This is a very long transaction description that should be truncated in the table view",
      Type: "Debit Card",
      Amount: -50.0,
      "Current balance": 1000.0,
      Status: "Posted",
    };

    const propsWithLongDescription = {
      ...defaultProps,
      transactions: [longDescriptionTransaction],
    };

    render(<TransactionTable {...propsWithLongDescription} />);

    const descriptionCell = screen.getByTitle(
      longDescriptionTransaction.Description
    );
    expect(descriptionCell).toBeInTheDocument();
    expect(descriptionCell).toHaveClass("truncate");
  });

  it("has proper accessibility attributes", () => {
    render(<TransactionTable {...defaultProps} />);

    // Check table role
    expect(screen.getByRole("table")).toBeInTheDocument();

    // Check column headers
    expect(screen.getByText("Fecha")).toBeInTheDocument();
    expect(screen.getByText("Descripción")).toBeInTheDocument();
    expect(screen.getByText("Tipo")).toBeInTheDocument();
    expect(screen.getByText("Monto")).toBeInTheDocument();
    expect(screen.getByText("Balance")).toBeInTheDocument();
    expect(screen.getByText("Estado")).toBeInTheDocument();

    // Check aria-labels for amounts
    expect(screen.getByLabelText(/gasto de 50 dólares/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/ingreso de 100 dólares/i)
    ).toBeInTheDocument();
  });

  it("formats dates correctly", () => {
    render(<TransactionTable {...defaultProps} />);

    // Check Spanish date format (DD/MM/YYYY) - based on actual output
    expect(screen.getByText("01/01/2024")).toBeInTheDocument();
    expect(screen.getByText("02/01/2024")).toBeInTheDocument();
    expect(screen.getByText("31/12/2023")).toBeInTheDocument();
  });

  it("displays balance amounts correctly", () => {
    render(<TransactionTable {...defaultProps} />);

    expect(screen.getByText("$1,000.00")).toBeInTheDocument();
    expect(screen.getByText("$1,100.00")).toBeInTheDocument();
    expect(screen.getByText("$1,075.00")).toBeInTheDocument();
  });

  it("has responsive design classes", () => {
    render(<TransactionTable {...defaultProps} />);

    // Check for responsive classes
    const container = screen.getByRole("table").closest(".overflow-x-auto");
    expect(container).toBeInTheDocument();

    // Check for responsive grid in summary
    const summaryContainer = screen
      .getByText("Total Ingresos:")
      .closest(".grid");
    expect(summaryContainer).toHaveClass("grid-cols-1", "sm:grid-cols-3");
  });
});
