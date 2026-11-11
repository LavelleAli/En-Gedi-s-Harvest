// @ts-check
// Downloads free-license photos from Wikimedia Commons into public/photos
// and records title, author and license for each one in frontend/data/photos.json.
//
//   npm run photos                 fetch every slot that doesn't have a photo yet
//   npm run photos -- --force      re-pick every slot
//   npm run photos -- sym-spots    re-pick just the slots you name
//
// Edit frontend/data/photo-queries.json to change a search, or pin an exact Commons file.
// Needs Node 18+ (built-in fetch) and an internet connection; the app works offline afterward.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const QUERIES = path.join(root, "frontend", "data", "photo-queries.json");
const OUT_JSON = path.join(root, "frontend", "data", "photos.json");
const OUT_DIR = path.join(root, "public", "photos");
const API = "https://commons.wikimedia.org/w/api.php";
const UA = "FultonHomesteadBook/1.0 (private personal gardening app)";
const WIDTH = 1000;

// Commons only hosts free licenses, but check anyway and skip anything non-commercial or no-derivatives.
const FREE = /(cc0|public domain|^pd|cc[ -]?by|attribution|gfdl|no restrictions)/i;
const NOT_FREE = /(\bnc\b|non-?commercial|\bnd\b|no-?deriv)/i;

// Only keep https links from Wikimedia/Creative Commons domains, since they end up in href/src.
/** @param {string} u @param {string[]} hosts */
const safeUrl = (u, hosts) => {
  try {
    const url = new URL(u);
    return url.protocol === "https:" && hosts.some((h) => url.hostname === h || url.hostname.endsWith("." + h)) ? url.href : "";
  } catch {
    return "";
  }
};
const MEDIA_HOSTS = ["wikimedia.org", "wikipedia.org"];
const LICENSE_HOSTS = ["creativecommons.org", "wikimedia.org", "wikipedia.org", "gnu.org"];

/** @param {number} ms */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const stripHtml = (s = "") => s.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

/** @param {Record<string, string>} params @returns {Promise<any>} Wikimedia's JSON answer */
async function api(params) {
  const url = new URL(API);
  for (const [k, v] of Object.entries({ format: "json", origin: "*", ...params })) url.searchParams.set(k, v);
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`Commons API ${res.status}`);
  return res.json();
}

const INFO = { prop: "imageinfo", iiprop: "url|extmetadata|mime|size", iiurlwidth: String(WIDTH) };

/** @param {any} page one page from Wikimedia's answer */
function usable(page) {
  const ii = page?.imageinfo?.[0];
  if (!ii || !/^image\/(jpeg|png|webp)$/.test(ii.mime)) return null;
  if (ii.width < 500) return null;
  const meta = ii.extmetadata || {};
  const license = stripHtml(meta.LicenseShortName?.value || "");
  if (!FREE.test(license) || NOT_FREE.test(license)) return null;
  if (!safeUrl(ii.thumburl || ii.url, MEDIA_HOSTS)) return null;
  return {
    title: page.title,
    url: safeUrl(ii.thumburl || ii.url, MEDIA_HOSTS),
    mime: ii.mime,
    artist: stripHtml(meta.Artist?.value || "Unknown author"),
    license,
    licenseUrl: safeUrl(meta.LicenseUrl?.value || "", LICENSE_HOSTS),
    source: safeUrl(ii.descriptionurl, MEDIA_HOSTS),
  };
}

/** @param {string} slot @param {{ query?: string, file?: string }} spec */
async function pick(slot, spec) {
  if (spec.file) {
    const data = await api({ action: "query", titles: spec.file, ...INFO });
    const page = Object.values(data.query?.pages || {})[0];
    const hit = usable(page);
    if (hit) return hit;
    console.warn(`  ! pinned file not usable for ${slot}, falling back to search`);
  }
  const data = await api({
    action: "query",
    generator: "search",
    gsrsearch: `${spec.query} filetype:bitmap`,
    gsrnamespace: "6",
    gsrlimit: "10",
    ...INFO,
  });
  const pages = Object.values(data.query?.pages || {}).sort((a, b) => a.index - b.index);
  for (const p of pages) {
    const hit = usable(p);
    if (hit) return hit;
  }
  return null;
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const only = args.filter((a) => !a.startsWith("--"));

  const queries = JSON.parse(await readFile(QUERIES, "utf8"));
  const photos = existsSync(OUT_JSON) ? JSON.parse(await readFile(OUT_JSON, "utf8")) : {};
  await mkdir(OUT_DIR, { recursive: true });

  const slots = Object.keys(queries).filter((k) => !k.startsWith("_") && (only.length ? only.includes(k) : true));
  let got = 0, skipped = 0, missed = [];

  for (const slot of slots) {
    if (!force && !only.length && photos[slot] && existsSync(path.join(root, "public", photos[slot].file))) {
      skipped++;
      continue;
    }
    process.stdout.write(`${slot} … `);
    try {
      const hit = await pick(slot, queries[slot]);
      if (!hit) { console.log("no free photo found"); missed.push(slot); continue; }
      const ext = hit.mime === "image/png" ? "png" : hit.mime === "image/webp" ? "webp" : "jpg";
      const res = await fetch(hit.url, { headers: { "User-Agent": UA } });
      if (!res.ok) throw new Error(`download ${res.status}`);
      await writeFile(path.join(OUT_DIR, `${slot}.${ext}`), Buffer.from(await res.arrayBuffer()));
      photos[slot] = {
        file: `/photos/${slot}.${ext}`,
        title: hit.title.replace(/^File:/, ""),
        artist: hit.artist,
        license: hit.license,
        licenseUrl: hit.licenseUrl,
        source: hit.source,
        query: queries[slot].file || queries[slot].query,
      };
      await writeFile(OUT_JSON, JSON.stringify(photos, null, 2) + "\n");
      console.log(`ok (${hit.license})`);
      got++;
    } catch (err) {
      console.log(`failed: ${err instanceof Error ? err.message : err}`);
      missed.push(slot);
    }
    await sleep(400); // be polite to Wikimedia's servers
  }

  console.log(`\nDone. ${got} downloaded, ${skipped} already had photos, ${missed.length} missing.`);
  if (missed.length) console.log("Missing (drawn illustrations will show instead):", missed.join(", "));
  console.log("Review every photo at /credits/ and pin a better file in frontend/data/photo-queries.json if one is off.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
