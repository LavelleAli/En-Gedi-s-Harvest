// How many drops of household bleach to add, by amount of water, for clear and for cloudy water.
import TableCard from "@/frontend/components/ui/TableCard";

const BLEACH = [
  ["1 quart or liter", "2 drops", "4 drops"],
  ["1 gallon", "8 drops (a little under ⅛ tsp)", "16 drops"],
  ["5 gallons", "40 drops (½ tsp)", "80 drops (1 tsp)"],
];

// Doses in the monospace face, so the numbers line up and read as measurements.
const DOSE = "font-mono text-[0.85em]";

export default function BleachTable() {
  return (
    <TableCard>
      <table>
        <thead>
          <tr>
            <th>Water</th>
            <th>Clear water (5–9% bleach)</th>
            <th>Cloudy, colored or very cold</th>
          </tr>
        </thead>
        <tbody>
          {BLEACH.map(([amt, clear, cloudy]) => (
            <tr key={amt}>
              <td>{amt}</td>
              <td className={DOSE}>{clear}</td>
              <td className={DOSE}>{cloudy}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableCard>
  );
}
