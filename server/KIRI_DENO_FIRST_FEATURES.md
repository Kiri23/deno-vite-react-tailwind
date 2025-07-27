# Kiri Framework - Deno-First Features Strategy

## 🎯 **Nuestro Diferenciador Real**

Kiri Framework se diferencia de Oak, Hono y otros frameworks por ser **Deno-First** con helper functions prácticas, no por replicar patrones de Node.js.

## 🚀 **¿Por qué Helper Functions > Dependency Injection?**

### **Problema con DI Complejo:**
```typescript
// ❌ Over-engineering para casos simples
@Injectable()
class UserService {
  constructor(
    @Inject('DATABASE') private db: DatabaseService,
    @Inject('CACHE') private cache: CacheService,
    @Inject('LOGGER') private logger: LoggerService
  ) {}
}

// ❌ Mucho boilerplate para algo simple
```

### **Solución con Helper Functions:**
```typescript
// ✅ Simple y directo
app.use('/api/users', async (ctx) => {
  const users = await ctx.kv.get(['users']);  // Helper automático
  const cached = await ctx.cache.get('users'); // Helper automático
  ctx.response.body = { users, cached };
});
```

## 🎯 **Deno-First Helper Functions**

### **1. KV Integration Nativa**
```typescript
// Context automáticamente tiene KV
export class Context {
  request: Request;
  response: Response;
  kv: Deno.Kv;  // ← Automático
  
  constructor(request: Request) {
    this.request = request;
    this.response = {};
    this.kv = await Deno.openKv();  // ← Automático
  }
}

// En tus rutas
router.get('/counter', async (ctx) => {
  const value = await ctx.kv.get(['counter']);  // ← Sin setup
  ctx.response.body = { counter: value };
});
```

### **2. SSE Helper Functions**
```typescript
// Helper para crear SSE streams fácilmente
export function createSSEStream(ctx: Context) {
  const stream = new ReadableStream({
    start(controller) {
      // Lógica SSE automática
    }
  });
  
  return {
    send: (data: any) => controller.enqueue(data),
    close: () => controller.close()
  };
}

// En tus rutas
router.get('/events', async (ctx) => {
  const sse = createSSEStream(ctx);
  
  setInterval(() => {
    sse.send({ type: 'update', data: Date.now() });
  }, 1000);
  
  return new Response(sse.stream, {
    headers: { 'Content-Type': 'text/event-stream' }
  });
});
```

### **3. WebWorker Helpers**
```typescript
// Helper para workers
export function createWorker(script: string, options?: WorkerOptions) {
  return new Worker(new URL(script, import.meta.url), {
    type: "module",
    deno: true,
    ...options
  });
}

// Helper para ejecutar tareas en workers
export async function runInWorker(script: string, data: any) {
  const worker = createWorker(script);
  
  return new Promise((resolve, reject) => {
    worker.postMessage(data);
    worker.onmessage = (e) => resolve(e.data);
    worker.onerror = reject;
  });
}

// En tus rutas
router.post('/heavy-task', async (ctx) => {
  const result = await runInWorker('./workers/processor.ts', ctx.request.body);
  ctx.response.body = result;
});
```

### **4. Cache Helper Functions**
```typescript
// Helper para cache simple
export class CacheHelper {
  private cache = new Map<string, { value: any; expires: number }>();
  
  async get(key: string) {
    const item = this.cache.get(key);
    if (item && item.expires > Date.now()) {
      return item.value;
    }
    this.cache.delete(key);
    return null;
  }
  
  async set(key: string, value: any, ttl: number = 60000) {
    this.cache.set(key, {
      value,
      expires: Date.now() + ttl
    });
  }
}

// En Context
export class Context {
  cache: CacheHelper;
  
  constructor(request: Request) {
    this.cache = new CacheHelper();
  }
}
```

### **5. Deno Deploy Helpers**
```typescript
// Helper para configuración automática
export function configureForDeploy(app: App) {
  // Configurar KV automáticamente
  if (Deno.env.get("DENO_DEPLOYMENT_ID")) {
    console.log("🚀 Running on Deno Deploy");
    // Configuraciones específicas de Deploy
  }
  
  // Configurar workers automáticamente
  if (Deno.env.get("DENO_WORKER_ID")) {
    console.log("👷 Running as Deno Worker");
    // Configuraciones específicas de Worker
  }
}
```

## 🎉 **API Final del Framework**

```typescript
// Framework Deno-First con helpers prácticos
const app = new App(8000);

// KV automático
app.use('/api/counter', async (ctx) => {
  const value = await ctx.kv.get(['counter']);
  ctx.response.body = { counter: value };
});

// Cache automático
app.use('/api/users', async (ctx) => {
  let users = await ctx.cache.get('users');
  if (!users) {
    users = await ctx.kv.get(['users']);
    await ctx.cache.set('users', users, 300000); // 5 min
  }
  ctx.response.body = { users };
});

// SSE helper
app.use('/api/events', async (ctx) => {
  const sse = createSSEStream(ctx);
  // Tu lógica SSE
});

// Worker helper
app.use('/api/process', async (ctx) => {
  const result = await runInWorker('./workers/processor.ts', ctx.request.body);
  ctx.response.body = result;
});

// Deploy ready
configureForDeploy(app);
```

## 🏆 **¿Por qué es Mejor que DI Complejo?**

### **Ventajas:**
- ✅ **Sin decoradores** (más simple)
- ✅ **Sin configuración compleja** (automático)
- ✅ **Deno nativo** (no adaptado de Node.js)
- ✅ **Helper functions** (práctico, no over-engineering)
- ✅ **Fácil de entender** (no magic)
- ✅ **Fácil de extender** (solo agregar helpers)

### **Diferenciador Real:**
- 🚀 **Deno-First** (no Node.js adaptado)
- 🚀 **KV integrado** (no configuración extra)
- 🚀 **Workers fáciles** (no boilerplate)
- 🚀 **SSE helpers** (no código repetitivo)
- 🚀 **Deploy ready** (configuración automática)

## 🎯 **Conclusión**

Kiri Framework se diferencia por ser **práctico y Deno-nativo**, no por replicar patrones complejos de Node.js. Los helper functions son la clave para mantener la simplicidad mientras se aprovechan las características únicas de Deno.

---

*Este enfoque hace que Kiri sea único: simple, práctico y Deno-first.* 