"use client";

import { useState } from "react";
import { REC } from "@/lib/recipes";
import RecipeCard from "@/components/RecipeCard";

const SEASONS = ["All", "Winter", "Spring", "Summer", "Fall"];

export default function RecipesSection() {
  const [season, setSeason] = useState("All");
  const shown = REC.filter((r) => season === "All" || r.season === season);
  return (
    <section className="view">
      <div>
        <div className="kicker">Cook what you pick</div>
        <h2>Recipe book</h2>
      </div>
      <p className="lead">
        Recipes grouped by the season their main ingredients come in. <b style={{ color: "var(--green-ink)" }}>Green</b> ingredients come from
        the garden; the rest are pantry staples.
      </p>
      <div className="chips noprint" role="group" aria-label="Season">
        {SEASONS.map((s) => (
          <button key={s} className="chip" type="button" aria-pressed={season === s} onClick={() => setSeason(s)}>
            {s}
          </button>
        ))}
      </div>
      <div className="rgrid">{shown.map((r) => <RecipeCard key={r.name} r={r} />)}</div>
    </section>
  );
}
