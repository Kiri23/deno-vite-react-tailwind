import { describe, it, expect, vi } from "vitest";
import { CsvService } from "../CsvService";

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

// Mock FileReader globally
global.FileReader = MockFileReader as any;

describe("CsvService - File Upload and Basic Validation (Task 2.1)", () => {
  describe("File Size Validation", () => {
    it("should reject files larger than 20MB", async () => {
      const largeFile = new File([""], "large.csv", {
        type: "text/csv",
      });

      // Mock file size to be over 20MB
      Object.defineProperty(largeFile, "size", {
        value: 21 * 1024 * 1024, // 21MB
        writable: false,
      });

      const result = await CsvService.validateAndParse(largeFile);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors![0].type).toBe("file_too_large");
      expect(result.errors![0].message).toContain("21.0 MB");
      expect(result.errors![0].message).toContain("Máximo permitido: 20 MB");
    });

    it("should accept files under 20MB", async () => {
      const validFile = new File(
        [
          "Date,Description,Type,Amount,Current balance,Status\n2024-01-01,Test,DEBIT,-10.00,100.00,Posted",
        ],
        "valid.csv",
        {
          type: "text/csv",
        }
      );

      Object.defineProperty(validFile, "size", {
        value: 1024, // 1KB
        writable: false,
      });

      const mockReader = new MockFileReader();
      mockReader.result =
        "Date,Description,Type,Amount,Current balance,Status\n2024-01-01,Test,DEBIT,-10.00,100.00,Posted";

      vi.spyOn(global, "FileReader").mockImplementation(() => mockReader);

      const result = await CsvService.validateAndParse(validFile);

      expect(result.isValid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it("should handle exactly 20MB files", async () => {
      const exactFile = new File([""], "exact.csv", {
        type: "text/csv",
      });

      Object.defineProperty(exactFile, "size", {
        value: 20 * 1024 * 1024, // Exactly 20MB
        writable: false,
      });

      const mockReader = new MockFileReader();
      mockReader.result =
        "Date,Description,Type,Amount,Current balance,Status\n2024-01-01,Test,DEBIT,-10.00,100.00,Posted";

      vi.spyOn(global, "FileReader").mockImplementation(() => mockReader);

      const result = await CsvService.validateAndParse(exactFile);

      expect(result.isValid).toBe(true);
      expect(result.errors).toBeUndefined();
    });
  });

  describe("File Type Validation", () => {
    it("should reject non-CSV files by extension", async () => {
      const txtFile = new File([""], "data.txt", {
        type: "text/plain",
      });

      const result = await CsvService.validateAndParse(txtFile);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors![0].message).toContain("archivo CSV válido");
    });

    it("should accept .csv files", async () => {
      const csvFile = new File(
        [
          "Date,Description,Type,Amount,Current balance,Status\n2024-01-01,Test,DEBIT,-10.00,100.00,Posted",
        ],
        "data.csv",
        {
          type: "text/csv",
        }
      );

      const mockReader = new MockFileReader();
      mockReader.result =
        "Date,Description,Type,Amount,Current balance,Status\n2024-01-01,Test,DEBIT,-10.00,100.00,Posted";

      vi.spyOn(global, "FileReader").mockImplementation(() => mockReader);

      const result = await CsvService.validateAndParse(csvFile);

      expect(result.isValid).toBe(true);
    });

    it("should accept files with text/csv MIME type", async () => {
      const csvFile = new File(
        [
          "Date,Description,Type,Amount,Current balance,Status\n2024-01-01,Test,DEBIT,-10.00,100.00,Posted",
        ],
        "data",
        {
          type: "text/csv",
        }
      );

      const mockReader = new MockFileReader();
      mockReader.result =
        "Date,Description,Type,Amount,Current balance,Status\n2024-01-01,Test,DEBIT,-10.00,100.00,Posted";

      vi.spyOn(global, "FileReader").mockImplementation(() => mockReader);

      const result = await CsvService.validateAndParse(csvFile);

      expect(result.isValid).toBe(true);
    });
  });

  describe("FileReader Integration", () => {
    it("should handle empty files", async () => {
      const emptyFile = new File([""], "empty.csv", {
        type: "text/csv",
      });

      const mockReader = new MockFileReader();
      mockReader.result = "";

      vi.spyOn(global, "FileReader").mockImplementation(() => mockReader);

      const result = await CsvService.validateAndParse(emptyFile);

      expect(result.isValid).toBe(false);
      expect(result.errors![0].message).toContain("archivo CSV está vacío");
    });

    it("should handle FileReader errors", async () => {
      const file = new File(["content"], "test.csv", {
        type: "text/csv",
      });

      const mockReader = new MockFileReader();
      mockReader.error = new Error("Read failed");

      vi.spyOn(global, "FileReader").mockImplementation(() => mockReader);

      const result = await CsvService.validateAndParse(file);

      expect(result.isValid).toBe(false);
      expect(result.errors![0].message).toContain("Error al leer el archivo");
    });

    it("should handle whitespace-only files", async () => {
      const whitespaceFile = new File(["   \n\t  "], "whitespace.csv", {
        type: "text/csv",
      });

      const mockReader = new MockFileReader();
      mockReader.result = "   \n\t  ";

      vi.spyOn(global, "FileReader").mockImplementation(() => mockReader);

      const result = await CsvService.validateAndParse(whitespaceFile);

      expect(result.isValid).toBe(false);
      expect(result.errors![0].message).toContain("archivo CSV está vacío");
    });
  });

  describe("CSV Header Validation", () => {
    it("should validate required columns (case-insensitive)", async () => {
      const file = new File([""], "test.csv", { type: "text/csv" });

      const mockReader = new MockFileReader();
      mockReader.result =
        "date,description,type,amount,current balance,status\n2024-01-01,Test,DEBIT,-10.00,100.00,Posted";

      vi.spyOn(global, "FileReader").mockImplementation(() => mockReader);

      const result = await CsvService.validateAndParse(file);

      expect(result.isValid).toBe(true);
      expect(result.metadata.rowCount).toBe(1);
    });

    it("should reject files with missing columns", async () => {
      const file = new File([""], "test.csv", { type: "text/csv" });

      const mockReader = new MockFileReader();
      mockReader.result = "Date,Description,Amount\n2024-01-01,Test,-10.00";

      vi.spyOn(global, "FileReader").mockImplementation(() => mockReader);

      const result = await CsvService.validateAndParse(file);

      expect(result.isValid).toBe(false);
      expect(result.errors![0].type).toBe("missing_columns");
      expect(result.errors![0].message).toContain(
        "Type, Current balance, Status"
      );
      expect(result.errors![0].examples).toEqual([
        "Type",
        "Current balance",
        "Status",
      ]);
    });

    it("should handle extra columns gracefully", async () => {
      const file = new File([""], "test.csv", { type: "text/csv" });

      const mockReader = new MockFileReader();
      mockReader.result =
        "Date,Description,Type,Amount,Current balance,Status,Extra Column\n2024-01-01,Test,DEBIT,-10.00,100.00,Posted,Extra";

      vi.spyOn(global, "FileReader").mockImplementation(() => mockReader);

      const result = await CsvService.validateAndParse(file);

      expect(result.isValid).toBe(true);
      expect(result.metadata.rowCount).toBe(1);
    });

    it("should handle columns with different casing", async () => {
      const file = new File([""], "test.csv", { type: "text/csv" });

      const mockReader = new MockFileReader();
      mockReader.result =
        "DATE,DESCRIPTION,TYPE,AMOUNT,CURRENT BALANCE,STATUS\n2024-01-01,Test,DEBIT,-10.00,100.00,Posted";

      vi.spyOn(global, "FileReader").mockImplementation(() => mockReader);

      const result = await CsvService.validateAndParse(file);

      expect(result.isValid).toBe(true);
    });

    it("should handle columns with extra whitespace", async () => {
      const file = new File([""], "test.csv", { type: "text/csv" });

      const mockReader = new MockFileReader();
      mockReader.result =
        " Date , Description , Type , Amount , Current balance , Status \n2024-01-01,Test,DEBIT,-10.00,100.00,Posted";

      vi.spyOn(global, "FileReader").mockImplementation(() => mockReader);

      const result = await CsvService.validateAndParse(file);

      expect(result.isValid).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle files with only headers", async () => {
      const file = new File([""], "headers-only.csv", { type: "text/csv" });

      const mockReader = new MockFileReader();
      mockReader.result = "Date,Description,Type,Amount,Current balance,Status";

      vi.spyOn(global, "FileReader").mockImplementation(() => mockReader);

      const result = await CsvService.validateAndParse(file);

      // With Polars integration, empty CSV (headers only) is now valid but returns no transactions
      expect(result.isValid).toBe(true);
      expect(result.transactions).toHaveLength(0);
    });

    it("should handle malformed CSV structure", async () => {
      const file = new File([""], "malformed.csv", { type: "text/csv" });

      const mockReader = new MockFileReader();
      mockReader.result = "Not a proper CSV structure";

      vi.spyOn(global, "FileReader").mockImplementation(() => mockReader);

      const result = await CsvService.validateAndParse(file);

      expect(result.isValid).toBe(false);
      // Could be either missing columns or Polars parsing error
      expect(result.errors![0].message).toMatch(
        /(Faltan columnas requeridas|Error al procesar el archivo CSV)/
      );
    });

    it("should provide correct row count in metadata", async () => {
      const file = new File([""], "multi-row.csv", { type: "text/csv" });

      const mockReader = new MockFileReader();
      mockReader.result = `Date,Description,Type,Amount,Current balance,Status
2024-01-01,Test1,DEBIT,-10.00,100.00,Posted
2024-01-02,Test2,DEBIT,-20.00,80.00,Posted
2024-01-03,Test3,DEPOSIT,50.00,130.00,Posted`;

      vi.spyOn(global, "FileReader").mockImplementation(() => mockReader);

      const result = await CsvService.validateAndParse(file);

      expect(result.isValid).toBe(true);
      expect(result.metadata.rowCount).toBe(3);
    });
  });
});
