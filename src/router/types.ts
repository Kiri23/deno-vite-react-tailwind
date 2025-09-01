import { z } from "zod";
import {
  AnalyzeSearchSchema,
  VisualizeSearchSchema,
  NormalizeSearchSchema,
  ImportSearchSchema,
} from "./routes";

// Search parameter types
export type AnalyzeSearch = z.infer<typeof AnalyzeSearchSchema>;
export type VisualizeSearch = z.infer<typeof VisualizeSearchSchema>;
export type NormalizeSearch = z.infer<typeof NormalizeSearchSchema>;
export type ImportSearch = z.infer<typeof ImportSearchSchema>;

// Route context types (will be expanded when AppContext is implemented)
export interface RouteContext {
  // Placeholder for future service injection
  services?: any;
  config?: any;
}

// Loader data types
export interface AnalyzeLoaderData {
  searchParams: AnalyzeSearch;
  timestamp: number;
}

export interface VisualizeLoaderData {
  searchParams: VisualizeSearch;
  timestamp: number;
}
