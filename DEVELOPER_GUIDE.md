# Developer Guide: Using New Quality Improvements

This guide explains how to use the new utilities, components, and hooks added for quality improvements.

---

## 1. Using Constants

All configuration is centralized in `frontend/lib/constants.ts`.

### Import
```typescript
import { 
  API_CONFIG, 
  UI_CONFIG, 
  FORM_CONSTRAINTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  DEFAULTS,
  STATUS,
  ENDPOINTS
} from "@/lib/constants";
```

### Examples
```typescript
// API Configuration
console.log(API_CONFIG.BASE_URL);       // "http://127.0.0.1:8000"
console.log(API_CONFIG.RETRY_ATTEMPTS); // 3

// UI Configuration
const refreshInterval = UI_CONFIG.AUTO_REFRESH_INTERVAL; // 15000ms

// Form Constraints
const maxName = FORM_CONSTRAINTS.CHILD_NAME_MAX_LENGTH; // 50
const validTypes = FORM_CONSTRAINTS.EVENT_TYPE_OPTIONS; // ["flight", "train", ...]

// Messages
const errMsg = ERROR_MESSAGES.CHILD_NAME_REQUIRED;
const successMsg = SUCCESS_MESSAGES.CHILD_CREATED;

// Defaults
const defaultLat = DEFAULTS.DEFAULT_LATITUDE; // 28.6139

// Status values
const activeStatus = STATUS.TRIP_ACTIVE; // "active"

// Endpoints
const childrenUrl = ENDPOINTS.CHILDREN; // "/parent/children"
```

---

## 2. Using Validation Functions

All validation logic is in `frontend/lib/validation.ts`.

### Import
```typescript
import {
  validateChildName,
  validateCoordinates,
  validateEvent,
  formatErrorMessage,
  sanitizeInput,
  isValidEmail,
  isValidUrl
} from "@/lib/validation";
```

### Examples
```typescript
// Validate child name
try {
  validateChildName("Alice");
} catch (error) {
  console.error(error.message); // "Child name is required" or "Child name must be 50 characters or less"
}

// Validate coordinates
try {
  validateCoordinates(51.5074, 0.1278); // Valid
  validateCoordinates(91, 0); // Throws error
} catch (error) {
  console.error(error.message); // "Latitude must be between -90 and 90"
}

// Validate event
try {
  validateEvent("NYC", "London", "flight"); // Valid
} catch (error) {
  console.error(error.message); // "Please fill in all required event fields"
}

// Format error for display
const displayError = formatErrorMessage(apiError);

// Sanitize user input (prevent XSS)
const cleanName = sanitizeInput("  John<script>  ");

// Validate email
if (isValidEmail("user@example.com")) {
  // Valid
}

// Validate URL
if (isValidUrl("https://example.com")) {
  // Valid
}
```

---

## 3. Using Custom Hooks

Reusable React hooks are in `frontend/lib/hooks.ts`.

### useDebounce Hook

```typescript
import { useDebounce } from "@/lib/hooks";

function SearchComponent() {
  const handleSearch = (query: string) => {
    // Make API call
  };

  // Debounce to 300ms delay
  const debouncedSearch = useDebounce(handleSearch, 300);

  return (
    <input
      onChange={(e) => debouncedSearch(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

### useAbortController Hook

```typescript
import { useAbortController } from "@/lib/hooks";

function MyComponent() {
  const pending = useAbortController();

  async function loadData() {
    // Prevent concurrent requests
    if (pending.isPending("load-children")) {
      return;
    }

    try {
      pending.set("load-children");
      const data = await getChildren();
      // Process data
    } finally {
      pending.clear("load-children");
    }
  }

  return (
    <button onClick={loadData} disabled={pending.isPending("load-children")}>
      {pending.isPending("load-children") ? "Loading..." : "Load"}
    </button>
  );
}
```

### useAsync Hook

```typescript
import { useAsync } from "@/lib/hooks";

function MyComponent() {
  const { isLoading, error, execute } = useAsync(() => getChildren());

  return (
    <>
      <button onClick={execute} disabled={isLoading}>
        {isLoading ? "Loading..." : "Load Children"}
      </button>
      {error && <div className="error">{error}</div>}
    </>
  );
}
```

---

## 4. Using Skeleton Components

Loading placeholders are in `frontend/components/Skeleton.tsx`.

### Import
```typescript
import {
  ChildSkeleton,
  EventSkeleton,
  TripSkeleton,
  ChildrenListSkeleton,
  Skeleton
} from "@/components/Skeleton";
```

### Examples
```typescript
// Show single child skeleton
function MyComponent() {
  const [isLoading, setIsLoading] = useState(true);
  const [child, setChild] = useState(null);

  return isLoading ? <ChildSkeleton /> : <ChildCard child={child} />;
}

// Show multiple skeletons
function MyComponent() {
  const [isLoading, setIsLoading] = useState(true);

  return isLoading ? <ChildrenListSkeleton count={3} /> : <ChildrenList />;
}

// Show event skeleton
function MyComponent() {
  const [isLoading, setIsLoading] = useState(true);

  return isLoading ? <EventSkeleton /> : <EventCard />;
}

// Custom skeleton
function MyComponent() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-3 w-40" />
    </div>
  );
}
```

---

## 5. Using Error Boundary

Error boundary is in `frontend/components/ErrorBoundary.tsx`.

### Wrap your component
```typescript
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <YourComponent />
    </ErrorBoundary>
  );
}
```

### Custom fallback UI
```typescript
<ErrorBoundary
  fallback={
    <div className="error-page">
      <p>Something went wrong. Please refresh the page.</p>
    </div>
  }
>
  <YourComponent />
</ErrorBoundary>
```

---

## 6. Improved API Functions

Enhanced API layer in `frontend/lib/api.ts` with better error handling.

### All functions now include:
- JSDoc documentation
- Input validation
- Better error messages
- Retry logic on fetch

### Example
```typescript
import { createChild, startTrip, addEvent } from "@/lib/api";

try {
  // Validates name length and emptiness
  const child = await createChild("Alice");
  
  // Returns trip with events
  const trip = await startTrip(child.id);
  
  // Validates event data
  const event = await addEvent(trip.id, {
    type: "flight",
    from: "NYC",
    to: "London",
  });
} catch (error) {
  // Error is descriptive: "Child name is required" or "Trip not found"
  console.error(error.message);
}
```

---

## 7. Enhanced Error Messages

Error messages are descriptive and guide users.

### Import error messages
```typescript
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/lib/constants";

// In component
const [error, setError] = useState<string | null>(null);

function handleCreateChild() {
  try {
    // ... operation
  } catch (err) {
    setError(ERROR_MESSAGES.CHILD_NAME_REQUIRED);
  }
}

// Display
{error && (
  <div className="error-message">
    <AlertCircle />
    <p>{error}</p>
  </div>
)}
```

---

## 8. Best Practices

### 1. Always use constants instead of magic numbers
```typescript
// ❌ Bad
useEffect(() => {
  const interval = setInterval(loadData, 15000);
  return () => clearInterval(interval);
}, []);

// ✅ Good
import { UI_CONFIG } from "@/lib/constants";
useEffect(() => {
  const interval = setInterval(loadData, UI_CONFIG.AUTO_REFRESH_INTERVAL);
  return () => clearInterval(interval);
}, []);
```

### 2. Validate user input early
```typescript
// ❌ Bad
async function handleCreateChild() {
  await createChild(name);
}

// ✅ Good
async function handleCreateChild() {
  try {
    validateChildName(name);
    await createChild(name);
  } catch (error) {
    setError(error.message);
  }
}
```

### 3. Use custom hooks for async operations
```typescript
// ❌ Bad
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState(null);
// ... manual loading/error handling

// ✅ Good
const { isLoading, error, execute } = useAsync(getChildren);
const handleClick = async () => execute();
```

### 4. Show loading states
```typescript
// ❌ Bad
{isLoading && <p>Loading...</p>}

// ✅ Good
{isLoading && <ChildrenListSkeleton />}
```

### 5. Wrap error-prone components
```typescript
// ❌ Bad
export default function App() {
  return <Dashboard />;
}

// ✅ Good
export default function App() {
  return (
    <ErrorBoundary>
      <Dashboard />
    </ErrorBoundary>
  );
}
```

---

## 9. Common Patterns

### Form with validation
```typescript
function CreateChildForm() {
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    // Validate
    try {
      validateChildName(name);
    } catch (err) {
      setError(err.message);
      return;
    }

    // Create
    setIsCreating(true);
    try {
      await createChild(name);
      setName("");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <input
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setError(null);
        }}
        maxLength={FORM_CONSTRAINTS.CHILD_NAME_MAX_LENGTH}
      />
      <button disabled={isCreating}>
        {isCreating ? "Creating..." : "Create"}
      </button>
      <p className="text-xs">
        {name.length} / {FORM_CONSTRAINTS.CHILD_NAME_MAX_LENGTH}
      </p>
    </form>
  );
}
```

### Async data loading with error handling
```typescript
function ChildList() {
  const [children, setChildren] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setError(null);
        const data = await getChildren();
        setChildren(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    load();
    const interval = setInterval(load, UI_CONFIG.AUTO_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) return <ChildrenListSkeleton />;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;
  if (children.length === 0) return <EmptyState />;

  return <ChildrenList children={children} />;
}
```

---

## 10. Troubleshooting

### Error: "Child name is required" but I provided a name
- Check that the name is not just whitespace
- Trim the name: `name.trim()`
- Validate before API call

### Error: "Invalid coordinates"
- Latitude must be between -90 and 90
- Longitude must be between -180 and 180
- Use validation function to check

### Component still crashes with error boundary
- Error boundary only catches render errors
- It doesn't catch async errors
- Wrap async error handling with try/catch

### Duplicate API calls happening
- Use `useAbortController` hook to prevent concurrent requests
- Check if request is already pending before making new call

---

## Summary

New tools available:
| Module | Purpose | Location |
|--------|---------|----------|
| Constants | Centralized config | `lib/constants.ts` |
| Validation | Form validation | `lib/validation.ts` |
| Hooks | Reusable logic | `lib/hooks.ts` |
| Skeleton | Loading states | `components/Skeleton.tsx` |
| Error Boundary | Error handling | `components/ErrorBoundary.tsx` |
| Enhanced API | Better error handling | `lib/api.ts` |

Use these consistently across your components to maintain code quality and provide great user experience!
