/**
 * App module exports for service injection and application context
 */

export {
  AppContextProvider,
  useAppContext,
  useServices,
  useAppConfig,
  useLogger,
  useClock,
  createTestAppContext,
  isLocalServiceFactory,
  Environment,
} from "./context.tsx";

export type {
  AppContext,
  AppConfig,
  Logger,
  Clock,
  Services,
  AppContextProviderProps,
} from "./context.tsx";
