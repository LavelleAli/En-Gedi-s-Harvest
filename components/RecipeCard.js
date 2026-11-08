const TONE = { Winter: "b", Spring: "g", Summer: "y", Fall: "r", Pantry: "" };

export default function RecipeCard({ r }) {
  return (
    <article className="recipe">
      <div className="chips">
        <span className={`chip ${TONE[r.season]}`}>{r.season}</span>
        <span className="chip">{r.y}</span>
      </div>
      <h3>{r.name}</h3>
      <p className="ing"><b>Garden:</b> {r.g}</p>
      <p className="ing"><i>Pantry:</i> {r.p}</p>
      <ol>{r.s.map((step) => <li key={step}>{step}</li>)}</ol>
    </article>
  );
}
