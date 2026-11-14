// One month's row: what to plant (green), what to harvest (yellow) and other tasks.
// The colors repeat the column headings, so they don't carry meaning on their own.

// A cell's list as text, or a dash when there's nothing that month.
const list = (items: string[]) => (items.length ? items.join(", ") : "—");

type CalendarRowProps = {
  month: string;
  plant: string[];
  harvest: string[];
  tasks: string[];
};

export default function CalendarRow({ month, plant, harvest, tasks }: CalendarRowProps) {
  return (
    <tr>
      <td className="whitespace-nowrap">{month}</td>
      <td className="text-green-ink">{list(plant)}</td>
      <td className="text-yellow-ink">{list(harvest)}</td>
      <td>{list(tasks)}</td>
    </tr>
  );
}
