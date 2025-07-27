type Middleware = (
  req: Request,
  next: () => Promise<Response>,
) => Promise<Response>;

// Middleware de logging
export const loggingMiddleware: Middleware = async (req, next) => {
  const start = Date.now();
  console.log(`📥 ${req.method} ${req.url}`);

  const response = await next();

  const duration = Date.now() - start;
  console.log(`📤 ${response.status} ${req.method} ${req.url} - ${duration}ms`);

  return response;
};

// Middleware de CORS
export const corsMiddleware: Middleware = async (req, next) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  const response = await next();

  // Agregar headers CORS a la response
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );

  return response;
};

// Middleware para archivos estáticos
export const staticFilesMiddleware = (
  basePath: string = "./dist",
): Middleware => {

  const verifyBasePath = async (basePath: string) => {
    try {
       const stat = await Deno.stat(basePath);
       if (stat.isDirectory) {
        console.log(`📁 Serving static files will be served from: ${basePath}`);
      }
    } catch (error) {
      console.error(`❌ Base path is not a directory: ${basePath}. Files will not be served.`,
      );
    }
  };
  verifyBasePath(basePath);
  return async (req, next) => {
    const url = new URL(req.url);

    // Solo manejar archivos estáticos
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
        const fullPath = `${basePath}${filePath}`;

        const file = await Deno.readFile(fullPath);

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
        console.log(
          `❌ Static file not found: ${basePath}${
            url.pathname === "/" ? "/index.html" : url.pathname
          }`,
        );
        return new Response("Not found", { status: 404 });
      }
    }

    return await next();
  };
};

// Middleware de manejo de errores
export const errorHandlerMiddleware: Middleware = async (req, next) => {
  try {
    return await next();
  } catch (error) {
    console.error("❌ Error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
