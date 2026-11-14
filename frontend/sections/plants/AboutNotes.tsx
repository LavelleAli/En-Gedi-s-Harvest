// The notes at the end of the encyclopedia: how far to trust the companion pairings, and where the
// nutrition and planting dates come from.
import Callout from "@/frontend/components/ui/Callout";

export default function AboutNotes() {
  return (
    <>
      <Callout tone="green" title="About companion planting">
        <p>
          Companion suggestions come from long-standing gardening practice. Some pairings have research behind them (flowers that draw
          beneficial insects, tall crops shading lettuce in summer); many are tradition. Treat them as good habits, not guarantees.
        </p>
      </Callout>
      <Callout tone="yellow" title="About nutrition and dates">
        <p>
          Nutrition highlights name what each food is a good source of; amounts vary by variety and cooking. For exact numbers, look the
          food up in <a href="https://fdc.nal.usda.gov/" target="_blank" rel="noopener noreferrer">USDA FoodData Central</a>. Planting
          dates use average frost dates for your zone, so check your local forecast before setting out tender plants.
        </p>
      </Callout>
    </>
  );
}
