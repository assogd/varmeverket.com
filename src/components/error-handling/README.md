# Error Handling System

A comprehensive error handling system for React applications with development-focused debugging tools.

## Features

- 🚨 **Error Boundaries** - Catch and handle component errors gracefully
- 🔍 **Development Debugging** - Enhanced error information in development mode
- 📊 **Error Logging** - Persistent error storage and viewing
- 🎯 **DevIndicator Integration** - Visual component identification
- 🛠️ **HOCs & Hooks** - Easy integration with existing components

## Quick Start

### 1. Wrap your app with the error provider

```tsx
import { DevErrorProvider } from '@/components/error-handling';

function App() {
  return (
    <DevErrorProvider>
      <YourApp />
    </DevErrorProvider>
  );
}
```

### 2. Use error boundaries around components

```tsx
import { ErrorBoundary } from '@/components/error-handling';

function MyComponent() {
  return (
    <ErrorBoundary componentName="MyComponent" showDevIndicator>
      <SomeComponentThatMightFail />
    </ErrorBoundary>
  );
}
```

### 3. Use the HOC for automatic wrapping

```tsx
import { withErrorBoundary } from '@/components/error-handling';

const SafeComponent = withErrorBoundary(MyComponent, {
  showDevIndicator: true,
});
```

## Components

### ErrorBoundary

Catches JavaScript errors anywhere in the child component tree.

```tsx
<ErrorBoundary
  componentName="MyComponent"
  showDevIndicator={true}
  onError={(error, errorInfo, errorId) => {
    console.log('Error caught:', error);
  }}
  fallback={<CustomErrorFallback />}
>
  <MyComponent />
</ErrorBoundary>
```

### ErrorFallback

Default error UI component with development debugging features.

```tsx
<ErrorFallback
  error={error}
  resetError={() => setError(null)}
  componentName="MyComponent"
  showDetails={true}
/>
```

### ErrorLogger

Floating error log viewer for development.

```tsx
import { ErrorLogger } from '@/components/error-handling';

// Automatically included in DevErrorProvider
<ErrorLogger />;
```

## Hooks

### useErrorHandler

Handle errors manually with logging.

```tsx
import { useErrorHandler } from '@/components/error-handling';

function MyComponent() {
  const { handleError, handleAsyncError } = useErrorHandler();

  const handleClick = () => {
    try {
      // Some operation that might fail
    } catch (error) {
      handleError(error, errorInfo, 'MyComponent');
    }
  };

  const handleAsync = async () => {
    try {
      await someAsyncOperation();
    } catch (error) {
      handleAsyncError(error, 'MyComponent');
    }
  };
}
```

### useDevError

Access error logging functions.

```tsx
import { useDevError } from '@/components/error-handling';

function MyComponent() {
  const { logError, clearErrors } = useDevError();

  // Use logError and clearErrors as needed
}
```

## HOCs

### withErrorBoundary

Wrap components with error boundaries automatically.

```tsx
import { withErrorBoundary } from '@/components/error-handling';

const SafeComponent = withErrorBoundary(MyComponent, {
  showDevIndicator: true,
  onError: (error, errorInfo, errorId) => {
    // Custom error handling
  },
});
```

### withErrorBoundaryProvider

Same as `withErrorBoundary` but with `showDevIndicator: true` by default.

```tsx
import { withErrorBoundaryProvider } from '@/components/error-handling';

const SafeComponent = withErrorBoundaryProvider(MyComponent);
```

## Development Features

### Error Storage

Errors are automatically stored in localStorage during development:

- Last 10 errors are kept
- Includes stack traces, component info, and timestamps
- Accessible via the ErrorLogger component

### DevIndicator Integration

Error boundaries automatically show DevIndicator components when `showDevIndicator` is true, making it easy to identify which components have error boundaries.

### Console Logging

Enhanced console logging in development:

- Grouped error information
- Component stack traces
- Error IDs for tracking

## Production Behavior

In production:

- Error boundaries show simple fallback UI
- No error logging or storage
- No DevIndicator components
- Minimal performance impact

## Best Practices

1. **Wrap at appropriate levels** - Not every component needs an error boundary
2. **Use meaningful component names** - Helps with debugging
3. **Provide custom fallbacks** - Better user experience
4. **Handle async errors** - Use `handleAsyncError` for promise rejections
5. **Test error states** - Ensure your error boundaries work as expected

## File Structure

```
src/components/error-handling/
├── components/
│   ├── ErrorBoundary.tsx
│   ├── ErrorFallback.tsx
│   ├── ErrorLogger.tsx
│   └── DevErrorProvider.tsx
├── hooks/
│   └── useErrorHandler.ts
├── utils/
│   ├── errorStorage.ts
│   └── withErrorBoundary.tsx
├── types/
│   └── index.ts
├── index.ts
└── README.md
```
