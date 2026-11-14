"use client";

// The value, once it has stopped changing for `ms` milliseconds (so a search waits for a pause in typing).
import { useEffect, useState } from "react";

export function useDebounced<T>(value: T, ms: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}
