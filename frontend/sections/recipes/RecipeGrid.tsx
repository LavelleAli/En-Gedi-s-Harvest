// Recipe cards in as many 19rem columns as fit. Cards lower on the page fade up as they scroll into
// view; change `refresh` when the list changes (a filter) to pick up the new cards.
import Reveal from "@/frontend/components/Reveal";
import type { Recipe } from "@/frontend/data/recipes";
import RecipeCard from "./RecipeCard";

export default function RecipeGrid({ recipes, refresh }: { recipes: Recipe[]; refresh?: unknown }) {
  return (
    <Reveal className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,19rem),1fr))] gap-4" refresh={refresh}>
      {recipes.map((r) => (
        <RecipeCard key={r.name} r={r} />
      ))}
    </Reveal>
  );
}
