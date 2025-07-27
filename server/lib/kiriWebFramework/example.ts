/// <reference lib="deno.unstable" />

// Example usage of Kiri Web Framework
import {
  App,
  Router,
  compose,
  when,
  ifElse,
  loggingMiddleware,
  corsMiddleware,
  staticFilesMiddleware,
  errorHandlerMiddleware,
  createAuthMiddleware,
  withTiming,
} from "./mod.ts";

// Create KV instance
const kv = await Deno.openKv();

// Create app
const app = new App(8000);

// Create router
const router = new Router();

// Define routes
router.get("/api/counter", async (req) => {
  try {
    const data = await kv.get(["counter"]);
    const counterValue = (data.value as Deno.KvU64 | undefined)?.value ?? 0;
    return new Response(JSON.stringify({ counter: Number(counterValue) }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error getting counter:", error);
    return new Response(JSON.stringify({ error: "Failed to get counter" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

router.post("/api/counter", async (req) => {
  try {
    const body = await req.json();
    const increment = body.increment || 1;

    await kv.atomic().sum(["counter"], BigInt(increment)).commit();

    const data = await kv.get(["counter"]);
    const counterValue = (data.value as Deno.KvU64 | undefined)?.value ?? 0;

    return new Response(JSON.stringify({ counter: Number(counterValue) }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating counter:", error);
    return new Response(JSON.stringify({ error: "Failed to update counter" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

// API health check
router.get("/api/health", async (req) => {
  return new Response(
    JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }),
    {
      headers: { "Content-Type": "application/json" },
    },
  );
});

// Conditions
const isApiRoute = (req: Request) => req.url.includes("/api");
const isStaticRoute = (req: Request) =>
  req.url.includes("/static") || req.url === "/";

// Complex middleware composition
const appMiddleware = compose([
  errorHandlerMiddleware, // 1. Error handling first
  loggingMiddleware, // 2. Logging
  corsMiddleware, // 3. CORS
  when(isApiRoute, createAuthMiddleware("my-secret")), // 4. Auth for API routes
  ifElse(
    isStaticRoute,
    staticFilesMiddleware(), // 5a. Static files
    withTiming(router.routes()), // 5b. API routes with timing
  ),
]);

// Configure middleware
app.use(appMiddleware);

// Start server
app.listen();

console.log("🚀 Kiri Web Framework example running!");
console.log("📡 Server: http://localhost:8000");
console.log("🔗 API: http://localhost:8000/api/counter");
console.log("🔗 Health: http://localhost:8000/api/health");
console.log("📁 Static: http://localhost:8000/ (serves from ./dist)");
