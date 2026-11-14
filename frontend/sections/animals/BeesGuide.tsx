// The beekeeping guide: getting started, gear, getting bees, inspections, the year, problems, harvest and safety.
// Its rules and seasons are written for Georgia; the page shows a note saying so (LocalRules) above it.
import Callout from "@/frontend/components/ui/Callout";
import SectionHeader from "@/frontend/components/ui/SectionHeader";
import Steps from "@/frontend/components/ui/Steps";
import TableCard from "@/frontend/components/ui/TableCard";
import GearTable, { type GearRow } from "./GearTable";
import GuideNav from "./GuideNav";
import GuideSection from "./GuideSection";
import Guide from "./Guide";

// The gear checklist: item, how much it matters, and why.
const GEAR: GearRow[] = [
  { item: "Hive stand", need: "Required", required: true, why: "Holds the hive 16–18 in off the ground. Keeps out moisture, toads and ants and saves your back." },
  { item: "Bottom board", need: "Required", required: true, why: "Screened bottom boards help with ventilation and varroa monitoring in Georgia heat." },
  { item: "2 deep brood boxes (10-frame or 8-frame)", need: "Required", required: true, why: "The colony lives and stores winter honey here. Pick one size and keep everything matching; 8-frame is lighter to lift." },
  { item: "Frames with foundation", need: "Required", required: true, why: "20 for two 10-frame deeps (16 for 8-frame). Foundation gives bees a straight guide to build comb." },
  { item: "Inner cover and telescoping outer cover", need: "Required", required: true, why: "Weatherproof roof plus insulation." },
  { item: "Entrance reducer", need: "Required", required: true, why: "Narrows the entrance for new colonies and during summer robbing." },
  { item: "2–3 medium honey supers with frames", need: "Required", required: true, why: "Added on top during the spring flow for the honey you harvest." },
  { item: "Queen excluder", need: "Optional", required: false, why: "Keeps the queen out of honey supers. Many keepers skip it." },
  { item: "Veil and jacket, or full suit", need: "Required", required: true, why: "Veil is the minimum; a ventilated jacket is far cooler in Georgia summers." },
  { item: "Gloves", need: "Required", required: true, why: "Leather or thick nitrile. Many keepers move to thinner gloves as they gain confidence." },
  { item: "Smoker and fuel", need: "Required", required: true, why: "Pine straw is free and burns cool. Smoke calms bees by masking alarm scent." },
  { item: "Hive tool", need: "Required", required: true, why: "Pries apart boxes and frames that bees glue together with propolis. Buy two; you’ll lose one." },
  { item: "Bee brush", need: "Optional", required: false, why: "Gently moves bees off frames." },
  { item: "Feeder (top, frame or entrance)", need: "Required", required: true, why: "For new colonies and light hives. Mix 1:1 sugar water in spring, 2:1 in fall." },
  { item: "Varroa testing kit", need: "Required", required: true, why: "Jar for an alcohol wash or sugar roll of about 300 bees (½ cup). Testing is non-negotiable." },
  { item: "Approved varroa treatments", need: "Required", required: true, why: "Such as oxalic acid, formic acid or thymol products. Use only EPA-registered products and follow the label exactly." },
  { item: "Small hive beetle traps", need: "Required", required: true, why: "Oil traps between frames. Beetles are a major Georgia pest." },
  { item: "Ratchet straps", need: "Optional", required: false, why: "Hold boxes together in storms and when moving hives." },
  { item: "Mouse guard", need: "Optional", required: false, why: "Metal entrance guard for November–February." },
  { item: "Harvest gear", need: "Optional", required: false, why: "Fume board or bee escape, uncapping knife, extractor (borrow from a club), double strainer, 5-gal bucket with honey gate, jars." },
];

export default function BeesGuide() {
  return (
    <Guide>
      <SectionHeader
        kicker="Honeybees"
        title="Beekeeping"
        tone="yellow"
        lead="Two hives is the usual start: you can compare them and borrow frames from one to save the other. Expect about an hour per hive every week or two in spring and summer, and plan on no honey harvest the first year."
      />
      <GuideNav
        links={[
          ["#b-1", "1. Before you start"],
          ["#b-2", "2. Gear"],
          ["#b-3", "3. Getting bees"],
          ["#b-4", "4. Inspections"],
          ["#b-5", "5. Georgia year"],
          ["#b-6", "6. Problems"],
          ["#b-7", "7. Harvest"],
          ["#b-8", "8. Safety"],
        ]}
      />
      <GuideSection id="b-1" title="1. Before you start">
        <Steps>
          <li>Check your city’s rules and any HOA rules. Fulton cities set their own limits on hives, setbacks and lot size.</li>
          <li>In Georgia, people who sell bees or queens must be inspected and certified through the Georgia Department of Agriculture apiary program. A hobby keeper with a few hives for honey generally needs no state permit, but confirm with the department.</li>
          <li>Tell close neighbors. A hive set back from property lines, with a 6-ft fence or hedge in front of the entrance, sends bees up and over people’s heads.</li>
          <li>Put a water source (a birdbath with stones) near the hive so bees don’t visit a neighbor’s pool.</li>
          <li>Ask anyone in your household about sting allergies first. Someone with a known allergy should talk to their doctor before you start.</li>
          <li>Join a local beekeeping club. Members lend extractors, share swarm calls and help with first inspections. The <a href="https://bees.caes.uga.edu" target="_blank" rel="noopener">UGA Bee Program</a> runs courses and certification.</li>
        </Steps>
        <Callout tone="yellow" title="Hive spot checklist">
          <p>Morning sun, afternoon shade (Georgia summers stress hives and help small hive beetles), entrance facing east or south, away from walkways and play areas, level ground, and room for you to work from behind the hive.</p>
        </Callout>
      </GuideSection>
      <GuideSection id="b-2" title="2. Gear requirements">
        <GearTable id="bee" rows={GEAR} />
      </GuideSection>
      <GuideSection id="b-3" title="3. Getting bees">
        <Steps ordered>
          <li>Order bees in December or January. Georgia suppliers sell out early; pickup is usually late March to April.</li>
          <li>Choose a nuc (5 frames of comb, brood, bees and a laying queen) for the easiest start, or a 3-lb package (bees plus a caged queen) for a lower price.</li>
          <li>Set up and level the hive before pickup day.</li>
          <li>Install a nuc by moving its 5 frames, in the same order, into the center of a deep box, then fill the box with empty frames.</li>
          <li>Install a package in the late afternoon: hang the queen cage between center frames, shake the bees in, close up and feed 1:1 syrup.</li>
          <li>Check 5–7 days later that the queen is out of her cage and laying. Then leave them alone for a week.</li>
        </Steps>
      </GuideSection>
      <GuideSection id="b-4" title="4. Inspections">
        <p>Every 7–10 days in spring, every 2 weeks in summer and fall, rarely in winter. Pick a warm, calm, sunny midday.</p>
        <Steps ordered>
          <li>Light the smoker; puff smoke at the entrance and under the lid, wait a minute.</li>
          <li>Remove an outside frame first so you have room to work.</li>
          <li>Look for eggs (tiny upright rice grains), a solid brood pattern, pollen and honey stores.</li>
          <li>Look for queen cells on frame bottoms; in spring they mean swarming is coming.</li>
          <li>Count frames covered with bees. Add a box when 7–8 of 10 frames are full.</li>
          <li>Record what you saw in a notebook every time.</li>
        </Steps>
      </GuideSection>
      <GuideSection id="b-5" title="5. The Georgia beekeeping year">
        <TableCard>
          <table>
            <thead>
              <tr><th>When</th><th>What is happening</th><th>Your job</th></tr>
            </thead>
            <tbody>
              <tr><td>Jan–Feb</td><td>Red maple blooms; queen starts laying</td><td>Lift the back of the hive to check weight; feed if light. Order bees. Build and paint equipment.</td></tr>
              <tr><td>March</td><td>Fast buildup</td><td>Inspect weekly. Give room and consider splitting strong hives to prevent swarms.</td></tr>
              <tr><td>April–May</td><td>Main nectar flow: tulip poplar, blackberry, clover. Peak swarm season.</td><td>Add honey supers early. Check for queen cells weekly. Catch swarms.</td></tr>
              <tr><td>June</td><td>Flow ends</td><td>Harvest capped honey. Test for varroa right after harvest.</td></tr>
              <tr><td>July–August</td><td>Dearth: little nectar, robbing, mites peak</td><td>Reduce entrances, don’t spill syrup, treat varroa if counts are high. Keep small hive beetle traps clean.</td></tr>
              <tr><td>Sept–Oct</td><td>Goldenrod and aster flow</td><td>Feed 2:1 syrup if hives are light. Combine weak colonies.</td></tr>
              <tr><td>Nov–Dec</td><td>Cluster for winter</td><td>Mouse guards on. Leave them alone except quick weight checks. A broodless oxalic acid treatment, by label, if needed.</td></tr>
            </tbody>
          </table>
        </TableCard>
      </GuideSection>
      <GuideSection id="b-6" title="6. Problems and how to spot them">
        <Steps>
          <li><b>Varroa mites:</b> the leading cause of colony loss. Test monthly from spring to fall; treat by label when counts pass about 3 mites per 100 bees. Deformed, crumpled wings are a late sign.</li>
          <li><b>Small hive beetles:</b> slimy, fermented-smelling comb with larvae. Keep colonies strong, hives in sun, traps refreshed, and never give a weak hive more space than it can guard.</li>
          <li><b>Wax moths:</b> webbing and tunnels in stored or weak-hive comb. Freeze frames 48 hours before storing.</li>
          <li><b>Queenless:</b> no eggs or young larvae and loud, cranky bees. Add a frame of eggs from your other hive so they can raise a queen, or buy one.</li>
          <li><b>Swarming:</b> half the bees leave with the old queen. Prevent by giving room and splitting in spring.</li>
          <li><b>Robbing:</b> fighting at the entrance, wax bits on the landing board. Reduce the entrance and cover it with a wet towel briefly.</li>
          <li><b>Foulbrood (AFB/EFB):</b> sunken, greasy, foul-smelling brood. Report it to the Georgia Department of Agriculture apiary inspector. Don’t move or sell equipment.</li>
        </Steps>
      </GuideSection>
      <GuideSection id="b-7" title="7. Harvest">
        <Steps ordered>
          <li>Take only capped honey from the supers. Leave the brood boxes&apos; honey for the bees; in Fulton a colony needs about 40–60 lb to get through winter.</li>
          <li>Clear bees from the supers with a bee escape the night before or a fume board.</li>
          <li>Slice off the wax cappings, spin the frames in an extractor, strain twice and let it settle a day.</li>
          <li>Bottle in clean, dry jars. Honey with too much moisture ferments, so harvest only capped frames.</li>
          <li>Return wet frames to the hives for the bees to clean.</li>
        </Steps>
      </GuideSection>
      <GuideSection id="b-8" title="8. Safety">
        <Callout title="Allergic reaction">
          <p>Hives spreading beyond the sting, swelling of the face, lips or throat, wheezing, dizziness or trouble breathing: call 911. Use an epinephrine auto-injector if one is prescribed.</p>
        </Callout>
        <Steps>
          <li>Scrape a stinger out sideways with a fingernail or card; don’t squeeze it.</li>
          <li>Never work bees alone if you’re new, or without a phone nearby.</li>
          <li>Keep the smoker on a non-flammable surface; dry Georgia summers make grass fires easy.</li>
        </Steps>
      </GuideSection>
    </Guide>
  );
}
