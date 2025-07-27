export class Context {
  request: Request;
  response: {
    body?: any;
    status?: number;
    headers?: Record<string, string>;
  };
  state: Record<string, any>;
  path: string; // Path procesado (sin prefijo)
  originalPath: string; // Path original completo

  constructor(request: Request) {
    this.request = request;
    this.response = {};
    this.state = {};
    this.originalPath = new URL(request.url).pathname;
    this.path = this.originalPath;
  }

  // Para routing con prefijos
  setPath(path: string) {
    this.path = path;
  }

  // Convertir a Response nativo
  toResponse(): Response {
    const { body, status = 200, headers = {} } = this.response;

    if (body && typeof body === "object") {
      headers["Content-Type"] = "application/json";
      return new Response(JSON.stringify(body), { status, headers });
    }

    return new Response(body, { status, headers });
  }
}
