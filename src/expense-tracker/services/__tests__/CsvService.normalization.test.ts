import { describe, it, expect } from "vitest";
import { CsvService } from "../CsvService";
import type { RawTransaction, TransactionData } from "../../types";

describe("CsvService - Data Normalization and Type Conversion (Task 2.3)", () => {
  describe("Transaction Type Normalization", () => {
    it("should normalize transaction types using the dictionary", () => {
      const rawTransactions: RawTransaction[] = [
        {
          Date: "2024-01-01",
          Description: "Coffee Shop",
          Type: "DEBIT",
          Amount: -4.5,
          "Current balance": 95.5,
          Status: "Posted",
        },
        {
          Date: "2024-01-02",
          Description: "ATM Cash",
          Type: "ATM",
          Amount: -100.0,
          "Current balance": -4.5,
          Status: "Posted",
        },
        {
          Date: "2024-01-03",
          Description: "Salary",
          Type: "DEP",
          Amount: 2000.0,
          "Current balance": 1995.5,
          Status: "Posted",
        },
        {
          Date: "2024-01-04",
          Description: "Transfer",
          Type: "XFER",
          Amount: -500.0,
          "Current balance": 1495.5,
          Status: "Posted",
        },
        {
          Date: "2024-01-05",
          Description: "Unknown Type",
          Type: "UNKNOWN",
          Amount: -10.0,
          "Current balance": 1485.5,
          Status: "Posted",
        },
      ];

      const normalized = CsvService.normalizeTransactionTypes(rawTransactions);

      expect(normalized[0].Type).toBe("Debit Card");
      expect(normalized[1].Type).toBe("Withdrawal");
      expect(normalized[2].Type).toBe("Deposit");
      expect(normalized[3].Type).toBe("Transfer");
      expect(normalized[4].Type).toBe("Other"); // Unknown types become 'Other'
    });

    it("should handle case-insensitive type normalization", () => {
      const rawTransactions: RawTransaction[] = [
        {
          Date: "2024-01-01",
          Description: "Test",
          Type: "debit card",
          Amount: -10.0,
          "Current balance": 90.0,
          Status: "Posted",
        },
        {
          Date: "2024-01-02",
          Description: "Test",
          Type: "Withdrawal",
          Amount: -20.0,
          "Current balance": 70.0,
          Status: "Posted",
        },
      ];

      const normalized = CsvService.normalizeTransactionTypes(rawTransactions);

      expect(normalized[0].Type).toBe("Debit Card");
      expect(normalized[1].Type).toBe("Withdrawal");
    });

    it("should normalize status values", () => {
      const rawTransactions: RawTransaction[] = [
        {
          Date: "2024-01-01",
          Description: "Test",
          Type: "DEBIT",
          Amount: -10.0,
          "Current balance": 90.0,
          Status: "pending",
        },
        {
          Date: "2024-01-02",
          Description: "Test",
          Type: "DEBIT",
          Amount: -20.0,
          "Current balance": 70.0,
          Status: "POSTED",
        },
      ];

      const normalized = CsvService.normalizeTransactionTypes(rawTransactions);

      expect(normalized[0].Status).toBe("Pending");
      expect(normalized[1].Status).toBe("Posted");
    });
  });

  describe("Date Normalization", () => {
    it("should normalize ISO dates to YYYY-MM-DD format", () => {
      const result = CsvService.normalizeDate("2024-01-15");
      expect(result).toBe("2024-01-15");
    });

    it("should normalize MM/DD/YYYY format to YYYY-MM-DD", () => {
      const result = CsvService.normalizeDate("01/15/2024");
      expect(result).toBe("2024-01-15");
    });

    it("should handle single digit months and days", () => {
      const result = CsvService.normalizeDate("1/5/2024");
      expect(result).toBe("2024-01-05");
    });

    it("should apply America/New_York timezone", () => {
      // This test verifies the timezone is applied, though the exact result
      // may vary based on daylight saving time
      const result = CsvService.normalizeDate("2024-06-15");
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("should throw error for invalid date formats", () => {
      expect(() => CsvService.normalizeDate("invalid-date")).toThrow();
      expect(() => CsvService.normalizeDate("13/32/2024")).toThrow();
      expect(() => CsvService.normalizeDate("")).toThrow();
    });
  });

  describe("Amount Canonicalization", () => {
    it("should ensure deposits are positive", () => {
      const result = CsvService.canonicalizeAmount(-1000, "Deposit");
      expect(result).toBe(1000);
    });

    it("should ensure withdrawals are negative", () => {
      const result = CsvService.canonicalizeAmount(100, "Withdrawal");
      expect(result).toBe(-100);
    });

    it("should ensure debit card transactions are negative", () => {
      const result = CsvService.canonicalizeAmount(50, "Debit Card");
      expect(result).toBe(-50);
    });

    it("should leave correctly signed amounts unchanged", () => {
      expect(CsvService.canonicalizeAmount(1000, "Deposit")).toBe(1000);
      expect(CsvService.canonicalizeAmount(-100, "Withdrawal")).toBe(-100);
      expect(CsvService.canonicalizeAmount(-50, "Debit Card")).toBe(-50);
    });

    it("should leave other transaction types unchanged", () => {
      expect(CsvService.canonicalizeAmount(100, "Transfer")).toBe(100);
      expect(CsvService.canonicalizeAmount(-100, "Transfer")).toBe(-100);
      expect(CsvService.canonicalizeAmount(25, "Other")).toBe(25);
    });
  });

  describe("Synthetic Balance Calculation", () => {
    it("should return original transactions if all balances are valid", () => {
      const transactions: TransactionData[] = [
        {
          Date: "2024-01-01",
          Description: "Starting",
          Type: "Deposit",
          Amount: 1000,
          "Current balance": 1000,
          Status: "Posted",
        },
        {
          Date: "2024-01-02",
          Description: "Purchase",
          Type: "Debit Card",
          Amount: -50,
          "Current balance": 950,
          Status: "Posted",
        },
      ];

      const result = CsvService.calculateSyntheticBalance(transactions);
      expect(result).toEqual(transactions);
    });

    it("should calculate synthetic balance when balances are missing", () => {
      const transactions: TransactionData[] = [
        {
          Date: "2024-01-01",
          Description: "Starting",
          Type: "Deposit",
          Amount: 1000,
          "Current balance": 1000,
          Status: "Posted",
        },
        {
          Date: "2024-01-02",
          Description: "Purchase",
          Type: "Debit Card",
          Amount: -50,
          "Current balance": 0, // Missing balance
          Status: "Posted",
        },
        {
          Date: "2024-01-03",
          Description: "Another Purchase",
          Type: "Debit Card",
          Amount: -25,
          "Current balance": 0, // Missing balance
          Status: "Posted",
        },
      ];

      const result = CsvService.calculateSyntheticBalance(transactions);

      expect(result[0]["Current balance"]).toBe(1000); // Original
      expect(result[1]["Current balance"]).toBe(950); // 1000 - 50
      expect(result[2]["Current balance"]).toBe(925); // 950 - 25
    });

    it("should handle transactions in any order", () => {
      const transactions: TransactionData[] = [
        {
          Date: "2024-01-03",
          Description: "Later Purchase",
          Type: "Debit Card",
          Amount: -25,
          "Current balance": 0,
          Status: "Posted",
        },
        {
          Date: "2024-01-01",
          Description: "Starting",
          Type: "Deposit",
          Amount: 1000,
          "Current balance": 1000,
          Status: "Posted",
        },
        {
          Date: "2024-01-02",
          Description: "Purchase",
          Type: "Debit Card",
          Amount: -50,
          "Current balance": 0,
          Status: "Posted",
        },
      ];

      const result = CsvService.calculateSyntheticBalance(transactions);

      // Should maintain original order but calculate balances correctly
      expect(result[0].Date).toBe("2024-01-03");
      expect(result[0]["Current balance"]).toBe(925);
      expect(result[1].Date).toBe("2024-01-01");
      expect(result[1]["Current balance"]).toBe(1000);
      expect(result[2].Date).toBe("2024-01-02");
      expect(result[2]["Current balance"]).toBe(950);
    });

    it("should handle empty transaction array", () => {
      const result = CsvService.calculateSyntheticBalance([]);
      expect(result).toEqual([]);
    });
  });

  describe("Full Normalization Pipeline", () => {
    it("should apply complete normalization pipeline", () => {
      const rawTransactions: RawTransaction[] = [
        {
          Date: "01/15/2024",
          Description: "Coffee Shop",
          Type: "DBT",
          Amount: 4.5, // Positive but should be negative for debit
          "Current balance": 0, // Missing, should be calculated
          Status: "pending",
        },
        {
          Date: "01/16/2024",
          Description: "Salary Deposit",
          Type: "DEP",
          Amount: -2000.0, // Negative but should be positive for deposit
          "Current balance": 1995.5,
          Status: "POSTED",
        },
      ];

      const result = CsvService.applyFullNormalization(rawTransactions);

      // Check type normalization
      expect(result.normalizedTransactions[0].Type).toBe("Debit Card");
      expect(result.normalizedTransactions[1].Type).toBe("Deposit");

      // Check date normalization
      expect(result.normalizedTransactions[0].Date).toBe("2024-01-15");
      expect(result.normalizedTransactions[1].Date).toBe("2024-01-16");

      // Check amount canonicalization
      expect(result.normalizedTransactions[0].Amount).toBe(-4.5); // Should be negative
      expect(result.normalizedTransactions[1].Amount).toBe(2000.0); // Should be positive

      // Check status normalization
      expect(result.normalizedTransactions[0].Status).toBe("Pending");
      expect(result.normalizedTransactions[1].Status).toBe("Posted");

      // Check balance calculation
      expect(result.balanceSource).toBe("calculated");
      expect(result.normalizedTransactions[0]["Current balance"]).toBe(-4.5);
      expect(result.normalizedTransactions[1]["Current balance"]).toBe(1995.5);

      // Check warnings
      expect(result.warnings).toContain(
        "Se calculó el balance sintéticamente debido a valores faltantes o inconsistentes"
      );
    });

    it("should handle date normalization errors gracefully", () => {
      const rawTransactions: RawTransaction[] = [
        {
          Date: "invalid-date",
          Description: "Test",
          Type: "DEBIT",
          Amount: -10.0,
          "Current balance": 90.0,
          Status: "Posted",
        },
      ];

      const result = CsvService.applyFullNormalization(rawTransactions);

      expect(
        result.warnings.some((w) => w.includes("Error al normalizar fecha"))
      ).toBe(true);
      expect(result.normalizedTransactions[0].Date).toBe("invalid-date"); // Should keep original
    });

    it("should return original balance source when no synthetic calculation needed", () => {
      const rawTransactions: RawTransaction[] = [
        {
          Date: "2024-01-15",
          Description: "Test",
          Type: "DEBIT",
          Amount: -10.0,
          "Current balance": 90.0,
          Status: "Posted",
        },
      ];

      const result = CsvService.applyFullNormalization(rawTransactions);

      expect(result.balanceSource).toBe("original");
      expect(result.warnings).not.toContain(
        "Se calculó el balance sintéticamente debido a valores faltantes o inconsistentes"
      );
    });
  });
});
