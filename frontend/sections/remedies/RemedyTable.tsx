// Common symptoms: the home remedy, how to use it, and its safety limits (in red).
import TableCard from "@/frontend/components/ui/TableCard";
import { REMEDIES } from "@/frontend/data/pantry";

export default function RemedyTable() {
  return (
    <TableCard>
      <table>
        <thead>
          <tr>
            <th>Symptom</th>
            <th>Remedy</th>
            <th>How</th>
            <th>Safety limits</th>
          </tr>
        </thead>
        <tbody>
          {REMEDIES.map(([sym, rem, how, limit]) => (
            <tr key={sym}>
              <td>{sym}</td>
              <td>{rem}</td>
              <td>{how}</td>
              <td className="text-red">{limit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableCard>
  );
}
