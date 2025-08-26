// Constants and configuration for the expense tracker

// CSV Schema validation
export const CSV_SCHEMA = {
  Date: "string",
  Description: "string",
  Type: "string",
  Amount: "number",
  "Current balance": "number",
  Status: "string",
} as const;

// Valid transaction types
export const VALID_TYPES = [
  "Debit Card",
  "Withdrawal",
  "Deposit",
  "Roundup",
  "Transfer",
  "Other",
] as const;

// Valid transaction statuses
export const VALID_STATUSES = ["Posted", "Pending"] as const;

// Type normalization dictionary
export const TYPE_NORMALIZATION = {
  DEBIT: "Debit Card",
  "DEBIT CARD": "Debit Card",
  DBT: "Debit Card",
  WITHDRAWAL: "Withdrawal",
  ATM: "Withdrawal",
  DEPOSIT: "Deposit",
  DEP: "Deposit",
  TRANSFER: "Transfer",
  XFER: "Transfer",
} as const;

// File size limits
export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB in bytes

// Performance targets
export const PROCESSING_TIMEOUT = 3000; // 3 seconds in milliseconds

// Date format constants
export const DATE_FORMAT = "YYYY-MM-DD";
export const TIMEZONE = "America/New_York";

// Chart colors
export const CHART_COLORS = {
  income: "#10b981", // green-500
  expense: "#ef4444", // red-500
  savings: "#10b981", // green-500
  deficit: "#ef4444", // red-500
  balance: "#3b82f6", // blue-500
  grid: "#e5e7eb", // gray-200
} as const;
