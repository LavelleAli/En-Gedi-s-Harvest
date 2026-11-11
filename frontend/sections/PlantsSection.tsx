"use client";

// The plant encyclopedia: every plant A to Z as an article, with a facts box, growing notes,
// planting dates for the reader's zone, what a healthy plant looks like, problems and companions.
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { PLANTS, TYPE, type Plant } from "@/frontend/data/plants";
import { SYM } from "@/frontend/data/art";
import { OK_SLOT } from "@/frontend/data/healthy";
import { slug } from "@/shared/slug";
import { CATALOG } from "@/shared/catalog";
import { FLOWER_GROUPS, FLOWER_GROUP_LABEL, KIND_LABEL, METHOD_LABEL, findCrop, suitsZone, zoneRangeText, type Crop, type FlowerGroup, type Life } from "@/shared/crop";
import { plantingWindows, seasonFit, windowText } from "@/shared/planting";
import { zoneNumber } from "@/shared/zones";
import { useLocation } from "@/frontend/lib/location";
import Photo, { getPhoto } from "@/frontend/components/Photo";
import Reveal from "@/frontend/components/Reveal";

const FILTERS = [
  ["all", "All"],
  ["fruit", "Fruits"],
  ["veg", "Vegetables"],
  ["herb", "Herbs"],
  ["flower", "Roses & flowers"],
  ["zone", "Grows in my zone"],
  ["star", "★ My garden"],
];
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const FLOWER_ONE: Record<FlowerGroup, string> = { rose: "Rose", peony: "Peony", camellia: "Camellia", companion: "Flowering companion" };
const LIFE: Record<Life, string> = { annual: "Annual", biennial: "Biennial", perennial: "Perennial" };

// Starred plants live in localStorage; this hook keeps every entry in sync with it.
const STAR_KEY = "fhb-stars";
const STAR_EVENT = "fhb-stars-change";
function readStars() {
  try {
    return localStorage.getItem(STAR_KEY) || "{}";
  } catch {
    return "{}";
  }
}
function subscribeStars(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(STAR_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(STAR_EVENT, callback);
  };
}
function useStars() {
  const raw = useSyncExternalStore(subscribeStars, readStars, () => "{}");
  const stars = useMemo((): Record<string, true> => {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }, [raw]);
  const toggle = (name: string) => {
    const next = { ...stars };
    if (next[name]) delete next[name];
    else next[name] = true;
    try {
      localStorage.setItem(STAR_KEY, JSON.stringify(next));
    } catch {}
    window.dispatchEvent(new Event(STAR_EVENT));
  };
  return [stars, toggle] as const;
}

// One entry per catalog crop, joined with its long-form text from the book when it has one.
const collator = new Intl.Collator("en", { sensitivity: "base" });
/** One encyclopedia article: the catalog crop, its long-form book text if it has one, and where it sits A to Z. */
type Entry = { crop: Crop; book: Plant | null; title: string; id: string; letter: string };

const ENTRIES: Entry[] = CATALOG.map((crop) => {
  const book = crop.book ? (PLANTS.find((p) => p.n === crop.book) ?? null) : null;
  const title = crop.book || crop.name;
  return { crop, book, title, id: `plant-${slug(title)}`, letter: title[0].toUpperCase() };
}).sort((a, b) => collator.compare(a.title, b.title));

// "Basil, marigolds, carrots" -> links to entries for the names that have one.
// Pass `text` (a book list like "Basil, marigolds") or `names` (a catalog crop's ids or names).
function CompanionList({ text, names }: { text?: string; names?: string[] }) {
  const parts = text ? text.split(/,\s*|;\s*|\s+\+\s+/) : (names ?? []);
  return (
    <>
      {parts.map((part, i) => {
        const match = findCrop(part, CATALOG);
        const entry = match && ENTRIES.find((e) => e.crop.id === match.id);
        return (
          <span key={`${part}-${i}`}>
            {i > 0 && ", "}
            {entry ? <a href={`#${entry.id}`}>{part}</a> : part}
          </span>
        );
      })}
    </>
  );
}

function Infobox({ entry, zone }: { entry: Entry; zone: string }) {
  const { crop, book } = entry;
  const photo = getPhoto(`plant-${slug(entry.title)}`);
  const windows = plantingWindows(crop, zone);
  const fits = suitsZone(crop, zoneNumber(zone));
  const fl = crop.flower;
  return (
    <aside className="infobox" aria-label={`${entry.title} at a glance`}>
      {photo && (
        <figure className="infobox-photo">
          <Photo slot={`plant-${slug(entry.title)}`} alt={entry.title} />
        </figure>
      )}
      <dl>
        {crop.family && <><dt>Family</dt><dd><i>{crop.family}</i></dd></>}
        <dt>Type</dt><dd>{fl?.type || `${KIND_LABEL[crop.kind]}, ${LIFE[crop.life].toLowerCase()}`}</dd>
        {fl?.height && <><dt>Height</dt><dd>{fl.height}</dd></>}
        {fl?.color && <><dt>Color</dt><dd>{fl.color}</dd></>}
        {fl?.scent && <><dt>Scent</dt><dd>{fl.scent}</dd></>}
        <dt>Hardiness</dt><dd>{zoneRangeText(crop)}</dd>
        <dt>Sun</dt><dd>{book ? book.care[0] : fl?.sun || `${crop.sunHours}+ hours${crop.shadeOk ? "; tolerates part shade" : ""}`}</dd>
        <dt>Water</dt><dd>{book ? book.care[1] : `About ${crop.waterIn} in a week`}</dd>
        {book && <><dt>Soil</dt><dd>{book.care[2]}</dd></>}
        <dt>{fl ? "Space" : "Spacing"}</dt><dd>{book ? book.care[4] : fl?.space || `${crop.spacingIn} in apart`}</dd>
        {fl ? (
          <>
            <dt>Blooms</dt><dd>{fl.bloom || crop.firstHarvest}</dd>
            {fl.disease && <><dt>Disease</dt><dd>{fl.disease}</dd></>}
          </>
        ) : (
          <><dt>Harvest</dt><dd>{crop.days ? `${crop.days[0]}–${crop.days[1]} days from planting` : crop.firstHarvest}</dd></>
        )}
        <dt>Zone {zone}</dt>
        <dd>
          {!fits
            ? "Not a good fit outdoors; grow it in a pot or a protected spot."
            : windows.length
              ? windows.map((w) => `Plant in ${w.season}: ${windowText(w)}`).join(". ")
              : "Grow in a container you can move."}
        </dd>
      </dl>
    </aside>
  );
}

function EntryArticle({ entry, zone, starred, onStar }: { entry: Entry; zone: string; starred: boolean; onStar: (title: string) => void }) {
  const { crop, book, title, id } = entry;
  const fit = seasonFit(crop, zone);
  return (
    <article className="entry" id={id} aria-labelledby={`${id}-title`}>
      <header className="entry-head">
        <div>
          <h4 className="headword" id={`${id}-title`}>{title}</h4>
          <p className="entry-sub">
            {crop.botanical && <i>{crop.botanical}</i>}
            {crop.botanical && " · "}
            {book ? TYPE[book.t] : crop.flower ? FLOWER_ONE[crop.flower.group] : KIND_LABEL[crop.kind]} · {LIFE[crop.life]}
          </p>
        </div>
        <button className="star noprint" type="button" aria-label={`Star ${title}`} aria-pressed={!!starred} onClick={() => onStar(title)}>
          ★
        </button>
      </header>
      <Infobox entry={entry} zone={zone} />
      <div className="entry-body">
        <p className="entry-lead">
          {book ? book.ben : crop.summary}
          {book && <> A good source of {book.nut.slice(0, -1).join(", ")}{book.nut.length > 1 ? " and " : ""}{book.nut[book.nut.length - 1]}.</>}
        </p>
        <h5>Growing</h5>
        <p>
          {crop.how} {book && <>Feed: {book.care[3].charAt(0).toLowerCase() + book.care[3].slice(1)}.</>}
        </p>
        <p className="pmeta">
          {METHOD_LABEL[crop.method]}{crop.depthIn ? `, ${crop.depthIn} in deep` : ""}. {crop.bedNote}
          {!fit.ok && ` ${fit.note}`}
        </p>
        {crop.flower?.note && <p className="pmeta">{crop.flower.note}</p>}
        {book && (
          <>
            <h5>A healthy plant</h5>
            <p>{book.ok}</p>
            <h5>Problems</h5>
            <ul className="entry-problems">
              {book.pr.map(([key, note]) => {
                const sym = SYM[key];
                return (
                  <li key={key} className="prob">
                    <div className="pair" aria-hidden="true">
                      <span className="art"><Photo slot={OK_SLOT[sym.ok]} alt="" fallback={sym.ok} credit={false} /></span>
                      <span className="art"><Photo slot={`sym-${key}`} alt="" fallback={key} credit={false} /></span>
                    </div>
                    <div>
                      <b><Link href={`/plant-doctor/#sym-${key}`}>{sym.t}</Link></b>
                      <br />
                      <span className="pmeta">{note}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
        {crop.flower?.companions && (
          <>
            <h5>Companions</h5>
            <dl className="kv">
              <dt>Plant with</dt>
              <dd><CompanionList text={crop.flower.companions} /></dd>
            </dl>
          </>
        )}
        {crop.flower && crop.sources.length > 0 && (
          <>
            <h5>Sources</h5>
            <ul className="pmeta">
              {crop.sources.map((s) => (
                <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a></li>
              ))}
            </ul>
          </>
        )}
        {(book || crop.friends.length > 0 || crop.foes.length > 0) && (
          <>
            <h5>Companions</h5>
            <dl className="kv">
              <dt>Grows well with</dt>
              <dd>{book ? <CompanionList text={book.good} /> : crop.friends.length ? <CompanionList names={crop.friends} /> : "No strong pairings"}</dd>
              <dt>Keep apart from</dt>
              <dd>{book ? <CompanionList text={book.bad} /> : crop.foes.length ? <CompanionList names={crop.foes} /> : "Nothing major"}</dd>
            </dl>
          </>
        )}
      </div>
    </article>
  );
}

export default function PlantsSection() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [group, setGroup] = useState<FlowerGroup | "all">("all");
  const [stars, toggle] = useStars();
  const location = useLocation();

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const zoneNum = zoneNumber(location.zone);
    return ENTRIES.filter(({ crop, book, title }) => {
      if (filter === "star" && !stars[title]) return false;
      if (filter === "zone" && !suitsZone(crop, zoneNum)) return false;
      if (["fruit", "veg", "herb", "flower"].includes(filter) && crop.kind !== filter) return false;
      if (filter === "flower" && group !== "all" && crop.flower?.group !== group) return false;
      if (!needle) return true;
      const fl = crop.flower;
      const text = [title, crop.name, crop.botanical, crop.family, crop.summary, crop.how, ...(fl ? [fl.type, fl.color, fl.scent, fl.bloom] : []), ...(book ? [...book.nut, book.ben, book.good, ...book.pr.map(([k, n]) => SYM[k].t + " " + n)] : [])]
        .join(" ")
        .toLowerCase();
      return text.includes(needle);
    });
  }, [q, filter, group, stars, location.zone]);

  const byLetter = useMemo(() => {
    const groups = new Map<string, Entry[]>();
    for (const e of shown) groups.set(e.letter, [...(groups.get(e.letter) || []), e]);
    return groups;
  }, [shown]);

  return (
    <section className="view encyclopedia">
      <div>
        <div className="kicker">Fruits · vegetables · herbs · flowers, A to Z</div>
        <h2>Plant encyclopedia</h2>
      </div>
      <p className="lead">
        {ENTRIES.length} plants for North American gardens. Each entry gives the plant&apos;s family and hardiness, how to grow it, when to
        plant in zone {location.zone}, what a healthy plant looks like, the problems to watch for, and its companions. Star the ones you grow.
      </p>
      <nav className="letter-index noprint" aria-label="Jump to a letter">
        {LETTERS.map((l) =>
          byLetter.has(l) ? <a key={l} href={`#letter-${l}`}>{l}</a> : <span key={l} aria-hidden="true">{l}</span>,
        )}
      </nav>
      <div className="toolbar">
        <input type="search" id="psearch" placeholder="Search plants, nutrients, problems" aria-label="Search plants" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="chips" role="group" aria-label="Filter">
          {FILTERS.map(([key, label]) => (
            <button key={key} className="chip" type="button" aria-pressed={filter === key} onClick={() => setFilter(key)}>
              {key === "zone" ? `Grows in zone ${location.zone}` : label}
            </button>
          ))}
        </div>
        {filter === "flower" && (
          <div className="chips" role="group" aria-label="Kind of flower">
            {(["all", ...FLOWER_GROUPS] as const).map((key) => (
              <button key={key} className="chip" type="button" aria-pressed={group === key} onClick={() => setGroup(key)}>
                {key === "all" ? "All flowers" : FLOWER_GROUP_LABEL[key]}
              </button>
            ))}
          </div>
        )}
      </div>
      <p className="pmeta noprint" aria-live="polite">
        {shown.length} of {ENTRIES.length} plants
        {filter === "star" && shown.length === 0 ? " · star plants to build your garden list" : ""}
      </p>
      <Reveal className="entries" items=".entry" refresh={`${filter}|${group}|${q}`}>
        {[...byLetter.entries()].map(([letter, entries]) => (
          <section key={letter} className="letter-group" aria-labelledby={`letter-${letter}`}>
            <h3 className="letter" id={`letter-${letter}`}>{letter}</h3>
            {entries.map((entry) => (
              <EntryArticle key={entry.id} entry={entry} zone={location.zone} starred={!!stars[entry.title]} onStar={toggle} />
            ))}
          </section>
        ))}
      </Reveal>
      <div className="callout g">
        <strong>About companion planting</strong>
        <p>
          Companion suggestions come from long-standing gardening practice. Some pairings have research behind them (flowers that draw
          beneficial insects, tall crops shading lettuce in summer); many are tradition. Treat them as good habits, not guarantees.
        </p>
      </div>
      <div className="callout y">
        <strong>About nutrition and dates</strong>
        <p>
          Nutrition highlights name what each food is a good source of; amounts vary by variety and cooking. For exact numbers, look the
          food up in <a href="https://fdc.nal.usda.gov/" target="_blank" rel="noopener noreferrer">USDA FoodData Central</a>. Planting
          dates use average frost dates for your zone, so check your local forecast before setting out tender plants.
        </p>
      </div>
    </section>
  );
}
