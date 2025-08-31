// Main export file for the expense tracker module

// Main component
export { ExpenseTracker } from "./ExpenseTracker";

// Types
export * from "./types";
export * from "./components/types";
export * from "./hooks/types";

// Constants
export * from "./constants";

// Components
export * from "./components";

// Hooks
export * from "./hooks";

// Services - export specific items to avoid conflicts
export {
  CsvService,
  AnalysisService,
  VizService,
  ExpenseAnalysisService,
} from "./services";
export {
  LocalCsvService,
  LocalAnalysisService,
  LocalVizService,
} from "./services";
export { createLocalServices } from "./services";
export type { CsvPort, AnalysisPort, VizPort } from "./services";

// ViewModels
export * from "./vm";
