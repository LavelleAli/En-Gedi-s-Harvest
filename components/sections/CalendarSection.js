import { MONTHS, CAL, ORDER } from "@/lib/calendar";

export default function CalendarSection() {
  return (
    <section className="view">
      <div>
        <div className="kicker">Twelve months</div>
        <h2>Planting and harvest calendar</h2>
      </div>
      <p className="lead">
        Fulton&apos;s last spring frost usually lands around early April and the first fall frost around early to mid November. Check the
        forecast before setting out tender plants.
      </p>
      <div className="tbl">
        <table className="cal">
          <thead>
            <tr><th>Month</th><th>Plant or sow</th><th>Harvest</th><th>Other tasks</th></tr>
          </thead>
          <tbody>
            {ORDER.map((m) => (
              <tr key={m}>
                <td>{MONTHS[m]}</td>
                <td>{CAL[m][0]}</td>
                <td>{CAL[m][1]}</td>
                <td>{CAL[m][2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
