"use client";

// The profile: who's signed in, where the garden is, and what's saved on this device (and whether
// it syncs). Works signed out too, since everything here also lives in this browser.
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/frontend/account/auth";
import { useLocation } from "@/frontend/lib/location";
import { SYNCED } from "@/shared/saved-data";

function count(key, pick) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? pick(JSON.parse(raw)) : 0;
  } catch {
    return 0;
  }
}

// How many things of each kind are saved in this browser.
function readSaved() {
  return [
    { label: "Starred plants", value: count("fhb-stars", (v) => Object.keys(v).length) },
    { label: "Gear checklist ticks", value: count("fhb-gear", (v) => Object.keys(v).length) },
    { label: "Monthly to-dos done", value: count("fhb-todo", (v) => Object.keys(v).length) },
    { label: "Garden beds planned", value: count("fhb-garden", (v) => (Array.isArray(v?.beds) ? v.beds.length : 0)) },
  ];
}

export default function ProfilePage() {
  const { status, user } = useAuth();
  const location = useLocation();
  const [saved, setSaved] = useState(null);

  // Re-count whenever a store (or sync) changes something.
  useEffect(() => {
    const refresh = () => setSaved(readSaved());
    refresh();
    const events = [...new Set(Object.values(SYNCED))];
    events.forEach((e) => window.addEventListener(e, refresh));
    return () => events.forEach((e) => window.removeEventListener(e, refresh));
  }, []);

  const signedIn = status === "signed-in";
  const exactCoords = location.source === "device" || location.source === "manual";

  return (
    <section className="view">
      <div>
        <div className="kicker">You</div>
        <h2>Profile</h2>
      </div>

      <div className="account-grid">
        <section className="card stack" aria-labelledby="who-title">
          <h3 id="who-title">{signedIn ? user.name || "Signed in" : "Not signed in"}</h3>
          {signedIn ? (
            <p>{user.email}</p>
          ) : (
            <p>
              {status === "disabled" ? "Accounts aren't turned on in this copy of the site." : "Sign in to keep your saved things on all your devices."}
            </p>
          )}
          <div className="row-actions">
            <Link className="btn" href="/account/">{signedIn ? "Account and plans" : "Sign in"}</Link>
          </div>
        </section>

        <section className="card stack" aria-labelledby="garden-title">
          <h3 id="garden-title">Your garden</h3>
          <dl className="kv">
            <dt>Place</dt>
            <dd>{location.place}</dd>
            <dt>Zone</dt>
            <dd>{location.zone}</dd>
            <dt>Sun angles</dt>
            <dd>{exactCoords ? "From your coordinates" : "Estimated from your area"}</dd>
          </dl>
          <p className="pmeta">Change it with the location button at the top of the page.</p>
        </section>
      </div>

      <section className="card stack" aria-labelledby="saved-title">
        <h3 id="saved-title">Saved on this device</h3>
        {saved ? (
          <dl className="kv">
            {saved.map((s) => (
              <div key={s.label} style={{ display: "contents" }}>
                <dt>{s.label}</dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="pmeta">Counting…</p>
        )}
        <p className="pmeta">
          {signedIn
            ? "These sync to your account and follow you to your other devices. Your location and light/dark setting stay on each device."
            : "These are saved only in this browser. Sign in to sync them to your other devices."}
        </p>
      </section>
    </section>
  );
}
