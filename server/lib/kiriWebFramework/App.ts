import { Context } from "./Context.ts";

type Middleware = (
  ctx: Context,
  next: () => Promise<Response>,
) => Promise<Response>;

type MiddlewareEntry = {
  path: string;
  middleware: Middleware;
};

export class App {
  private middlewareStack: MiddlewareEntry[] = [];
  private port: number;

  constructor(port = 8000) {
    this.port = port;
  }

  use(pathOrMiddleware: string | Middleware, middleware?: Middleware) {
    if (typeof pathOrMiddleware === "function") {
      // Es middleware global (sin path específico)
      this.middlewareStack.push({ path: "/", middleware: pathOrMiddleware });
    } else {
      // Es middleware para path específico
      this.middlewareStack.push({
        path: pathOrMiddleware,
        middleware: middleware!,
      });
    }
    return this; // Para chaining
  }

  listen() {
    console.log(`🚀 Server running on http://localhost:${this.port}`);
    Deno.serve({ port: this.port }, this.handleRequest.bind(this));
  }

  private async handleRequest(req: Request): Promise<Response> {
    return this.executeMiddleware(req);
  }

  private async executeMiddleware(req: Request): Promise<Response> {
    const context = new Context(req);
    let index = 0;

    const next = async (): Promise<Response> => {
      if (index >= this.middlewareStack.length) {
        return new Response("Not found", { status: 404 });
      }

      const entry = this.middlewareStack[index++];

      // Si hay path específico, modificar el context
      if (entry.path !== "/") {
        const url = new URL(req.url);
        if (url.pathname.startsWith(entry.path)) {
          context.setPath(url.pathname.slice(entry.path.length));
        }
      }

      const result = await entry.middleware(context, next);

      // Si el middleware devuelve un Context, convertirlo a Response
      if (result && typeof result === "object" && "toResponse" in result) {
        return (result as any).toResponse();
      }

      return result;
    };

    return await next();
  }
}
