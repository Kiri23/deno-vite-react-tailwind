import { z } from "zod";

// Re-export the schemas from routes for consistency
export {
  AnalyzeSearchSchema,
  VisualizeSearchSchema,
  NormalizeSearchSchema,
  ImportSearchSchema,
} from "./routes";

// Export the inferred types
export type {
  AnalyzeSearch,
  VisualizeSearch,
  NormalizeSearch,
  ImportSearch,
} from "./routes";
