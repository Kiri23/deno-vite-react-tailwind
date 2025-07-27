import { Router } from "kiriWebFramework";

const kv = await Deno.openKv();

const router = new Router();

// SSE endpoint
router.get("/sse", async (ctx) => {
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

export default router.routes();
