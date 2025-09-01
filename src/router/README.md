# TanStack Router Configuration

This directory contains the TanStack Router configuration for the expense tracker modularization. The router provides URL-driven navigation with type-safe search parameter validation.

## Structure

```
src/router/
├── routes.tsx              # Route definitions and Zod schemas
├── index.ts               # Main router instance and exports
├── types.ts               # TypeScript type definitions
├── hooks.ts               # Router utility hooks
├── RouterProvider.tsx     # Router provider component
├── example.tsx            # Usage examples
├── README.md              # This documentation
└── __tests__/             # Router tests
    ├── routes.test.ts     # Schema validation tests
    └── router.integration.test.tsx # Integration tests
```

## Routes

The router defines the following routes:

- `/expenses/import` - CSV file import and validation
- `/expenses/normalize` - Data normalization display
- `/expenses/analyze` - Financial analysis with integrated insights
- `/expenses/visualize` - Interactive charts with contextual annotations

## Search Parameter Validation

Each route uses Zod schemas for type-safe search parameter validation:

### Analyze Route (`/expenses/analyze`)

```typescript
{
  monthFrom?: string;        // Start month filter (YYYY-MM)
  monthTo?: string;          // End month filter (YYYY-MM)
  categories?: string[];     // Category filters
  excludeCurrent?: boolean;  // Exclude current month
}
```

### Visualize Route (`/expenses/visualize`)

```typescript
{
  monthFrom?: string;        // Start month filter
  monthTo?: string;          // End month filter
  categories?: string[];     // Category filters
  chartType?: 'monthly' | 'balance' | 'types'; // Chart type
  excludeCurrent?: boolean;  // Exclude current month
}
```

### Normalize Route (`/expenses/normalize`)

```typescript
{
  showRaw?: boolean;         // Show raw data table
  showNormalized?: boolean;  // Show normalized data table
}
```

### Import Route (`/expenses/import`)

```typescript
{
  step?: 'upload' | 'validate' | 'preview'; // Import step
}
```

## Usage

### Basic Setup

```typescript
import { RouterProvider } from "@/router";

function App() {
  return <RouterProvider>{/* Your app content */}</RouterProvider>;
}
```

### Navigation with Links

```typescript
import { Link } from "@tanstack/react-router";

function Navigation() {
  return (
    <nav>
      <Link to="/expenses/import">Import</Link>
      <Link to="/expenses/analyze" search={{ excludeCurrent: true }}>
        Analyze
      </Link>
      <Link to="/expenses/visualize" search={{ chartType: "monthly" }}>
        Visualize
      </Link>
    </nav>
  );
}
```

### Programmatic Navigation

```typescript
import { useNavigate } from "@tanstack/react-router";

function MyComponent() {
  const navigate = useNavigate();

  const goToAnalyze = () => {
    navigate({
      to: "/expenses/analyze",
      search: {
        monthFrom: "2024-01",
        monthTo: "2024-12",
        excludeCurrent: true,
      },
    });
  };

  return <button onClick={goToAnalyze}>Analyze</button>;
}
```

### Search Parameter Management

```typescript
import { useAnalyzeSearch } from "@/router/hooks";

function AnalyzePage() {
  const { currentSearch, updateSearch } = useAnalyzeSearch();

  const toggleExcludeCurrent = () => {
    updateSearch({
      excludeCurrent: !currentSearch.excludeCurrent,
    });
  };

  return (
    <div>
      <p>Exclude Current: {currentSearch.excludeCurrent ? "Yes" : "No"}</p>
      <button onClick={toggleExcludeCurrent}>Toggle</button>
    </div>
  );
}
```

### Route Information

```typescript
import { useCurrentRoute } from "@/router/hooks";

function MyComponent() {
  const routeInfo = useCurrentRoute();

  if (routeInfo.isAnalyzeRoute) {
    return <div>Currently on analyze page</div>;
  }

  return <div>Current path: {routeInfo.pathname}</div>;
}
```

## Error Handling

Each route includes error boundaries and pending states:

- **Error Component**: Displays user-friendly error messages
- **Pending Component**: Shows loading states during navigation
- **Loader Functions**: Handle data loading with error recovery

## Type Safety

The router configuration provides full TypeScript support:

- Search parameters are validated with Zod schemas
- Route paths are type-checked
- Navigation functions are type-safe
- Component props receive typed search parameters

## Testing

The router includes comprehensive tests:

- **Schema Validation**: Tests for all Zod schemas
- **Integration Tests**: Router behavior with React components
- **Type Safety**: Ensures TypeScript types are correct

Run tests with:

```bash
deno task test src/router/__tests__/
```

## Future Enhancements

This router configuration is designed to support:

1. **Service Integration**: Context-based service injection (Task 13)
2. **URL State Sync**: Bidirectional VM-URL synchronization (Task 10)
3. **Layout Components**: Consistent navigation structure (Task 11)
4. **Content Views**: Pure component integration (Task 12)

The router provides the foundation for the complete modular architecture outlined in the expense tracker modularization spec.
