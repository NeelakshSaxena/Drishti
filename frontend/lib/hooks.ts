import React, { useCallback, useRef } from "react";

/**
 * Custom hook for debouncing function calls
 * Prevents rapid repeated executions (useful for form submissions)
 * 
 * @param callback - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced callback function
 * 
 * @example
 * const debouncedSearch = useDebounce((query) => search(query), 300);
 * <input onChange={(e) => debouncedSearch(e.target.value)} />
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}

/**
 * Custom hook for preventing duplicate API calls
 * Tracks pending requests and prevents concurrent calls to same endpoint
 * 
 * @returns Object with functions to manage pending requests
 * 
 * @example
 * const pending = useAbortController();
 * const makeSafeRequest = async () => {
 *   try {
 *     pending.set("fetch-children");
 *     await getChildren();
 *   } finally {
 *     pending.clear("fetch-children");
 *   }
 * };
 */
export function useAbortController() {
  const pendingRef = useRef<Set<string>>(new Set());

  return {
    isPending: (key: string) => pendingRef.current.has(key),
    set: (key: string) => pendingRef.current.add(key),
    clear: (key: string) => pendingRef.current.delete(key),
    clearAll: () => pendingRef.current.clear(),
  };
}

/**
 * Custom hook for async operations with loading state
 * Simplifies async function handling with try/catch/finally
 * 
 * @param asyncFunc - Async function to execute
 * @returns Object with isLoading, error, and execute function
 * 
 * @example
 * const { isLoading, error, execute } = useAsync(getChildren);
 * const handleClick = () => execute();
 */
export function useAsync<T, E = string>(asyncFunc: () => Promise<T>) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<E | null>(null);

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      return await asyncFunc();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message as E);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [asyncFunc]);

  return { isLoading, error, execute };
}
