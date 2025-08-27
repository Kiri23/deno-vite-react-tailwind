import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { formatCurrency, type CurrencyFormatOptions } from "../currency";

describe("formatCurrency", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    // Set NODE_ENV to development for warning tests
    vi.stubEnv("NODE_ENV", "development");
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    vi.unstubAllEnvs();
  });

  describe("ASCII hyphen-minus compliance (foundation.md)", () => {
    it("uses ASCII hyphen-minus for negative values", () => {
      const result = formatCurrency(-123.45);
      expect(result).toBe("-$123.45");
      // Verify ASCII hyphen-minus character code (U+002D)
      expect(result.charCodeAt(0)).toBe(45);
    });

    it("does not use Unicode minus sign", () => {
      const result = formatCurrency(-123.45);
      // Unicode minus (U+2212) should not be present
      expect(result).not.toContain("−");
      expect(result.indexOf("\u2212")).toBe(-1);
    });

    it("validates character code for multiple negative amounts", () => {
      const testCases = [-1, -100, -1000.5, -0.01];

      testCases.forEach((amount) => {
        const result = formatCurrency(amount);
        expect(result.charCodeAt(0)).toBe(45); // ASCII hyphen-minus
        expect(result.startsWith("-")).toBe(true);
      });
    });
  });

  describe("basic formatting", () => {
    it("formats positive amounts correctly", () => {
      expect(formatCurrency(123.45)).toBe("$123.45");
      expect(formatCurrency(1234.5)).toBe("$1,234.50");
      expect(formatCurrency(0)).toBe("$0.00");
    });

    it("formats negative amounts with ASCII hyphen-minus", () => {
      expect(formatCurrency(-123.45)).toBe("-$123.45");
      expect(formatCurrency(-1234.5)).toBe("-$1,234.50");
    });

    it("maintains 2 decimal places per foundation.md", () => {
      expect(formatCurrency(100)).toBe("$100.00");
      expect(formatCurrency(100.1)).toBe("$100.10");
      expect(formatCurrency(100.123)).toBe("$100.12");
    });
  });

  describe("showPlus option", () => {
    it("shows plus sign for positive values when showPlus is true", () => {
      expect(formatCurrency(123.45, { showPlus: true })).toBe("+$123.45");
      expect(formatCurrency(0, { showPlus: true })).toBe("$0.00"); // Zero doesn't get plus
    });

    it("does not show plus sign when showPlus is false or undefined", () => {
      expect(formatCurrency(123.45)).toBe("$123.45");
      expect(formatCurrency(123.45, { showPlus: false })).toBe("$123.45");
    });

    it("still uses ASCII hyphen-minus for negatives with showPlus option", () => {
      const result = formatCurrency(-123.45, { showPlus: true });
      expect(result).toBe("-$123.45");
      expect(result.charCodeAt(0)).toBe(45); // ASCII hyphen-minus
    });
  });

  describe("compact option", () => {
    it("formats large numbers compactly", () => {
      expect(formatCurrency(1200, { compact: true })).toBe("$1.2 K");
      expect(formatCurrency(1500000, { compact: true })).toBe("$1.5 M");
      expect(formatCurrency(2500000000, { compact: true })).toBe("$2500 M");
    });

    it("formats negative large numbers compactly with ASCII hyphen-minus", () => {
      const result = formatCurrency(-1200000, { compact: true });
      expect(result).toBe("-$1.2 M");
      expect(result.charCodeAt(0)).toBe(45); // ASCII hyphen-minus
    });

    it("formats small numbers with compact option", () => {
      expect(formatCurrency(123.45, { compact: true })).toBe("$123.5");
      expect(formatCurrency(999, { compact: true })).toBe("$999");
    });

    it("combines compact and showPlus options", () => {
      expect(formatCurrency(1200, { compact: true, showPlus: true })).toBe(
        "+$1.2 K"
      );
    });
  });

  describe("negative zero handling", () => {
    it("formats negative zero as positive per foundation.md", () => {
      expect(formatCurrency(-0)).toBe("$0.00");
      expect(formatCurrency(Object.freeze(-0))).toBe("$0.00");
    });

    it("formats very small negative amounts as zero", () => {
      expect(formatCurrency(-0.001)).toBe("$0.00");
      expect(formatCurrency(-0.004)).toBe("$0.00");
    });

    it("does not format small negative amounts that round to 0.01", () => {
      expect(formatCurrency(-0.005)).toBe("-$0.01");
      expect(formatCurrency(-0.01)).toBe("-$0.01");
    });
  });

  describe("edge case handling", () => {
    it("handles NaN input", () => {
      expect(formatCurrency(NaN)).toBe("—");
      expect(consoleSpy).toHaveBeenCalledWith(
        "formatCurrency: Invalid amount received:",
        NaN
      );
    });

    it("handles undefined input", () => {
      expect(formatCurrency(undefined as any)).toBe("—");
      expect(consoleSpy).toHaveBeenCalledWith(
        "formatCurrency: Invalid amount received:",
        undefined
      );
    });

    it("handles null input", () => {
      expect(formatCurrency(null as any)).toBe("—");
      expect(consoleSpy).toHaveBeenCalledWith(
        "formatCurrency: Invalid amount received:",
        null
      );
    });

    it("does not log warnings in production environment", () => {
      vi.stubEnv("NODE_ENV", "production");
      formatCurrency(NaN);
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it("handles very large numbers", () => {
      expect(formatCurrency(Number.MAX_SAFE_INTEGER)).toContain("$");
      expect(formatCurrency(-Number.MAX_SAFE_INTEGER)).toMatch(/^-/);
    });

    it("handles very small numbers", () => {
      expect(formatCurrency(Number.MIN_VALUE)).toBe("$0.00");
      expect(formatCurrency(-Number.MIN_VALUE)).toBe("$0.00");
    });
  });

  describe("contract compliance", () => {
    it("matches expected contract examples from design.md", () => {
      // Basic formatting
      expect(formatCurrency(1234.5)).toBe("$1,234.50");
      expect(formatCurrency(-123.45)).toBe("-$123.45");
      expect(formatCurrency(0)).toBe("$0.00");

      // Edge cases
      expect(formatCurrency(-0)).toBe("$0.00");
      expect(formatCurrency(NaN)).toBe("—");
      expect(formatCurrency(undefined as any)).toBe("—");

      // Options
      expect(formatCurrency(123.45, { showPlus: true })).toBe("+$123.45");
      expect(formatCurrency(1200, { compact: true })).toBe("$1.2 K");
      expect(formatCurrency(-1200, { compact: true })).toBe("-$1.2 K");

      // Character validation
      expect(formatCurrency(-100).charCodeAt(0)).toBe(45); // ASCII hyphen-minus (U+002D)
    });
  });

  describe("locale compliance (foundation.md)", () => {
    it("uses es-US locale formatting", () => {
      // es-US uses comma for thousands separator and period for decimal
      expect(formatCurrency(1234.56)).toBe("$1,234.56");
      expect(formatCurrency(1000000.99)).toBe("$1,000,000.99");
    });

    it("uses USD currency symbol", () => {
      expect(formatCurrency(100)).toContain("$");
      expect(formatCurrency(-100)).toContain("$");
    });
  });
});
