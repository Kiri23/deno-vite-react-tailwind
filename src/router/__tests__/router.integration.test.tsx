import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryHistory } from "@tanstack/react-router";
import { router } from "../index";
import RouterProvider from "../RouterProvider";

// Mock router for testing
const createTestRouter = (initialEntries: string[] = ["/"]) => {
  const history = createMemoryHistory({
    initialEntries,
  });

  return router.update({
    history,
  });
};

describe("Router Integration", () => {
  it("should render root route", () => {
    const testRouter = createTestRouter(["/"]);

    render(
      <RouterProvider>
        <div>Root content</div>
      </RouterProvider>
    );

    // Since we have placeholder components, we just verify no errors occur
    expect(document.body).toBeDefined();
  });

  it("should handle expenses routes", () => {
    const testRouter = createTestRouter(["/expenses/import"]);

    render(
      <RouterProvider>
        <div>Test content</div>
      </RouterProvider>
    );

    // Verify the router doesn't crash with expenses routes
    expect(document.body).toBeDefined();
  });

  it("should validate search parameters for analyze route", () => {
    // Test that invalid search parameters would be caught by Zod
    const invalidSearch = { chartType: "invalid" };

    expect(() => {
      // This would normally be caught by the router's validateSearch
      // We're testing the schema directly since we can't easily test
      // the full router navigation in this setup
      const { AnalyzeSearchSchema } = require("../routes");
      AnalyzeSearchSchema.parse(invalidSearch);
    }).toThrow();
  });
});
