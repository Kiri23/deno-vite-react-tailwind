/**
 * Centralized currency formatting utility
 * Implements ASCII hyphen-minus (-, U+002D) compliance per foundation.md
 */

export interface CurrencyFormatOptions {
  /** Show "+" for positive values (default: false) */
  showPlus?: boolean;
  /** Use compact notation like "$1.2K" (default: false) */
  compact?: boolean;
}

/**
 * Formats a number as currency with consistent ASCII hyphen-minus for negative values
 *
 * @param amount - The numeric amount to format
 * @param options - Formatting options
 * @returns Formatted currency string with ASCII hyphen-minus for negatives
 *
 * @example
 * formatCurrency(1234.5) // "$1,234.50"
 * formatCurrency(-123.45) // "-$123.45" (ASCII hyphen-minus)
 * formatCurrency(1200, { compact: true }) // "$1.2K"
 * formatCurrency(123.45, { showPlus: true }) // "+$123.45"
 * formatCurrency(-0.0001) // "$0.00" (no negative zero)
 */
export function formatCurrency(
  amount: number,
  options: CurrencyFormatOptions = {}
): string {
  const { showPlus = false, compact = false } = options;

  // Handle edge cases
  if (isNaN(amount) || amount === undefined || amount === null) {
    if (
      typeof process !== "undefined" &&
      process.env?.NODE_ENV === "development"
    ) {
      console.warn("formatCurrency: Invalid amount received:", amount);
    }
    return "—";
  }

  // Handle negative zero - avoid "-$0.00"
  if (Object.is(amount, -0) || Math.abs(amount) < 0.005) {
    return "$0.00";
  }

  // Create formatter with es-US locale per foundation.md
  const formatterOptions: Intl.NumberFormatOptions = {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };

  // Handle compact notation
  if (compact) {
    formatterOptions.notation = "compact";
    formatterOptions.compactDisplay = "short";
    // For compact notation, allow fewer decimal places for cleaner display
    formatterOptions.minimumFractionDigits = 0;
    formatterOptions.maximumFractionDigits = 1;
  }

  const formatter = new Intl.NumberFormat("es-US", formatterOptions);

  // Format the absolute value to avoid Unicode minus from Intl.NumberFormat
  let formatted = formatter.format(Math.abs(amount));

  // Replace non-breaking spaces with regular spaces in compact notation
  if (compact) {
    formatted = formatted.replace(/\u00A0/g, " ");
  }

  // Handle negative values with ASCII hyphen-minus (-, U+002D)
  if (amount < 0) {
    return `-${formatted}`; // ASCII hyphen-minus (U+002D)
  }

  // Add plus sign if requested for positive values
  if (showPlus && amount > 0) {
    return `+${formatted}`;
  }

  return formatted;
}
