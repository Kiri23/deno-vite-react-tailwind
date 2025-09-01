# Layout Components

This directory contains layout components that provide consistent structure and navigation for the expense tracker application.

## Components

### ExpensesLayout

The main layout component for all expense-related routes. Provides:

- **Header**: Contains the application title and navigation
- **Navigation**: Integrated ExpensesNavigation component
- **Main Content Area**: Container for route-specific content via `<Outlet />`
- **Responsive Design**: Mobile-friendly layout with proper spacing
- **Accessibility**: Semantic HTML structure with proper ARIA labels

#### Usage

```tsx
import { ExpensesLayout } from "../layouts/ExpensesLayout";

// Used in router configuration
export const expensesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/expenses",
  component: ExpensesLayout,
});
```

#### Structure

```
ExpensesLayout
├── Header (with title and navigation)
│   └── ExpensesNavigation
└── Main Content Area
    └── Outlet (for child routes)
```

## Design Principles

1. **Separation of Concerns**: Layout handles structure, content components handle data
2. **Consistency**: Provides uniform navigation and styling across all expense routes
3. **Accessibility**: Uses semantic HTML and proper ARIA attributes
4. **Responsive**: Works on mobile and desktop devices
5. **Maintainability**: Clean component structure with clear responsibilities

## Integration

The layout integrates with TanStack Router to provide:

- Consistent navigation structure across all `/expenses/*` routes
- Active state indication for current route
- Proper outlet rendering for child route content
- Error boundaries and loading states (handled by individual routes)

## Testing

Components include comprehensive unit tests covering:

- Rendering and structure
- Accessibility attributes
- Navigation functionality
- Active state management
- CSS class application
