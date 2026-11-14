// The backyard fish guide: Georgia rules, choosing fish, gear, building an aquaponics system, cycling the water, care and problems.
// Its rules and seasons are written for Georgia; the page shows a note saying so (LocalRules) above it.
import Callout from "@/frontend/components/ui/Callout";
import Columns from "@/frontend/components/ui/Columns";
import Packet from "@/frontend/components/ui/Packet";
import SectionHeader from "@/frontend/components/ui/SectionHeader";
import Steps from "@/frontend/components/ui/Steps";
import TableCard from "@/frontend/components/ui/TableCard";
import GearTable, { type GearRow } from "./GearTable";
import GuideNav from "./GuideNav";
import GuideSection from "./GuideSection";
import Guide from "./Guide";

// The gear checklist: item, how much it matters, and why.
const GEAR: GearRow[] = [
  { item: "Fish tank", need: "Required", required: true, why: "A food-grade IBC tote (275 gal), stock tank or large barrel. Never a container that held chemicals." },
  { item: "Grow bed", need: "Required", required: true, why: "About the same volume as the fish tank, 10–12 in deep. A cut-down IBC top works." },
  { item: "Grow media", need: "Required", required: true, why: "Expanded clay pebbles or washed ¾-in gravel (avoid limestone, which raises pH)." },
  { item: "Water pump", need: "Required", required: true, why: "Moves the full tank volume about once an hour. Submersible, rated for continuous duty." },
  { item: "Air pump and air stones", need: "Required", required: true, why: "Fish die within hours without oxygen. Run 24/7, separate from the water pump." },
  { item: "Battery backup air pump", need: "Required", required: true, why: "Georgia storms knock out power. This saves your fish." },
  { item: "Plumbing", need: "Required", required: true, why: "PVC pipe and fittings, bulkhead fittings, and a bell siphon to flood and drain the grow bed." },
  { item: "Solids filter", need: "Optional", required: false, why: "A swirl or settling filter for larger fish loads." },
  { item: "Test kit", need: "Required", required: true, why: "Liquid kit for pH, ammonia, nitrite and nitrate. Strips are less accurate." },
  { item: "Thermometer", need: "Required", required: true, why: "Waterproof, in the fish tank." },
  { item: "Dechlorinator", need: "Required", required: true, why: "City water may contain chlorine or chloramine; use a product that neutralizes both." },
  { item: "Fish feed", need: "Required", required: true, why: "Floating pellets sized to your fish, stored dry and sealed." },
  { item: "Dip net and quarantine tub", need: "Required", required: true, why: "Moving fish and isolating sick ones." },
  { item: "Cover or netting", need: "Required", required: true, why: "Herons, raccoons and cats will fish your tank." },
  { item: "Shade cloth", need: "Required", required: true, why: "Keeps summer water from overheating and stops algae." },
  { item: "Tank heater", need: "Optional", required: false, why: "Required for tilapia through Fulton winters; sized to the tank volume." },
];

export default function FishGuide() {
  return (
    <Guide>
      <SectionHeader
        kicker="Backyard aquaculture"
        title="Fish farming"
        tone="blue"
        lead="The most practical backyard setup is aquaponics: fish in a tank, with their waste feeding plants in a grow bed that cleans the water. It produces both fish and leafy greens. Plan on a few minutes a day and a 4–6 week startup before fish go in."
      />
      <GuideNav
        links={[
          ["#f-1", "1. Legal"],
          ["#f-2", "2. Choose your fish"],
          ["#f-3", "3. Gear"],
          ["#f-4", "4. Build"],
          ["#f-5", "5. Cycle"],
          ["#f-6", "6. Daily care"],
          ["#f-7", "7. Georgia year"],
          ["#f-8", "8. Problems"],
          ["#f-9", "9. Harvest"],
          ["#f-10", "10. Pond option"],
        ]}
      />
      <GuideSection id="f-1" title="1. Georgia rules first">
        <Callout tone="blue" title="Tilapia are regulated in Georgia">
          <p>Georgia DNR treats tilapia as an exotic species. You can keep them without a license only in a closed tank that discharges no water except during cleaning, and cleaning water must pass through a filter that removes all fish and eggs before going to a permitted septic or sewer system. Otherwise you need a Wild Animal License. Tilapia may never be stocked into ponds or lakes, and selling them always takes a DNR license. Details: <a href="https://georgiawildlife.com/tilapia" target="_blank" rel="noopener">Georgia DNR, Tilapia</a>.</p>
        </Callout>
        <Steps>
          <li>Never release any farmed fish into a creek, pond or lake.</li>
          <li>Buy fish from a licensed Georgia dealer or hatchery.</li>
          <li>Grass carp for weed control must be certified sterile (triploid) in Georgia; check with DNR before buying.</li>
        </Steps>
      </GuideSection>
      <GuideSection id="f-2" title="2. Choose your fish">
        <TableCard>
          <table>
            <thead>
              <tr><th>Fish</th><th>Water temperature</th><th>Time to eat size</th><th>Fit for Fulton</th></tr>
            </thead>
            <tbody>
              <tr><td>Channel catfish</td><td>Survives winter outdoors; grows best 75–85°F</td><td>12–18 months to 1–1.5 lb</td><td>Best beginner choice outdoors</td></tr>
              <tr><td>Bluegill</td><td>Survives winter outdoors; grows best 70–80°F</td><td>12–18 months to pan size</td><td>Hardy, but slow and small</td></tr>
              <tr><td>Tilapia</td><td>Needs about 70–85°F; stops eating near 60°F and dies near 50°F</td><td>6–9 months to about 1 lb</td><td>Fastest, but needs a heated tank or greenhouse from October to April, plus Georgia&apos;s tank rules</td></tr>
            </tbody>
          </table>
        </TableCard>
      </GuideSection>
      <GuideSection id="f-3" title="3. Gear requirements">
        <GearTable id="fish" rows={GEAR} />
      </GuideSection>
      <GuideSection id="f-4" title="4. Build the system">
        <Steps ordered>
          <li>Set the fish tank on level, solid ground in part shade, near power with a GFCI outlet.</li>
          <li>Put the grow bed beside or above the tank so it drains back by gravity.</li>
          <li>Fill the grow bed with rinsed media. Install the bell siphon so the bed floods and drains every 15–20 minutes.</li>
          <li>Plumb the pump to send tank water up to the grow bed.</li>
          <li>Fill the tank, add dechlorinator, and start the air pump and water pump.</li>
          <li>Run it for a day and check for leaks.</li>
        </Steps>
      </GuideSection>
      <GuideSection id="f-5" title="5. Cycle the water (4–6 weeks)">
        <p>Helpful bacteria have to grow before fish go in. They turn fish waste (ammonia) into nitrite, then into nitrate, which feeds plants.</p>
        <Steps ordered>
          <li>Add a small ammonia source: a pinch of fish food daily or pure ammonia sold for fishless cycling, aiming for about 2 ppm.</li>
          <li>Test every 2–3 days. Ammonia rises, then nitrite rises, then both fall.</li>
          <li>The system is ready when ammonia and nitrite read 0 and nitrate is rising.</li>
          <li>Plant hardy greens (lettuce, kale, basil, Malabar spinach in summer) once nitrate shows up.</li>
          <li>Add fish a few at a time. Start light: about 1 lb of adult fish per 10 gallons of tank water.</li>
        </Steps>
      </GuideSection>
      <GuideSection id="f-6" title="6. Daily and weekly care">
        <Columns min={15}>
          <Packet tone="blue" title="Daily">
            <Steps compact>
              <li>Feed only what fish eat in about 5 minutes, once or twice.</li>
              <li>Check that the pumps run and the grow bed floods and drains.</li>
              <li>Check water temperature.</li>
              <li>Look at the fish: eating and swimming normally?</li>
            </Steps>
          </Packet>
          <Packet title="Weekly">
            <Steps compact>
              <li>Test pH, ammonia, nitrite and nitrate; keep pH about 6.8–7.2.</li>
              <li>Top up water lost to evaporation with dechlorinated water.</li>
              <li>Clean the pump intake and any solids filter.</li>
              <li>Harvest greens to keep plants pulling nutrients.</li>
            </Steps>
          </Packet>
        </Columns>
      </GuideSection>
      <GuideSection id="f-7" title="7. The Georgia fish year">
        <TableCard>
          <table>
            <thead>
              <tr><th>When</th><th>What is happening</th><th>Your job</th></tr>
            </thead>
            <tbody>
              <tr><td>Apr–Jun</td><td>Water warms; fast growth</td><td>Stock new fish. Feed more as fish eat more.</td></tr>
              <tr><td>Jul–Aug</td><td>Water can top 85°F; oxygen drops</td><td>Shade cloth, extra aeration. Feed less on the hottest days.</td></tr>
              <tr><td>Sep–Oct</td><td>Cooling</td><td>Harvest tilapia before water drops under 65°F, or heat the tank.</td></tr>
              <tr><td>Nov–Mar</td><td>Cold water; catfish and bluegill slow down</td><td>Feed lightly or not at all below about 50°F. Keep air pumps running.</td></tr>
            </tbody>
          </table>
        </TableCard>
      </GuideSection>
      <GuideSection id="f-8" title="8. Problems">
        <Steps>
          <li><b>Fish gasping at the surface:</b> low oxygen. Add aeration immediately and check the air pump.</li>
          <li><b>Ammonia or nitrite above 0.5 ppm:</b> stop feeding, replace a quarter of the water with dechlorinated water, and check for dead fish or rotting food.</li>
          <li><b>pH falling below 6.5:</b> add a small amount of crushed oyster shell or potassium bicarbonate to the grow bed.</li>
          <li><b>White fuzz, sores or clamped fins:</b> move the fish to the quarantine tub; ask the UGA Extension office about diagnosis.</li>
          <li><b>Power outage:</b> switch to the battery air pump right away.</li>
        </Steps>
      </GuideSection>
      <GuideSection id="f-9" title="9. Harvest and food safety">
        <Steps ordered>
          <li>Stop feeding 1–2 days before harvest.</li>
          <li>Net the fish and humanely dispatch them quickly, then chill them on ice right away.</li>
          <li>Clean and refrigerate within a few hours, or freeze.</li>
          <li>Cook fish to 145°F, until the flesh is opaque and flakes.</li>
          <li>Wash greens from the grow bed well, and keep tank water off leaves you’ll eat raw.</li>
        </Steps>
      </GuideSection>
      <GuideSection id="f-10" title="10. Pond option">
        <Steps>
          <li>If you have land for a pond, channel catfish and bluegill are classic Georgia pond fish; bass are usually added with bluegill in larger ponds.</li>
          <li>Get the pond’s size, depth and stocking rates from the UGA Extension office before buying fish, and buy only from a licensed hatchery.</li>
          <li>A pond aerator keeps fish alive through hot August nights.</li>
        </Steps>
      </GuideSection>
    </Guide>
  );
}
