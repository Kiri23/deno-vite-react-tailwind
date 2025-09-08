import React from "react";
import { createRoute, createRootRoute } from "@tanstack/react-router";
import { z } from "zod";
import { AppLayout } from "../layouts/AppLayout";
import {
  HomePage,
  ImportCsvPage,
  NormalizePage,
  AnalyzePage,
  VisualizePage,
} from "../pages";

// Root route with AppLayout
export const rootRoute = createRootRoute({
  component: AppLayout,
});

// Home page route
export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
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

export const ValidateSearchSchema = z.object({
  showRaw: z.boolean().optional(),
  showNormalized: z.boolean().optional(),
});

export const ImportSearchSchema = z.object({
  step: z.enum(["upload", "validate", "preview"]).optional(),
});

// Import route
export const importRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/import",
  validateSearch: (search) => ImportSearchSchema.parse(search),
  component: ImportCsvPage,
  pendingComponent: () => <div>Cargando página de importación...</div>,
  errorComponent: ({ error }) => (
    <div className="p-4 bg-red-50 border border-red-200 rounded">
      <h2 className="text-red-800 font-semibold">
        Error cargando página de importación
      </h2>
      <p className="text-red-600">{error.message}</p>
    </div>
  ),
});

// Validate route (renamed from normalize)
export const validateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/validate",
  validateSearch: (search) => ValidateSearchSchema.parse(search),
  component: NormalizePage,
  pendingComponent: () => <div>Cargando página de validación...</div>,
  errorComponent: ({ error }) => (
    <div className="p-4 bg-red-50 border border-red-200 rounded">
      <h2 className="text-red-800 font-semibold">
        Error cargando página de validación
      </h2>
      <p className="text-red-600">{error.message}</p>
    </div>
  ),
});

// Analyze route
export const analyzeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/analyze",
  validateSearch: (search) => AnalyzeSearchSchema.parse(search),
  component: AnalyzePage,
  pendingComponent: () => <div>Cargando análisis...</div>,
  errorComponent: ({ error }) => (
    <div className="p-4 bg-red-50 border border-red-200 rounded">
      <h2 className="text-red-800 font-semibold">Error cargando análisis</h2>
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
  getParentRoute: () => rootRoute,
  path: "/visualize",
  validateSearch: (search) => VisualizeSearchSchema.parse(search),
  component: VisualizePage,
  pendingComponent: () => <div>Cargando visualizaciones...</div>,
  errorComponent: ({ error }) => (
    <div className="p-4 bg-red-50 border border-red-200 rounded">
      <h2 className="text-red-800 font-semibold">
        Error cargando visualizaciones
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
  importRoute,
  validateRoute,
  analyzeRoute,
  visualizeRoute,
]);

// Export search schema types for use in components
export type AnalyzeSearch = z.infer<typeof AnalyzeSearchSchema>;
export type VisualizeSearch = z.infer<typeof VisualizeSearchSchema>;
export type ValidateSearch = z.infer<typeof ValidateSearchSchema>;
export type ImportSearch = z.infer<typeof ImportSearchSchema>;
