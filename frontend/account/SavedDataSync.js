"use client";

// While someone is signed in, keeps the keys in shared/saved-data.js the same on all their devices.
// The existing stores (stars, gear, to-dos, planner) keep reading and writing localStorage exactly as
// before; this component only copies values between localStorage and the server (/api/saved/).
//
// When it runs:
//   - right after sign-in, and whenever the tab comes back into view: fetch the server's copy
//   - when a store fires its change event: send that change about a second later
// It renders nothing.
import { useEffect } from "react";
import { useAuth } from "@/frontend/account/auth";
import { api } from "@/frontend/account/api";
import { resolve } from "@/frontend/account/sync";
import { SYNCED, SYNCED_KEYS } from "@/shared/saved-data";

// This device's sync bookkeeping, per account: { [uid]: { [key]: { syncedAt, value } } }.
// value is the last copy known to match the server, so we can tell when a key changed locally.
const META_KEY = "fhb-sync-meta";
const PUSH_DELAY_MS = 1200; // wait for a burst of ticks to finish before sending
const PULL_GAP_MS = 30_000; // don't re-fetch more often than this when switching tabs

function readKey(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function loadMeta(uid) {
  try {
    return JSON.parse(localStorage.getItem(META_KEY) || "{}")[uid] || {};
  } catch {
    return {};
  }
}

function saveMeta(uid, meta) {
  try {
    const all = JSON.parse(localStorage.getItem(META_KEY) || "{}");
    all[uid] = meta;
    localStorage.setItem(META_KEY, JSON.stringify(all));
  } catch {}
}

export default function SavedDataSync() {
  const { status, user } = useAuth();
  const uid = status === "signed-in" ? user?.uid : null;

  useEffect(() => {
    if (!uid) return;
    const meta = loadMeta(uid);
    let stopped = false; // set when signed out, or when the server isn't available (offline copy)
    let pushTimer = null;
    let lastPull = 0;

    // Take a value from the server: store it, remember it, and tell its store to redraw.
    function apply(key, item) {
      meta[key] = { syncedAt: item.updatedAt, value: item.value };
      saveMeta(uid, meta);
      try {
        localStorage.setItem(key, item.value);
      } catch {}
      window.dispatchEvent(new Event(SYNCED[key]));
    }

    // Send one value. If the server already had something newer, take that instead.
    async function push(key, value) {
      const updatedAt = Date.now();
      try {
        const { saved, item } = await api("/api/saved/", { method: "PUT", auth: true, body: { key, value, updatedAt } });
        if (saved) {
          meta[key] = { syncedAt: updatedAt, value };
          saveMeta(uid, meta);
        } else {
          apply(key, item);
        }
      } catch (err) {
        if (err.code === "offline" || err.code === "not-configured") stopped = true;
      }
    }

    async function pull() {
      if (stopped || Date.now() - lastPull < PULL_GAP_MS) return;
      lastPull = Date.now();
      let items;
      try {
        ({ items } = await api("/api/saved/", { auth: true }));
      } catch (err) {
        // The offline copy and servers without Firebase have no sync; stay quiet and stop trying.
        if (err.code === "offline" || err.code === "not-configured") stopped = true;
        return;
      }
      for (const key of SYNCED_KEYS) {
        const local = { value: readKey(key), syncedAt: meta[key]?.syncedAt || 0 };
        const step = resolve(key, local, items[key] || null);
        if (step.action === "pull") apply(key, { value: step.value, updatedAt: items[key].updatedAt });
        if (step.action === "push") await push(key, step.value);
      }
    }

    // A store changed something: after a short pause, send every key that differs from its last sync.
    function onLocalChange() {
      if (stopped) return;
      clearTimeout(pushTimer);
      pushTimer = setTimeout(() => {
        for (const key of SYNCED_KEYS) {
          const value = readKey(key);
          if (value != null && value !== meta[key]?.value) push(key, value);
        }
      }, PUSH_DELAY_MS);
    }

    function onVisible() {
      if (document.visibilityState === "visible") pull();
    }

    pull();
    const events = [...new Set(Object.values(SYNCED))];
    events.forEach((e) => window.addEventListener(e, onLocalChange));
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stopped = true;
      clearTimeout(pushTimer);
      events.forEach((e) => window.removeEventListener(e, onLocalChange));
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [uid]);

  return null;
}
