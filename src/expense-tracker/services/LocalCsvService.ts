import type {
  RawTransaction,
  TransactionData,
  CsvValidationResult,
} from "../types/index.ts";
import type { CsvPort } from "./ports.ts";
import { CsvService } from "./CsvService.ts";

/**
 * LocalCsvService implements CsvPort interface using the existing CsvService
 * This provides a clean port-based implementation for the modular architecture.
 *
 * Requirements: 1.1, 1.2, 2.2
 */
export class LocalCsvService implements CsvPort {
  /**
   * Validates and parses a CSV file, returning validation results and normalized transactions
   */
  async validateAndParse(file: File): Promise<CsvValidationResult> {
    return CsvService.validateAndParse(file);
  }

  /**
   * Normalizes raw transaction data according to foundation.md standards
   */
  normalizeTransactions(raw: RawTransaction[]): TransactionData[] {
    return CsvService.normalizeTransactionTypes(raw);
  }

  /**
   * Normalizes date strings to YYYY-MM-DD format with America/New_York timezone assumption
   */
  normalizeDate(dateStr: string): string {
    return CsvService.normalizeDate(dateStr);
  }

  /**
   * Canonicalizes transaction amounts based on type (deposits positive, withdrawals negative)
   */
  canonicalizeAmount(amount: number, type: string): number {
    return CsvService.canonicalizeAmount(amount, type);
  }
}
