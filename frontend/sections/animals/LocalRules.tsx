// The note at the top of each animal guide: its laws, permits and seasons are written for Georgia.
import Callout from "@/frontend/components/ui/Callout";

export default function LocalRules({ what }: { what: string }) {
  return (
    <Callout tone="blue" title="Written for Georgia">
      <p>
        The rules, permits and month-by-month timing in this guide are for Georgia (zones 7–8). Elsewhere, check your city or county and your
        state or provincial agriculture department for {what}, and shift the seasons to match your frost dates.
      </p>
    </Callout>
  );
}
