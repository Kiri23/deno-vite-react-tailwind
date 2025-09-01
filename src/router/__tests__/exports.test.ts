import { describe, it, expect } from "vitest";

describe("Router Exports", () => {
  it("should export router instance", async () => {
    const { router } = await import("../index");
    expect(router).toBeDefined();
    expect(typeof router.navigate).toBe("function");
  });

  it("should export RouterProvider", async () => {
    const { RouterProvider } = await import("../index");
    expect(RouterProvider).toBeDefined();
  });

  it("should export route schemas", async () => {
    const {
      AnalyzeSearchSchema,
      VisualizeSearchSchema,
      NormalizeSearchSchema,
      ImportSearchSchema,
    } = await import("../index");

    expect(AnalyzeSearchSchema).toBeDefined();
    expect(VisualizeSearchSchema).toBeDefined();
    expect(NormalizeSearchSchema).toBeDefined();
    expect(ImportSearchSchema).toBeDefined();
  });

  it("should export utility hooks", async () => {
    const { useAnalyzeSearch, useVisualizeSearch, useCurrentRoute } =
      await import("../index");

    expect(useAnalyzeSearch).toBeDefined();
    expect(useVisualizeSearch).toBeDefined();
    expect(useCurrentRoute).toBeDefined();
  });

  it("should export route tree", async () => {
    const { routeTree } = await import("../index");
    expect(routeTree).toBeDefined();
  });
});
