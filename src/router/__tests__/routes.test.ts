import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  AnalyzeSearchSchema,
  VisualizeSearchSchema,
  NormalizeSearchSchema,
  ImportSearchSchema,
} from "../routes";

describe("Router Search Schemas", () => {
  describe("AnalyzeSearchSchema", () => {
    it("should validate valid search parameters", () => {
      const validParams = {
        monthFrom: "2024-01",
        monthTo: "2024-12",
        categories: ["Food", "Transport"],
        excludeCurrent: true,
      };

      const result = AnalyzeSearchSchema.parse(validParams);
      expect(result).toEqual(validParams);
    });

    it("should allow optional parameters", () => {
      const result = AnalyzeSearchSchema.parse({});
      expect(result).toEqual({});
    });

    it("should validate partial parameters", () => {
      const partialParams = {
        monthFrom: "2024-01",
        excludeCurrent: false,
      };

      const result = AnalyzeSearchSchema.parse(partialParams);
      expect(result).toEqual(partialParams);
    });
  });

  describe("VisualizeSearchSchema", () => {
    it("should validate valid search parameters", () => {
      const validParams = {
        monthFrom: "2024-01",
        monthTo: "2024-12",
        categories: ["Food"],
        chartType: "monthly" as const,
        excludeCurrent: true,
      };

      const result = VisualizeSearchSchema.parse(validParams);
      expect(result).toEqual(validParams);
    });

    it("should validate chartType enum", () => {
      const validChartTypes = ["monthly", "balance", "types"];

      validChartTypes.forEach((chartType) => {
        const result = VisualizeSearchSchema.parse({ chartType });
        expect(result.chartType).toBe(chartType);
      });
    });

    it("should reject invalid chartType", () => {
      expect(() => {
        VisualizeSearchSchema.parse({ chartType: "invalid" });
      }).toThrow();
    });
  });

  describe("NormalizeSearchSchema", () => {
    it("should validate boolean parameters", () => {
      const validParams = {
        showRaw: true,
        showNormalized: false,
      };

      const result = NormalizeSearchSchema.parse(validParams);
      expect(result).toEqual(validParams);
    });

    it("should allow empty parameters", () => {
      const result = NormalizeSearchSchema.parse({});
      expect(result).toEqual({});
    });
  });

  describe("ImportSearchSchema", () => {
    it("should validate step enum", () => {
      const validSteps = ["upload", "validate", "preview"];

      validSteps.forEach((step) => {
        const result = ImportSearchSchema.parse({ step });
        expect(result.step).toBe(step);
      });
    });

    it("should reject invalid step", () => {
      expect(() => {
        ImportSearchSchema.parse({ step: "invalid" });
      }).toThrow();
    });

    it("should allow empty parameters", () => {
      const result = ImportSearchSchema.parse({});
      expect(result).toEqual({});
    });
  });
});
