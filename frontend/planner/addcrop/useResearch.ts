"use client";

// Researching a new plant with Claude through the server (signed-in readers; free accounts get a few a
// month). Counts the seconds while it works, can be cancelled, and resets when the window closes.
import { useEffect, useRef, useState } from "react";
import { ApiError, api } from "@/frontend/account/api";
import type { LookupResult } from "@/backend/plants/service"; // the research API's answer (type only)

export type ResearchState = { state: "idle" } | { state: "loading" } | { state: "error"; error: ApiError } | ({ state: "done" } & LookupResult);

export function useResearch(zone: string) {
  const [research, setResearch] = useState<ResearchState>({ state: "idle" });
  const [elapsed, setElapsed] = useState(0);
  const abort = useRef<AbortController | null>(null);

  // A seconds counter while it works.
  useEffect(() => {
    if (research.state !== "loading") return undefined;
    const started = Date.now();
    const t = setInterval(() => setElapsed(Math.round((Date.now() - started) / 1000)), 1000);
    return () => clearInterval(t);
  }, [research.state]);

  const run = async (name: string) => {
    abort.current?.abort();
    const controller = new AbortController();
    abort.current = controller;
    setElapsed(0);
    setResearch({ state: "loading" });
    try {
      // Research can take minutes (searching and reading sources), so the timeout is long.
      const r = await api<LookupResult>("/api/plants/research/", { method: "POST", auth: true, body: { name, zone }, signal: controller.signal, timeout: 280000 });
      setResearch({ state: "done", ...r });
    } catch (err) {
      if (err instanceof ApiError && err.code === "cancelled") setResearch({ state: "idle" });
      else setResearch({ state: "error", error: err instanceof ApiError ? err : new ApiError(0, "error", "Something went wrong") });
    }
  };

  const cancel = () => abort.current?.abort();
  const reset = () => {
    abort.current?.abort();
    setResearch({ state: "idle" });
  };

  return { research, elapsed, run, cancel, reset };
}
