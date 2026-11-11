"use client";

// "Add a crop that isn't listed": search the stock list and the shared library, research a new plant
// with Claude (signed-in users; free accounts get a few a month), or type one in by hand.
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ApiError, api } from "@/frontend/account/api";
import { useAuth } from "@/frontend/account/auth";
import { CropSchema, KINDS, KIND_LABEL, cropId, normalizeName, zoneRangeText } from "@/shared/crop";

function useDebounced(value, ms) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

function CropCard({ crop, onAdd, bedName }) {
  return (
    <div className="card stack-sm found-crop">
      <div>
        <h4>{crop.name}</h4>
        <p className="pmeta">{[crop.botanical, KIND_LABEL[crop.kind], zoneRangeText(crop)].filter(Boolean).join(" · ")}</p>
      </div>
      {crop.summary && <p>{crop.summary}</p>}
      <p className="pmeta">Sun {crop.sunHours} h · {crop.spacingIn} in apart · {crop.waterIn} in water a week{crop.days ? ` · ${crop.days[0]}–${crop.days[1]} days` : crop.firstHarvest ? ` · ${crop.firstHarvest}` : ""}</p>
      {crop.zoneNote && <p><b>In your zone:</b> {crop.zoneNote}</p>}
      {crop.sources?.length > 0 && (
        <p className="pmeta">Sources: {crop.sources.map((s, i) => (
          <span key={s.url}>{i ? ", " : ""}<a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a></span>
        ))}</p>
      )}
      <div><button type="button" className="btn-primary" onClick={() => onAdd(crop)}>Add to {bedName}</button></div>
    </div>
  );
}

const SEASON_WINDOWS = {
  cool: { spring: [-4, 2], fall: [-8, -4] },
  warm: { spring: [1, 6], fall: null },
  perennial: { spring: [-4, 2], fall: [-6, -2] },
};

function ManualForm({ initialName, onSave }) {
  const [f, setF] = useState({ name: initialName, kind: "veg", season: "warm", sunHours: 6, spacingIn: 12, heightFt: 2, waterIn: 1, daysMax: 70, zoneMin: 3, zoneMax: 11, how: "", friends: "", foes: "" });
  const [errors, setErrors] = useState([]);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === "number" ? Number(e.target.value) : e.target.value });
  const submit = (e) => {
    e.preventDefault();
    const list = (s) => s.split(",").map((x) => x.trim()).filter(Boolean).slice(0, 12);
    const result = CropSchema.safeParse({
      id: cropId(f.name) || "crop",
      name: f.name,
      kind: f.kind,
      life: f.season === "perennial" ? "perennial" : "annual",
      habit: f.heightFt >= 4 ? "tall" : f.heightFt < 0.7 ? "groundcover" : "bush",
      zones: [Math.min(f.zoneMin, f.zoneMax), Math.max(f.zoneMin, f.zoneMax)],
      season: f.season,
      sunHours: f.sunHours,
      shadeOk: f.sunHours <= 5,
      waterIn: f.waterIn,
      spacingIn: f.spacingIn,
      heightFt: f.heightFt,
      days: f.daysMax > 0 ? [Math.max(1, Math.round(f.daysMax * 0.8)), f.daysMax] : null,
      method: "transplant",
      depthIn: 0.25,
      ...SEASON_WINDOWS[f.season],
      how: f.how || "Plant at the spacing shown and keep evenly watered until established.",
      bed: "either",
      friends: list(f.friends),
      foes: list(f.foes),
      origin: "custom",
    });
    if (!result.success) {
      setErrors(result.error.issues.map((i) => `${i.path.join(".") || "Form"}: ${i.message}`));
      return;
    }
    setErrors([]);
    onSave(result.data);
  };
  const num = (k, label, min, max, step = 1) => (
    <div className="field">
      <label htmlFor={`m-${k}`}>{label}</label>
      <input id={`m-${k}`} type="number" inputMode="decimal" required min={min} max={max} step={step} value={f[k]} onChange={set(k)} />
    </div>
  );
  return (
    <form className="stack" onSubmit={submit}>
      <div className="field">
        <label htmlFor="m-name">Plant name</label>
        <input id="m-name" type="text" required minLength={2} maxLength={60} value={f.name} onChange={set("name")} />
      </div>
      <div className="two-col">
        <div className="field">
          <label htmlFor="m-kind">Type</label>
          <select id="m-kind" value={f.kind} onChange={set("kind")}>{KINDS.map((k) => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}</select>
        </div>
        <div className="field">
          <label htmlFor="m-season">Season</label>
          <select id="m-season" value={f.season} onChange={set("season")}>
            <option value="cool">Cool season (spring and fall)</option>
            <option value="warm">Warm season (after frost)</option>
            <option value="perennial">Perennial</option>
          </select>
        </div>
        {num("sunHours", "Sun it needs (hours)", 0, 14, 0.5)}
        {num("spacingIn", "Spacing (inches)", 1, 480)}
        {num("heightFt", "Height (feet)", 0.1, 80, 0.1)}
        {num("waterIn", "Water (inches a week)", 0, 4, 0.25)}
        {num("daysMax", "Days to harvest (0 if a year+)", 0, 400)}
        {num("zoneMin", "Coldest zone", 1, 13)}
        {num("zoneMax", "Warmest zone", 1, 13)}
      </div>
      <div className="field">
        <label htmlFor="m-how">Planting notes <span className="optional">(optional)</span></label>
        <textarea id="m-how" rows={3} maxLength={500} value={f.how} onChange={set("how")} />
      </div>
      <div className="two-col">
        <div className="field">
          <label htmlFor="m-friends">Good companions <span className="optional">(comma-separated)</span></label>
          <input id="m-friends" type="text" maxLength={300} value={f.friends} onChange={set("friends")} />
        </div>
        <div className="field">
          <label htmlFor="m-foes">Keep apart from <span className="optional">(comma-separated)</span></label>
          <input id="m-foes" type="text" maxLength={300} value={f.foes} onChange={set("foes")} />
        </div>
      </div>
      {errors.length > 0 && (
        <div className="callout" role="alert"><strong>Check these fields</strong><ul>{errors.map((e) => <li key={e}>{e}</li>)}</ul></div>
      )}
      <div><button type="submit" className="btn-primary">Save crop</button></div>
    </form>
  );
}

export default function AddCropDialog({ open, bedName, zone, crops, onClose, onAdd }) {
  const ref = useRef(null);
  const { status } = useAuth();
  const [query, setQuery] = useState("");
  const [libraryResult, setLibrary] = useState({ q: "", state: "idle", results: [] });
  const [research, setResearch] = useState({ state: "idle" });
  const [manual, setManual] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const researchAbort = useRef(null);
  const q = useDebounced(query.trim(), 300);

  useEffect(() => {
    const d = ref.current;
    if (open && !d.open) d.showModal();
    else if (!open && d.open) d.close();
  }, [open]);
  const resetAndClose = () => {
    researchAbort.current?.abort();
    setQuery("");
    setResearch({ state: "idle" });
    setManual(false);
    onClose();
  };

  // Stock crops matching the query, searched right here in the browser.
  const stockMatches = useMemo(() => {
    const key = normalizeName(q);
    if (key.length < 2) return [];
    return crops.filter((c) => normalizeName(c.name).includes(key) || (c.book && normalizeName(c.book).includes(key))).slice(0, 6);
  }, [q, crops]);

  // The shared library on the server; stale requests are cancelled. Results are tagged with their
  // query, so a result for an older query is never shown as the answer to a newer one.
  const libraryQuery = normalizeName(q).length >= 2 ? q : "";
  useEffect(() => {
    if (!libraryQuery) return undefined;
    const controller = new AbortController();
    api(`/api/plants/?q=${encodeURIComponent(libraryQuery)}`, { signal: controller.signal, timeout: 8000 })
      .then((r) => setLibrary({ q: libraryQuery, state: "done", results: r.results.filter((c) => !crops.some((s) => s.id === c.id)) }))
      .catch((err) => {
        if (err.code !== "cancelled") setLibrary({ q: libraryQuery, state: "error", results: [], error: err });
      });
    return () => controller.abort();
  }, [libraryQuery, crops]);
  const library = !libraryQuery ? { state: "idle", results: [] } : libraryResult.q === libraryQuery ? libraryResult : { state: "loading", results: [] };

  useEffect(() => {
    if (research.state !== "loading") return undefined;
    const started = Date.now();
    const t = setInterval(() => setElapsed(Math.round((Date.now() - started) / 1000)), 1000);
    return () => clearInterval(t);
  }, [research.state]);

  const runResearch = async () => {
    researchAbort.current?.abort();
    const controller = new AbortController();
    researchAbort.current = controller;
    setElapsed(0);
    setResearch({ state: "loading" });
    try {
      const r = await api("/api/plants/research/", { method: "POST", auth: true, body: { name: query.trim(), zone }, signal: controller.signal, timeout: 280000 });
      setResearch({ state: "done", ...r });
    } catch (err) {
      if (err.code === "cancelled") setResearch({ state: "idle" });
      else setResearch({ state: "error", error: err instanceof ApiError ? err : new ApiError(0, "error", "Something went wrong") });
    }
  };

  const nothingFound = q.length >= 2 && stockMatches.length === 0 && library.state === "done" && library.results.length === 0;
  const err = research.error;

  return (
    <dialog ref={ref} className="dialog dialog-wide" aria-labelledby="addcrop-title" onClose={resetAndClose}>
      <div className="stack">
        <div className="panel-head">
          <h2 id="addcrop-title">Add a crop to {bedName}</h2>
          <button type="button" className="link-button" onClick={() => ref.current.close()}>Close</button>
        </div>
        <div className="field">
          <label htmlFor="addcrop-q">Plant name</label>
          <input id="addcrop-q" type="search" autoComplete="off" enterKeyHint="search" maxLength={60} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tomatillo, ground cherry, sorrel…" aria-describedby="addcrop-hint" />
          <p className="hint" id="addcrop-hint">Searches the stock list and the shared library first. Both are free.</p>
        </div>

        {stockMatches.length > 0 && (
          <div className="stack-sm">
            <h3 className="small-head">On the stock list</h3>
            <div className="chips">{stockMatches.map((c) => <button key={c.id} type="button" className="chip" onClick={() => onAdd(c)}>+ {c.name}</button>)}</div>
          </div>
        )}
        {library.results.length > 0 && (
          <div className="stack-sm">
            <h3 className="small-head">In the shared library</h3>
            {library.results.map((c) => <CropCard key={c.id} crop={c} bedName={bedName} onAdd={onAdd} />)}
          </div>
        )}
        <p className="pmeta" role="status" aria-live="polite">
          {library.state === "loading" && "Searching the shared library…"}
          {library.state === "error" && library.error.code === "offline" && "The shared library needs the online version of the site."}
          {library.state === "error" && library.error.code !== "offline" && `Couldn't search the shared library: ${library.error.title}.`}
          {nothingFound && `No match for “${q}” yet.`}
        </p>

        {q.length >= 2 && (
          <div className="card stack-sm research-box">
            <h3 className="small-head">Research “{query.trim()}” with Claude</h3>
            <p className="pmeta">Claude searches extension services and seed companies and writes a growing guide for zone {zone}. It joins the shared library for everyone. Free accounts get 5 new plants a month; the Garden plan is unlimited.</p>
            {status === "disabled" && <p className="pmeta">Accounts aren&apos;t turned on for this copy of the site, so research isn&apos;t available. You can enter the plant by hand.</p>}
            {status === "signed-out" && <p><Link href="/account/">Sign in or create a free account</Link> to research plants.</p>}
            {status === "signed-in" && research.state !== "loading" && (
              <div><button type="button" className="btn-primary" onClick={runResearch}>Research it</button></div>
            )}
            {research.state === "loading" && (
              <div className="row-actions" role="status">
                <span className="spinner" aria-hidden="true" />
                <span>Searching and reading sources… {elapsed}s (usually under a minute)</span>
                <button type="button" onClick={() => researchAbort.current?.abort()}>Cancel</button>
              </div>
            )}
            {research.state === "error" && (
              <div className="callout" role="alert">
                <strong>{err.title}</strong>
                {err.detail && <p>{err.detail}</p>}
                {err.code === "quota-exceeded" && <p><Link href="/account/">Upgrade to the Garden plan</Link> for unlimited lookups.</p>}
                {err.code === "sign-in-required" && <p><Link href="/account/">Sign in</Link> and try again.</p>}
              </div>
            )}
            {research.state === "done" && (
              <>
                <p className="pmeta" role="status">
                  {research.source === "research" ? `Researched for zone ${zone}.` : "Already known, so this lookup was free."}
                  {research.usage?.limit ? ` You've used ${research.usage.used} of ${research.usage.limit} lookups this month.` : ""}
                </p>
                <CropCard crop={research.crop} bedName={bedName} onAdd={onAdd} />
              </>
            )}
          </div>
        )}

        <div className="stack-sm">
          {manual ? (
            <>
              <h3 className="small-head">Enter it by hand</h3>
              <ManualForm initialName={query.trim()} onSave={onAdd} />
            </>
          ) : (
            <button type="button" className="link-button" onClick={() => setManual(true)}>Or enter a plant by hand</button>
          )}
        </div>
      </div>
    </dialog>
  );
}
