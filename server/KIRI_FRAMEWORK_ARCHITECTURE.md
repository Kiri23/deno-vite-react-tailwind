# Kiri Web Framework - Architecture & Evolution Guide

## 🎯 Overview

Kiri Web Framework is a Deno-based web framework inspired by Nest.js and Danet, designed to provide a clean separation between web infrastructure and business logic. The framework aims to be reusable across multiple projects while maintaining simplicity and flexibility.

## 🏗️ Current Architecture

### Core Components

```
server/
├── lib/kiriWebFramework/     # Framework core
│   ├── App.ts               # Main application orchestrator
│   ├── Router.ts            # HTTP routing
│   ├── Middleware.ts        # Middleware system
│   └── mod.ts              # Framework exports
├── routes/                  # Route handlers
│   ├── index.ts            # Route aggregator
│   └── README.md           # Route documentation
└── server.ts               # Application entry point
```

### Current Features

- **HTTP Routing**: GET, POST, PUT, DELETE methods
- **Middleware System**: CORS, logging, error handling, static files
- **Functional Composition**: Middleware composition with `compose()` and `ifElse()`
- **Route Organization**: Clean route structure with separation of concerns
- **Deno KV Integration**: Built-in support for Deno KV database
- **SSE Support**: Server-Sent Events for real-time updates

## 🚀 Evolution Strategy

### Phase 1: Service Layer (Current Focus)

**Goal**: Separate business logic from HTTP handling

**Current State**:
```typescript
// Routes contain both HTTP and business logic
router.get("/api/counter", async (req) => {
  const data = await kv.get(["counter"]);  // Business logic mixed with HTTP
  return new Response(JSON.stringify({ counter: data.value }));
});
```

**Target State**:
```typescript
// Routes only handle HTTP
router.get("/api/counter", async (req) => {
  const counter = await counterService.getCounter();  // Delegate to service
  return new Response(JSON.stringify({ counter }));
});

// Services contain business logic
class CounterService {
  async getCounter(): Promise<number> {
    const data = await this.kv.get(["counter"]);
    console.log(`Current counter: ${data.value}`);
    return data.value;
  }
}
```

### Phase 2: Lifecycle Management

**Goal**: Add application and service lifecycle hooks

**Features to Add**:
- `onModuleInit()` - Service initialization
- `onModuleDestroy()` - Service cleanup
- Application lifecycle events
- Graceful shutdown handling

**Example**:
```typescript
class CounterService {
  private interval: number;

  async onModuleInit() {
    this.interval = setInterval(() => this.increment(), 2000);
  }

  async onModuleDestroy() {
    clearInterval(this.interval);
  }
}
```

### Phase 3: Dependency Injection

**Goal**: Automatic service dependency resolution

**Features to Add**:
- Service container
- Constructor injection
- Service registration system
- Circular dependency detection

### Phase 4: Decorators & Controllers

**Goal**: Nest.js-style decorators and controllers

**Features to Add**:
- `@Controller()` decorator
- `@Get()`, `@Post()`, etc. decorators
- `@Injectable()` decorator
- Automatic route registration

## 🎯 Architecture Principles

### 1. Separation of Concerns

**Web Layer (Framework)**:
- HTTP request/response handling
- Routing and middleware
- Lifecycle management
- Event system

**Business Logic Layer (Services)**:
- Business rules and validations
- Data transformations
- Console logging and monitoring
- Domain logic

**Data Layer (Repositories)**:
- Database access (KV, PostgreSQL, etc.)
- Data persistence
- Connection management
- Query optimization

### 2. Reusability

The framework should be:
- **Framework-level**: Reusable across multiple projects
- **Service-level**: Services can be shared between routes
- **Repository-level**: Data access can be swapped (KV ↔ PostgreSQL)

### 3. Testability

Each layer should be independently testable:
- **Services**: Test business logic without HTTP
- **Repositories**: Test data access without business logic
- **Routes**: Test HTTP handling with mocked services

## 🔄 Current Implementation Details

### Router System

```typescript
class Router {
  private routeHandlers: Map<string, RouteHandler> = new Map();

  get(path: string, handler: RouteHandler) {
    this.routeHandlers.set(`GET:${path}`, handler);
    return this;
  }

  routes(): Middleware {
    return async (req: Request, next: () => Promise<Response>) => {
      const url = new URL(req.url);
      const key = `${req.method}:${url.pathname}`;
      
      const handler = this.routeHandlers.get(key);
      if (handler) {
        return await handler(req);
      }
      
      return await next();
    };
  }
}
```

### Middleware Composition

```typescript
const appMiddleware = compose([
  errorHandlerMiddleware,    // 1. Error handling first
  loggingMiddleware,         // 2. Logging
  corsMiddleware,           // 3. CORS for all routes
  ifElse(
    isApiRoute,
    router.routes(),         // 4a. API routes
    staticFilesMiddleware(staticFilesPath), // 4b. Static files
  ),
]);
```

### Current Route Structure

```typescript
// routes/index.ts
export function createAllRoutes(kv: Deno.Kv): Router {
  const router = new Router();
  
  // Counter endpoint
  router.get("/api/counter", async (req) => {
    // Business logic mixed with HTTP handling
  });

  // SSE endpoint
  router.get("/api/sse", async (req) => {
    // Complex SSE logic with timers and streams
  });
  
  return router;
}
```

## 🎯 Key Questions for Evolution

### 1. Service Implementation
- How to implement service lifecycle hooks?
- Should services be singletons or request-scoped?
- How to handle service dependencies?

### 2. Data Layer Abstraction
- How to abstract KV operations for different databases?
- Should we implement Repository pattern?
- How to handle database connections and pooling?

### 3. Framework Architecture
- How to implement dependency injection?
- Should we add decorators for metadata?
- How to handle application events and lifecycle?

### 4. Testing Strategy
- How to test services independently?
- How to mock dependencies?
- How to test the framework itself?

## 🚀 Next Steps

### Immediate (Phase 1)
1. Create `services/` directory
2. Extract business logic from routes to services
3. Implement simple service registration
4. Update routes to use services

### Short-term (Phase 2)
1. Add service lifecycle hooks
2. Implement application lifecycle management
3. Add graceful shutdown handling
4. Create service container

### Medium-term (Phase 3)
1. Implement dependency injection
2. Add service metadata and reflection
3. Create service factory system
4. Add circular dependency detection

### Long-term (Phase 4)
1. Add decorator support
2. Implement controller pattern
3. Add automatic route registration
4. Create CLI for project generation

## 📚 References & Inspiration

- **Danet**: https://github.com/Savory/Danet
- **Nest.js**: https://nestjs.com/
- **Express.js**: https://expressjs.com/
- **Fastify**: https://www.fastify.io/

## 🎯 Success Metrics

- **Reusability**: Framework can be used in 3+ different projects
- **Testability**: 90%+ test coverage for business logic
- **Maintainability**: Clear separation between layers
- **Performance**: Minimal overhead compared to raw Deno
- **Developer Experience**: Intuitive API and good documentation

---

*This document serves as a guide for evolving Kiri Web Framework from a simple router to a full-featured web framework with proper separation of concerns, lifecycle management, and dependency injection.* 