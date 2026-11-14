// A bed's companion notes: pairs that grow well together (✓, green), pairs that shouldn't share a bed (✗,
// red), and clashing crops in a bed too close by (!, red). The marks are decorative; the words say it.
import type { CompanionResult } from "../analysis";

export default function BedCompanions({ pairs }: { pairs: CompanionResult }) {
  if (!pairs.good.length && !pairs.bad.length && !pairs.nearby.length) return null;
  return (
    <div className="grid content-start gap-2">
      <h4>Companions</h4>
      <ul className="m-0 grid list-none gap-1 p-0 text-sm">
        {pairs.good.map(([a, b]) => (
          <li key={`g-${a.id}-${b.id}`}>
            <span className="font-bold text-green-ink" aria-hidden="true">
              ✓
            </span>{" "}
            {a.name} and {b.name} grow well together
          </li>
        ))}
        {pairs.bad.map(([a, b]) => (
          <li key={`b-${a.id}-${b.id}`}>
            <span className="font-bold text-red-ink" aria-hidden="true">
              ✗
            </span>{" "}
            {a.name} and {b.name} shouldn&apos;t share a bed
          </li>
        ))}
        {pairs.nearby.map(({ a, b, bed: other }) => (
          <li key={`n-${a.id}-${b.id}-${other.id}`}>
            <span className="font-bold text-red-ink" aria-hidden="true">
              !
            </span>{" "}
            {a.name} is close to {b.name} in {other.name}; keep them farther apart
          </li>
        ))}
      </ul>
    </div>
  );
}
