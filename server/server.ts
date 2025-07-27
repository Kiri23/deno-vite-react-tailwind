/// <reference lib="deno.unstable" />

import {
  App,
  Router,
  compose,
  ifElse,
  loggingMiddleware,
  corsMiddleware,
  staticFilesMiddleware,
  errorHandlerMiddleware,
} from "kiriWebFramework";

// Determine the correct path for static files
// In development: ./dist (from vite-project/)
// In production: ./dist (from vite-project/server/)
// Detect environment and set appropriate path
const isProduction = Deno.env.get("DENO_DEPLOYMENT_ID") !== undefined;
const staticFilesPath = isProduction ? "./dist" : "../dist";

const kv = await Deno.openKv();

// Create app
const app = new App(8000);

// Create router for API routes
const router = new Router();

// Counter endpoint para datos iniciales
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

// SSE endpoint
router.get("/api/sse", async (req) => {
  console.log("SSE connection requested");

  // Insertar valor de prueba si no existe
  const current = await kv.get(["counter"]);
  if (!current.value) {
    await kv.set(["counter"], new Deno.KvU64(0n));
    console.log("Initialized counter to 0");
  }

  // Incrementar el contador cada 2 segundos (solo para demo)
  const interval = setInterval(async () => {
    try {
      await kv.atomic().sum(["counter"], 1n).commit();
      console.log("Incremented counter");
    } catch (error) {
      console.error("Error incrementing counter:", error);
    }
  }, 2000);

  const stream = kv.watch([["counter"]]).getReader();
  const body = new ReadableStream({
    async start(controller) {
      console.log("SSE stream started");
      try {
        while (true) {
          const { done, value } = await stream.read();
          if (done) {
            console.log("SSE stream done");
            break;
          }

          const data = await kv.get(["counter"]);
          const counterValue =
            (data.value as Deno.KvU64 | undefined)?.value ?? 0;
          const message = `data: ${JSON.stringify({
            counter: Number(counterValue),
          })}\n\n`;
          console.log("Sending SSE message:", message.trim());
          controller.enqueue(new TextEncoder().encode(message));
        }
      } catch (error) {
        console.error("Error in SSE stream:", error);
        controller.error(error);
      }
    },
    cancel() {
      console.log("SSE stream cancelled");
      clearInterval(interval);
      stream.cancel();
    },
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Headers": "Cache-Control",
    },
  });
});

// Conditions for middleware routing
const isApiRoute = (req: Request) => req.url.includes("/api");

// Compose middleware with functional routing
const appMiddleware = compose([
  errorHandlerMiddleware, // 1. Error handling first
  loggingMiddleware, // 2. Logging
  corsMiddleware, // 3. CORS for all routes
  ifElse(
    isApiRoute,
    router.routes(), // 4a. API routes
    staticFilesMiddleware(staticFilesPath), // 4b. Static files (works for both dev and prod)
  ),
]);

// Configure middleware
app.use(appMiddleware);

// Start server
app.listen();

console.log("🚀 Server running with Kiri Web Framework!");
console.log("📡 API: http://localhost:8000/api/counter");
console.log("📡 SSE: http://localhost:8000/api/sse");
