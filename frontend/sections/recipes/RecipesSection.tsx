"use client";

// The recipe book: recipes grouped by the season their main ingredients come in, with a season filter.
import { useState } from "react";
import SectionHeader from "@/frontend/components/ui/SectionHeader";
import { REC } from "@/frontend/data/recipes";
import RecipeGrid from "./RecipeGrid";
import SeasonFilter from "./SeasonFilter";
import Page from "@/frontend/components/ui/Page";

export default function RecipesSection() {
  const [season, setSeason] = useState("All");
  const shown = REC.filter((r) => season === "All" || r.season === season);
  return (
    <Page>
      <SectionHeader
        kicker="Cook what you pick"
        title="Recipe book"
        lead={
          <>
            Recipes grouped by the season their main ingredients come in. <b className="text-green-ink">Green</b> ingredients come from the garden;
            the rest are pantry staples.
          </>
        }
      />
      <SeasonFilter value={season} onChange={setSeason} />
      <RecipeGrid recipes={shown} refresh={season} />
    </Page>
  );
}
