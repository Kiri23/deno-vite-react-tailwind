# Kiri Web Framework

A lightweight, functional web framework for Deno inspired by Oak and Express, built with TypeScript and functional programming principles.

## Features

- 🚀 **Lightweight**: Minimal overhead, maximum performance
- 🧠 **Functional**: Built with functional programming patterns
- 🔧 **Composable**: Middleware composition with `compose()`, `when()`, `ifElse()`
- 🛣️ **Routing**: Simple and intuitive routing system
- 🔒 **Middleware**: Rich ecosystem of middleware utilities
- 📦 **TypeScript**: Full TypeScript support with type safety
- 🎯 **Oak-inspired**: Familiar API for Oak/Express developers

## Installation

```typescript
import { App, Router, compose, when } from "jsr:@your-org/kiri-web-framework";
```

## Quick Start

```typescript
import { App, Router, loggingMiddleware, corsMiddleware } from "jsr:@your-org/kiri-web-framework";

// Create app
const app = new App(8000);

// Create router
const router = new Router();

// Define routes
router.get("/api/hello", async (req) => {
  return new Response(JSON.stringify({ message: "Hello World!" }), {
    headers: { "Content-Type": "application/json" }
  });
});

// Use middleware
app
  .use(loggingMiddleware)
  .use(corsMiddleware)
  .use(router.routes());

// Start server
app.listen();
```

## Core Concepts

### App Class

The main application class that handles middleware and server management.

```typescript
import { App } from "jsr:@your-org/kiri-web-framework";

const app = new App(8000);
app.use(middleware);
app.listen();
```

### Router Class

Define HTTP routes with a clean, chainable API.

```typescript
import { Router } from "jsr:@your-org/kiri-web-framework";

const router = new Router();

router
  .get("/users", async (req) => {
    // Handle GET /users
  })
  .post("/users", async (req) => {
    // Handle POST /users
  })
  .put("/users/:id", async (req) => {
    // Handle PUT /users/:id
  })
  .delete("/users/:id", async (req) => {
    // Handle DELETE /users/:id
  });

app.use(router.routes());
```

### Middleware

Functions that process requests and responses in a chain.

```typescript
import { Middleware } from "jsr:@your-org/kiri-web-framework";

const myMiddleware: Middleware = async (req, next) => {
  // Before next middleware
  console.log("Request:", req.url);
  
  const response = await next();
  
  // After next middleware
  console.log("Response:", response.status);
  
  return response;
};
```

## Built-in Middleware

### Logging Middleware

```typescript
import { loggingMiddleware } from "jsr:@your-org/kiri-web-framework";

app.use(loggingMiddleware);
// Logs: 📥 GET http://localhost:8000/api/users
// Logs: 📤 200 GET http://localhost:8000/api/users - 45ms
```

### CORS Middleware

```typescript
import { corsMiddleware } from "jsr:@your-org/kiri-web-framework";

app.use(corsMiddleware);
// Handles CORS preflight requests and adds CORS headers
```

### Static Files Middleware

```typescript
import { staticFilesMiddleware } from "jsr:@your-org/kiri-web-framework";

app.use(staticFilesMiddleware("./dist"));
// Serves static files from ./dist directory
```

### Error Handler Middleware

```typescript
import { errorHandlerMiddleware } from "jsr:@your-org/kiri-web-framework";

app.use(errorHandlerMiddleware);
// Catches and handles errors gracefully
```

## Functional Middleware Helpers

### Compose

Combine multiple middleware into one.

```typescript
import { compose, loggingMiddleware, corsMiddleware } from "jsr:@your-org/kiri-web-framework";

const combinedMiddleware = compose([
  loggingMiddleware,
  corsMiddleware,
  myCustomMiddleware
]);

app.use(combinedMiddleware);
```

### When

Conditional middleware execution.

```typescript
import { when } from "jsr:@your-org/kiri-web-framework";

const isApiRoute = (req: Request) => req.url.includes("/api");

app.use(when(isApiRoute, authMiddleware));
// Only applies authMiddleware to API routes
```

### If-Else

Conditional middleware with else branch.

```typescript
import { ifElse, staticFilesMiddleware } from "jsr:@your-org/kiri-web-framework";

const isStaticRoute = (req: Request) => req.url.includes("/static");

app.use(ifElse(
  isStaticRoute,
  staticFilesMiddleware(),
  apiMiddleware
));
```

### With Timing

Add timing to any middleware.

```typescript
import { withTiming } from "jsr:@your-org/kiri-web-framework";

app.use(withTiming(myMiddleware));
// Logs: ⏱️ GET http://localhost:8000/api/users took 45ms
```

### Create Auth Middleware

Factory for authentication middleware.

```typescript
import { createAuthMiddleware } from "jsr:@your-org/kiri-web-framework";

const authMiddleware = createAuthMiddleware("my-secret");

app.use(authMiddleware);
// Requires Authorization: Bearer my-secret header
```

## Advanced Examples

### Complex Middleware Composition

```typescript
import { 
  App, 
  Router, 
  compose, 
  when, 
  ifElse,
  loggingMiddleware,
  corsMiddleware,
  staticFilesMiddleware,
  createAuthMiddleware
} from "jsr:@your-org/kiri-web-framework";

const app = new App(8000);
const router = new Router();

// Define routes
router.get("/api/users", async (req) => {
  return new Response(JSON.stringify({ users: [] }));
});

// Complex middleware composition
const appMiddleware = compose([
  loggingMiddleware,
  corsMiddleware,
  when(
    (req) => req.url.includes("/api"),
    createAuthMiddleware("secret")
  ),
  ifElse(
    (req) => req.url.includes("/static"),
    staticFilesMiddleware("./public"),
    router.routes()
  )
]);

app.use(appMiddleware);
app.listen();
```

### Custom Middleware with Retry Logic

```typescript
import { withRetry, withTimeout } from "jsr:@your-org/kiri-web-framework";

const databaseMiddleware = async (req: Request, next: () => Promise<Response>) => {
  // Database operation that might fail
  const result = await database.query();
  return new Response(JSON.stringify(result));
};

// Add retry and timeout
const robustDatabaseMiddleware = compose([
  withRetry(databaseMiddleware, 3),
  withTimeout(databaseMiddleware, 5000)
]);

app.use(robustDatabaseMiddleware);
```

## API Reference

### App

- `new App(port?: number)` - Create new app instance
- `use(middleware: Middleware)` - Add middleware
- `listen()` - Start the server

### Router

- `get(path: string, handler: RouteHandler)` - Define GET route
- `post(path: string, handler: RouteHandler)` - Define POST route
- `put(path: string, handler: RouteHandler)` - Define PUT route
- `delete(path: string, handler: RouteHandler)` - Define DELETE route
- `routes(): Middleware` - Get middleware for the router

### Middleware Helpers

- `compose(middlewares: Middleware[]): Middleware` - Compose multiple middleware
- `when(condition, middleware): Middleware` - Conditional middleware
- `ifElse(condition, trueMiddleware, falseMiddleware): Middleware` - If-else middleware
- `withTiming(middleware): Middleware` - Add timing to middleware
- `createAuthMiddleware(secret: string): Middleware` - Create auth middleware
- `withRetry(middleware, maxRetries): Middleware` - Add retry logic
- `withTimeout(middleware, timeoutMs): Middleware` - Add timeout
- `skip(condition, middleware): Middleware` - Skip middleware conditionally
- `once(middleware): Middleware` - Execute middleware only once

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- Inspired by [Oak](https://github.com/oakserver/oak) and [Express](https://expressjs.com/)
- Built with functional programming principles
- Designed for Deno's modern runtime 