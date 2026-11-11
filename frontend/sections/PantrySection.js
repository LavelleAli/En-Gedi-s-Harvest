import { PANTRY } from "@/frontend/data/pantry";
import { COMBO } from "@/frontend/data/recipes";
import RecipeCard from "@/frontend/components/RecipeCard";
import Reveal from "@/frontend/components/Reveal";

export default function PantrySection() {
  return (
    <section className="view">
      <div>
        <div className="kicker">From the store</div>
        <h2>Pantry additions</h2>
      </div>
      <p className="lead">A small stock of staples turns garden produce into full meals and carries you through the thin weeks of February and August.</p>
      <div className="tbl">
        <table>
          <thead><tr><th>Category</th><th>Keep on hand</th><th>What it adds</th></tr></thead>
          <tbody>
            {PANTRY.map(([cat, items, adds]) => (
              <tr key={cat}><td>{cat}</td><td>{items}</td><td>{adds}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <h3>Combination recipes</h3>
      <Reveal className="rgrid">{COMBO.map((r) => <RecipeCard key={r.name} r={r} />)}</Reveal>
    </section>
  );
}
