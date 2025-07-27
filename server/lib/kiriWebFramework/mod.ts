// Kiri Web Framework - A lightweight, functional web framework for Deno
// Inspired by Oak and Express, built with TypeScript and functional programming principles

// Core classes
export { App } from "./App.ts";
export { Router } from "./Router.ts";

// Middleware utilities
export {
  loggingMiddleware,
  corsMiddleware,
  staticFilesMiddleware,
  errorHandlerMiddleware,
} from "./Middleware.ts";

// Functional middleware helpers
export {
  compose,
  when,
  ifElse,
  withTiming,
  createAuthMiddleware,
  withRetry,
  withTimeout,
  skip,
  once,
} from "./helpers/middleware.ts";

// Re-export types for convenience
export type { RouteHandler, Middleware } from "./Router.ts";
