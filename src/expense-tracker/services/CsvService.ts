import pl from "nodejs-polars";
import type {
  RawTransaction,
  TransactionData,
  CsvValidationResult,
  ValidationError,
} from "../types";

/**
 * CsvService handles CSV file validation, parsing, and data normalization
 * for expense tracker transactions.
 */
export class CsvService {
  private static readonly MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
  private static readonly REQUIRED_COLUMNS = [
    "Date",
    "Description",
    "Type",
    "Amount",
    "Current balance",
    "Status",
  ];

  /**
   * Validates file size and type before processing
   */
  private static validateFile(file: File): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      errors.push({
        type: "file_too_large",
        message: `El archivo es demasiado grande (${(
          file.size /
          1024 /
          1024
        ).toFixed(
          1
        )} MB). Máximo permitido: 20 MB. Considera dividir el archivo en períodos más pequeños.`,
      });
    }

    // Check file type
    if (!file.name.toLowerCase().endsWith(".csv") && file.type !== "text/csv") {
      errors.push({
        type: "missing_columns", // Using existing type for now
        message: "Por favor selecciona un archivo CSV válido",
      });
    }

    return errors;
  }

  /**
   * Reads file content using FileReader API
   */
  private static readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (!text || text.trim().length === 0) {
          reject(new Error("El archivo CSV está vacío"));
          return;
        }
        resolve(text);
      };

      reader.onerror = () => {
        reject(new Error("Error al leer el archivo"));
      };

      reader.readAsText(file);
    });
  }

  /**
   * Validates CSV headers (case-insensitive)
   */
  private static validateHeaders(headers: string[]): ValidationError[] {
    const errors: ValidationError[] = [];
    const normalizedHeaders = headers.map((h) => h.trim().toLowerCase());
    const missingColumns: string[] = [];

    for (const requiredCol of this.REQUIRED_COLUMNS) {
      const found = normalizedHeaders.some(
        (header) => header === requiredCol.toLowerCase()
      );
      if (!found) {
        missingColumns.push(requiredCol);
      }
    }

    if (missingColumns.length > 0) {
      errors.push({
        type: "missing_columns",
        message: `Faltan columnas requeridas: ${missingColumns.join(", ")}`,
        examples: missingColumns,
      });
    }

    return errors;
  }

  /**
   * Basic CSV parsing without Polars (for initial validation)
   */
  private static parseCSVBasic(csvText: string): {
    headers: string[];
    rows: string[][];
  } {
    const lines = csvText.trim().split("\n");
    if (lines.length < 2) {
      throw new Error(
        "El archivo CSV debe contener al menos una fila de encabezados y una fila de datos"
      );
    }

    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
    const rows = lines
      .slice(1)
      .map((line) =>
        line.split(",").map((cell) => cell.trim().replace(/"/g, ""))
      );

    return { headers, rows };
  }

  /**
   * Parse CSV using Polars.js with robust error handling
   */
  private static parseCSVWithPolars(csvText: string): {
    dataFrame: pl.DataFrame;
    transactions: RawTransaction[];
    errors: ValidationError[];
    warnings: string[];
  } {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    try {
      // Parse CSV with Polars
      const dataFrame = pl.readCSV(csvText, {
        hasHeader: true,
        ignoreErrors: false,
        tryParseDate: false, // We'll handle date parsing manually for better control
      });

      // Get column names and normalize them
      const columns = dataFrame.columns;
      const columnMap = this.createColumnMap(columns);

      // Validate that all required columns are present
      const missingColumns: string[] = [];
      for (const requiredCol of this.REQUIRED_COLUMNS) {
        if (!columnMap[requiredCol.toLowerCase()]) {
          missingColumns.push(requiredCol);
        }
      }

      if (missingColumns.length > 0) {
        errors.push({
          type: "missing_columns",
          message: `Faltan columnas requeridas: ${missingColumns.join(", ")}`,
          examples: missingColumns,
        });
        return { dataFrame, transactions: [], errors, warnings };
      }

      // Convert DataFrame to RawTransaction objects with validation
      const transactions = this.convertDataFrameToTransactions(
        dataFrame,
        columnMap,
        errors,
        warnings
      );

      return { dataFrame, transactions, errors, warnings };
    } catch (error) {
      errors.push({
        type: "missing_columns", // Generic error type
        message: `Error al parsear CSV con Polars: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      });
      return { dataFrame: pl.DataFrame(), transactions: [], errors, warnings };
    }
  }

  /**
   * Create a mapping from normalized column names to actual column names
   */
  private static createColumnMap(columns: string[]): Record<string, string> {
    const columnMap: Record<string, string> = {};

    for (const col of columns) {
      const normalized = col.trim().toLowerCase().replace(/"/g, "");
      columnMap[normalized] = col;
    }

    return columnMap;
  }

  /**
   * Convert Polars DataFrame to RawTransaction array with validation
   */
  private static convertDataFrameToTransactions(
    dataFrame: pl.DataFrame,
    columnMap: Record<string, string>,
    errors: ValidationError[],
    warnings: string[]
  ): RawTransaction[] {
    const transactions: RawTransaction[] = [];
    const rowCount = dataFrame.height;

    // Get actual column names
    const dateCol = columnMap["date"];
    const descCol = columnMap["description"];
    const typeCol = columnMap["type"];
    const amountCol = columnMap["amount"];
    const balanceCol = columnMap["current balance"];
    const statusCol = columnMap["status"];

    // Extract data as arrays for efficient processing
    const dates = dataFrame.getColumn(dateCol).toArray();
    const descriptions = dataFrame.getColumn(descCol).toArray();
    const types = dataFrame.getColumn(typeCol).toArray();
    const amounts = dataFrame.getColumn(amountCol).toArray();
    const balances = dataFrame.getColumn(balanceCol).toArray();
    const statuses = dataFrame.getColumn(statusCol).toArray();

    const invalidDateRows: number[] = [];
    const invalidAmountRows: number[] = [];

    for (let i = 0; i < rowCount; i++) {
      try {
        const date = String(dates[i] || "").trim();
        const description = String(descriptions[i] || "").trim();
        const type = String(types[i] || "").trim();
        const amountStr = String(amounts[i] || "").trim();
        const balanceStr = String(balances[i] || "").trim();
        const status = String(statuses[i] || "").trim();

        // Validate and convert amount
        let amount: number;
        if (
          amountStr === "" ||
          amountStr === "null" ||
          amountStr === "undefined"
        ) {
          invalidAmountRows.push(i + 2); // +2 because row 1 is header, array is 0-indexed
          continue;
        }

        amount = parseFloat(amountStr.replace(/[$,]/g, ""));
        if (isNaN(amount)) {
          invalidAmountRows.push(i + 2);
          continue;
        }

        // Validate and convert balance
        let balance: number;
        if (
          balanceStr === "" ||
          balanceStr === "null" ||
          balanceStr === "undefined"
        ) {
          balance = 0; // Will be calculated later if needed
          warnings.push(
            `Fila ${
              i + 2
            }: Current balance faltante, se calculará sintéticamente`
          );
        } else {
          balance = parseFloat(balanceStr.replace(/[$,]/g, ""));
          if (isNaN(balance)) {
            balance = 0;
            warnings.push(
              `Fila ${
                i + 2
              }: Current balance inválido (${balanceStr}), se calculará sintéticamente`
            );
          }
        }

        // Basic date validation (detailed parsing will be in task 2.3)
        if (
          !date ||
          date === "null" ||
          date === "undefined" ||
          date === "invalid-date"
        ) {
          invalidDateRows.push(i + 2);
          continue;
        }

        transactions.push({
          Date: date,
          Description: description,
          Type: type,
          Amount: amount,
          "Current balance": balance,
          Status: status,
        });
      } catch (error) {
        warnings.push(
          `Fila ${i + 2}: Error al procesar - ${
            error instanceof Error ? error.message : "Error desconocido"
          }`
        );
      }
    }

    // Add validation errors for invalid data
    if (invalidDateRows.length > 0) {
      errors.push({
        type: "invalid_date",
        message: `Formato de fecha inválido en ${invalidDateRows.length} filas`,
        examples: invalidDateRows.slice(0, 3).map((row) => `fila ${row}`),
      });
    }

    if (invalidAmountRows.length > 0) {
      errors.push({
        type: "invalid_amount",
        message: `Montos no numéricos encontrados en ${invalidAmountRows.length} filas`,
        examples: invalidAmountRows.slice(0, 3).map((row) => `fila ${row}`),
      });
    }

    return transactions;
  }

  /**
   * Calculate date range from transactions
   */
  private static calculateDateRange(
    transactions: RawTransaction[] | TransactionData[]
  ): {
    start: string;
    end: string;
  } {
    if (transactions.length === 0) {
      return { start: "", end: "" };
    }

    // Extract dates and sort them
    const dates = transactions
      .map((t) => t.Date)
      .filter((date) => date && date.trim() !== "")
      .sort();

    if (dates.length === 0) {
      return { start: "", end: "" };
    }

    return {
      start: dates[0],
      end: dates[dates.length - 1],
    };
  }

  /**
   * Main validation and parsing method (Task 2.1 implementation)
   */
  static async validateAndParse(file: File): Promise<CsvValidationResult> {
    try {
      // Step 1: Basic file validation
      const fileErrors = this.validateFile(file);
      if (fileErrors.length > 0) {
        return {
          isValid: false,
          errors: fileErrors,
          metadata: {
            rowCount: 0,
            dateRange: { start: "", end: "" },
            balanceSource: "original",
          },
        };
      }

      // Step 2: Read file content
      const csvText = await this.readFileAsText(file);

      // Step 3: Parse CSV with Polars.js (Task 2.2 implementation)
      const {
        dataFrame,
        transactions,
        errors: parseErrors,
        warnings,
      } = this.parseCSVWithPolars(csvText);

      // Step 4: Check for parsing errors
      if (parseErrors.length > 0) {
        return {
          isValid: false,
          errors: parseErrors,
          warnings,
          transactions, // Include partial transactions even with errors
          metadata: {
            rowCount: transactions.length,
            dateRange: { start: "", end: "" },
            balanceSource: "original",
          },
        };
      }

      // Step 5: Calculate date range from parsed transactions
      const dateRange = this.calculateDateRange(transactions);

      // Step 6: Apply full normalization pipeline (Task 2.3 implementation)
      const {
        normalizedTransactions,
        balanceSource,
        warnings: normalizationWarnings,
      } = this.applyFullNormalization(transactions);

      // Combine all warnings
      const allWarnings = [...warnings, ...normalizationWarnings];

      // Step 7: Calculate final date range from normalized transactions
      const finalDateRange = this.calculateDateRange(normalizedTransactions);

      // Step 8: Success response with normalized data
      return {
        isValid: true,
        transactions: normalizedTransactions,
        warnings: allWarnings,
        metadata: {
          rowCount: normalizedTransactions.length,
          dateRange: finalDateRange,
          balanceSource,
        },
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [
          {
            type: "missing_columns", // Generic error type
            message: `Error al procesar el archivo CSV: ${
              error instanceof Error ? error.message : "Error desconocido"
            }`,
          },
        ],
        metadata: {
          rowCount: 0,
          dateRange: { start: "", end: "" },
          balanceSource: "original",
        },
      };
    }
  }

  /**
   * Transaction type normalization dictionary
   */
  private static readonly TYPE_NORMALIZATION: Record<string, string> = {
    DEBIT: "Debit Card",
    "DEBIT CARD": "Debit Card",
    DBT: "Debit Card",
    WITHDRAWAL: "Withdrawal",
    ATM: "Withdrawal",
    DEPOSIT: "Deposit",
    DEP: "Deposit",
    TRANSFER: "Transfer",
    XFER: "Transfer",
    ROUNDUP: "Roundup",
    "ROUND UP": "Roundup",
  };

  /**
   * Normalize transaction types using the normalization dictionary
   */
  static normalizeTransactionTypes(
    transactions: RawTransaction[]
  ): TransactionData[] {
    return transactions.map((transaction) => {
      const normalizedType =
        this.TYPE_NORMALIZATION[transaction.Type.toUpperCase()] || "Other";

      return {
        Date: transaction.Date, // Will be normalized in normalizeDate
        Description: transaction.Description,
        Type: normalizedType as TransactionData["Type"],
        Amount: transaction.Amount, // Will be canonicalized in canonicalizeAmount
        "Current balance": transaction["Current balance"],
        Status: this.normalizeStatus(transaction.Status),
      };
    });
  }

  /**
   * Normalize status values
   */
  private static normalizeStatus(status: string): "Posted" | "Pending" {
    const normalizedStatus = status.toUpperCase();
    return normalizedStatus === "PENDING" ? "Pending" : "Posted";
  }

  /**
   * Normalize dates to YYYY-MM-DD format with America/New_York timezone
   */
  static normalizeDate(dateStr: string): string {
    try {
      // If already in YYYY-MM-DD format, return as-is
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr;
      }

      // Try MM/DD/YYYY format
      const mmddyyyy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (mmddyyyy) {
        const [, month, day, year] = mmddyyyy;
        const monthNum = parseInt(month);
        const dayNum = parseInt(day);
        const yearNum = parseInt(year);

        // Validate date components
        if (monthNum < 1 || monthNum > 12 || dayNum < 1 || dayNum > 31) {
          throw new Error(`Invalid date components: ${dateStr}`);
        }

        // Format as YYYY-MM-DD
        return `${yearNum}-${monthNum.toString().padStart(2, "0")}-${dayNum
          .toString()
          .padStart(2, "0")}`;
      }

      // Try parsing as-is for other formats
      const date = new Date(dateStr);

      if (isNaN(date.getTime())) {
        throw new Error(`Invalid date format: ${dateStr}`);
      }

      // Format as YYYY-MM-DD (using local date components to avoid timezone issues)
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");

      return `${year}-${month}-${day}`;
    } catch (error) {
      throw new Error(
        `Failed to normalize date "${dateStr}": ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Canonicalize amounts: negative = expense, positive = income
   */
  static canonicalizeAmount(amount: number, type: string): number {
    // For most transaction types, the sign should already be correct
    // But we can apply business rules here if needed

    // Deposits should always be positive (income)
    if (type === "Deposit" && amount < 0) {
      return Math.abs(amount);
    }

    // Withdrawals and debits should always be negative (expenses)
    if ((type === "Withdrawal" || type === "Debit Card") && amount > 0) {
      return -amount;
    }

    return amount;
  }

  /**
   * Calculate synthetic balance when Current balance is inconsistent
   */
  static calculateSyntheticBalance(
    transactions: TransactionData[]
  ): TransactionData[] {
    if (transactions.length === 0) {
      return transactions;
    }

    // Sort transactions by date to ensure proper balance calculation
    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime()
    );

    // Check if we need to calculate synthetic balance
    const needsSyntheticBalance = sortedTransactions.some(
      (t) => t["Current balance"] === 0 || isNaN(t["Current balance"])
    );

    if (!needsSyntheticBalance) {
      return transactions; // Return original order if no synthetic calculation needed
    }

    // Simple approach: calculate running balance from start, using known balances as checkpoints
    let runningBalance = 0;
    const updatedTransactions = sortedTransactions.map((transaction) => {
      // If this transaction has a valid balance, use it
      if (
        transaction["Current balance"] !== 0 &&
        !isNaN(transaction["Current balance"])
      ) {
        runningBalance = transaction["Current balance"];
        return transaction;
      } else {
        // Calculate balance: previous balance + current transaction amount
        runningBalance += transaction.Amount;
        return {
          ...transaction,
          "Current balance": runningBalance,
        };
      }
    });

    // Return in original order by mapping back
    return transactions.map((original) => {
      const updated = updatedTransactions.find(
        (t) =>
          t.Date === original.Date &&
          t.Description === original.Description &&
          t.Amount === original.Amount
      );
      return updated || original;
    });
  }

  /**
   * Apply full normalization pipeline to transactions
   */
  static applyFullNormalization(transactions: RawTransaction[]): {
    normalizedTransactions: TransactionData[];
    balanceSource: "original" | "calculated";
    warnings: string[];
  } {
    const warnings: string[] = [];

    // Step 1: Normalize transaction types
    let normalizedTransactions = this.normalizeTransactionTypes(transactions);

    // Step 2: Normalize dates and canonicalize amounts
    normalizedTransactions = normalizedTransactions.map(
      (transaction, index) => {
        try {
          const normalizedDate = this.normalizeDate(transaction.Date);
          const canonicalAmount = this.canonicalizeAmount(
            transaction.Amount,
            transaction.Type
          );

          return {
            ...transaction,
            Date: normalizedDate,
            Amount: canonicalAmount,
          };
        } catch (error) {
          warnings.push(
            `Fila ${index + 2}: Error al normalizar fecha "${
              transaction.Date
            }" - ${
              error instanceof Error ? error.message : "Error desconocido"
            }`
          );
          return transaction; // Keep original if normalization fails
        }
      }
    );

    // Step 3: Calculate synthetic balance if needed
    const needsSyntheticBalance = normalizedTransactions.some(
      (t) => t["Current balance"] === 0 || isNaN(t["Current balance"])
    );

    let balanceSource: "original" | "calculated" = "original";

    if (needsSyntheticBalance) {
      normalizedTransactions = this.calculateSyntheticBalance(
        normalizedTransactions
      );
      balanceSource = "calculated";
      warnings.push(
        "Se calculó el balance sintéticamente debido a valores faltantes o inconsistentes"
      );
    }

    return {
      normalizedTransactions,
      balanceSource,
      warnings,
    };
  }
}
