// Planting, harvest and task notes for each month (0 = January).
export const MONTHS=["January","February","March","April","May","June","July","August","September","October","November","December"];
// Zone 8a calendar. Per month (0 = January): [plant or sow, harvest, other tasks], each a list in one string.
export const CAL: Record<number, [string, string, string]> = {
 0:["Fig and muscadine plants; finish fruit plantings","Collards, kale, carrots, green onions, herbs","Order seeds; late in the month, start peppers indoors under lights"],
 1:["Asparagus crowns, snap peas, spinach, lettuce, radishes (mid to late month), seed potatoes","Collards, kale, green onions, herbs (the thinnest month)","Start tomatoes and eggplant indoors; prune blueberries and muscadines"],
 2:["Broccoli and cabbage transplants, carrots, beets, more lettuce and radishes every 2–3 weeks","Lettuce, radishes, spinach, last kale and collards before they flower","Fertilize blueberries as leaves open; harden off seedlings outdoors"],
 3:["After last frost: tomato, pepper and eggplant transplants; squash, cucumbers, bush beans, sweet corn","Lettuce, spinach, snap peas, radishes, asparagus (from year 2), first strawberries","Stake tomatoes; mulch to hold moisture"],
 4:["Sweet potato slips, okra, southern peas, Malabar spinach; second sowing of squash and beans","Strawberries, snap peas, broccoli, cabbage, garlic scapes, early squash, last lettuce","Watch for squash vine borers; replant beds as spring crops finish"],
 5:["More southern peas and okra; third sowing of squash and cucumbers","Garlic, potatoes, blueberries, blackberries, squash, cucumbers, green beans, first tomatoes","Water deeply 1–2 times a week; net blueberries from birds"],
 6:["Start fall collards, cabbage and broccoli in a shaded seedbed or indoors","Tomatoes, peppers, eggplant, okra, corn, blueberries, first figs","Pull spent spring crops; solarize an empty bed if pests built up"],
 7:["Fall bush beans (early), turnips and carrots (late), collard and cabbage transplants (late)","Okra, southern peas, peppers, figs, first muscadines, sweet potato greens, Malabar spinach","Heat slump: keep beds mulched and watered; pick okra every 2 days"],
 8:["Lettuce, spinach, radishes, mustard, kale, more turnips","Muscadines, last figs, peppers, okra, southern peas, early sweet potatoes","Second, smaller fertilizer round for fall greens"],
 9:["Strawberry plants, garlic (late month), more greens and radishes","Sweet potatoes (before first frost), peppers, persimmons, fall greens, radishes, lettuce","Cure sweet potatoes warm and humid for about 10 days before storing; collect leaves for mulch"],
 10:["Garlic cloves, onion sets, collard and kale transplants (early in the month), strawberry plants","Collards, kale, turnips, radishes, lettuce, peppers until frost, persimmons, rosemary, thyme","Mulch beds with shredded leaves; send off a soil test; build or fill raised beds"],
 11:["Bare-root blueberries (two rabbiteye varieties), thornless blackberries, persimmon tree","Collards, kale, turnips, carrots, green onions, parsley, herbs","Add compost to empty beds; cover greens on nights below 20°F"]};
export const ORDER=[10,11,0,1,2,3,4,5,6,7,8,9];

// Splits "A, B (x, y); C" into ["A", "B (x, y)", "C"].
export function splitItems(text: string): string[] {
  return text.split(/;\s*|,\s*(?![^()]*\))/).map((s) => s.trim()).filter(Boolean);
}

// The calendar above is written for zone 8a. For another zone, spring and summer tasks (Jan–Jul)
// move with that zone's last spring frost and fall tasks (Aug–Dec) with its first fall frost.
// Fall tasks never move ahead of summer ones; months that end up empty come back as [[], [], []].
// Returns { month: [plantItems, harvestItems, taskItems] }. Approximate for zones 1–4 and 10–13.
/** Per month (0 = January): [things to plant or sow, things to harvest, other tasks]. */
export type MonthLists = Record<number, [string[], string[], string[]]>;

export function shiftedCalendar({ spring, fall }: { spring: number; fall: number }): MonthLists {
  const DAYS_PER_MONTH = 30.44;
  const target: number[] = [];
  for (let m = 0; m < 12; m++) {
    const shift = Math.round((m <= 6 ? spring : fall) / DAYS_PER_MONTH);
    target[m] = m + shift;
    if (m >= 7) target[m] = Math.max(target[m], target[m - 1]);
  }
  const out: MonthLists = Object.fromEntries(Array.from({ length: 12 }, (_, m) => [m, [[], [], []]]));
  for (let m = 0; m < 12; m++) {
    const t = ((target[m] % 12) + 12) % 12;
    CAL[m].forEach((text, group) => {
      for (const item of splitItems(text)) {
        const list = out[t][group as 0 | 1 | 2];
        if (!list.some((x) => x.toLowerCase() === item.toLowerCase())) list.push(item);
      }
    });
  }
  return out;
}
