import { Context } from "./Context.ts";

export type Middleware = (
  ctx: Context,
  next: () => Promise<Response>,
) => Promise<Response>;
export type RouteHandler = (ctx: Context) => Promise<Response>;

export class Router {
  private routeHandlers: Map<string, RouteHandler> = new Map();

  get(path: string, handler: RouteHandler) {
    this.routeHandlers.set(`GET:${path}`, handler);
    return this; // Para chaining
  }

  post(path: string, handler: RouteHandler) {
    this.routeHandlers.set(`POST:${path}`, handler);
    return this;
  }

  put(path: string, handler: RouteHandler) {
    this.routeHandlers.set(`PUT:${path}`, handler);
    return this;
  }

  delete(path: string, handler: RouteHandler) {
    this.routeHandlers.set(`DELETE:${path}`, handler);
    return this;
  }

  // Retorna middleware (como Oak)
  routes(): Middleware {
    return async (ctx: Context, next: () => Promise<Response>) => {
      const key = `${ctx.request.method}:${ctx.path}`;

      const handler = this.routeHandlers.get(key);
      if (handler) {
        return await handler(ctx);
      }

      return await next(); // Pasa al siguiente middleware
    };
  }
}
