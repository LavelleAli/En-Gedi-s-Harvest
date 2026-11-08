import { Hero } from "@/components/Photo";

const BLEACH = [
  ["1 quart or liter", "2 drops", "4 drops"],
  ["1 gallon", "8 drops (a little under ⅛ tsp)", "16 drops"],
  ["5 gallons", "40 drops (½ tsp)", "80 drops (1 tsp)"],
];

function Packet({ title, children }) {
  return (
    <div className="packet b">
      <header><h3>{title}</h3></header>
      <div className="body">{children}</div>
    </div>
  );
}

export default function WaterSection() {
  return (
    <section className="view">
      <div>
        <div className="kicker" style={{ color: "var(--blue)" }}>Filtering and purifying</div>
        <h2>Safe water</h2>
      </div>
      <Hero slot="hero-water" alt="Water coming to a boil in a pot" />
      <p className="lead">
        Boiling is the most reliable way to make water safe. Filtering clears dirt and some germs; disinfecting kills the rest. For untreated
        water, do both. Steps follow CDC emergency guidance.
      </p>
      <div className="callout">
        <strong>Hard limit</strong>
        <p>No home method makes water safe if it contains fuel, toxic chemicals or radioactive material. Use bottled water and contact the Fulton County Board of Health.</p>
      </div>
      <div className="trio">
        <Packet title="1. Clear it">
          <ol className="steps">
            <li>Let water sit in a bucket a few hours so dirt settles.</li>
            <li>Dip off the clear water on top.</li>
            <li>Pour it through a clean cloth, paper towel or coffee filter.</li>
          </ol>
        </Packet>
        <Packet title="2. Boil it (best)">
          <ol className="steps">
            <li>Hold a rolling boil for 1 minute. Atlanta is about 1,000 ft up, so 1 minute is enough (3 minutes above 6,500 ft).</li>
            <li>Cool it and store in clean containers with tight lids.</li>
            <li>Fix the flat taste by pouring between two containers or adding a pinch of salt per quart.</li>
          </ol>
        </Packet>
        <Packet title="Or: sunlight">
          <ol className="steps">
            <li>Fill clean, clear plastic bottles with clear water.</li>
            <li>Lay them on their sides in full sun, on a dark surface if you can.</li>
            <li>Leave 6 hours if sunny, 2 full days if cloudy.</li>
          </ol>
        </Packet>
      </div>
      <h3>Household bleach</h3>
      <p>Plain, unscented bleach only. Check the label: most US bleach is 5–9% sodium hypochlorite. Stir, then wait at least 30 minutes before drinking.</p>
      <div className="tbl">
        <table>
          <thead><tr><th>Water</th><th>Clear water (5–9% bleach)</th><th>Cloudy, colored or very cold</th></tr></thead>
          <tbody>
            {BLEACH.map(([amt, clear, cloudy]) => (
              <tr key={amt}><td>{amt}</td><td className="mono">{clear}</td><td className="mono">{cloudy}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="callout b">
        <strong>What bleach misses</strong>
        <p>Bleach kills bacteria and viruses but not reliably the parasites Giardia and Cryptosporidium. Boil when you can.</p>
      </div>
      <div className="grid2">
        <Packet title="Tablets and drops">
          <ul>
            <li>Follow the package for chlorine dioxide, chlorine or iodine products.</li>
            <li>Chlorine dioxide is the only one that kills Cryptosporidium when used correctly.</li>
            <li>Skip iodine if pregnant, if you have thyroid problems or an iodine sensitivity, and never rely on it for more than a few weeks.</li>
          </ul>
        </Packet>
        <Packet title="Filters and UV">
          <ul>
            <li>Pore size of 1 micron or smaller stops parasites; 0.3 micron or smaller stops bacteria.</li>
            <li>No portable filter removes viruses, so disinfect after filtering.</li>
            <li>UV pens work only in small amounts of clear water.</li>
          </ul>
        </Packet>
      </div>
      <h3>Homemade sediment filter</h3>
      <div className="callout">
        <strong>Not safe on its own</strong>
        <p>A bucket filter clears muddy water. Always boil or disinfect what comes out.</p>
      </div>
      <ol className="steps">
        <li>Drill small holes in the bottom of a food-grade bucket and set it over a second clean bucket.</li>
        <li>Layer bottom to top: clean cloth, 2 in activated charcoal (aquarium or survival-supply, not grill briquettes), 4–6 in fine washed sand, 2–3 in washed pea gravel.</li>
        <li>Pour slowly. Throw away the first few batches until it runs clear.</li>
        <li>Boil or bleach everything that comes out.</li>
      </ol>
      <h3>Storage</h3>
      <ul className="steps">
        <li>At least 1 gallon per person (and per pet) per day, for at least 3 days.</li>
        <li>Clean, food-grade containers with tight lids, in a cool, dark place.</li>
      </ul>
      <p className="sources">
        Source:{" "}
        <a href="https://www.cdc.gov/water-emergency/about/index.html" target="_blank" rel="noopener noreferrer">CDC, How to Make Water Safe in an Emergency</a>
      </p>
    </section>
  );
}
