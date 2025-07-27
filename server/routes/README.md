# Routes Organization

This folder contains all the API routes for the server, organized in a clean and maintainable structure.

## Structure

```
routes/
├── index.ts          # Main route aggregator
└── README.md         # This file
```

## How it works

The `index.ts` file exports a `createAllRoutes` function that:
- Creates a new Router instance
- Registers all API endpoints
- Returns the configured router

## Benefits of this organization

1. **Separation of Concerns**: Routes are separated from server setup
2. **Scalability**: Easy to add new routes as the application grows
3. **Maintainability**: Clear structure makes code easier to navigate
4. **Testing**: Individual routes can be tested in isolation
5. **Reusability**: Routes can be imported and reused

## Adding new routes

To add a new route:

1. Open `routes/index.ts`
2. Add your route handler using the router methods:
   ```typescript
   router.get("/api/new-endpoint", async (req) => {
     // Your route logic here
     return new Response(JSON.stringify({ data: "example" }), {
       headers: { "Content-Type": "application/json" },
     });
   });
   ```

## Best Practices

- Keep route handlers focused and single-purpose
- Use proper error handling with try-catch blocks
- Return appropriate HTTP status codes
- Set correct Content-Type headers
- Log important events for debugging

## Current Routes

- `GET /api/counter` - Returns the current counter value
- `GET /api/sse` - Server-Sent Events endpoint for real-time counter updates 