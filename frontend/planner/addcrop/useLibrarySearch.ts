"use client";

// Searches the shared plant library on the server for `q` (2+ letters), leaving out crops already in the
// planner. A newer search cancels an older one, and results are tagged with their query, so a result for
// an older query is never shown as the answer to a newer one.
import { useEffect, useState } from "react";
import { ApiError, api } from "@/frontend/account/api";
import { normalizeName, type Crop } from "@/shared/crop";

export type LibraryState = { q?: string; state: "idle" | "loading" | "done" | "error"; results: Crop[]; error?: ApiError };

export function useLibrarySearch(q: string, known: Crop[]): LibraryState {
  const [result, setResult] = useState<LibraryState>({ q: "", state: "idle", results: [] });
  const query = normalizeName(q).length >= 2 ? q : "";
  useEffect(() => {
    if (!query) return undefined;
    const controller = new AbortController();
    api<{ results: Crop[] }>(`/api/plants/?q=${encodeURIComponent(query)}`, { signal: controller.signal, timeout: 8000 })
      .then((r) => setResult({ q: query, state: "done", results: r.results.filter((c) => !known.some((s) => s.id === c.id)) }))
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.code === "cancelled") return;
        setResult({ q: query, state: "error", results: [], error: err instanceof ApiError ? err : new ApiError(0, "error", "Something went wrong") });
      });
    return () => controller.abort();
  }, [query, known]);
  if (!query) return { state: "idle", results: [] };
  return result.q === query ? result : { state: "loading", results: [] };
}
