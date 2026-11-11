// Plant lookups, cheapest source first:
//   1. the stock catalog (built into the app)       free, instant
//   2. the shared plant library in Firestore         free, instant
//   3. new research with Claude and web search       counts against the free monthly allowance
// Dependencies are passed in so the rules can be tested without Firebase or the Claude API.
import { z } from "zod";
import { HttpError, log, parseOr400 } from "@/backend/http";
import { CATALOG } from "@/shared/catalog";
import { findCrop, normalizeName } from "@/shared/crop";
import { isZone } from "@/shared/zones";

const plantName = z
  .string()
  .trim()
  .min(2, "Enter at least 2 letters")
  .max(60, "Keep it under 60 characters")
  .regex(/^[\p{L}\p{N} '’().,×-]+$/u, "Use letters, numbers, spaces and simple punctuation");

export const LookupInput = z.object({ name: plantName, zone: z.string().refine(isZone, "Pick a USDA zone from 1a to 13b") }).strict();
export const SearchInput = z.object({ q: plantName });

export const monthKey = (date) => date.toISOString().slice(0, 7); // "2026-11"

export function createPlantService({ library, accounts, research, freeLimit, now = () => new Date() }) {
  return {
    // Library matches for the search box (the stock catalog is searched in the browser).
    async search(rawQuery) {
      const { q } = parseOr400(SearchInput, { q: rawQuery });
      return library.search(q);
    },

    async lookup(uid, body) {
      const { name, zone } = parseOr400(LookupInput, body);

      const stock = findCrop(name, CATALOG);
      if (stock) return { crop: stock, source: "stock", charged: false };

      const saved = await library.findByName(name, zone);
      if (saved) return { crop: saved, source: "library", charged: false };

      const month = monthKey(now());
      const usage = await accounts.reserveLookup(uid, month, freeLimit);
      let result;
      try {
        result = await research(name, zone);
      } catch (err) {
        await accounts.refundLookup(uid, month);
        throw err;
      }
      if (!result.found) {
        await accounts.refundLookup(uid, month);
        throw new HttpError(404, "not-a-plant", `We couldn't find a garden plant called "${name}"`, "Check the spelling or try its common name. Your lookup wasn't counted.");
      }

      // Claude may return a different common name ("pole bean" -> "Green beans"); keep both as keys.
      const crop = result.crop;
      const existing = findCrop(crop.name, CATALOG);
      if (existing) return { crop: existing, source: "stock", charged: true, usage };
      await library.save(crop, zone, [name]);
      log("info", "plant researched", { cropId: crop.id, zone, model: result.model, inTokens: result.usage?.input_tokens, outTokens: result.usage?.output_tokens });
      return { crop, source: "research", charged: true, usage, query: normalizeName(name) };
    },
  };
}
