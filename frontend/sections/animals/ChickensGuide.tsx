// The backyard chickens guide: city rules, breeds for heat, gear, the coop, chicks, care, the year, health and safety.
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
  { item: "Coop", need: "Required", required: true, why: "At least 4 sq ft of floor per bird, raised off the ground. Easy-clean doors." },
  { item: "Run", need: "Required", required: true, why: "At least 10 sq ft per bird, fully enclosed with a roof. Hawks are common in Fulton." },
  { item: "½-inch hardware cloth", need: "Required", required: true, why: "Not chicken wire, which raccoons tear through. Bury it 12 in or lay a 2-ft apron out from the walls." },
  { item: "Predator-proof latches", need: "Required", required: true, why: "Two-step latches or carabiners. Raccoons open simple hooks." },
  { item: "Ventilation", need: "Required", required: true, why: "About 1 sq ft of screened vent per bird, high on the walls. Heat kills more Georgia chickens than cold." },
  { item: "Roost bars", need: "Required", required: true, why: "2x4 with the wide side up, 8–10 in of length per bird, higher than the nest boxes." },
  { item: "Nest boxes", need: "Required", required: true, why: "About 12×12 in, one per 4 hens, darker and lower than the roosts." },
  { item: "Feeder", need: "Required", required: true, why: "Hanging or treadle feeder to keep rats and wild birds out." },
  { item: "Waterer", need: "Required", required: true, why: "Holds at least a day’s water; hens drink much more in summer. Nipple waterers stay cleaner." },
  { item: "Layer feed (16% protein)", need: "Required", required: true, why: "Main diet from about 18 weeks or the first egg." },
  { item: "Oyster shell", need: "Required", required: true, why: "Free choice in a separate dish for strong eggshells." },
  { item: "Grit", need: "Optional", required: false, why: "Needed if birds eat grains or scraps but can’t free-range." },
  { item: "Bedding", need: "Required", required: true, why: "Pine shavings or straw for the coop floor and nests." },
  { item: "Shade and summer cooling", need: "Required", required: true, why: "Shade cloth over the run, a fan for the coop, frozen water bottles on hot days." },
  { item: "Feed storage", need: "Required", required: true, why: "Metal trash can with a tight lid against rats." },
  { item: "First aid kit", need: "Required", required: true, why: "Saline, wound spray made for poultry, vet wrap, poultry electrolytes, gloves, and a dog crate for isolating a sick bird." },
  { item: "Brooder (for chicks)", need: "Optional", required: false, why: "Tub or box, heat plate (safer than a heat lamp), thermometer, chick feeder and waterer, chick starter feed." },
];

export default function ChickensGuide() {
  return (
    <Guide>
      <SectionHeader
        kicker="Backyard laying hens"
        title="Chickens"
        tone="red"
        lead="A small flock of 4–6 hens gives about 3–5 eggs a day in season, eats kitchen scraps and garden pests, and produces compost-rich manure. Plan on 10–15 minutes a day and birds that live 6–10 years, with laying slowing after about 3."
      />
      <GuideNav
        links={[
          ["#c-1", "1. Rules"],
          ["#c-2", "2. Breeds"],
          ["#c-3", "3. Gear"],
          ["#c-4", "4. Coop setup"],
          ["#c-5", "5. Chicks"],
          ["#c-6", "6. Daily routine"],
          ["#c-7", "7. Georgia year"],
          ["#c-8", "8. Health"],
          ["#c-9", "9. Eggs and garden"],
          ["#c-10", "10. Safety"],
        ]}
      />
      <GuideSection id="c-1" title="1. Know your city’s rules">
        <p>Every Fulton city sets its own limits. Alpharetta has allowed up to 6 chickens on lots of at least 1 acre and Milton about 12 per acre, but rules change, and published numbers for Atlanta conflict. Call your city’s planning or zoning office before buying birds, and check HOA rules and your lease.</p>
        <Steps>
          <li>Hens only is the safe assumption; many cities ban roosters.</li>
          <li>Ask about coop setbacks from property lines and neighbors&apos; houses.</li>
          <li>Ask whether slaughter is allowed, if that matters to you.</li>
        </Steps>
      </GuideSection>
      <GuideSection id="c-2" title="2. Breeds for Georgia heat">
        <TableCard>
          <table>
            <thead>
              <tr><th>Breed</th><th>Eggs per year (approx.)</th><th>Notes</th></tr>
            </thead>
            <tbody>
              <tr><td>Leghorn</td><td>250–300 white</td><td>Best heat tolerance, flighty, small eater</td></tr>
              <tr><td>Rhode Island Red</td><td>200–250 brown</td><td>Hardy, handles heat and cold</td></tr>
              <tr><td>Barred Plymouth Rock</td><td>200 brown</td><td>Friendly, good with kids</td></tr>
              <tr><td>Australorp</td><td>250 brown</td><td>Calm, steady layer</td></tr>
              <tr><td>Easter Egger</td><td>200 blue or green</td><td>Hardy and fun egg colors</td></tr>
            </tbody>
          </table>
        </TableCard>
        <p>Avoid heavy, very fluffy breeds like Cochins and Brahmas, which suffer in July and August.</p>
      </GuideSection>
      <GuideSection id="c-3" title="3. Gear requirements">
        <GearTable id="hen" rows={GEAR} />
      </GuideSection>
      <GuideSection id="c-4" title="4. Coop setup">
        <Steps ordered>
          <li>Pick high, well-drained ground with afternoon shade.</li>
          <li>Lay hardware cloth under or around the run before building on it.</li>
          <li>Build or place the coop, then wire the run on all sides and the top.</li>
          <li>Hang the feeder and waterer at the height of the birds&apos; backs to cut waste.</li>
          <li>Spread 3–4 in of bedding on the coop floor and fill the nest boxes.</li>
          <li>Put a ceramic or wooden egg in each nest box to show young hens where to lay.</li>
        </Steps>
      </GuideSection>
      <GuideSection id="c-5" title="5. Raising chicks">
        <Steps ordered>
          <li>Buy chicks in spring (March–April) from a hatchery or farm store; ask for vaccinated, sexed pullets.</li>
          <li>Brooder temperature: about 95°F at chick level in week 1, then 5°F lower each week. Chicks huddled under the heat are cold; spread far away and panting are hot.</li>
          <li>Give chick starter feed and clean water at all times. Dip each beak in water on arrival.</li>
          <li>Check daily for a dried, pasted-over vent and clean it with warm water.</li>
          <li>Move them to the coop at about 6–8 weeks, when fully feathered and nights stay mild.</li>
          <li>Switch to layer feed at about 18 weeks or when the first egg appears (usually 18–24 weeks).</li>
        </Steps>
      </GuideSection>
      <GuideSection id="c-6" title="6. Daily, weekly and monthly routine">
        <Columns min={15}>
          <Packet tone="red" title="Daily">
            <Steps compact>
              <li>Open the coop in the morning; lock it at dusk every night.</li>
              <li>Fresh water and feed.</li>
              <li>Collect eggs once or twice (twice in summer).</li>
              <li>Watch each bird for a minute: eating, moving, bright eyes.</li>
            </Steps>
          </Packet>
          <Packet title="Weekly and monthly">
            <Steps compact>
              <li>Weekly: scrub waterers, rake droppings under the roost, top up bedding.</li>
              <li>Monthly: full bedding change into the compost pile, check birds under the wings for mites and lice, check fences and latches.</li>
            </Steps>
          </Packet>
        </Columns>
      </GuideSection>
      <GuideSection id="c-7" title="7. The Georgia chicken year">
        <TableCard>
          <table>
            <thead>
              <tr><th>When</th><th>What is happening</th><th>Your job</th></tr>
            </thead>
            <tbody>
              <tr><td>March–May</td><td>Peak laying; chick season</td><td>Start chicks. Watch for broody hens sitting on nests.</td></tr>
              <tr><td>June–August</td><td>Heat over 90°F, black rat snakes after eggs, laying slows</td><td>Shade, fans, cold water, frozen treats, electrolytes. Collect eggs twice. Close gaps over ½ in.</td></tr>
              <tr><td>Sept–Nov</td><td>Molt: feathers drop, eggs stop</td><td>Raise protein (switch to an 18–20% feed for a few weeks). Don’t handle molting birds much.</td></tr>
              <tr><td>Dec–Feb</td><td>Short days, few eggs</td><td>No heat lamps for adult birds (fire risk); keep the coop dry and draft-free with vents open high.</td></tr>
            </tbody>
          </table>
        </TableCard>
      </GuideSection>
      <GuideSection id="c-8" title="8. Health problems to know">
        <Steps>
          <li><b>Heat stress:</b> panting, wings held out, pale combs. Move to shade, offer cool water with electrolytes. Can kill in hours.</li>
          <li><b>Mites and lice:</b> dirty vent feathers, pale combs, crawling specks at night. Treat birds and the coop with a poultry-labeled product.</li>
          <li><b>Bumblefoot:</b> swollen foot with a dark scab, from rough roosts. Soak and clean; see a vet for deep infections.</li>
          <li><b>Egg binding:</b> straining, tail pumping, sitting fluffed up. Warm soak and a quiet crate; call a vet if not resolved in a few hours.</li>
          <li><b>Respiratory illness:</b> sneezing, bubbles at the eyes, rattling breath. Isolate the bird.</li>
          <li><b>Avian influenza:</b> several sudden deaths, swollen purple combs, or a sharp drop in eating and laying. Report it right away to the Georgia Department of Agriculture or the state veterinarian, and don’t move birds.</li>
        </Steps>
      </GuideSection>
      <GuideSection id="c-9" title="9. Eggs and the garden">
        <Steps>
          <li>Collect daily; discard cracked or dirty-shelled eggs, or wash just before use.</li>
          <li>Unwashed clean eggs keep their natural coating. Refrigerate once washed, and refrigerate all eggs for longest life.</li>
          <li>Cook eggs until whites and yolks are firm.</li>
          <li>Compost manure and bedding at least 6 months before using it on vegetables. Never spread fresh manure on crops you’ll eat soon.</li>
          <li>Let hens into a garden bed only after harvest or before planting. They’ll eat pests and till, but they’ll also eat seedlings.</li>
        </Steps>
      </GuideSection>
      <GuideSection id="c-10" title="10. Safety">
        <Callout title="Salmonella">
          <p>Healthy-looking chickens can carry Salmonella. Wash hands with soap after touching birds, eggs or anything in the coop. Don&apos;t kiss or snuggle birds, keep them out of the kitchen, and supervise children under 5 closely.</p>
        </Callout>
      </GuideSection>
    </Guide>
  );
}
