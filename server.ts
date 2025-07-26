/// <reference lib="deno.unstable" />

const kv = await Deno.openKv();

Deno.serve(async (req) => {
  const url = new URL(req.url);

  // Serve static files from dist/
  if (
    url.pathname === "/" ||
    url.pathname.startsWith("/assets") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".ico") ||
    url.pathname.endsWith(".html")
  ) {
    try {
      const filePath = url.pathname === "/" ? "/index.html" : url.pathname;
      const file = await Deno.readFile(`./dist${filePath}`);
      const contentType = filePath.endsWith(".js")
        ? "application/javascript"
        : filePath.endsWith(".css")
        ? "text/css"
        : filePath.endsWith(".svg")
        ? "image/svg+xml"
        : filePath.endsWith(".ico")
        ? "image/x-icon"
        : "text/html";
      return new Response(file, {
        headers: { "content-type": contentType },
      });
    } catch {
      return new Response("Not found", { status: 404 });
    }
  }

  // Counter endpoint para datos iniciales
  if (url.pathname === "/api/counter") {
    try {
      const data = await kv.get(["counter"]);
      const counterValue = (data.value as Deno.KvU64 | undefined)?.value ?? 0;
      return new Response(JSON.stringify({ counter: Number(counterValue) }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error) {
      console.error("Error getting counter:", error);
      return new Response(JSON.stringify({ error: "Failed to get counter" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  }

  // SSE endpoint
  if (url.pathname === "/api/sse") {
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
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Cache-Control",
      },
    });
  }

  // Fallback
  return new Response("Not found", { status: 404 });
});
