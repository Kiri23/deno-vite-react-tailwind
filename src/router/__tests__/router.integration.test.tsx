import { describe, it, expect } from "vitest";
import { AnalyzeSearchSchema, VisualizeSearchSchema } from "../routes";

describe("Router Integration", () => {
  it("should validate search parameters for analyze route", () => {
    // Test valid search parameters
    const validSearch = {
      monthFrom: "2024-01",
      monthTo: "2024-12",
      excludeCurrent: true,
    };

    expect(() => {
      AnalyzeSearchSchema.parse(validSearch);
    }).not.toThrow();
  });

  it("should reject invalid search parameters for analyze route", () => {
    // Test that invalid categories array would be caught by Zod
    const invalidSearch = { categories: "not-an-array" };

    expect(() => {
      AnalyzeSearchSchema.parse(invalidSearch);
    }).toThrow();
  });

  it("should validate search parameters for visualize route", () => {
    // Test valid search parameters
    const validSearch = {
      chartType: "monthly" as const,
      excludeCurrent: false,
    };

    expect(() => {
      VisualizeSearchSchema.parse(validSearch);
    }).not.toThrow();
  });

  it("should reject invalid chart type for visualize route", () => {
    // Test that invalid chart type would be caught by Zod
    const invalidSearch = { chartType: "invalid" };

    expect(() => {
      VisualizeSearchSchema.parse(invalidSearch);
    }).toThrow();
  });
});
