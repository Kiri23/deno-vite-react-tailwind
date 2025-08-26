import { describe, it, expect, vi } from "vitest";
import { CsvService } from "../CsvService";

// Mock FileReader for testing
class MockFileReader {
  result: string | null = null;
  error: Error | null = null;
  onload: ((event: any) => void) | null = null;
  onerror: (() => void) | null = null;

  readAsText(file: File) {
    setTimeout(() => {
      if (this.error) {
        this.onerror?.();
      } else {
        this.onload?.({ target: { result: this.result } });
      }
    }, 0);
  }
}

global.FileReader = MockFileReader as any;

describe("CsvService - Polars.js Integration (Task 2.2)", () => {
  describe("CSV Parsing with Polars", () => {
    it("should parse valid CSV with all required columns", async () => {
      const csvContent = `Date,Description,Type,Amount,Current balance,Status
2024-01-01,Coffee Shop,DEBIT,-4.50,95.50,Posted
2024-01-02,Salary,DEPOSIT,2000.00,2095.50,Posted
2024-01-03,ATM Withdrawal,WITHDRAWAL,-100.00,1995.50,Posted`;

      const file = new File([csvContent], "transactions.csv", {
        type: "text/csv",
      });

      const mockReader = new MockFileReader();
      mockReader.result = csvContent;
      vi.spyOn(global, "FileReader").mockImplementation(() => mockReader);

      const result = await CsvService.validateAndParse(file);

      expect(result.isValid).toBe(true);
      expect(result.transactions).toHaveLength(3);
      expect(result.metadata.rowCount).toBe(3);
      expect(result.metadata.dateRange.start).toBe("2024-01-01");
      expect(result.metadata.dateRange.end).toBe("2024-01-03");

      // Verify transaction data (now normalized)
      expect(result.transactions![0]).toEqual({
        Date: "2024-01-01",
        Description: "Coffee Shop",
        Type: "Debit Card", // Normalized from DEBIT
        Amount: -4.5,
        "Current balance": 95.5,
        Status: "Posted",
      });
    });

    it("should handle case-insensitive column matching", async () => {
      const csvContent = `date,DESCRIPTION,type,AMOUNT,current balance,STATUS
2024-01-01,Test Transaction,DEBIT,-10.00,90.00,Posted`;

      const file = new File([csvContent], "case-test.csv", {
        type: "text/csv",
      });

      const mockReader = new MockFileReader();
      mockReader.result = csvContent;
      vi.spyOn(global, "FileReader").mockImplementation(() => mockReader);

      const result = await CsvService.validateAndParse(file);

      expect(result.isValid).toBe(true);
      expect(result.transactions).toHaveLength(1);
      expect(result.transactions![0].Description).toBe("Test Transaction");
    });

    it("should handle extra columns gracefully", async () => {
      const csvContent = `Date,Description,Type,Amount,Current balance,Status,Extra Column,Another Extra
2024-01-01,Test,DEBIT,-10.00,90.00,Posted,Extra Value,Another Value`;

      const file = new File([csvContent], "extra-cols.csv", {
        type: "text/csv",
      });

      const mockReader = new MockFileReader();
      mockReader.result = csvContent;
      vi.spyOn(global, "FileReader").mockImplementation(() => mockReader);

      const result = await CsvService.validateAndParse(file);

      expect(result.isValid).toBe(true);
      expect(result.transactions).toHaveLength(1);
    });

    it("should detect missing required columns", async () => {
      const csvContent = `Date,Description,Amount
2024-01-01,Test Transaction,-10.00`;

      const file = new File([csvContent], "missing-cols.csv", {
        type: "text/csv",
      });

      const mockReader = new MockFileReader();
      mockReader.result = csvContent;
      vi.spyOn(global, "FileReader").mockImplementation(() => mockReader);

      const result = await CsvService.validateAndParse(file);

      expect(result.isValid).toBe(false);
      expect(result.errors![0].type).toBe("missing_columns");
      expect(result.errors![0].message).toContain(
        "Type, Current balance, Status"
      );
    });
  });

  describe("Data Validation and Type Conversion", () => {
    it("should validate and convert numeric amounts", async () => {
      const csvContent = `Date,Description,Type,Amount,Current balance,Status
2024-01-01,Test1,DEBIT,-10.50,100.00,Posted
2024-01-02,Test2,DEPOSIT,25.75,125.75,Posted
2024-01-03,Test3,DEBIT,$-5.00,$120.75,Posted`;

      const file = new File([csvContent], "amounts.csv", { type: "text/csv" });

      const mockReader = new MockFileReader();
      mockReader.result = csvContent;
      vi.spyOn(global, "FileReader").mockImplementation(() => mockReader);

      const result = await CsvService.validateAndParse(file);

      expect(result.isValid).toBe(true);
      expect(result.transactions![0].Amount).toBe(-10.5);
      expect(result.transactions![1].Amount).toBe(25.75);
      expect(result.transactions![2].Amount).toBe(-5.0); // Should handle $ signs
    });

    it("should handle invalid amounts with proper error reporting", async () => {
      const csvContent = `Date,Description,Type,Amount,Current balance,Status
2024-01-01,Valid,DEBIT,-10.00,100.00,Posted
2024-01-02,Invalid Amount,DEBIT,invalid,90.00,Posted
2024-01-03,Empty Amount,DEBIT,,90.00,Posted
2024-01-04,Another Valid,DEBIT,-5.00,85.00,Posted`;

      const file = new File([csvContent], "invalid-amounts.csv", {
        type: "text/csv",
      });

      const mockReader = new MockFileReader();
      mockReader.result = csvContent;
      vi.spyOn(global, "FileReader").mockImplementation(() => mockReader);

      const result = await CsvService.validateAndParse(file);

      expect(result.isValid).toBe(false);
      expect(result.errors!.some((e) => e.type === "invalid_amount")).toBe(
        true
      );
      expect(result.transactions).toHaveLength(2); // Only valid transactions
      expect(result.transactions![0].Description).toBe("Valid");
      expect(result.transactions![1].Description).toBe("Another Valid");
    });

    it("should handle missing or invalid balance values with warnings", async () => {
      const csvContent = `Date,Description,Type,Amount,Current balance,Status
2024-01-01,Missing Balance,DEBIT,-10.00,,Posted
2024-01-02,Invalid Balance,DEBIT,-5.00,invalid,Posted
2024-01-03,Valid Balance,DEBIT,-3.00,82.00,Posted`;

      const file = new File([csvContent], "balance-issues.csv", {
        type: "text/csv",
      });

      const mockReader = new MockFileReader();
      mockReader.result = csvContent;
      vi.spyOn(global, "FileReader").mockImplementation(() => mockReader);

      const result = await CsvService.validateAndParse(file);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(3); // Now includes synthetic balance warning
      expect(result.warnings![0]).toContain("Fila 2: Current balance faltante");
      expect(result.warnings![1]).toContain("Fila 3: Current balance inválido");
      expect(result.warnings![2]).toContain(
        "Se calculó el balance sintéticamente"
      );
      expect(result.transactions![0]["Current balance"]).toBe(-10); // Calculated from 0 + (-10)
      expect(result.transactions![1]["Current balance"]).toBe(-15); // -10 + (-5)
      expect(result.transactions![2]["Current balance"]).toBe(82.0); // Original valid balance
    });

    it("should handle invalid dates with proper error reporting", async () => {
      const csvContent = `Date,Description,Type,Amount,Current balance,Status
2024-01-01,Valid Date,DEBIT,-10.00,100.00,Posted
invalid-date,Invalid Date,DEBIT,-5.00,95.00,Posted
,Empty Date,DEBIT,-3.00,92.00,Posted
2024-01-04,Another Valid,DEBIT,-2.00,90.00,Posted`;

      const file = new File([csvContent], "invalid-dates.csv", {
        type: "text/csv",
      });

      const mockReader = new MockFileReader();
      mockReader.result = csvContent;
      vi.spyOn(global, "FileReader").mockImplementation(() => mockReader);

      const result = await CsvService.validateAndParse(file);

      expect(result.isValid).toBe(false);
      expect(result.errors!.some((e) => e.type === "invalid_date")).toBe(true);
      expect(result.transactions).toHaveLength(2); // Only valid transactions
    });
  });

  describe("Schema Validation", () => {
    it("should validate required columns exist", async () => {
      const csvContent = `Date,Description,Type,Amount,Current balance,Status
2024-01-01,Test,DEBIT,-10.00,90.00,Posted`;

      const file = new File([csvContent], "valid-schema.csv", {
        type: "text/csv",
      });

      const mockReader = new MockFileReader();
      mockReader.result = csvContent;
      vi.spyOn(global, "FileReader").mockImplementation(() => mockReader);

      const result = await CsvService.validateAndParse(file);

      expect(result.isValid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it("should handle columns with whitespace in names", async () => {
      const csvContent = `Date ,Description ,Type ,Amount ,Current balance ,Status 
2024-01-01,Test,DEBIT,-10.00,90.00,Posted`;

      const file = new File([csvContent], "whitespace-cols.csv", {
        type: "text/csv",
      });

      const mockReader = new MockFileReader();
      mockReader.result = csvContent;
      vi.spyOn(global, "FileReader").mockImplementation(() => mockReader);

      const result = await CsvService.validateAndParse(file);

      expect(result.isValid).toBe(true);
      expect(result.transactions).toHaveLength(1);
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle empty CSV (headers only)", async () => {
      const csvContent = `Date,Description,Type,Amount,Current balance,Status`;

      const file = new File([csvContent], "empty.csv", { type: "text/csv" });

      const mockReader = new MockFileReader();
      mockReader.result = csvContent;
      vi.spyOn(global, "FileReader").mockImplementation(() => mockReader);

      const result = await CsvService.validateAndParse(file);

      expect(result.isValid).toBe(true);
      expect(result.transactions).toHaveLength(0);
      expect(result.metadata.rowCount).toBe(0);
    });

    it("should handle malformed CSV that Polars cannot parse", async () => {
      const csvContent = `This is not a valid CSV file
It has no proper structure
And should cause Polars to fail`;

      const file = new File([csvContent], "malformed.csv", {
        type: "text/csv",
      });

      const mockReader = new MockFileReader();
      mockReader.result = csvContent;
      vi.spyOn(global, "FileReader").mockImplementation(() => mockReader);

      const result = await CsvService.validateAndParse(file);

      expect(result.isValid).toBe(false);
      // Could be either missing columns or Polars parsing error
      expect(result.errors![0].message).toMatch(
        /(Faltan columnas requeridas|Error al parsear CSV con Polars)/
      );
    });

    it("should calculate correct date range", async () => {
      const csvContent = `Date,Description,Type,Amount,Current balance,Status
2024-03-15,Transaction 1,DEBIT,-10.00,100.00,Posted
2024-01-01,Transaction 2,DEBIT,-5.00,95.00,Posted
2024-12-31,Transaction 3,DEPOSIT,50.00,145.00,Posted
2024-06-15,Transaction 4,DEBIT,-20.00,125.00,Posted`;

      const file = new File([csvContent], "date-range.csv", {
        type: "text/csv",
      });

      const mockReader = new MockFileReader();
      mockReader.result = csvContent;
      vi.spyOn(global, "FileReader").mockImplementation(() => mockReader);

      const result = await CsvService.validateAndParse(file);

      expect(result.isValid).toBe(true);
      expect(result.metadata.dateRange.start).toBe("2024-01-01");
      expect(result.metadata.dateRange.end).toBe("2024-12-31");
    });

    it("should handle transactions with various data types", async () => {
      const csvContent = `Date,Description,Type,Amount,Current balance,Status
2024-01-01,Coffee Shop,DEBIT,-4.50,95.50,Posted
2024-01-02,Salary Deposit,DEPOSIT,2000,2095.50,Posted
2024-01-03,ATM Withdrawal,WITHDRAWAL,-100.0,1995.50,Posted`;

      const file = new File([csvContent], "complex-data.csv", {
        type: "text/csv",
      });

      const mockReader = new MockFileReader();
      mockReader.result = csvContent;
      vi.spyOn(global, "FileReader").mockImplementation(() => mockReader);

      const result = await CsvService.validateAndParse(file);

      expect(result.isValid).toBe(true);
      expect(result.transactions).toHaveLength(3);
      expect(result.transactions![0].Description).toBe("Coffee Shop");
      expect(result.transactions![1].Amount).toBe(2000);
      expect(result.transactions![2].Description).toBe("ATM Withdrawal");
    });
  });
});
