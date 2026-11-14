// One recipe: its season and servings, the garden and pantry ingredients, and the steps.
import Tag from "@/frontend/components/ui/Tag";
import type { Tone } from "@/frontend/components/ui/tone";
import type { Recipe } from "@/frontend/data/recipes";

// Each season's tag color.
const TONE: Record<string, Tone> = { Winter: "blue", Spring: "green", Summer: "yellow", Fall: "red", Pantry: "plain" };

const CARD = "grid content-start gap-3 rounded-lg border border-line bg-panel p-6 shadow-card backdrop-blur-glass print:break-inside-avoid";

export default function RecipeCard({ r }: { r: Recipe }) {
  return (
    <article className={CARD}>
      <div className="flex flex-wrap gap-2">
        <Tag tone={TONE[r.season]}>{r.season}</Tag>
        <Tag>{r.y}</Tag>
      </div>
      <h3>{r.name}</h3>
      {/* Garden ingredients are labelled in green, pantry ones in muted bold (matching the page's intro). */}
      <p className="text-[0.9375rem]">
        <b className="text-green-ink">Garden:</b> {r.g}
      </p>
      <p className="text-[0.9375rem]">
        <i className="font-bold text-muted not-italic">Pantry:</i> {r.p}
      </p>
      <ol className="m-0 grid gap-1.5 ps-5 marker:font-bold marker:text-muted">
        {r.s.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </article>
  );
}
