import { REMEDIES } from "@/frontend/data/pantry";

export default function RemediesSection() {
  return (
    <section className="view">
      <div>
        <div className="kicker" style={{ color: "var(--red)" }}>Comfort care</div>
        <h2>Simple home remedies</h2>
      </div>
      <p className="lead">
        These ease minor, common symptoms. They don&apos;t treat infections or serious illness. Oral rehydration solution has the strongest
        evidence and can be lifesaving during diarrhea or vomiting.
      </p>
      <div className="packet r">
        <header><h3>Oral rehydration solution</h3><span className="mono">1 liter</span></header>
        <div className="body">
          <ol className="steps">
            <li>Start with 1 liter (about 4¼ cups) of safe water, boiled and cooled if needed.</li>
            <li>Stir in 6 <b>level</b> teaspoons sugar and ½ <b>level</b> teaspoon salt. Measure carefully; too much salt is harmful.</li>
            <li>Sip small amounts often. Make a fresh batch every 24 hours.</li>
          </ol>
          <p>For babies and young children, use a store-bought pediatric solution and call their doctor.</p>
        </div>
      </div>
      <div className="tbl">
        <table>
          <thead><tr><th>Symptom</th><th>Remedy</th><th>How</th><th>Safety limits</th></tr></thead>
          <tbody>
            {REMEDIES.map(([sym, rem, how, limit]) => (
              <tr key={sym}><td>{sym}</td><td>{rem}</td><td>{how}</td><td style={{ color: "var(--red)" }}>{limit}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid2">
        <div className="packet k">
          <header><h3>Medicine cabinet basics</h3></header>
          <div className="body">
            <p>Pain and fever reducer (acetaminophen or ibuprofen), antihistamine, hydrocortisone cream, antibiotic ointment, bandages, thermometer. Follow each label&apos;s dosing.</p>
          </div>
        </div>
        <div className="packet r">
          <header><h3>Get care right away</h3></header>
          <div className="body">
            <ul>
              <li>Trouble breathing, chest pain or confusion</li>
              <li>Little or no urine, dizziness, can&apos;t keep fluids down</li>
              <li>Blood in vomit or stool</li>
              <li>High fever that won&apos;t come down, or any fever in a baby under 3 months</li>
              <li>A deep, large, spreading-red or oozing wound or burn</li>
              <li>Symptoms past about a week, or getting worse</li>
            </ul>
            <p><b>Emergency: 911. Poison Control: 1-800-222-1222.</b></p>
          </div>
        </div>
      </div>
      <p className="sources">
        ORS recipe:{" "}
        <a href="https://rehydrate.org/faq/how-to-prepare-ors.htm" target="_blank" rel="noopener noreferrer">Rehydration Project</a>
      </p>
    </section>
  );
}
