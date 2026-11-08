"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { PLANTS, TYPE } from "@/lib/plants";
import { SYM } from "@/lib/art";
import { OK_SLOT } from "@/lib/healthy";
import { slug } from "@/lib/slug";
import Photo, { Hero, getPhoto } from "@/components/Photo";

const FILTERS = [
  ["all", "All"],
  ["fruit", "Fruits"],
  ["veg", "Vegetables"],
  ["herb", "Herbs"],
  ["star", "★ My garden"],
];

// Starred plants live in localStorage; this hook keeps every card in sync with it.
const STAR_KEY = "fhb-stars";
const STAR_EVENT = "fhb-stars-change";

function readStars() {
  try {
    return localStorage.getItem(STAR_KEY) || "{}";
  } catch {
    return "{}";
  }
}

function subscribeStars(callback) {
  window.addEventListener("storage", callback);
  window.addEventListener(STAR_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(STAR_EVENT, callback);
  };
}

function useStars() {
  const raw = useSyncExternalStore(subscribeStars, readStars, () => "{}");
  const stars = useMemo(() => {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }, [raw]);
  const toggle = (name) => {
    const next = { ...stars };
    if (next[name]) delete next[name];
    else next[name] = true;
    try {
      localStorage.setItem(STAR_KEY, JSON.stringify(next));
    } catch {}
    window.dispatchEvent(new Event(STAR_EVENT));
  };
  return [stars, toggle];
}

function MiniArt({ slot, art }) {
  return (
    <span className="art">
      <Photo slot={slot} alt="" fallback={art} credit={false} />
    </span>
  );
}

function PlantCard({ p, starred, onStar, forceOpen }) {
  const s = slug(p.n);
  const photo = getPhoto(`plant-${s}`);
  return (
    <details className="plant" id={`plant-${s}`} open={forceOpen || undefined}>
      <summary>
        <span className="thumb" aria-hidden="true">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo.file} alt="" loading="lazy" width="56" height="56" />
          ) : (
            <span className={`swatch sw-${p.t}`} />
          )}
        </span>
        <span>
          <span className="pname">{p.n}</span>
          <br />
          <span className="pmeta">{TYPE[p.t]} · {p.s}</span>
        </span>
        <button
          className="star noprint"
          type="button"
          aria-label={`Star ${p.n}`}
          aria-pressed={!!starred}
          onClick={(e) => {
            e.preventDefault();
            onStar(p.n);
          }}
        >
          ★
        </button>
      </summary>
      <div className="pbody">
        <Hero slot={`plant-${s}`} alt={p.n} />
        <div className="grid2">
          <div className="sub" style={{ gap: 8 }}>
            <h4>Nutrition</h4>
            <div className="chips">{p.nut.map((x) => <span className="chip y" key={x}>{x}</span>)}</div>
            <p>{p.ben}</p>
          </div>
          <div className="sub" style={{ gap: 8 }}>
            <h4>Care guide</h4>
            <dl className="kv">
              <dt>Sun</dt><dd>{p.care[0]}</dd>
              <dt>Water</dt><dd>{p.care[1]}</dd>
              <dt>Soil</dt><dd>{p.care[2]}</dd>
              <dt>Feed</dt><dd>{p.care[3]}</dd>
              <dt>Spacing</dt><dd>{p.care[4]}</dd>
            </dl>
          </div>
        </div>
        <div className="callout g">
          <strong>Healthy looks like</strong>
          <p>{p.ok}</p>
        </div>
        <div className="sub" style={{ gap: 8 }}>
          <h4>Watch for</h4>
          {p.pr.map(([key, note]) => {
            const sym = SYM[key];
            return (
              <div className="prob" key={key}>
                <div className="pair">
                  <div><MiniArt slot={OK_SLOT[sym.ok]} art={sym.ok} /><div className="lbl">healthy</div></div>
                  <div><MiniArt slot={`sym-${key}`} art={key} /><div className="lbl">problem</div></div>
                </div>
                <div>
                  <b><Link href={`/plant-doctor/#sym-${key}`}>{sym.t}</Link></b>
                  <br />
                  <span className="pmeta">{note}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="grid2">
          <div><h4>Good companions</h4><p>{p.good}</p></div>
          <div><h4 style={{ color: "var(--red)" }}>Keep apart</h4><p>{p.bad}</p></div>
        </div>
      </div>
    </details>
  );
}

export default function PlantsSection({ printAll = false }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [stars, toggle] = useStars();

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return PLANTS.filter((p) => {
      if (filter === "star" ? !stars[p.n] : filter !== "all" && filter !== p.t) return false;
      if (!needle) return true;
      const text = [p.n, ...p.nut, p.ben, p.good, ...p.pr.map(([k, n]) => SYM[k].t + " " + n)].join(" ").toLowerCase();
      return text.includes(needle);
    });
  }, [q, filter, stars]);

  return (
    <section className="view">
      <div>
        <div className="kicker">Fruits · vegetables · herbs</div>
        <h2>Plant index</h2>
      </div>
      <p className="lead">
        Every plant in this book with its nutrition highlights, a care guide, what healthy looks like, problems to watch for, and good
        neighbors. Tap a plant to open it. Star the ones you grow.
      </p>
      <div className="toolbar">
        <input type="search" id="psearch" placeholder="Search plants, nutrients, problems" aria-label="Search plants" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="chips" role="group" aria-label="Filter">
          {FILTERS.map(([key, label]) => (
            <button key={key} className="chip" type="button" aria-pressed={filter === key} onClick={() => setFilter(key)}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <p className="pmeta noprint" aria-live="polite">
        {shown.length} of {PLANTS.length} plants
        {filter === "star" && shown.length === 0 ? " · star plants to build your garden list" : ""}
      </p>
      <div className="plist">
        {shown.map((p) => (
          <PlantCard key={p.n} p={p} starred={stars[p.n]} onStar={toggle} forceOpen={printAll} />
        ))}
      </div>
      <div className="callout g">
        <strong>About companion planting</strong>
        <p>
          Companion suggestions come from long-standing gardening practice. Some pairings have research behind them (flowers that draw
          beneficial insects, tall crops shading lettuce in summer); many are tradition. Treat them as good habits, not guarantees.
        </p>
      </div>
      <div className="callout y">
        <strong>About nutrition</strong>
        <p>
          Highlights name the nutrients each food is known as a good source of. Amounts vary by variety and cooking. For exact numbers, look
          the food up in <a href="https://fdc.nal.usda.gov/" target="_blank" rel="noopener noreferrer">USDA FoodData Central</a>.
        </p>
      </div>
    </section>
  );
}
