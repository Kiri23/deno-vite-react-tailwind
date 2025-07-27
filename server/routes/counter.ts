import { Router } from "kiriWebFramework";

const kv = await Deno.openKv();

const router = new Router();

// Counter endpoint para datos iniciales
router.get("/counter", async (ctx) => {
  try {
    const data = await kv.get(["counter"]);
    const counterValue = (data.value as Deno.KvU64 | undefined)?.value ?? 0;
    ctx.response.body = { counter: Number(counterValue) };
    return ctx.toResponse();
  } catch (error) {
    console.error("Error getting counter:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Failed to get counter" };
    return ctx.toResponse();
  }
});

export default router.routes();
