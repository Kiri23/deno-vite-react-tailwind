export type Middleware = (
  req: Request,
  next: () => Promise<Response>,
) => Promise<Response>;
export type RouteHandler = (req: Request) => Promise<Response>;

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
    return async (req: Request, next: () => Promise<Response>) => {
      const url = new URL(req.url);
      const key = `${req.method}:${url.pathname}`;

      const handler = this.routeHandlers.get(key);
      if (handler) {
        return await handler(req);
      }

      return await next(); // Pasa al siguiente middleware
    };
  }
}
