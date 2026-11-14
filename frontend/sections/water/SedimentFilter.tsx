// How to build a two-bucket sediment filter, with a warning that it doesn't make water safe by itself.
import Callout from "@/frontend/components/ui/Callout";
import Steps from "@/frontend/components/ui/Steps";

export default function SedimentFilter() {
  return (
    <>
      <h3>Homemade sediment filter</h3>
      <Callout title="Not safe on its own">
        <p>A bucket filter clears muddy water. Always boil or disinfect what comes out.</p>
      </Callout>
      <Steps ordered>
        <li>Drill small holes in the bottom of a food-grade bucket and set it over a second clean bucket.</li>
        <li>
          Layer bottom to top: clean cloth, 2 in activated charcoal (aquarium or survival-supply, not grill briquettes), 4–6 in fine washed
          sand, 2–3 in washed pea gravel.
        </li>
        <li>Pour slowly. Throw away the first few batches until it runs clear.</li>
        <li>Boil or bleach everything that comes out.</li>
      </Steps>
    </>
  );
}
