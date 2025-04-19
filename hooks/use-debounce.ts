"use client";

import { useState, useEffect } from "react";

/**
 * A hook that returns a debounced value
 * @param value The value to debounce
 * @param delay The delay in milliseconds
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set debouncedValue to value after the specified delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Return a cleanup function that will be called whenever:
    // - value changes
    // - delay changes
    // - the component is unmounted
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
