type Middleware = (
  req: Request,
  next: () => Promise<Response>,
) => Promise<Response>;

export class App {
  private middleware: Middleware[] = [];
  private port: number;

  constructor(port = 8000) {
    this.port = port;
  }

  use(middleware: Middleware) {
    this.middleware.push(middleware);
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
    let index = 0;

    const next = async (): Promise<Response> => {
      if (index >= this.middleware.length) {
        return new Response("Not found", { status: 404 });
      }

      const middleware = this.middleware[index++];
      return await middleware(req, next);
    };

    return await next();
  }
}
