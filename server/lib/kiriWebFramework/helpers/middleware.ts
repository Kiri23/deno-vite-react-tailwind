import { Context } from "../Context.ts";

type Middleware = (
  ctx: Context,
  next: () => Promise<Response>,
) => Promise<Response>;

// ===== MIDDLEWARE HELPERS =====

// Compose multiple middleware into one
export function compose(middlewares: Middleware[]): Middleware {
  return async (ctx: Context, next: () => Promise<Response>) => {
    let index = 0;

    const executeNext = async (): Promise<Response> => {
      if (index >= middlewares.length) {
        return await next();
      }

      const middleware = middlewares[index++];
      return await middleware(ctx, executeNext);
    };

    return await executeNext();
  };
}

// Conditional middleware (if condition is true, run middleware)
export function when(
  condition: (ctx: Context) => boolean,
  middleware: Middleware,
): Middleware {
  return async (ctx: Context, next: () => Promise<Response>) => {
    if (condition(ctx)) {
      return await middleware(ctx, next);
    }
    return await next();
  };
}

// If-else middleware
export function ifElse(
  condition: (ctx: Context) => boolean,
  trueMiddleware: Middleware,
  falseMiddleware: Middleware,
): Middleware {
  return async (ctx: Context, next: () => Promise<Response>) => {
    if (condition(ctx)) {
      return await trueMiddleware(ctx, next);
    } else {
      return await falseMiddleware(ctx, next);
    }
  };
}

// Higher-order middleware (wraps another middleware)
export function withTiming(middleware: Middleware): Middleware {
  return async (ctx: Context, next: () => Promise<Response>) => {
    const start = Date.now();
    const response = await middleware(ctx, next);
    const duration = Date.now() - start;
    console.log(
      `⏱️ ${ctx.request.method} ${ctx.request.url} took ${duration}ms`,
    );
    return response;
  };
}

// Middleware factory with configuration
export function createAuthMiddleware(secret: string): Middleware {
  return async (ctx: Context, next: () => Promise<Response>) => {
    const token = ctx.request.headers.get("Authorization");
    if (!token || token !== `Bearer ${secret}`) {
      return new Response("Unauthorized", { status: 401 });
    }
    return await next();
  };
}

// Retry middleware
export function withRetry(
  middleware: Middleware,
  maxRetries: number = 3,
): Middleware {
  return async (ctx: Context, next: () => Promise<Response>) => {
    let lastError: Error;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await middleware(ctx, next);
      } catch (error) {
        lastError = error as Error;
        console.log(`Retry ${i + 1}/${maxRetries} failed:`, error);
      }
    }

    throw lastError!;
  };
}

// Timeout middleware
export function withTimeout(
  middleware: Middleware,
  timeoutMs: number,
): Middleware {
  return async (ctx: Context, next: () => Promise<Response>) => {
    const timeoutPromise = new Promise<Response>((_, reject) => {
      setTimeout(
        () => reject(new Error(`Timeout after ${timeoutMs}ms`)),
        timeoutMs,
      );
    });

    return await Promise.race([middleware(ctx, next), timeoutPromise]);
  };
}

// Skip middleware if condition is true
export function skip(
  condition: (ctx: Context) => boolean,
  middleware: Middleware,
): Middleware {
  return async (ctx: Context, next: () => Promise<Response>) => {
    if (condition(ctx)) {
      return await next();
    }
    return await middleware(ctx, next);
  };
}

// Execute middleware only once per request
export function once(middleware: Middleware): Middleware {
  const executed = new WeakSet();

  return async (ctx: Context, next: () => Promise<Response>) => {
    if (executed.has(ctx)) {
      return await next();
    }

    executed.add(ctx);
    return await middleware(ctx, next);
  };
}
