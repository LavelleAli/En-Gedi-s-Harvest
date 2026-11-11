// Decides what to do when this device's copy of a saved key and the server's copy differ.
// Pure function (no storage, no network) so the rules are easy to read and unit-test.
//
//   local:  { value: string | null, syncedAt: number }   syncedAt 0 = never synced on this device
//   remote: { value: string, updatedAt: number } | null   null = the server has nothing yet
//
// Returns { action: "none" | "push" | "pull", value }:
//   push = send this device's value to the server, pull = take the server's value.

// Checklist-style data ({ "item": true }) can be merged; a garden plan can't, so one copy wins.
const MERGEABLE = new Set(["fhb-stars", "fhb-gear", "fhb-todo"]);

function parseMap(raw) {
  try {
    const v = JSON.parse(raw);
    return v && typeof v === "object" && !Array.isArray(v) ? v : {};
  } catch {
    return {};
  }
}

export function resolve(key, local, remote) {
  const hasLocal = local.value != null && local.value !== "";

  // Nothing on the server yet: upload whatever this device has.
  if (!remote) return hasLocal ? { action: "push", value: local.value } : { action: "none" };
  if (remote.value === local.value) return { action: "none" };

  // First sync on this device, and both sides have data (for example, ticks made before signing in).
  if (!local.syncedAt && hasLocal) {
    if (MERGEABLE.has(key)) {
      // Keep every tick from both sides.
      const merged = JSON.stringify({ ...parseMap(remote.value), ...parseMap(local.value) });
      return merged === remote.value ? { action: "pull", value: merged } : { action: "push", value: merged };
    }
    // For the garden plan, the copy already saved to the account wins.
    return { action: "pull", value: remote.value };
  }

  // Changed on another device since this one last synced: take that change.
  if (remote.updatedAt > local.syncedAt) return { action: "pull", value: remote.value };
  // Otherwise this device made the latest change.
  return hasLocal ? { action: "push", value: local.value } : { action: "none" };
}
