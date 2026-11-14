// The pantry page: the store-bought staples worth keeping, and recipes that combine them with the garden.
import SectionHeader from "@/frontend/components/ui/SectionHeader";
import TableCard from "@/frontend/components/ui/TableCard";
import { PANTRY } from "@/frontend/data/pantry";
import { COMBO } from "@/frontend/data/recipes";
import RecipeGrid from "./RecipeGrid";
import Page from "@/frontend/components/ui/Page";

export default function PantrySection() {
  return (
    <Page>
      <SectionHeader
        kicker="From the store"
        title="Pantry additions"
        lead="A small stock of staples turns garden produce into full meals and carries you through the thin weeks of February and August."
      />
      <TableCard>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Keep on hand</th>
              <th>What it adds</th>
            </tr>
          </thead>
          <tbody>
            {PANTRY.map(([cat, items, adds]) => (
              <tr key={cat}>
                <td>{cat}</td>
                <td>{items}</td>
                <td>{adds}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>
      <h3>Combination recipes</h3>
      <RecipeGrid recipes={COMBO} />
    </Page>
  );
}
