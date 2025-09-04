import React from "react";
import { createRoute, createRootRoute, Outlet } from "@tanstack/react-router";
import { z } from "zod";
import { ExpensesLayout } from "../layouts/ExpensesLayout";
import {
  ImportCsvPage,
  NormalizePage,
  AnalyzePage,
  VisualizePage,
} from "../pages";

// Root route
export const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// Index route that redirects to expenses/import
export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => {
    // Redirect to expenses/import
    React.useEffect(() => {
      window.location.href = "/expenses/import";
    }, []);
    return <div>Redirecting...</div>;
  },
});

// Expenses parent route
export const expensesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/expenses",
  component: ExpensesLayout,
});

// Zod schemas for search parameter validation
export const AnalyzeSearchSchema = z.object({
  monthFrom: z.string().optional(),
  monthTo: z.string().optional(),
  categories: z.array(z.string()).optional(),
  excludeCurrent: z.boolean().optional(),
});

export const VisualizeSearchSchema = z.object({
  monthFrom: z.string().optional(),
  monthTo: z.string().optional(),
  categories: z.array(z.string()).optional(),
  chartType: z.enum(["monthly", "balance", "types"]).optional(),
  excludeCurrent: z.boolean().optional(),
});

export const NormalizeSearchSchema = z.object({
  showRaw: z.boolean().optional(),
  showNormalized: z.boolean().optional(),
});

export const ImportSearchSchema = z.object({
  step: z.enum(["upload", "validate", "preview"]).optional(),
});

// Import route
export const importRoute = createRoute({
  getParentRoute: () => expensesRoute,
  path: "/import",
  validateSearch: (search) => ImportSearchSchema.parse(search),
  component: ImportCsvPage,
  pendingComponent: () => <div>Loading import page...</div>,
  errorComponent: ({ error }) => (
    <div className="p-4 bg-red-50 border border-red-200 rounded">
      <h2 className="text-red-800 font-semibold">Error loading import page</h2>
      <p className="text-red-600">{error.message}</p>
    </div>
  ),
});

// Normalize route
export const normalizeRoute = createRoute({
  getParentRoute: () => expensesRoute,
  path: "/normalize",
  validateSearch: (search) => NormalizeSearchSchema.parse(search),
  component: NormalizePage,
  pendingComponent: () => <div>Loading normalize page...</div>,
  errorComponent: ({ error }) => (
    <div className="p-4 bg-red-50 border border-red-200 rounded">
      <h2 className="text-red-800 font-semibold">
        Error loading normalize page
      </h2>
      <p className="text-red-600">{error.message}</p>
    </div>
  ),
});

// Analyze route
export const analyzeRoute = createRoute({
  getParentRoute: () => expensesRoute,
  path: "/analyze",
  validateSearch: (search) => AnalyzeSearchSchema.parse(search),
  component: AnalyzePage,
  pendingComponent: () => <div>Loading analysis...</div>,
  errorComponent: ({ error }) => (
    <div className="p-4 bg-red-50 border border-red-200 rounded">
      <h2 className="text-red-800 font-semibold">Error loading analysis</h2>
      <p className="text-red-600">{error.message}</p>
    </div>
  ),
  loader: async () => {
    // Placeholder loader - will be enhanced with actual data loading
    return {
      timestamp: Date.now(),
    };
  },
});

// Visualize route
export const visualizeRoute = createRoute({
  getParentRoute: () => expensesRoute,
  path: "/visualize",
  validateSearch: (search) => VisualizeSearchSchema.parse(search),
  component: VisualizePage,
  pendingComponent: () => <div>Loading visualizations...</div>,
  errorComponent: ({ error }) => (
    <div className="p-4 bg-red-50 border border-red-200 rounded">
      <h2 className="text-red-800 font-semibold">
        Error loading visualizations
      </h2>
      <p className="text-red-600">{error.message}</p>
    </div>
  ),
  loader: async () => {
    // Placeholder loader - will be enhanced with actual data loading
    return {
      timestamp: Date.now(),
    };
  },
});

// Route tree
export const routeTree = rootRoute.addChildren([
  indexRoute,
  expensesRoute.addChildren([
    importRoute,
    normalizeRoute,
    analyzeRoute,
    visualizeRoute,
  ]),
]);

// Export search schema types for use in components
export type AnalyzeSearch = z.infer<typeof AnalyzeSearchSchema>;
export type VisualizeSearch = z.infer<typeof VisualizeSearchSchema>;
export type NormalizeSearch = z.infer<typeof NormalizeSearchSchema>;
export type ImportSearch = z.infer<typeof ImportSearchSchema>;
