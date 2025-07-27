/// <reference lib="deno.unstable" />

import {
  App,
  compose,
  corsMiddleware,
  staticFilesMiddleware,
  errorHandlerMiddleware,
} from "kiriWebFramework";
import counterRoutes from "./routes/counter.ts";
import sseRoutes from "./routes/sse.ts";

// Determine the correct path for static files
// In development: ./dist (from vite-project/)
// In production: ./dist (from vite-project/server/)
// Detect environment and set appropriate path
const isProduction = Deno.env.get("DENO_DEPLOYMENT_ID") !== undefined;
const staticFilesPath = isProduction ? "./dist" : "../dist";

// Create app
const app = new App(8000);

// Create API routes middleware using compose
const apiRoutesMiddleware = compose([counterRoutes, sseRoutes]);

// Configure middleware
app.use(errorHandlerMiddleware);
app.use(corsMiddleware);
app.use("/api", apiRoutesMiddleware);
app.use(staticFilesMiddleware(staticFilesPath));

// Start server
app.listen();

console.log("🚀 Server running with Kiri Web Framework!");
console.log("📡 API: http://localhost:8000/api/counter");
console.log("📡 SSE: http://localhost:8000/api/sse");
