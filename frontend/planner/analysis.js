// What the garden report says about each bed: how many plants fit, whether the bed gets enough sun,
// which crops help or hurt each other (in the bed and in beds next to it), how to plant each crop,
// and a weekly watering schedule. Pure functions, so they can be unit-tested.
import { matchCropIds, METHOD_LABEL } from "@/shared/crop";
import { plantingWindows, seasonFit, windowText } from "@/shared/planting";
import { frostDays, isFrostFree } from "@/shared/zones";

const NEARBY_FT = 3; // beds closer than this count as neighbors for companion planting

export function bedCrops(bed, cropsById) {
  return bed.crops.map((id) => cropsById[id]).filter(Boolean);
}

// Plants of one crop that fit when the bed is shared equally among its crops (square spacing).
export function plantCount(bed, crop, cropsInBed) {
  const shareSqIn = (bed.w * 12 * bed.d * 12) / Math.max(1, cropsInBed);
  return Math.max(1, Math.floor(shareSqIn / (crop.spacingIn * crop.spacingIn)));
}

// How well a bed's sun hours suit a crop.
export function sunFit(hours, crop) {
  if (hours >= crop.sunHours - 0.25) return { level: "good", text: `Gets the ${crop.sunHours}+ hours it needs` };
  if (crop.shadeOk && hours >= 3.5) return { level: "ok", text: `Part shade suits it (wants ${crop.sunHours} hours, gets about ${hours.toFixed(1)})` };
  return { level: "poor", text: `Needs about ${crop.sunHours} hours of sun; this bed gets ${hours.toFixed(1)}` };
}

function relation(a, b, crops) {
  const lists = (crop, key) => crop[key].flatMap((name) => matchCropIds(name, crops));
  if (lists(a, "foes").includes(b.id) || lists(b, "foes").includes(a.id)) return "bad";
  if (lists(a, "friends").includes(b.id) || lists(b, "friends").includes(a.id)) return "good";
  return null;
}

function gapBetween(a, b) {
  const gx = Math.max(0, Math.abs(a.x - b.x) - (a.w + b.w) / 2);
  const gz = Math.max(0, Math.abs(a.z - b.z) - (a.d + b.d) / 2);
  return Math.max(gx, gz);
}

// For each bed: good pairs and bad pairs inside it, and bad pairs with crops in neighboring beds.
export function companionReport(beds, cropsById, crops) {
  const report = {};
  for (const bed of beds) {
    const inBed = bedCrops(bed, cropsById);
    const good = [];
    const bad = [];
    for (let i = 0; i < inBed.length; i++) {
      for (let j = i + 1; j < inBed.length; j++) {
        const rel = relation(inBed[i], inBed[j], crops);
        if (rel === "good") good.push([inBed[i], inBed[j]]);
        if (rel === "bad") bad.push([inBed[i], inBed[j]]);
      }
    }
    const nearby = [];
    for (const other of beds) {
      if (other.id === bed.id || gapBetween(bed, other) > NEARBY_FT) continue;
      for (const a of inBed) {
        for (const b of bedCrops(other, cropsById)) {
          if (a.id !== b.id && relation(a, b, crops) === "bad") nearby.push({ a, b, bed: other });
        }
      }
    }
    report[bed.id] = { good, bad, nearby };
  }
  return report;
}

// Step-by-step planting notes for one crop in one bed.
export function plantingNotes(crop, bed, zone) {
  const notes = [];
  const windows = plantingWindows(crop, zone);
  if (windows.length) {
    notes.push(`When: ${windows.map((w) => `${w.season === "spring" ? "Spring" : "Fall"} ${windowText(w)}`).join("; ")}`);
  } else {
    notes.push("When: no outdoor planting window in this zone; grow it in a container you can move indoors.");
  }
  const depth = crop.depthIn ? `, ${crop.depthIn} in deep` : "";
  notes.push(`How: ${METHOD_LABEL[crop.method]}${depth}, ${crop.spacingIn} in apart.`);
  const fit = seasonFit(crop, zone);
  if (!fit.ok) notes.push(fit.note);
  if (crop.bed === "raised" && bed.type === "in-ground") notes.push(`Prefers a raised bed: ${crop.bedNote || "it needs loose, well-drained soil"}`);
  if (crop.bed === "in-ground" && bed.type === "raised") notes.push(`Usually grown in the ground: ${crop.bedNote || "it needs more room than a raised bed gives"}`);
  if (bed.type === "raised" && bed.h * 12 < crop.rootIn) {
    notes.push(`Roots go about ${crop.rootIn} in deep; this bed holds ${Math.round(bed.h * 12)} in of soil, so loosen the ground underneath before filling it.`);
  }
  return notes;
}

const DAY_PATTERNS = { 1: ["Sat"], 2: ["Mon", "Thu"], 3: ["Mon", "Wed", "Fri"], 4: ["Mon", "Wed", "Fri", "Sun"] };
const MID_MONTH = [15, 46, 74, 105, 135, 166, 196, 227, 258, 288, 319, 349];

// Weekly watering for a bed in a month: inches a week (including rain), sessions, days and gallons.
export function wateringPlan(bed, crops, month, zone) {
  if (!crops.length) return null;
  const doy = MID_MONTH[month];
  const [lastFrost, firstFrost] = frostDays(zone);
  const growing = isFrostFree(zone) || (doy >= lastFrost - 21 && doy <= firstFrost + 21);
  const perennialsOnly = crops.every((c) => c.life === "perennial");
  if (!growing) {
    return {
      dormant: true,
      text: perennialsOnly
        ? "Dormant season: water perennials about once a month when the ground isn't frozen and there's been no rain or snow."
        : "Off season: nothing growing outdoors. Water only overwintering crops, and only in dry spells.",
    };
  }
  const base = Math.max(...crops.map((c) => c.waterIn));
  // Summer heat raises demand: about +30% in midsummer, less in spring and fall.
  const seasonal = 0.85 + 0.45 * Math.max(0, Math.cos((2 * Math.PI * (doy - 196)) / 365));
  const raised = bed.type === "raised" ? 1.15 : 1;
  const inches = Math.round(base * seasonal * raised * 4) / 4;
  let sessions = inches <= 1 ? 1 : inches <= 1.75 ? 2 : 3;
  if (bed.type === "raised") sessions += 1; // raised beds drain and warm faster
  sessions = Math.min(4, sessions);
  const sqft = bed.w * bed.d;
  const gallons = (sqft * inches * 0.623) / sessions; // 1 in of water over 1 sq ft = 0.623 gal
  return {
    dormant: false,
    inches,
    sessions,
    days: DAY_PATTERNS[sessions],
    gallonsPerSession: Math.round(gallons * 10) / 10,
    text:
      `${inches} in a week, counting rain: water ${sessions === 1 ? "once" : `${sessions} times`} a week, ` +
      `about ${Math.round(gallons * 10) / 10} gal each time. Water in the morning, at the soil, and skip a session after ½ in of rain.`,
  };
}
