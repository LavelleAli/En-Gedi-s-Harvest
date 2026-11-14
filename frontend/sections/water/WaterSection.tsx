// The safe water page: clearing, boiling and sun treatment, bleach doses, tablets and filters, a homemade
// sediment filter, and storage. Steps follow CDC emergency guidance.
import { Hero } from "@/frontend/components/Photo";
import Callout from "@/frontend/components/ui/Callout";
import SectionHeader from "@/frontend/components/ui/SectionHeader";
import SourceNote from "@/frontend/components/ui/SourceNote";
import Steps from "@/frontend/components/ui/Steps";
import BleachTable from "./BleachTable";
import MakeItSafe from "./MakeItSafe";
import SedimentFilter from "./SedimentFilter";
import TabletsAndFilters from "./TabletsAndFilters";
import Page from "@/frontend/components/ui/Page";

export default function WaterSection() {
  return (
    <Page>
      <SectionHeader
        kicker="Filtering and purifying"
        title="Safe water"
        tone="blue"
        picture={<Hero slot="hero-water" alt="Water coming to a boil in a pot" />}
        lead={
          <>
            Boiling is the most reliable way to make water safe. Filtering clears dirt and some germs; disinfecting kills the rest. For untreated
            water, do both. Steps follow CDC emergency guidance.
          </>
        }
      />
      <Callout title="Hard limit">
        <p>
          No home method makes water safe if it contains fuel, toxic chemicals or radioactive material. Use bottled water and contact your local
          health department.
        </p>
      </Callout>
      <MakeItSafe />
      <h3>Household bleach</h3>
      <p>Plain, unscented bleach only. Check the label: most US bleach is 5–9% sodium hypochlorite. Stir, then wait at least 30 minutes before drinking.</p>
      <BleachTable />
      <Callout tone="blue" title="What bleach misses">
        <p>Bleach kills bacteria and viruses but not reliably the parasites Giardia and Cryptosporidium. Boil when you can.</p>
      </Callout>
      <TabletsAndFilters />
      <SedimentFilter />
      <h3>Storage</h3>
      <Steps>
        <li>At least 1 gallon per person (and per pet) per day, for at least 3 days.</li>
        <li>Clean, food-grade containers with tight lids, in a cool, dark place.</li>
      </Steps>
      <SourceNote>
        Source:{" "}
        <a href="https://www.cdc.gov/water-emergency/about/index.html" target="_blank" rel="noopener noreferrer">
          CDC, How to Make Water Safe in an Emergency
        </a>
      </SourceNote>
    </Page>
  );
}
