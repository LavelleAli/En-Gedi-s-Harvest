// ============================================================================
// PLANT ENCYCLOPEDIA DATA
// ============================================================================
//
// This file is the long-form text for each plant in the Plant encyclopedia
// (frontend/sections/PlantsSection.tsx). Every plant is one object in the
// PLANTS list below. The list is grouped into fruits, vegetables and herbs;
// the page sorts them A to Z itself, so the order here doesn't matter.
//
// The field names are short to keep the file compact. Here's what each means:
//
//   n     name           The plant's name, shown as the entry title.
//                        Must match a "book" name in shared/catalog.ts
//                        (a unit test checks this).
//   t     type           "fruit", "veg" or "herb".
//   s     season         When to plant or harvest, e.g. "Harvest Jun–Jul".
//   nut   nutrients      What the food is a good source of.
//   ben   benefit        One sentence on why it's worth growing or eating.
//   care  care           Five growing tips, always in this order:
//                        sun, water, soil, feed (fertilizer), spacing.
//   ok    healthy look   What a healthy plant looks like.
//   pr    problems       Common problems. Each one is a pair:
//                        [symptom key, note]. The symptom key must be a key
//                        in SYM in frontend/data/art.ts, such as "spots",
//                        "holes" or "rootrot".
//   good  companions     Plants that grow well next to it.
//   bad   keep apart     Plants to keep away from it.
//   photo (optional)     Not used by any code right now. Photo searches
//                        live in frontend/data/photo-queries.json.
//
// To add a plant: copy an existing entry, paste it in the right section and
// change the text. Keep all five care tips, in order.
// ============================================================================

/** One plant's encyclopedia entry. See the field key at the top of this file. */
export type Plant = {
  n: string; // name
  t: string; // type: "fruit", "veg" or "herb"
  s: string; // season
  nut: string[]; // nutrients
  ben: string; // benefit
  care: [sun: string, water: string, soil: string, feed: string, spacing: string];
  ok: string; // what a healthy plant looks like
  pr: [symptom: string, note: string][]; // problems
  good: string; // good companions
  bad: string; // keep apart from
  photo?: string; // optional, currently unused
};

export const PLANTS: Plant[] = [
  // ===================== FRUITS =====================

  {
    n: "Blueberry (rabbiteye)",
    t: "fruit",
    s: "Harvest Jun–Jul",
    nut: ["Vitamin C", "Vitamin K", "Manganese", "Fiber", "Anthocyanins"],
    ben: "Deep-blue skins carry antioxidant pigments; a cup adds fiber with few calories.",
    care: [
      "Full sun, 6+ hours", // sun
      "1–2 in per week; shallow roots dry out fast", // water
      "Acidic, pH 4.5–5.5; pine bark mulch", // soil
      "Light azalea fertilizer as leaves open and again in late spring", // feed
      "5–6 ft apart; plant 2+ varieties for pollination", // spacing
    ],
    ok: "Glossy green leaves, red-tinged new growth, heavy bloom in March.",
    pr: [
      ["iron", "Most common blueberry problem in limed or tap-watered soil."],
      ["scorch", "Summer drought on shallow roots."],
      ["rootrot", "Never plant in a low wet spot."],
    ],
    good: "Strawberries, thyme, azaleas and other acid-lovers",
    bad: "Anything that needs lime or sweet soil (brassicas, asparagus nearby)",
  },

  {
    n: "Blackberry (thornless)",
    t: "fruit",
    s: "Harvest June",
    nut: ["Vitamin C", "Vitamin K", "Manganese", "Fiber"],
    ben: "One of the highest-fiber fruits you can grow.",
    care: [
      "Full sun", // sun
      "1 in per week, more while fruiting", // water
      "Well-drained, pH 5.5–6.5", // soil
      "Balanced fertilizer in early spring", // feed
      "3–4 ft apart on a trellis", // spacing
    ],
    ok: "Upright canes, dark green leaves, berries that turn fully black and dull.",
    pr: [
      ["spots", "Cane and leaf diseases; cut out fruited canes after harvest."],
      ["holes", "Japanese beetles in June."],
    ],
    good: "Garlic, chives, tansy at the edges",
    bad: "Keep away from wild brambles, which carry disease",
  },

  {
    n: "Fig",
    t: "fruit",
    s: "Harvest Jul–Aug",
    nut: ["Fiber", "Potassium", "Calcium", "Magnesium"],
    ben: "Fresh figs are a gentle source of fiber and potassium.",
    care: [
      "Full sun; a south wall helps", // sun
      "Deep water weekly in drought", // water
      "Tolerates clay if drained", // soil
      "Little or none; too much feed means leaves, no fruit", // feed
      "10–15 ft from other trees", // spacing
    ],
    ok: "Large lobed leaves, fruit that droops on the stem when ripe.",
    pr: [
      ["rootrot", "Root-knot nematodes are common in Georgia; mulch heavily."],
      ["scorch", "Drought drops fruit."],
      ["spots", "Fig rust in late summer; rake fallen leaves."],
    ],
    good: "Rosemary, thyme, marigolds under the canopy",
    bad: "Vegetable beds close by (shade and roots compete)",
  },

  {
    n: "Muscadine",
    t: "fruit",
    s: "Harvest Aug–Sep",
    nut: ["Fiber", "Manganese", "Polyphenols incl. resveratrol"],
    ben: "Skins and seeds are rich in plant polyphenols; native to the Southeast.",
    care: [
      "Full sun", // sun
      "1 in per week the first two years", // water
      "Well-drained, pH 6–6.5", // soil
      "Small amounts in March, May, July", // feed
      "20 ft apart on a single-wire trellis", // spacing
    ],
    ok: "Vigorous vines, round leaves, clusters of thick-skinned grapes.",
    pr: [
      ["spots", "Bitter rot and leaf spot in wet summers; prune for airflow."],
      ["holes", "Japanese beetles."],
    ],
    good: "Clover or low herbs underneath",
    bad: "Trees nearby (vines climb and shade them)",
  },

  {
    n: "Persimmon (Asian)",
    t: "fruit",
    s: "Harvest Oct–Nov",
    nut: ["Vitamin A", "Vitamin C", "Fiber", "Manganese"],
    ben: "Orange flesh is high in beta-carotene; eat astringent types only when very soft.",
    care: [
      "Full sun", // sun
      "Deep water in summer drought", // water
      "Adaptable, well-drained", // soil
      "Very little", // feed
      "15–20 ft apart", // spacing
    ],
    ok: "Glossy leaves that turn orange in fall, fruit hanging after leaves drop.",
    pr: [
      ["scorch", "Young trees drop fruit in drought."],
      ["spots", "Leaf spot in wet years; minor."],
    ],
    good: "Comfrey, clover, herbs as ground cover",
    bad: "Walnut trees nearby",
  },

  {
    n: "Strawberry",
    t: "fruit",
    s: "Harvest Apr–May",
    nut: ["Vitamin C", "Folate", "Manganese"],
    ben: "A cup gives more than a day's vitamin C.",
    care: [
      "Full sun", // sun
      "1 in per week; drip is best", // water
      "Raised bed, pH 5.5–6.5", // soil
      "Light feeding at planting and early spring", // feed
      "12 in apart", // spacing
    ],
    ok: "Bright green three-part leaves, white flowers, firm red berries.",
    pr: [
      ["spots", "Leaf spot and gray mold in wet springs; mulch with straw."],
      ["rootrot", "Plant in raised rows in clay."],
      ["holes", "Slugs and birds; net the bed."],
    ],
    good: "Spinach, lettuce, thyme, borage, onions",
    bad: "Cabbage family, and beds where tomatoes or peppers grew (verticillium)",
  },

  // ===================== VEGETABLES =====================

  {
    n: "Collards",
    t: "veg",
    s: "Harvest Oct–Apr",
    nut: ["Vitamin K", "Vitamin A", "Vitamin C", "Calcium", "Fiber"],
    ben: "One of the richest garden sources of vitamin K and plant calcium.",
    care: [
      "Full sun; part shade in early fall", // sun
      "1 in per week", // water
      "pH 6–6.8, rich in compost", // soil
      "Nitrogen side-dress every 4–6 weeks", // feed
      "18–24 in apart", // spacing
    ],
    ok: "Big blue-green leaves; frost makes them sweeter.",
    pr: [
      ["holes", "Cabbage worms and harlequin bugs."],
      ["curl", "Aphids under leaves in spring."],
      ["nitrogen", "Pale lower leaves mean feed them."],
    ],
    good: "Onions, garlic, dill, chamomile, thyme",
    bad: "Strawberries, tomatoes",
  },

  {
    n: "Kale",
    t: "veg",
    s: "Harvest Oct–Apr",
    nut: ["Vitamin K", "Vitamin A", "Vitamin C", "Lutein"],
    ben: "Lutein supports eye health; cook lightly or eat raw.",
    care: [
      "Full sun to part shade", // sun
      "1 in per week", // water
      "pH 6–7.5, rich", // soil
      "Nitrogen every 4–6 weeks", // feed
      "12–18 in apart", // spacing
    ],
    ok: "Firm, crinkled, deep-green or blue leaves.",
    pr: [
      ["holes", "Cabbage worms; use row cover or Bt."],
      ["curl", "Aphids."],
      ["bolt", "Flowers in late spring heat."],
    ],
    good: "Onions, beets, dill, nasturtium",
    bad: "Strawberries, tomatoes",
  },

  {
    n: "Mustard greens",
    t: "veg",
    s: "Harvest Oct–Dec, Mar–Apr",
    nut: ["Vitamin K", "Vitamin A", "Vitamin C", "Folate"],
    ben: "Peppery greens ready in about 40 days.",
    care: [
      "Full sun to part shade", // sun
      "Even moisture", // water
      "Rich, pH 6–7", // soil
      "Light nitrogen", // feed
      "6–12 in apart", // spacing
    ],
    ok: "Tender leaves, steady growth in cool weather.",
    pr: [
      ["bolt", "Bolts fast in heat."],
      ["holes", "Flea beetles."],
    ],
    good: "Onions, beans, lettuce",
    bad: "Strawberries",
  },

  {
    n: "Turnips",
    t: "veg",
    s: "Harvest Oct–Dec, Apr",
    nut: ["Vitamin C (roots)", "Vitamins K, A, C and calcium (greens)", "Fiber"],
    ben: "Two crops in one: roots and greens.",
    care: [
      "Full sun", // sun
      "Even moisture keeps roots mild", // water
      "Loose soil, pH 6–7", // soil
      "Light; too much nitrogen means all leaves", // feed
      "Thin to 4 in apart", // spacing
    ],
    ok: "Lush tops, smooth white-and-purple roots 2–3 in wide.",
    pr: [
      ["holes", "Flea beetles on young leaves."],
      ["curl", "Aphids."],
    ],
    good: "Peas, onions, lettuce",
    bad: "Potatoes",
  },

  {
    n: "Cabbage",
    t: "veg",
    s: "Harvest Dec–Jan, May",
    nut: ["Vitamin C", "Vitamin K", "Fiber"],
    ben: "Stores well and makes slaw, sauerkraut and soups.",
    care: [
      "Full sun", // sun
      "1–1.5 in per week; even watering prevents splitting", // water
      "Rich, pH 6–6.8", // soil
      "Nitrogen at 3 and 6 weeks", // feed
      "18 in apart", // spacing
    ],
    ok: "Tight, heavy heads with waxy outer leaves.",
    pr: [
      ["holes", "Cabbage worms and loopers."],
      ["nitrogen", "Small heads, pale leaves."],
    ],
    good: "Onions, dill, chamomile, celery",
    bad: "Strawberries, tomatoes, pole beans",
  },

  {
    n: "Broccoli",
    t: "veg",
    s: "Harvest Nov–Dec, May",
    nut: ["Vitamin C", "Vitamin K", "Folate", "Fiber", "Sulforaphane"],
    ben: "High in vitamin C; side shoots keep coming after the main head.",
    care: [
      "Full sun", // sun
      "1–1.5 in per week", // water
      "Rich, pH 6–7", // soil
      "Nitrogen every 3–4 weeks", // feed
      "18 in apart", // spacing
    ],
    ok: "Tight blue-green head; pick before yellow flowers open.",
    pr: [
      ["holes", "Cabbage worms."],
      ["bolt", "Heads loosen and flower in heat; plant earlier."],
    ],
    good: "Onions, dill, beets, lettuce",
    bad: "Strawberries, tomatoes",
  },

  {
    n: "Lettuce",
    t: "veg",
    s: "Harvest Oct–Dec, Mar–May",
    nut: ["Vitamin A", "Vitamin K", "Folate"],
    ben: "Red and dark leaf types carry the most nutrients.",
    care: [
      "Sun in spring and fall, afternoon shade as it warms", // sun
      "Light watering often; shallow roots", // water
      "Loose, rich soil", // soil
      "Light nitrogen", // feed
      "8–10 in apart, or thick rows for cut-and-come-again", // spacing
    ],
    ok: "Crisp, upright leaves; sweet flavor.",
    pr: [
      ["bolt", "The number one lettuce problem in Georgia."],
      ["holes", "Slugs at night."],
      ["curl", "Aphids."],
    ],
    good: "Radishes, carrots, chives, strawberries",
    bad: "Parsley crowding it",
  },

  {
    n: "Spinach",
    t: "veg",
    s: "Harvest Nov–Dec, Mar–Apr",
    nut: ["Vitamin K", "Vitamin A", "Folate", "Iron", "Magnesium"],
    ben: "Packed with folate; iron is better absorbed alongside vitamin C foods.",
    care: [
      "Full sun in cool months", // sun
      "Even moisture", // water
      "Rich, pH 6.5–7", // soil
      "Nitrogen", // feed
      "4–6 in apart", // spacing
    ],
    ok: "Dark, thick leaves in a low rosette.",
    pr: [
      ["bolt", "Bolts as days lengthen in April."],
      ["iron", "Pale leaves in acidic soil; spinach likes pH near 7."],
    ],
    good: "Strawberries, peas, radishes",
    bad: "Potatoes",
  },

  {
    n: "Radish",
    t: "veg",
    s: "Harvest most of the year",
    nut: ["Vitamin C", "Fiber"],
    ben: "Ready in 25–30 days; a crunchy, low-calorie snack.",
    care: [
      "Full sun", // sun
      "Even moisture or they turn woody", // water
      "Loose, stone-free soil", // soil
      "None needed", // feed
      "Thin to 2 in apart", // spacing
    ],
    ok: "Bright roots that pop just above the soil.",
    pr: [
      ["holes", "Flea beetles."],
      ["bolt", "Pithy, hot roots in heat."],
    ],
    good: "Lettuce, carrots, peas, squash (thought to deter beetles)",
    bad: "Hyssop",
  },

  {
    n: "Carrot",
    t: "veg",
    s: "Harvest Dec–Feb, May",
    nut: ["Vitamin A", "Fiber", "Potassium"],
    ben: "One of the best sources of beta-carotene.",
    care: [
      "Full sun", // sun
      "Keep seedbed moist until sprouted (1–3 weeks)", // water
      "Deep, loose, stone-free; raised beds in clay", // soil
      "Low nitrogen, more potassium", // feed
      "Thin to 2–3 in apart", // spacing
    ],
    ok: "Feathery tops, smooth straight roots.",
    pr: [
      ["rootrot", "Forked or rotted roots in heavy clay."],
      ["scorch", "Seedlings dry out in heat."],
    ],
    good: "Onions, chives, lettuce, radishes, tomatoes",
    bad: "Dill (cross-pollinates and stunts), parsnips",
  },

  {
    n: "Beet",
    t: "veg",
    s: "Harvest May–Jun, Nov–Dec",
    nut: ["Folate", "Manganese", "Potassium", "Dietary nitrates"],
    ben: "Roots and greens are both edible; greens are high in vitamin K.",
    care: [
      "Full sun", // sun
      "Even moisture", // water
      "Loose, pH 6–7", // soil
      "Light", // feed
      "Thin to 3 in apart", // spacing
    ],
    ok: "Red-veined leaves, round roots.",
    pr: [
      ["spots", "Cercospora leaf spot in humid weather."],
      ["holes", "Leaf miners."],
    ],
    good: "Onions, lettuce, cabbage family",
    bad: "Pole beans",
  },

  {
    n: "Snap pea",
    t: "veg",
    s: "Harvest Apr–May",
    nut: ["Vitamin C", "Vitamin K", "Fiber", "Plant protein"],
    ben: "Sweet pods eaten whole; roots add nitrogen to the soil.",
    care: [
      "Full sun", // sun
      "Even moisture", // water
      "Well-drained, pH 6–7.5", // soil
      "None; peas make their own nitrogen", // feed
      "2 in apart on a 5–6 ft trellis", // spacing
    ],
    ok: "Climbing tendrils, white flowers, bright plump pods.",
    pr: [
      ["mildew", "Powdery mildew as weather warms."],
      ["scorch", "Vines quit in May heat."],
    ],
    good: "Carrots, radishes, lettuce, spinach",
    bad: "Onions, garlic, chives",
  },

  {
    n: "Onion (incl. green and walking onions)",
    t: "veg",
    s: "Harvest green onions year-round, bulbs May–Jun",
    nut: ["Vitamin C", "Quercetin", "Prebiotic fiber"],
    ben: "Feeds healthy gut bacteria; walking onions come back every year.",
    care: [
      "Full sun", // sun
      "1 in per week; stop when tops fall over", // water
      "Loose, well-drained", // soil
      "Nitrogen every 3 weeks until bulbing", // feed
      "4 in apart", // spacing
    ],
    ok: "Upright blue-green tubes; tops flop over when bulbs are ready.",
    pr: [
      ["spots", "Purple blotch in wet springs."],
      ["rootrot", "Bulb rot in wet clay."],
    ],
    good: "Cabbage family, carrots, lettuce, tomatoes, strawberries",
    bad: "Beans, peas",
  },

  {
    n: "Garlic",
    t: "veg",
    s: "Plant Oct–Nov, harvest Jun",
    nut: ["Manganese", "Vitamin B6", "Sulfur compounds (allicin)"],
    ben: "Its sulfur compounds give the flavor; plant cloves in fall.",
    care: [
      "Full sun", // sun
      "Moderate; stop watering 2 weeks before harvest", // water
      "Loose, rich", // soil
      "Nitrogen in Feb and Mar", // feed
      "6 in apart, 2 in deep", // spacing
    ],
    ok: "Strong green leaves through winter; harvest when lower leaves brown.",
    pr: [
      ["rootrot", "Rots in waterlogged clay."],
      ["spots", "Rust spots in spring; minor."],
    ],
    good: "Tomatoes, cabbage family, roses, strawberries",
    bad: "Beans, peas",
  },

  {
    n: "Asparagus",
    t: "veg",
    s: "Harvest Mar–May from year 3",
    nut: ["Folate", "Vitamin K", "Vitamin A"],
    ben: "A bed lasts 15–20 years once established.",
    care: [
      "Full sun", // sun
      "Deep water in the first two years", // water
      "Well-drained, pH 6.5–7.5", // soil
      "Compost every spring", // feed
      "12–18 in apart in a trench", // spacing
    ],
    ok: "Thick spears in spring, tall ferns all summer.",
    pr: [
      ["holes", "Asparagus beetles on spears and ferns."],
      ["rootrot", "Crowns die in wet clay; raised beds."],
    ],
    good: "Tomatoes, parsley, basil",
    bad: "Onions, garlic, potatoes",
  },

  {
    n: "Potato",
    t: "veg",
    s: "Plant Feb–Mar, harvest Jun",
    nut: ["Vitamin C", "Potassium", "Vitamin B6"],
    ben: "Skins hold much of the fiber and potassium.",
    care: [
      "Full sun", // sun
      "Even moisture", // water
      "Loose, slightly acidic, pH 5.5–6.5", // soil
      "Balanced at planting", // feed
      "12 in apart; hill soil up as they grow", // spacing
    ],
    ok: "Bushy plants, white or purple flowers.",
    pr: [
      ["spots", "Early blight."],
      ["holes", "Colorado potato beetles."],
    ],
    good: "Bush beans, marigolds, cabbage family",
    bad: "Tomatoes, squash, cucumbers",
  },

  {
    n: "Tomato",
    t: "veg",
    s: "Harvest Jun–Sep",
    nut: ["Vitamin C", "Potassium", "Lycopene"],
    ben: "Cooking tomatoes makes lycopene easier to absorb.",
    care: [
      "Full sun, 8 hours", // sun
      "1–2 in per week, evenly", // water
      "Rich, pH 6.2–6.8", // soil
      "Balanced at planting; light feeding at first fruit", // feed
      "24–36 in apart, staked or caged", // spacing
    ],
    ok: "Dark green leaves, thick stems, flowers setting fruit.",
    pr: [
      ["spots", "Early blight starts on lower leaves."],
      ["ber", "Uneven watering."],
      ["holes", "Hornworms."],
      ["wilt", "Fusarium or bacterial wilt; choose resistant varieties."],
    ],
    good: "Basil, marigolds, carrots, onions, garlic",
    bad: "Potatoes, corn, fennel, cabbage family",
  },

  {
    n: "Pepper",
    t: "veg",
    s: "Harvest Jun–frost",
    nut: ["Vitamin C", "Vitamin A", "Vitamin B6"],
    ben: "Red ripe peppers have more vitamin C than oranges.",
    care: [
      "Full sun", // sun
      "1–2 in per week", // water
      "Rich, well-drained", // soil
      "Light; too much nitrogen means no fruit", // feed
      "18 in apart", // spacing
    ],
    ok: "Glossy leaves, steady fruit set; production picks up again in fall.",
    pr: [
      ["ber", "Uneven watering."],
      ["curl", "Aphids."],
      ["scorch", "Sunscald on fruit in July."],
    ],
    good: "Basil, onions, okra, carrots",
    bad: "Fennel, beans close by",
  },

  {
    n: "Eggplant",
    t: "veg",
    s: "Harvest Jul–Sep",
    nut: ["Fiber", "Potassium", "Anthocyanins (in skin)"],
    ben: "The purple skin holds most of its antioxidants.",
    care: [
      "Full sun, loves heat", // sun
      "1–2 in per week", // water
      "Rich, well-drained", // soil
      "Balanced, monthly", // feed
      "24 in apart", // spacing
    ],
    ok: "Fuzzy gray-green leaves, glossy firm fruit.",
    pr: [
      ["holes", "Flea beetles riddle young leaves."],
      ["wilt", "Verticillium wilt."],
    ],
    good: "Beans, peppers, marigolds",
    bad: "Fennel",
  },

  {
    n: "Summer squash and zucchini",
    t: "veg",
    s: "Harvest May–Jul",
    nut: ["Vitamin C", "Vitamin B6", "Potassium"],
    ben: "Low in calories and very productive.",
    care: [
      "Full sun", // sun
      "1–2 in per week at the base", // water
      "Rich, compost-heavy", // soil
      "Balanced at planting", // feed
      "3 ft apart", // spacing
    ],
    ok: "Big leaves, steady yellow flowers, fruit picked at 6–8 in.",
    pr: [
      ["wilt", "Squash vine borers; look for sawdust at the stem."],
      ["mildew", "Powdery mildew by midsummer."],
      ["ber", "Blossom end rot on early fruit."],
    ],
    good: "Corn, beans, nasturtium, radishes",
    bad: "Potatoes",
  },

  {
    n: "Cucumber",
    t: "veg",
    s: "Harvest Jun–Aug",
    nut: ["Vitamin K", "Water"],
    ben: "Mostly water; refreshing in the heat.",
    care: [
      "Full sun", // sun
      "1–2 in per week; bitter if dry", // water
      "Rich, well-drained", // soil
      "Balanced", // feed
      "12 in apart on a trellis", // spacing
    ],
    ok: "Climbing vines, many small fruit.",
    pr: [
      ["mildew", "Downy and powdery mildew."],
      ["wilt", "Bacterial wilt spread by cucumber beetles."],
    ],
    good: "Beans, dill, nasturtium, corn, radishes",
    bad: "Potatoes, sage",
  },

  {
    n: "Green beans",
    t: "veg",
    s: "Harvest May–Jul, Oct",
    nut: ["Vitamin C", "Vitamin K", "Folate", "Fiber"],
    ben: "Adds nitrogen to the soil for the next crop.",
    care: [
      "Full sun", // sun
      "1 in per week", // water
      "Well-drained", // soil
      "None to light", // feed
      "4 in apart", // spacing
    ],
    ok: "Bushy or climbing plants, smooth pods.",
    pr: [
      ["holes", "Mexican bean beetles."],
      ["spots", "Rust spots in humid weather."],
    ],
    good: "Corn, squash, cucumbers, carrots, eggplant",
    bad: "Onions, garlic, peppers close by",
  },

  {
    n: "Sweet corn",
    t: "veg",
    s: "Harvest Jun–Jul",
    nut: ["Fiber", "B vitamins", "Lutein and zeaxanthin"],
    ben: "Yellow kernels carry eye-friendly carotenoids.",
    care: [
      "Full sun", // sun
      "1–1.5 in per week, more at tasseling", // water
      "Rich, deep", // soil
      "Heavy nitrogen feeder", // feed
      "Plant in blocks of 4+ rows, 12 in apart, for pollination", // spacing
    ],
    ok: "Tall, deep-green stalks; silks brown when ears are ready.",
    pr: [
      ["nitrogen", "Yellow lower leaves; corn needs a lot."],
      ["holes", "Earworms at the tips."],
    ],
    good: "Beans, squash, cucumbers (the Three Sisters)",
    bad: "Tomatoes",
  },

  {
    n: "Okra",
    t: "veg",
    s: "Harvest Jun–Oct",
    nut: ["Vitamin K", "Vitamin C", "Folate", "Soluble fiber"],
    ben: "Its soluble fiber thickens gumbo; thrives in August heat.",
    care: [
      "Full sun, loves heat", // sun
      "Drought-tolerant once established", // water
      "Most soils", // soil
      "Light", // feed
      "12–18 in apart", // spacing
    ],
    ok: "Tall plants with hibiscus-like flowers; pick pods at 3 in.",
    pr: [
      ["rootrot", "Root-knot nematodes; rotate the bed."],
      ["curl", "Aphids."],
    ],
    good: "Southern peas, peppers, basil, melons",
    bad: "Nothing major",
  },

  {
    n: "Southern peas (field peas)",
    t: "veg",
    s: "Harvest Jul–Sep",
    nut: ["Plant protein", "Fiber", "Folate", "Iron"],
    ben: "Fresh or dried, a strong protein source for the thin months.",
    care: [
      "Full sun, heat-loving", // sun
      "Moderate", // water
      "Tolerates poor soil", // soil
      "None; fixes its own nitrogen", // feed
      "3–4 in apart", // spacing
    ],
    ok: "Bushy vines, long pods that dry to tan.",
    pr: [
      ["curl", "Cowpea aphids."],
      ["holes", "Stink bugs on pods."],
    ],
    good: "Okra, corn, sweet potatoes",
    bad: "Onions, garlic",
  },

  {
    n: "Sweet potato",
    t: "veg",
    s: "Harvest Sep–Oct",
    nut: ["Vitamin A", "Fiber", "Potassium", "Vitamin C"],
    ben: "A medium sweet potato covers more than a day's vitamin A; young leaves are edible greens.",
    care: [
      "Full sun", // sun
      "Moderate; stop 2–3 weeks before harvest", // water
      "Loose, sandy or raised; heavy clay gives misshapen roots", // soil
      "Low nitrogen", // feed
      "12–18 in apart on raised rows", // spacing
    ],
    ok: "Vines that cover the ground; leaves stay green until frost.",
    pr: [
      ["rootrot", "Rot and nematodes in wet clay."],
      ["holes", "Leaf-chewing beetles; minor."],
    ],
    good: "Bush beans, thyme, oregano",
    bad: "Squash (both sprawl)",
  },

  {
    n: "Malabar spinach",
    t: "veg",
    s: "Harvest Jul–Sep",
    nut: ["Vitamin A", "Vitamin C", "Iron", "Calcium"],
    ben: "A heat-loving climbing green for when real spinach can't grow.",
    care: [
      "Full sun to part shade", // sun
      "Even moisture", // water
      "Rich", // soil
      "Light nitrogen", // feed
      "12 in apart on a trellis", // spacing
    ],
    ok: "Thick, glossy leaves on red or green stems.",
    pr: [
      ["spots", "Leaf spot in wet weather."],
    ],
    good: "Peppers, okra, eggplant",
    bad: "Nothing major",
  },

  // ===================== HERBS =====================

  {
    n: "Basil",
    t: "herb",
    s: "Harvest May–Sep",
    nut: ["Vitamin K", "Flavor compounds"],
    ben: "Used in small amounts, it adds flavor without salt.",
    care: [
      "Full sun", // sun
      "Even moisture", // water
      "Rich, well-drained", // soil
      "Light", // feed
      "12 in apart; pinch flower buds", // spacing
    ],
    ok: "Bushy plants with bright leaves.",
    pr: [
      ["spots", "Downy mildew: yellow leaves with gray fuzz underneath."],
      ["bolt", "Pinch flowers to keep leaves coming."],
    ],
    good: "Tomatoes, peppers, asparagus",
    bad: "Sage, rue",
  },

  {
    n: "Parsley",
    t: "herb",
    s: "Harvest Oct–May",
    nut: ["Vitamin K", "Vitamin C", "Vitamin A"],
    ben: "High in vitamin K for its size; host plant for swallowtail butterflies.",
    care: [
      "Full sun to part shade", // sun
      "Even moisture", // water
      "Rich", // soil
      "Light", // feed
      "8–10 in apart", // spacing
    ],
    ok: "Dense, bright green clumps through winter.",
    pr: [
      ["holes", "Swallowtail caterpillars; plant extra and share."],
    ],
    good: "Tomatoes, asparagus, roses",
    bad: "Lettuce, mint",
  },

  {
    n: "Chives",
    t: "herb",
    s: "Harvest Mar–Nov",
    nut: ["Vitamin K", "Vitamin C"],
    ben: "Perennial mild onion flavor; flowers draw pollinators.",
    care: [
      "Full sun to part shade", // sun
      "Moderate", // water
      "Most soils", // soil
      "None", // feed
      "Clumps 8–12 in apart", // spacing
    ],
    ok: "Grassy hollow leaves, purple pom-pom flowers.",
    pr: [
      ["rootrot", "Only in soggy soil."],
    ],
    good: "Carrots, tomatoes, strawberries, roses",
    bad: "Beans, peas",
  },

  {
    n: "Rosemary",
    t: "herb",
    s: "Harvest year-round",
    nut: ["Antioxidant compounds", "Flavor"],
    ben: "Evergreen in Fulton; a little goes a long way in roasts.",
    care: [
      "Full sun", // sun
      "Dry side; overwatering kills it", // water
      "Sharp drainage, raised or sloped", // soil
      "None", // feed
      "2–3 ft apart", // spacing
    ],
    ok: "Woody, upright stems with needle-like gray-green leaves.",
    pr: [
      ["rootrot", "Clay plus water is the top killer."],
    ],
    good: "Cabbage family, beans, carrots, sage",
    bad: "Basil (different water needs)",
  },

  {
    n: "Thyme",
    t: "herb",
    s: "Harvest year-round",
    nut: ["Vitamin C", "Antioxidant compounds"],
    ben: "A hardy ground cover that brings in pollinators.",
    care: [
      "Full sun", // sun
      "Dry side", // water
      "Well-drained", // soil
      "None", // feed
      "12 in apart", // spacing
    ],
    ok: "Low, dense mats with tiny leaves.",
    pr: [
      ["rootrot", "Rots in heavy wet clay."],
    ],
    good: "Cabbage family, strawberries, tomatoes, eggplant",
    bad: "Nothing major",
  },

  {
    n: "Oregano",
    t: "herb",
    s: "Harvest Apr–Nov",
    nut: ["Antioxidant compounds", "Flavor"],
    ben: "Perennial and nearly carefree.",
    care: [
      "Full sun", // sun
      "Dry side", // water
      "Well-drained", // soil
      "None", // feed
      "12–18 in apart", // spacing
    ],
    ok: "Spreading mounds of small leaves.",
    pr: [
      ["rootrot", "Wet winters in clay."],
    ],
    good: "Peppers, cabbage family, squash",
    bad: "Nothing major",
  },

  {
    n: "Sage",
    t: "herb",
    s: "Harvest year-round",
    nut: ["Vitamin K", "Flavor"],
    ben: "Classic with sweet potatoes and greens.",
    care: [
      "Full sun", // sun
      "Dry side", // water
      "Sharp drainage", // soil
      "None", // feed
      "18–24 in apart", // spacing
    ],
    ok: "Soft gray-green leaves on woody stems.",
    pr: [
      ["rootrot", "Summer humidity plus wet soil."],
      ["mildew", "Mildew in humid weather; thin the plant."],
    ],
    good: "Rosemary, cabbage family, carrots",
    bad: "Cucumbers",
  },

  {
    n: "Mint",
    t: "herb",
    s: "Harvest Apr–Nov",
    nut: ["Flavor", "Traditionally used for indigestion"],
    ben: "Peppermint tea is a classic for an upset stomach.",
    care: [
      "Sun to part shade", // sun
      "Moist", // water
      "Any; grow in a pot so it doesn't spread", // soil
      "None", // feed
      "One pot", // spacing
    ],
    ok: "Spreading stems with fragrant leaves.",
    pr: [
      ["spots", "Rust spots; cut back hard."],
    ],
    good: "Near (not in) cabbage beds, in pots",
    bad: "Parsley, chamomile, open garden beds (it takes over)",
  },

  {
    n: "Chamomile",
    t: "herb",
    s: "Bloom Apr–May",
    nut: ["Calming tea flowers"],
    ben: "Dried flowers make a mild bedtime tea.",
    care: [
      "Full sun", // sun
      "Moderate", // water
      "Average, well-drained", // soil
      "None", // feed
      "8 in apart; sow in fall or late winter", // spacing
    ],
    ok: "Feathery leaves, small daisy flowers.",
    pr: [
      ["curl", "Aphids."],
    ],
    good: "Cabbage family, onions, cucumbers",
    bad: "Mint",
  },

  {
    n: "Lemon balm",
    t: "herb",
    s: "Harvest Apr–Oct",
    nut: ["Calming tea leaves"],
    ben: "Lemon-scented tea herb that comes back every year.",
    care: [
      "Part shade in Georgia summers", // sun
      "Moderate", // water
      "Most soils", // soil
      "None", // feed
      "18 in apart; cut before it seeds", // spacing
    ],
    ok: "Bright green, heart-shaped, lemony leaves.",
    pr: [
      ["mildew", "Powdery mildew in humid shade."],
    ],
    good: "Squash, melons (draws pollinators)",
    bad: "Open beds (reseeds heavily)",
  },

  {
    n: "Ginger",
    t: "herb",
    s: "Plant Apr, harvest Oct–Nov",
    nut: ["Gingerols"],
    ben: "Evidence supports ginger for easing nausea.",
    care: [
      "Part shade", // sun
      "Even moisture", // water
      "Rich, loose; a large pot works well", // soil
      "Compost", // feed
      "One root per 12 in pot", // spacing
    ],
    ok: "Tall, reedy stems with long narrow leaves.",
    pr: [
      ["rootrot", "Rots in cold, wet soil; plant after soil warms."],
    ],
    good: "Shade-tolerant herbs",
    bad: "Cold, soggy spots",
  },

  {
    n: "Aloe vera",
    t: "herb",
    s: "Year-round, indoors in winter",
    nut: ["Topical use only, not for eating"],
    ben: "The clear gel soothes minor burns and sunburn. Don't eat the leaf.",
    care: [
      "Bright light; afternoon shade outdoors in summer", // sun
      "Water only when soil is fully dry", // water
      "Cactus potting mix", // soil
      "None", // feed
      "One pot; bring inside below 50°F", // spacing
    ],
    ok: "Firm, plump, upright gray-green leaves.",
    pr: [
      ["rootrot", "Overwatering turns leaves soft and brown."],
      ["scorch", "Reddish leaves from too much sun."],
    ],
    good: "Other succulents in pots",
    bad: "Wet garden beds",
  },
];

// Display names for the plant types, used for each entry's subtitle.
export const TYPE: Record<string, string> = {
  fruit: "Fruit",
  veg: "Vegetable",
  herb: "Herb",
};
