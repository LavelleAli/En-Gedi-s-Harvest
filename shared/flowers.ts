// Roses, peonies, camellias and their companion plants from the En Gedi rose garden list
// ("Rose Garden List with pics.pdf" in the Image Bank). Only the growing details are kept here; the
// garden plan columns (placement, decision, dates, verses, costs, stores) stay in the spreadsheet.
// Rows that only had a name were filled in from nursery and registry pages, listed in `sources`.
import { CropSchema, type Crop, type FlowerGroup } from "@/shared/crop";
import { slug } from "@/shared/slug";

/** The nursery details for one flower, as written in the sheet. */
type Details = Partial<Record<"type" | "height" | "color" | "sun" | "scent" | "space" | "bloom" | "disease" | "companions", string>>;
type Extra = { zones?: [number, number]; note?: string; sources?: { title: string; url: string }[] };

// Height in feet from text like "8–10 ft", "10ft", "28–32 in" or "up to 85 cm": the larger number of the first size given.
export function heightFeet(text: string): number | null {
  const m = /(\d+(?:\.\d+)?)(?:\s*[–-]\s*(\d+(?:\.\d+)?))?\s*(ft|in|cm|m)\b/.exec(text);
  if (!m) return null;
  const n = Number(m[2] ?? m[1]);
  const perFoot = { ft: 1, in: 12, cm: 30.48, m: 0.3048 }[m[3] as "ft" | "in" | "cm" | "m"];
  return Math.round((n / perFoot) * 10) / 10;
}

const ROSE_HOW = {
  climber:
    "Plant bare-root roses while dormant in late winter, or potted roses in spring or fall, with the graft union at soil level. Give it a sturdy arch, fence or trellis and tie the long canes out sideways; sideways canes flower more. Water deeply once a week the first year and mulch 2–3 in. Prune repeat bloomers in late winter; prune once-blooming ramblers right after they flower.",
  shrub:
    "Plant bare-root roses while dormant in late winter, or potted roses in spring or fall, with the graft union at soil level. Give it at least 6 hours of sun and room for air to move through the leaves, which keeps black spot down. Water deeply once a week the first year and mulch 2–3 in. Cut it back by about a third in late winter as the buds swell.",
};
const PEONY_HOW = {
  herbaceous:
    "Plant divisions in fall with the pink buds (eyes) 1–2 in deep; in the South set them only about 1 in deep so they get enough winter chill. Choose a sunny, well-drained spot, since peonies dislike being moved. Cut the stems to the ground in fall. Expect few flowers the first spring.",
  tree: "Plant in fall with the graft union 3–4 in below the soil, in well-drained, humus-rich soil. Don't cut it to the ground: it keeps a woody framework and needs little pruning.",
};

// Growing details that the sheet doesn't give, by kind of flower. The planner uses these for spacing, shade and planting dates.
function base(group: FlowerGroup, name: string, d: Details): Record<string, unknown> {
  const type = (d.type ?? "").toLowerCase();
  const height = heightFeet(d.height ?? "");
  const shadeOk = /part|shade/i.test(d.sun ?? "");
  if (group === "rose") {
    const climber = /climb|rambler|noisette/.test(type);
    const ground = /ground ?cover/.test(type);
    const mini = /miniature/.test(type);
    const heightFt = height ?? (climber ? 10 : mini ? 1.5 : 4);
    return {
      botanical: "Rosa", family: "Rosaceae", habit: climber ? "vine" : ground ? "groundcover" : "shrub", zones: [5, 9],
      sunHours: 6, shadeOk, waterIn: 1, heightFt, spacingIn: climber ? 96 : mini ? 18 : Math.min(72, Math.max(24, Math.round(heightFt * 9))),
      rootIn: 18, method: "bare-root", depthIn: 0, spring: [-6, 4], fall: [-8, -3], fallMinZone: 6, firstHarvest: "Blooms the first year",
      how: climber ? ROSE_HOW.climber : ROSE_HOW.shrub, bedNote: climber ? "Needs a fence, arch or trellis." : "",
    };
  }
  if (group === "peony") {
    const tree = /tree peony/.test(type);
    return {
      botanical: tree ? "Paeonia suffruticosa" : /itoh|intersectional/.test(type) ? "Paeonia × Itoh hybrid" : /lactiflora/.test(type) ? "Paeonia lactiflora" : "Paeonia hybrid",
      family: "Paeoniaceae", habit: tree ? "shrub" : "clump", zones: [3, 8], sunHours: 6, shadeOk, waterIn: 1, heightFt: height ?? 3,
      spacingIn: 36, rootIn: 18, method: tree ? "bare-root" : "division", depthIn: tree ? 4 : 1.5, spring: null, fall: [-8, -2],
      firstHarvest: "Blooms in year 2–3", how: tree ? PEONY_HOW.tree : PEONY_HOW.herbaceous,
    };
  }
  if (group === "camellia") {
    const sasanqua = /sasanqua/.test(type);
    return {
      botanical: sasanqua ? "Camellia sasanqua" : "Camellia japonica", family: "Theaceae", habit: "shrub", zones: sasanqua ? [7, 10] : [7, 9],
      sunHours: 4, shadeOk: true, waterIn: 1, heightFt: height ?? 6, spacingIn: Math.min(96, Math.max(36, Math.round((height ?? 6) * 12))), rootIn: 18,
      method: "container", depthIn: 0, spring: [-6, 2], fall: [-10, -2], fallMinZone: 7, firstHarvest: sasanqua ? "Blooms fall to winter" : "Blooms late winter to spring",
      how: "Plant in fall or late winter in acidic, well-drained soil, with the top of the root ball slightly above the ground. Morning sun and afternoon shade suit it best. Mulch, but keep the mulch off the trunk. Prune right after it flowers, before next year's buds form.",
    };
  }
  return COMPANIONS[name];
}

// The four companion plants in the sheet each need their own growing details.
const COMPANIONS: Record<string, Record<string, unknown>> = {
  "Lamb's ear": {
    botanical: "Stachys byzantina", family: "Lamiaceae", habit: "groundcover", zones: [4, 8], sunHours: 6, shadeOk: true, waterIn: 0.5, heightFt: 1.5,
    spacingIn: 18, rootIn: 8, method: "container", depthIn: 0, spring: [0, 6], fall: [-8, -4], fallMinZone: 6, firstHarvest: "Flower spikes in early summer",
    how: "Plant in lean, sharply drained soil; wet, heavy soil rots it. Water at the base, not over the fuzzy leaves, and pull off any leaves that turn mushy in humid weather.",
  },
  "Sweet alyssum": {
    botanical: "Lobularia maritima", family: "Brassicaceae", life: "annual", season: "cool", habit: "groundcover", zones: [2, 11], sunHours: 6, shadeOk: true,
    waterIn: 1, heightFt: 0.6, spacingIn: 8, rootIn: 6, method: "transplant", depthIn: 0, spring: [-2, 4], fall: [-10, -6], fallMinZone: 8,
    firstHarvest: "Blooms in 6–8 weeks", how: "Set out plants or sow seed on the surface; it needs light to sprout. Shear it back by half when it stops blooming in summer heat, and it blooms again in fall.",
  },
  "Kwanzan cherry": {
    botanical: "Prunus serrulata 'Kanzan'", family: "Rosaceae", habit: "tree", zones: [5, 8], sunHours: 6, shadeOk: false, waterIn: 1, heightFt: 25,
    spacingIn: 300, rootIn: 36, method: "container", depthIn: 0, spring: [-4, 2], fall: [-8, -2], firstHarvest: "Blooms in spring",
    how: "Plant with the root flare at or just above the soil and keep mulch and grass back from the trunk. It has no fruit; it is grown for its double pink spring flowers.",
  },
  "Lil' Kim Rose of Sharon": {
    botanical: "Hibiscus syriacus", family: "Malvaceae", habit: "shrub", zones: [5, 9], sunHours: 6, shadeOk: false, waterIn: 1, heightFt: 4,
    spacingIn: 48, rootIn: 18, method: "container", depthIn: 0, spring: [-2, 6], fall: [-8, -3], firstHarvest: "Blooms in summer",
    how: "Plant in sun in any well-drained soil. It leafs out late in spring, so don't give up on it. Prune in late winter if needed; it flowers on new growth.",
  },
};

const GROUP_KIND: Record<FlowerGroup, string> = { rose: "Rose", peony: "Peony", camellia: "Camellia", companion: "" };

function flower(group: FlowerGroup, name: string, details: Details, extra: Extra = {}): Crop {
  const b = base(group, name, details);
  const what = details.type || GROUP_KIND[group];
  const summary = [what, details.color, details.scent && details.scent !== "None" ? (/scent|fragran/i.test(details.scent) ? details.scent : `${details.scent} scent`) : ""].filter(Boolean).join(" · ");
  return CropSchema.parse({
    life: "perennial", season: "perennial", bed: "in-ground", bedNote: "", days: null, friends: [], foes: [], origin: "stock",
    ...b,
    id: `${group}-${slug(name)}`.slice(0, 60).replace(/-$/, ""),
    name,
    kind: "flower",
    zones: extra.zones ?? b.zones,
    summary: summary.slice(0, 320),
    sources: extra.sources ?? [],
    flower: { group, ...details, note: extra.note ?? "" },
  });
}

export const FLOWERS: Crop[] = [
  flower("rose", "A Shropshire Lad", { type: "Climber", height: "8–10 ft", color: "Soft peach-pink", sun: "Full sun/part shade", scent: "Strong fruity tea", space: "Vigorous", bloom: "Repeat", disease: "Average; watch black spot and mildew in humid summers", companions: "Lavender + catmint + white allium" }),
  flower("rose", "Alchemist", { type: "Shrub/climber", height: "10ft", color: "Varied apricot pink white", sun: "Full", scent: "Strong", bloom: "Once", companions: "Lavender + white alyssum" }),
  flower("rose", "Alister Stella Gray", { type: "Noisette climber", height: "15ft", color: "White Yellow", scent: "Medium", bloom: "Repeat", companions: "Blue salvia + thyme" }, { zones: [7, 10] }),
  flower("rose", "Amethyst Babylon", { type: "Shrub rose (Interplant, 2013)", height: "5–6.5 ft (150–200 cm)", color: "Lavender-purple with central blotch", sun: "Sun; ordinary shade tolerance per nursery", scent: "Very light tea scent", bloom: "Repeat flowering", disease: "Average powdery mildew and black spot resistance (nursery rating)" }, { sources: [{ title: "Reference from the sheet", url: "https://www.baranoie.com/shopdetail/000000006410/" }] }),
  flower("rose", "At Last", { type: "Shrub", height: "3ft", color: "apricot", sun: "Full", scent: "None", bloom: "Repeat/Summer", disease: "Strong", companions: "Catmint + white allium" }),
  flower("rose", "Ballerina", { type: "Hybrid Musk Shrub", height: "4ft", color: "White/Pink/yellow", sun: "partial/full", scent: "Light", bloom: "Continual single", disease: "Strong", companions: "Rosemary + dianthus" }),
  flower("rose", "Bathsheba", { type: "Climber", height: "10–12 ft", color: "Apricot-yellow", sun: "Full sun/part shade", scent: "Strong myrrh", space: "Vigorous", bloom: "Repeat", disease: "Good; provide airflow in humid summers", companions: "Blue salvia + lavender + white alyssum" }),
  flower("rose", "Blue Dress", { type: "shrub", color: "Pastel Blue", companions: "Yarrow + creeping thyme" }, { note: "Details for this name haven't been confirmed yet; only what the sheet and photo show is listed." }),
  flower("rose", "Blue Moonstone", { color: "Purple Blue", companions: "Coreopsis + sweet alyssum" }, { note: "Details for this name haven't been confirmed yet; only what the sheet and photo show is listed.", sources: [{ title: "HelpMeFind: Blue Moonstone", url: "https://helpmefind.com/rose/l.php?l=2.86187" }] }),
  flower("rose", "Boscobel", { type: "Shrub", height: "4 ft", color: "Salmon pink", sun: "Full sun", scent: "Strong myrrh", space: "Upright", bloom: "Repeat", disease: "Good to very good", companions: "Catmint + white allium + creeping thyme" }),
  flower("rose", "Bouquet Parfait", { type: "Hybrid musk shrub (Lens, 1989)", height: "4–5 ft", color: "White to soft pink, small pompon clusters", scent: "Light musk", bloom: "Repeat" }, { sources: [{ title: "RHS: Rosa Bouquet Parfait", url: "https://www.rhs.org.uk/plants/385098/rosa-bouquet-parfait-lenbofa-hm/details" }] }),
  flower("rose", "Buff Beauty", { type: "Hybrid Musk shrub; short climber in warm areas", height: "About 5–10 ft, depending on training", color: "Buff-apricot fading to primrose", sun: "Full sun or part shade; 4+ hours direct sun", scent: "Fragrant; tea rose scent", space: "Spreading; allow about 5 ft", bloom: "Repeat, summer into autumn", disease: "May get black spot and mildew; allow good airflow" }, { sources: [{ title: "Reference from the sheet", url: "https://www.rhs.org.uk/plants/93267/rosa-buff-beauty-hm/details" }] }),
  flower("rose", "Cathedral Bells", { type: "Shrub rose", color: "Medium pink, cupped", bloom: "Repeat", companions: "Coreopsis + sweet alyssum" }, { sources: [{ title: "Brighter Blooms: Cathedral Bells rose", url: "https://www.brighterblooms.com/products/cathedral-bells-rose" }] }),
  flower("rose", "Cecile Brunner", { type: "Rambler", height: "10-20ft", color: "Pink", sun: "partial/full", scent: "Light", space: "Vigorous", bloom: "Repeat", disease: "Strong", companions: "Lavender + ornamental allium" }, { zones: [6, 10] }),
  flower("rose", "Chandos Beauty", { type: "Hybrid tea (Harkness, 2005)", height: "3–4 ft", color: "Creamy apricot-peach", scent: "Strong", bloom: "Repeat" }, { sources: [{ title: "RHS: Rosa Chandos Beauty", url: "https://www.rhs.org.uk/plants/235499/rosa-chandos-beauty-harmisty-ht/details" }] }),
  flower("camellia", "Chansonette’s Blush", { type: "Evergreen sasanqua camellia", height: "2–3 ft", color: "Soft pink, double", sun: "Filtered sun to part shade", scent: "Light", space: "6–8 ft (wide spreading)", bloom: "Fall through winter", disease: "Good with drainage and airflow; watch tea scale, petal blight, and root rot", companions: "Japanese maple + pieris + ferns" }),
  flower("rose", "Chevy Chase", { type: "Rambler", height: "12-15 tall 6-8 wide", color: "Velvet Red", sun: "Shade tolerant", scent: "Moderate sweet", space: "Vigorous", bloom: "Once or twice", disease: "Strong" }),
  flower("rose", "Chicago Peace", { type: "Hybrid tea (sport of Peace, 1962)", height: "4–5 ft", color: "Pink with a yellow base", scent: "Light", bloom: "Repeat", disease: "Average; watch black spot", companions: "Lavender + white alyssum" }),
  flower("rose", "Commerce Peace", { companions: "Blue salvia + thyme" }, { note: "Details for this name haven't been confirmed yet; only what the sheet and photo show is listed." }),
  flower("rose", "Cosmic Clouds", { type: "Shrub or short climber (Weeks Roses)", color: "Deep Purple", scent: "Fragrant", bloom: "Repeat", companions: "Catmint + white allium" }, { sources: [{ title: "Weeks Roses: Cosmic Clouds", url: "https://www.weeksroses.com/varieties/p/cosmic-clouds" }] }),
  flower("rose", "Courage", { type: "Rose; type to confirm", height: "Around 4 ft (seller listing)", color: "Dark crimson red", sun: "Full sun", bloom: "Abundant clustered blooms; timing to confirm", disease: "Glossy, healthy foliage per seller; Georgia performance to confirm", companions: "White alyssum + lamb's ear" }, { note: "Several roses are sold as Courage; confirm the breeder before buying.", sources: [{ title: "Palmers: Courage rose", url: "https://www.palmers.co.nz/products/998037478" }] }),
  flower("rose", "Desdemona", { type: "Shrub", height: "4 ft", color: "White", sun: "Full sun/part shade", scent: "Strong", space: "Medium", bloom: "Repeat", disease: "Good", companions: "Yarrow + creeping thyme" }),
  flower("rose", "Dolly Parton", { type: "Hybrid tea", height: "4–6 ft", color: "Orange-red / coppery red; large double blooms, up to 6 in", sun: "Full sun (6+ hours)", scent: "Very strong; spicy rose fragrance", space: "About 2–3 ft wide; upright, bushy", bloom: "Repeat; spring through frost", disease: "Moderate / average; good airflow; monitor black spot in humid summers" }, { sources: [{ title: "Grace Rose Farm: Dolly Parton", url: "https://www.gracerosefarm.com/products/dolly-parton%E2%84%A2-potted-rose-bush" }, { title: "Witherspoon Rose Culture: Dolly Parton", url: "https://witherspoonrose.com/products/dolly-parton" }] }),
  flower("rose", "Don Juan", { type: "Climber", height: "9-10ft", color: "Dark Red", sun: "Full/Partial", scent: "Tea Fruity Strong", bloom: "Repeat", disease: "Moderate; watch black spot and mildew; provide good airflow", companions: "White salvia + chives" }),
  flower("rose", "Earth Angel", { type: "Floribunda (Kordes Parfuma)", height: "3–4 ft", color: "Light pink, very full and cupped", scent: "Strong", bloom: "Repeat", disease: "Good" }),
  flower("rose", "Ebb Tide", { type: "Floribunda", height: "Approx. 4 ft × 4 ft", color: "Smoked deep plum-purple", sun: "Full sun", scent: "Strong clove + citrus blossom", space: "Compact, rounded", bloom: "Repeat", disease: "Good; monitor black spot in humid conditions", companions: "Coreopsis + sweet alyssum" }),
  flower("rose", "Eden Climber — Pink", { type: "Climber", height: "10ft", color: "Pink", sun: "Full", scent: "Green Pepper Like", bloom: "Repeat", companions: "Lavender + ornamental allium" }),
  flower("rose", "Eden Climber — White", { type: "Climber", height: "10ft", color: "White", sun: "Full", scent: "Green Pepper Like", bloom: "Repeat", companions: "Lavender + white alyssum" }),
  flower("rose", "Emerald Isle", {  }, { note: "Details for this name haven't been confirmed yet; only what the sheet and photo show is listed." }),
  flower("rose", "English Perfume", { companions: "Blue salvia + thyme" }, { note: "Details for this name haven't been confirmed yet; only what the sheet and photo show is listed." }),
  flower("rose", "Erinnerung an Brod (Souvenir de Brod)", { type: "Rambler", height: "8–10 ft", color: "Deep velvety crimson-purple / wine-purple", sun: "Full sun/part shade", scent: "Strong fragrance", space: "Vigorous, long scrambling canes", bloom: "Once" }),
  flower("rose", "Eustacia Vye", { type: "Shrub", height: "4ft", color: "Pink Apricot", sun: "Full", scent: "Strong/Fruity", space: "Vigorous", bloom: "Repeat", disease: "Strong", companions: "Catmint + white allium" }),
  flower("rose", "Evelyn", { type: "English shrub rose (David Austin, 1991)", height: "3–4 ft", color: "Apricot-pink", scent: "Very strong", bloom: "Repeat", companions: "Rosemary + dianthus" }),
  flower("rose", "Everest", { companions: "Yarrow + creeping thyme" }, { note: "Details for this name haven't been confirmed yet; only what the sheet and photo show is listed." }),
  flower("rose", "Felicia", { type: "Hybrid Musk shrub", height: "4–5 ft (RHS); can spread widely", color: "Rich pink with salmon-apricot center; fades paler", sun: "Full sun preferred", scent: "Strong, sweet fragrance", space: "5–8 ft spread (RHS range)", bloom: "Repeat, summer into autumn", disease: "May get black spot or mildew; monitor in humid summers" }, { sources: [{ title: "Reference from the sheet", url: "https://www.rhs.org.uk/plants/99573/rosa-felicia-hm/details" }] }),
  flower("rose", "Francis E. Lester", { type: "Rambler", height: "15–20 ft", color: "White edged pink", sun: "Full sun/part shade", scent: "Musk", space: "Very vigorous", bloom: "Once", disease: "Good", companions: "Catmint + white alyssum" }),
  flower("rose", "Gertrude Jekyll", { type: "Climber", height: "9ft", color: "Pink", sun: "Full", scent: "Strong", bloom: "Repeat", disease: "Weak", companions: "Yarrow + creeping thyme" }),
  flower("rose", "Ghislaine de Féligonde", { type: "Repeat-flowering rambler", height: "8–12 ft", color: "Apricot to cream", sun: "Full sun/part shade", scent: "Light musk", space: "Vigorous", bloom: "Repeat", disease: "Very good", companions: "Rosemary + lavender + thyme" }),
  flower("rose", "Hana Bonbori", { type: "Shrub rose", height: "Approx. 3–4 ft", color: "Blush pink/cream", sun: "Full sun", space: "Moderate", bloom: "Repeat", disease: "Availability watch; verify U.S. listing", companions: "Miniature white dianthus" }),
  flower("rose", "Hansa", { type: "Shrub", height: "3-6ft", color: "Vibrant Pink", sun: "Full/Partial Sun", scent: "Strong", bloom: "Repeat", disease: "Strong", companions: "White salvia + chives" }, { zones: [3, 8] }),
  flower("rose", "Heavenly Pink", { type: "Hybrid musk shrub (Lens, 1997)", height: "2.5–4 ft", color: "Clear pink, double rosettes in large clusters", sun: "Full sun/part shade", scent: "Light", space: "Plant about 2.5–3 ft apart", bloom: "Repeat; abundant", disease: "Healthy foliage per breeder; highly disease resistant; easy to propagate", companions: "Catmint + white allium" }),
  flower("rose", "Iceberg", { type: "Climber", height: "10–12 ft", color: "White", sun: "Full sun/part shade", scent: "Light", space: "Vigorous", bloom: "Repeat", disease: "Moderate; watch black spot in humid weather", companions: "Lavender + blue salvia + allium" }),
  flower("rose", "It's a Breeze", { type: "Ground Cover", height: "2-3ft", color: "Dark Red", sun: "Full sun", scent: "None", space: "Vigorous", companions: "Rosemary + dianthus" }),
  flower("companion", "Kwanzan cherry", { type: "Flowering tree", height: "15–25 ft", color: "Double pink", sun: "Full sun", scent: "Light", space: "Spreading crown", bloom: "Spring bloom", disease: "Moderate; susceptible to leaf spot, canker, borers, and scale", companions: "Creeping thyme + spring bulbs; keep the root flare clear" }),
  flower("rose", "Jasmina", { type: "Climber (Kordes, 2005)", height: "8–10 ft", color: "Lilac-pink cupped clusters", scent: "Light apple", bloom: "Repeat", disease: "Good" }),
  flower("rose", "Jude the Obscure", { type: "Shrub", height: "4-5ft", color: "Soft yellow/Peach", sun: "Full/Partial Sun", scent: "Extremely strong", bloom: "Repeat/continual", disease: "Strong", companions: "Coreopsis + sweet alyssum" }),
  flower("rose", "Juliet", { type: "English rose (David Austin, 2005)", height: "3–4 ft", color: "Peach-apricot", scent: "Light", bloom: "Repeat", companions: "Lavender + ornamental allium" }, { note: "Bred mainly as a cut flower." }),
  flower("rose", "Jump for Joy", { type: "Floribunda (Weeks Roses)", height: "3–4 ft", color: "Coral-salmon", bloom: "Repeat", companions: "White salvia + chives" }, { sources: [{ title: "Heirloom Roses: Jump for Joy", url: "https://heirloomroses.com/products/jump-for-joy" }] }),
  flower("rose", "Kensington Gardens", { type: "Garden rose", color: "Yellow/fuchsia", companions: "Lavender + white alyssum" }, { note: "Details for this name haven't been confirmed yet; only what the sheet and photo show is listed.", sources: [{ title: "RHS: Rosa Kensington Gardens", url: "https://www.rhs.org.uk/plants/519972/rosa-kensington-gardens-sch88431/details" }] }),
  flower("rose", "Kew Rambler", { type: "Rambler", height: "15–20 ft", color: "Pink with white center", sun: "Full sun/part shade", scent: "Musk", space: "Very vigorous", bloom: "Once", disease: "Good", companions: "Yarrow + thyme" }),
  flower("rose", "Kimberley", { type: "Shrub rose", disease: "To verify — exact Kimberley cultivar must be confirmed", companions: "Lavender + white alyssum" }, { note: "The exact Kimberley cultivar still needs confirming." }),
  flower("rose", "Lady Banks", { type: "Rambler", height: "20ft", color: "Yellow", sun: "Full", scent: "Moderate", bloom: "Once", companions: "Blue salvia + thyme" }, { zones: [7, 10] }),
  flower("rose", "Lady Capri", { type: "shrub", height: "3ft", color: "apricot", sun: "Full", scent: "Strong Fruit", space: "Vigorous", bloom: "Repeat", disease: "Strong", companions: "White salvia + chives" }),
  flower("rose", "Lady of Shalott", { type: "Shrub/climber", height: "6–8 ft", color: "Orange-copper", sun: "Full sun/part shade", scent: "Medium tea", space: "Vigorous", bloom: "Repeat", disease: "Very good", companions: "Blue salvia + catmint + white allium" }),
  flower("companion", "Lamb's ear", { type: "Perennial groundcover", height: "12–18 in", color: "Silvery-gray foliage; purple flower spikes", sun: "Full sun/part shade", scent: "Light", space: "Spreading clumps", bloom: "Late spring/summer", disease: "Good with sharp drainage and airflow" }),
  flower("rose", "Lavender Lassie", { type: "Hybrid Musk shrub; trainable climber", height: "5–10 ft", color: "Lavender-pink / mauve", sun: "Full sun or part shade; 4+ hours direct sun", scent: "Very fragrant", space: "4–6 ft wide", bloom: "Repeat flowering", disease: "Not independently rated; monitor black spot in humid summers" }, { sources: [{ title: "Reference from the sheet", url: "https://heirloomroses.com/products/lavender-lassie" }] }),
  flower("rose", "Leverkusen", { type: "Climbing Floribunda", height: "8-10ft", color: "White/Yellow center", sun: "Shade Tolerant", scent: "Moderate", bloom: "Repeat", disease: "Strong", companions: "Catmint + white allium" }),
  flower("companion", "Lil' Kim Rose of Sharon", { type: "Dwarf flowering shrub", height: "3–4 ft", color: "White with red eye", sun: "Full sun", scent: "Light", space: "Compact", bloom: "Summer bloom", disease: "Good; generally trouble-free with airflow", companions: "Creeping thyme + lavender + allium" }),
  flower("rose", "Love's Light", { companions: "Rosemary + dianthus" }, { note: "Details for this name haven't been confirmed yet; only what the sheet and photo show is listed.", sources: [{ title: "HelpMeFind: Love's Light", url: "https://helpmefind.com/rose/l.php?l=2.86430" }] }),
  flower("rose", "Madame Anisette", { type: "Kordes Grandiflora", height: "4ft", color: "Peachy Pink", sun: "Full", scent: "Strong", space: "Vigorous Upright", bloom: "Repeat", companions: "Yarrow + creeping thyme" }),
  flower("camellia", "Magnoliaeflora", { type: "Evergreen japonica camellia", height: "6–8 ft", color: "Blush pink, semi-double", sun: "Part shade; filtered morning light", scent: "Little to none", space: "5–6 ft", bloom: "Late spring", disease: "Average to good with airflow; watch tea scale, petal blight, dieback, and root rot", companions: "Japanese forest grass + hellebores + ferns" }),
  flower("rose", "Maiden's Blush", { type: "Climber", color: "Pink", sun: "Full Sun/Partial Shade", scent: "Strong", bloom: "Once", disease: "Strong", companions: "White salvia + chives" }),
  flower("rose", "Malvern Hills", { type: "Repeat-flowering rambler", height: "10–12 ft", color: "Soft yellow", sun: "Full sun/part shade", scent: "Light-medium musk", space: "Vigorous", bloom: "Repeat", disease: "Good", companions: "Blue salvia + white alyssum" }),
  flower("rose", "Minerva", { type: "Floribunda", height: "2–3 ft", color: "Violet-purple", scent: "Fragrant", bloom: "Repeat" }, { sources: [{ title: "Eastcroft Roses: Minerva", url: "https://eastcroftroses.co.uk/products/minerva" }] }),
  flower("rose", "Miniature Peach", { type: "Miniature", color: "Peach", sun: "Full", companions: "Blue salvia + thyme" }, { note: "The sheet doesn't name the cultivar; Peach Sunblaze is the example used." }),
  flower("rose", "Miniature Purple", { type: "Miniature", color: "Pastel Purple", sun: "Full", companions: "Lavender + ornamental allium" }, { note: "The sheet doesn't name the cultivar; Lavender Jewel is the example used." }),
  flower("rose", "Miniature Yellow", { type: "Miniature", color: "Yellow", sun: "Full", companions: "Lavender + white alyssum" }, { note: "The sheet doesn't name the cultivar; Yellow Sunblaze is the example used." }),
  flower("rose", "Mister Lincoln", { type: "Tall Shrub", color: "Deep Velvet Red", sun: "Full", scent: "Fruit Punch" }),
  flower("rose", "Nelson Mandela", { type: "Hybrid tea (Ludwig's Roses, 2018)", color: "Orange", bloom: "Repeat", companions: "Catmint + white allium" }, { sources: [{ title: "Heirloom Roses: Nelson Mandela", url: "https://heirloomroses.com/products/nelson-mandela" }] }),
  flower("rose", "New Dawn", { type: "Climber", height: "15-20 ft", color: "Pale Pink", sun: "Full/Partial", scent: "Very Fragrant", space: "Repeat", bloom: "Once", companions: "Lavender + ornamental allium" }),
  flower("camellia", "October Magic Carpet", { type: "Evergreen sasanqua camellia", height: "About 3 ft", color: "Pink and white, frilled double", sun: "Full sun to part shade; protect from hot afternoon sun", scent: "Light", space: "4–5 ft", bloom: "Late fall to early winter", disease: "Good with drainage; watch tea scale, petal blight, dieback, and root rot", companions: "Dwarf mondo grass + autumn fern + heuchera" }),
  flower("camellia", "October Magic White Shi-Shi", { type: "Evergreen sasanqua camellia", height: "3–4 ft", color: "White, formal double", sun: "Part shade; morning sun; protect from hot afternoon sun", scent: "Light to none", space: "3–4 ft", bloom: "Fall to early winter", disease: "Good with drainage; watch tea scale, petal blight, dieback, and root rot", companions: "Hellebores + autumn fern + heuchera" }),
  flower("rose", "Olivia Rose Austin", { type: "Shrub", height: "4ft", color: "Pink", sun: "Full Sun/Partial Shade", scent: "Light to Medium", bloom: "Repeat", disease: "Very Good", companions: "Lavender + white alyssum" }),
  flower("rose", "Outrageous", { type: "Floribunda (Jackson & Perkins)", color: "Coral-orange", bloom: "Repeat", companions: "Blue salvia + thyme" }, { sources: [{ title: "Jackson & Perkins: Outrageous", url: "https://www.jacksonandperkins.com/outrageous-floribunda-rose/p/v2217/" }] }),
  flower("rose", "Paul's Himalayan Musk", { type: "Rambler", height: "20–30 ft", color: "Blush pink fading white", sun: "Full sun/part shade", scent: "Musk, moderate", space: "Very vigorous", bloom: "Once, late spring/early summer", disease: "Good with airflow", companions: "White allium + purple salvia" }),
  flower("rose", "Peppermint Party", { type: "Climber", height: "8–10 ft", color: "Cream/yellow petals edged red", sun: "Full sun", scent: "Fruity", space: "About 4 ft wide", bloom: "Repeat, late spring–mid fall", disease: "Good (breeder claim)" }),
  flower("rose", "Perfume Breeze", { type: "Climber", height: "6ft", color: "pink rosettes", sun: "Full", scent: "Strong", space: "Vigorous", bloom: "Bunches continuous", companions: "Catmint + white allium" }),
  flower("camellia", "Pink Parade", { type: "Evergreen japonica camellia", height: "6–8 ft", color: "Hot pink, peony to semi-double", sun: "Filtered sun to part shade", scent: "Little to none", space: "6–8 ft", bloom: "Late winter to early spring", disease: "Average to good with airflow; watch tea scale, petal blight, dieback, and root rot", companions: "Azaleas + ferns + heuchera" }),
  flower("rose", "Pinky Apricot Honey", { type: "Climber/Shrub", height: "8ft", color: "Peach", sun: "Full", scent: "Apricot honey, medium", bloom: "Continuous", disease: "strong", companions: "Rosemary + dianthus" }),
  flower("rose", "Poet's Wife", { type: "English shrub rose (David Austin, 2014)", height: "3–4 ft", color: "Rich yellow", scent: "Strong lemon and fruit", bloom: "Repeat", companions: "Yarrow + creeping thyme" }),
  flower("rose", "Pashmina", { type: "Small shrub rose (Kordes)", height: "2–3 ft", color: "White with a pink blush, cupped", bloom: "Repeat" }, { note: "The sheet lists this as Pom Pom Flower Circus / Pashmina; the photo matches Pashmina.", sources: [{ title: "Rosen Tantau / Kordes: Pashmina", url: "https://rosen.de/en/garden-roses/shop-by-type/shrub-roses/pashmina" }] }),
  flower("rose", "Port Sunlight", { type: "Shrub", height: "5 ft", color: "Apricot", sun: "Full sun", scent: "Strong tea", space: "Upright", bloom: "Repeat", disease: "Good", companions: "Blue salvia + lavender + white alyssum" }),
  flower("rose", "Poseidon (Novalis)", { type: "Shrub", color: "Lavender", sun: "Full", scent: "Light", space: "Continuous", disease: "Strong", companions: "White salvia + chives" }),
  flower("rose", "Princess Alexandra of Kent", { type: "Shrub", height: "4ft", color: "Bluish Pink", sun: "Full", disease: "Weak", companions: "Coreopsis + sweet alyssum" }),
  flower("rose", "Princess Charlene de Monaco", { type: "Hybrid tea", color: "Apricot", sun: "Full", scent: "Moderate", bloom: "Repeat", disease: "Strong", companions: "Lavender + ornamental allium" }),
  flower("rose", "Queen of Sweden", { type: "Shrub", height: "4 ft", color: "Soft pink", sun: "Full sun", scent: "Medium myrrh", space: "Upright", bloom: "Repeat", disease: "Very good", companions: "Catmint + white allium + lavender" }),
  flower("rose", "Radiant Perfume", { type: "Shrub", color: "Deep Yellow", sun: "Full", scent: "Strong", space: "Super Vigorous", companions: "Lavender + white alyssum" }),
  flower("rose", "Rambling Rosie", { type: "Repeat-flowering rambler", height: "10–15 ft", color: "Red", sun: "Full sun", scent: "Light", space: "Vigorous", bloom: "Repeat", disease: "Good", companions: "White salvia + thyme" }),
  flower("rose", "Raubritter", { type: "Shrub or short climber (Kordes, 1936)", height: "3–6 ft", color: "Clear pink, globe-shaped", scent: "Light", bloom: "Once", disease: "Can get mildew" }),
  flower("rose", "Rhapsody in Blue", { type: "Shrub", height: "1ft", color: "Iridescent purple", sun: "Full", scent: "Moderate", bloom: "Repeat", disease: "Moderate", companions: "Blue salvia + thyme" }),
  flower("rose", "Roald Dahl", { type: "Shrub", height: "4 ft", color: "Apricot", sun: "Full sun", scent: "Light-medium tea", space: "Bushy", bloom: "Repeat", disease: "Excellent", companions: "Blue salvia + catmint + thyme" }),
  flower("rose", "Royal Bonica", { type: "Shrub", height: "3–5 ft", color: "Pink", sun: "Full sun", scent: "Light", space: "Bushy", bloom: "Repeat", disease: "Excellent; notably strong", companions: "Lavender + white alyssum + thyme" }),
  flower("rose", "Royal Jubilee", { type: "Shrub", height: "5 ft", color: "Deep pink", sun: "Full sun", scent: "Fruity", space: "Bushy", bloom: "Repeat", disease: "Good", companions: "Catmint + blue salvia + allium" }),
  flower("rose", "Sabrina (Meiptorius)", { type: "Climber", height: "Approx. 6.5 ft (2 m)", color: "Creamy blush pink; pale apricot centre", sun: "Full sun", scent: "Light", space: "Trellis/support required", bloom: "Repeat flowering" }, { sources: [{ title: "Ashwood Nurseries: Sabrina", url: "https://www.ashwoodnurseries.com/product/rose-climbing-sabrina/" }] }),
  flower("rose", "Scarborough Fair", { type: "Shrub", height: "3 ft", color: "Soft pink", sun: "Full sun/part shade", scent: "Medium musk", space: "Compact", bloom: "Repeat", disease: "Good", companions: "Rosemary + lavender + thyme" }),
  flower("camellia", "Shishi Gashira", { type: "Evergreen sasanqua camellia", height: "4–5 ft", color: "Hot pink, semi-double with yellow centers", sun: "Filtered sun to partial shade; morning sun ideal", scent: "Light", space: "6–8 ft (wide spreading)", bloom: "Fall through winter", disease: "Good and reliable with drainage; watch tea scale, petal blight, dieback, and root rot", companions: "Hellebores + autumn fern + heuchera" }),
  flower("rose", "Snow Goose", { type: "Repeat-flowering rambler", height: "8–10 ft", color: "White", sun: "Full sun/part shade", scent: "Musk", space: "Vigorous", bloom: "Repeat", disease: "Good", companions: "Blue salvia + creeping thyme" }),
  flower("rose", "Spirit of Freedom", { type: "English climber (David Austin, 2002)", height: "8–10 ft", color: "Soft lilac-pink", scent: "Myrrh", bloom: "Repeat", companions: "Catmint + white allium" }),
  flower("rose", "Sultry Night", { type: "Shrub rose (Weeks Roses)", color: "Deep crimson-magenta", bloom: "Repeat" }, { sources: [{ title: "Weeks Roses: Sultry Night", url: "https://www.weeksroses.com/products/sultry-night" }] }),
  flower("rose", "Summer Song", { type: "English shrub rose (David Austin, 2005)", height: "4 ft", color: "Deep Coral", sun: "Part Shade", scent: "Strong tea", bloom: "Repeat", companions: "Rosemary + dianthus" }),
  flower("rose", "Super Excelsa", { type: "Repeat-flowering rambler", height: "10–15 ft", color: "Crimson-pink", sun: "Full sun/part shade", scent: "Light", space: "Vigorous", bloom: "Repeat", disease: "Very good", companions: "White alyssum + catmint" }),
  flower("companion", "Sweet alyssum", { type: "Low flowering annual / cool-season perennial", height: "4–8 in", color: "Tiny white flowers", sun: "Full sun/part shade", scent: "Sweet honey fragrance", space: "Low spreading mounds", bloom: "Long bloom; strongest in cool weather", disease: "Generally good; avoid soggy soil" }),
  flower("rose", "Sweet Love", { companions: "Yarrow + creeping thyme" }, { note: "Details for this name haven't been confirmed yet; only what the sheet and photo show is listed." }),
  flower("rose", "Tangerine Skies", { type: "Climber", color: "Orange", sun: "Full", companions: "White salvia + chives" }),
  flower("rose", "Teasing Georgia", { type: "Climber", height: "10–12 ft", color: "Rich yellow", sun: "Full sun/part shade", scent: "Strong tea", space: "Vigorous", bloom: "Repeat", disease: "Good; watch black spot in humid summers", companions: "Blue salvia + white alyssum + thyme" }),
  flower("rose", "The Albrighton Rambler", { type: "Repeat-flowering rambler", height: "10–12 ft", color: "Soft pink", sun: "Full sun/part shade", scent: "Light musk", space: "Vigorous", bloom: "Repeat", disease: "Good", companions: "Dianthus + lavender" }),
  flower("rose", "The Fairy", { type: "Shrub/Climbing", height: "2-3ft", color: "Pink", sun: "Full", scent: "none", bloom: "Repeat", disease: "Moderate", companions: "Coreopsis + sweet alyssum" }),
  flower("rose", "The Generous Gardener", { type: "Climber", height: "10–15 ft", color: "Pink", sun: "Full sun/part shade", scent: "Strong musk/myrrh", space: "Vigorous", bloom: "Repeat", disease: "Good", companions: "Lavender + ornamental allium" }),
  flower("rose", "The Lady of the Lake", { type: "Repeat-flowering rambler", height: "10–12 ft", color: "Blush pink", sun: "Full sun/part shade", scent: "Citrus", space: "Vigorous", bloom: "Repeat", disease: "Good", companions: "Lavender + chives" }),
  flower("rose", "The Lark Ascending", { type: "Shrub", height: "5 ft", color: "Soft apricot", sun: "Full sun", scent: "Light myrrh", space: "Airy", bloom: "Repeat", disease: "Very good", companions: "Lavender + yarrow + blue salvia" }),
  flower("rose", "The Mill on the Floss", { type: "English shrub rose (David Austin, 2018)", height: "4 ft", color: "Soft lilac-pink", bloom: "Repeat" }),
  flower("rose", "True Inspiration", { type: "Shrub/Hybrid tea", color: "Pink", sun: "Full", companions: "Lavender + white alyssum" }),
  flower("rose", "True Spirit", { type: "Hybrid Tea Shrub", color: "Red", sun: "Full", scent: "Peppery Perfume", companions: "Blue salvia + thyme" }),
  flower("rose", "Twilight Zone", { type: "Grandiflora (Weeks Roses)", height: "4–5 ft", color: "Deep purple", scent: "Strong clove", bloom: "Repeat", companions: "Catmint + white allium" }),
  flower("rose", "Veilchenblau", { type: "Rambler", height: "10–15 ft", color: "Violet-purple fading lilac", sun: "Full sun/part shade", scent: "Orange-like", space: "Very vigorous", bloom: "Once", disease: "Good", companions: "White allium + silver artemisia" }),
  flower("rose", "Waterloo", { type: "Hybrid Musk shrub (Lens, 1996; LENcena)", height: "About 4–5 ft; arching", color: "Creamy buds opening white", sun: "Sun or part shade", scent: "Very light floral scent", space: "About 3–4 ft planting spread", bloom: "Repeat; into first frost", disease: "Cultivar-specific disease rating not confirmed" }, { sources: [{ title: "Reference from the sheet", url: "https://www.lens-roses.com/en_US/shop/waterloo-14550?attribute_values=103" }] }),
  flower("rose", "Wollerton Old Hall", { type: "Climber", height: "10–12 ft", color: "Pale apricot to cream", sun: "Full sun/part shade", scent: "Strong myrrh", space: "Vigorous", bloom: "Repeat", disease: "Good; watch black spot in humid summers", companions: "Lavender + catmint + white allium" }),
  flower("rose", "Zéphirine Drouhin", { type: "Climber", height: "8–12 ft", color: "Cerise pink", sun: "Full sun/part shade", scent: "Strong bourbon", space: "Vigorous", bloom: "Repeat", disease: "Moderate; can blackspot", companions: "Rosemary + dianthus" }),
  flower("peony", "Alertie", { type: "Herbaceous (Paeonia lactiflora); fully double", height: "28–32 in", color: "Soft pink fading to white with pink blush", sun: "Full sun to partial shade", scent: "Sweet fragrance", bloom: "Mid to late spring; early flowering", disease: "Not rated by source" }, { zones: [3, 8], sources: [{ title: "Breck's: Alertie", url: "https://www.brecks.com/products/alertie-peony" }] }),
  flower("peony", "Avalanche", { type: "Herbaceous (Paeonia lactiflora); double", height: "30–36 in", color: "Blush-white; faint pink center, pale yellow base, occasional crimson edges", sun: "Full sun to partial shade", scent: "Strong fragrance; not sweet (Breck’s)", bloom: "Late spring–early summer; late midseason", disease: "Not rated by source" }, { zones: [3, 8], sources: [{ title: "Breck's: Avalanche", url: "https://www.brecks.com/products/avalanche-peony" }] }),
  flower("peony", "Bartzella", { type: "Itoh / intersectional hybrid; semi-double to double", height: "30–36 in", color: "Yellow with red flares near center", sun: "Full sun; tolerates partial shade", scent: "Sweet fragrance", space: "30–36 in mature spread (Easy to Grow)", bloom: "Late spring–early summer; successive buds extend display", disease: "Not rated by Holland Bulb Farms" }, { zones: [3, 8], sources: [{ title: "Holland Bulb Farms: Bartzella", url: "https://www.hollandbulbfarms.com/bartzella-itoh-hybrid-peony.aspx" }] }),
  flower("peony", "Cora Louise", { type: "Itoh / intersectional hybrid; semi-double", height: "24–30 in (Holland Bulb Farms)", color: "White to soft pink with lavender-purple center", sun: "Full sun to partial shade", scent: "Light fragrance", space: "36–48 in mature spread (Prides Corner)", bloom: "Late spring", disease: "Not rated by Holland Bulb Farms" }, { zones: [4, 8], sources: [{ title: "Holland Bulb Farms: Cora Louise", url: "https://www.hollandbulbfarms.com/cora-louise-peony" }] }),
  flower("peony", "Coral Charm", { type: "Herbaceous hybrid; semi-double", height: "Tall (Hollingsworth)", color: "Orange-coral → peach → creamy beige", sun: "Full sun", scent: "Not specified by Hollingsworth", space: "Sprawling habit; support needed", bloom: "Early midseason", disease: "Not rated by Hollingsworth" }, { zones: [3, 7], sources: [{ title: "Hollingsworth Peonies: Coral Charm", url: "https://hollingsworthpeonies.com/product/coral-charm/" }] }),
  flower("peony", "Etched Salmon", { type: "Herbaceous hybrid; fully double", height: "36 in", color: "Delicate salmon pink", sun: "Full sun to partial shade", scent: "Fragrant", bloom: "Late spring; midseason flowering", disease: "Not rated by source" }, { zones: [3, 8], sources: [{ title: "Breck's: Etched Salmon", url: "https://www.brecks.com/products/etched-salmon-peony" }] }),
  flower("peony", "Felix Supreme", { type: "Herbaceous (Paeonia lactiflora); double", height: "Approx. 30–36 in", color: "Deep ruby/crimson red", sun: "Full sun to partial shade", scent: "Spicy fragrance (RHS)", space: "30–36 in spacing; moist, well-drained soil", bloom: "Late spring to early summer; midseason (varies by climate)", disease: "No formal cultivar-specific resistance rating", companions: "White alliums, nepeta/catmint, white salvia" }),
  flower("peony", "Fringed Ivory", { type: "Lactiflora; semi-double, becoming double at maturity", height: "Medium (Hollingsworth)", color: "Ivory white; occasional magenta streaks", sun: "Full sun", scent: "Fragrant; Best Fragrant", space: "Large bush; support beneficial", bloom: "Late midseason–late season", disease: "Healthy foliage reported; no formal resistance rating" }, { zones: [2, 8], sources: [{ title: "Hollingsworth Peonies: Fringed Ivory", url: "https://hollingsworthpeonies.com/product/fringed-ivory/" }] }),
  flower("peony", "Garden Treasure", { type: "Itoh / intersectional hybrid; semi-double", height: "27 in", color: "Golden yellow with scarlet flares", sun: "Full sun to partial shade", scent: "Fragrant", space: "Up to 60 in mature spread", bloom: "Late spring–early summer; late midseason; successive side buds", disease: "Not rated by source" }, { zones: [3, 8], sources: [{ title: "Breck's: Garden Treasure", url: "https://www.brecks.com/products/garden-treasure-itoh-peony" }] }),
  flower("peony", "Gay Paree", { type: "Herbaceous (Paeonia lactiflora); Japanese form", height: "28–32 in; description says up to 36 in", color: "Deep rose-pink outer petals; creamy white and shell-pink center", sun: "Full sun to partial shade", scent: "Fragrant", bloom: "Late spring; midseason flowering", disease: "Not rated by source" }, { zones: [3, 8], sources: [{ title: "Breck's: Gay Paree", url: "https://www.brecks.com/products/gay-paree-peony" }] }),
  flower("peony", "Georgiana Shaylor", { type: "Lactiflora; double", height: "Medium (Hollingsworth)", color: "Light rose-pink; crimson center markings", sun: "Full sun", scent: "Sweet fragrance; Best Fragrant", space: "Not specified by Hollingsworth", bloom: "Late midseason–late season", disease: "Not rated by Hollingsworth" }, { zones: [2, 8], sources: [{ title: "Hollingsworth Peonies: Georgiana Shaylor", url: "https://hollingsworthpeonies.com/product/georgiana-shaylor/" }] }),
  flower("peony", "Hari-ai-nin", { type: "Lactiflora; Japanese flower form", height: "Medium; up to 90 cm / 35 in (RHS)", color: "Wine red; gold-tipped center", sun: "Full sun (Hollingsworth)", scent: "Fragrant (RHS)", space: "Spread 0.5–1 m / 1.6–3.3 ft (RHS)", bloom: "Late season", disease: "No resistance rating; RHS notes susceptibility to peony wilt and leaf blotch" }, { zones: [2, 8], sources: [{ title: "Hollingsworth Peonies: Hari-ai-nin", url: "https://hollingsworthpeonies.com/product/hari-ai-nin/" }] }),
  flower("peony", "Henry Sass", { type: "Herbaceous (Paeonia lactiflora); fully double", height: "32–36 in", color: "Pure white, sometimes creamy at center", sun: "Full sun", scent: "Sweet, strong fragrance (sources vary)", space: "30–36 in spread; stake heavy blooms after rain", bloom: "Midseason to late spring/early summer", disease: "Healthy growth reported; no formal resistance rating", companions: "Salvia, catmint, purple alliums" }),
  flower("peony", "Jan van Leeuwen", { type: "Herbaceous (Paeonia lactiflora); Japanese form", height: "34–36 in", color: "Pure white outer petals; deep yellow center", sun: "Full sun to partial shade", scent: "Fragrant", bloom: "Early summer; late flowering", disease: "Not rated by source" }, { zones: [3, 8], sources: [{ title: "Breck's: Jan van Leeuwen", url: "https://www.brecks.com/products/jan-van-leeuwen-peony" }] }),
  flower("peony", "Karl Rosenfield", { type: "Lactiflora; double", height: "30–36 in", color: "Crimson red", sun: "Full sun / partial shade", scent: "Fragrant", space: "30–36 in spacing", bloom: "Late spring", disease: "Not rated by Holland Bulb Farms", companions: "White Giant Allium + Royal Touch Bearded Iris (vendor suggestions)" }, { zones: [3, 8] }),
  flower("peony", "King’s Day", { type: "Herbaceous; semi-double", height: "34 in", color: "Pastel salmon to orange", sun: "Full sun to partial shade", scent: "Not specified by Breck’s", bloom: "Mid to late spring; early flowering", disease: "Not rated by source" }, { zones: [3, 8], sources: [{ title: "Breck's: King's Day", url: "https://www.brecks.com/products/kingsday-peony" }] }),
  flower("peony", "Lavender peony", { type: "Herbaceous hybrid; single", height: "Medium (Hollingsworth)", color: "Soft lavender; yellow center; fades paler in sun", sun: "Full sun", scent: "Not specified by Hollingsworth", space: "Dense mounded bush; self-supporting stems", bloom: "Early season", disease: "No resistance rating; southern performance concern noted" }, { zones: [3, 7], sources: [{ title: "Hollingsworth Peonies: Lavender", url: "https://hollingsworthpeonies.com/product/lavender/" }] }),
  flower("peony", "Missie’s Blush", { type: "Lactiflora; full double", height: "32 in (APS); medium (Hollingsworth)", color: "Blush pink fading to white", sun: "Full sun", scent: "None per current APS registry; reports differ", space: "Broad bush; support if needed", bloom: "Late season (Hollingsworth)", disease: "Not rated by Hollingsworth" }, { zones: [2, 8], sources: [{ title: "Hollingsworth Peonies: Missie's Blush", url: "https://hollingsworthpeonies.com/product/missies-blush/" }] }),
  flower("peony", "Mrs. Franklin D. Roosevelt", { type: "Herbaceous (Paeonia lactiflora); fully double, rose form", height: "28–36 in (varies by grower)", color: "Soft shell pink / rose pink; long incurved petals", sun: "Full sun; tolerates part sun", scent: "Fragrant; sweet floral fragrance", space: "30–36 in mature spread; plant 3 ft apart", bloom: "Midseason (late spring to early summer); free flowering", disease: "No formal disease-resistance rating", companions: "Catmint, salvia, allium, or lavender for contrast" }),
  flower("peony", "Patricia Jean", { type: "Herbaceous hybrid; full double", height: "Tall (Hollingsworth); 34 in (registry)", color: "Yellow-caramel with pink-tinted outer petals", sun: "Full sun", scent: "Fragrant; Best Fragrant", space: "Substantial spreading bush; support helps after rain", bloom: "Early midseason", disease: "Healthy foliage reported; no formal resistance rating" }, { zones: [3, 7], sources: [{ title: "Hollingsworth Peonies: Patricia Jean", url: "https://hollingsworthpeonies.com/product/patricia-jean/" }] }),
  flower("peony", "Red Charm", { type: "Herbaceous hybrid; bomb double", height: "Medium; up to 85 cm / 33 in (RHS)", color: "Deep velvety red", sun: "Full sun", scent: "Spicy, nutmeg-like fragrance", space: "Spread 0.5–1 m / 1.6–3.3 ft (RHS); light support", bloom: "Midseason (Hollingsworth)", disease: "No formal rating; foliage may yellow with heat/water stress" }, { zones: [3, 7], sources: [{ title: "Hollingsworth Peonies: Red Charm", url: "https://hollingsworthpeonies.com/product/red-charm/" }] }),
  flower("peony", "Sarah Bernhardt", { type: "Herbaceous (Paeonia lactiflora); double", height: "34–36 in", color: "Soft rose pink", sun: "Full sun to partial shade", scent: "Pleasant fragrance", space: "30–36 in", bloom: "Late spring to early summer; late midseason", disease: "Not formally rated" }),
  flower("peony", "Singing in the Rain", { type: "Itoh / intersectional hybrid; semi-double", height: "36–40 in", color: "Pink-orange opening; creamy yellow and peach-salmon tones", sun: "Full sun to partial shade", scent: "Pleasant fragrance", bloom: "Mid spring–early summer (Breck’s); extended flowering", disease: "Not rated by source" }, { zones: [3, 8], sources: [{ title: "Breck's: Singing in the Rain", url: "https://www.brecks.com/products/singing-in-the-rain-itoh-peony" }] }),
  flower("peony", "Sunny Girl", { type: "Herbaceous hybrid; fully double", height: "34 in", color: "Yellow fading to creamy chartreuse / white", sun: "Full sun to partial shade", scent: "Not specified by Breck’s", bloom: "Mid spring; very early flowering", disease: "Not rated by source" }, { zones: [3, 8], sources: [{ title: "Breck's: Sunny Girl", url: "https://www.brecks.com/products/sunny-girl-peony" }] }),
  flower("peony", "The Best Inkstone (Mo Run Jue Lun)", { type: "Tree peony (Paeonia suffruticosa); double", height: "4–5 ft", color: "Deep crimson / dark red", sun: "Full sun to partial shade", scent: "Delicate fragrance", bloom: "Mid to late spring; midseason flowering", disease: "Not rated by source" }, { zones: [4, 7], sources: [{ title: "Breck's: The Best Inkstone", url: "https://www.brecks.com/products/the-best-inkstone-tree-peony" }] }),
  flower("peony", "Vivid Rose", { type: "Lactiflora; full double", height: "Medium (Hollingsworth)", color: "Bright medium pink", sun: "Full sun", scent: "Fragrant", space: "Strong stems; support large double blooms", bloom: "Late midseason–late season", disease: "Not rated by Hollingsworth" }),
  flower("peony", "Walter Faxon", { type: "Lactiflora; full double", height: "30–32 in (Old House Gardens); medium", color: "Shell pink; paler outer petals; fades in sun", sun: "Full sun", scent: "Fragrant; Best Fragrant", space: "Large bush; good support needed in rain", bloom: "Late midseason–late season (Hollingsworth)", disease: "No formal resistance rating" }),
];
