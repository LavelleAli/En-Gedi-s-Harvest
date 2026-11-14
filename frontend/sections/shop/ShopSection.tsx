// The shop: gear for the book's projects, grouped by category. Every item is a placeholder for now,
// so there are no prices and the buttons say "Coming soon". Items live in frontend/data/shop.ts.
import Callout from "@/frontend/components/ui/Callout";
import SectionHeader from "@/frontend/components/ui/SectionHeader";
import { SHOP_CATEGORIES } from "@/frontend/data/shop";
import ShopCategorySection from "./ShopCategorySection";
import Page from "@/frontend/components/ui/Page";

export default function ShopSection() {
  return (
    <Page>
      <SectionHeader kicker="Gear and supplies" title="Shop" />
      <Callout tone="yellow" title="Coming soon">
        <p>These are placeholder items: the gear each guide calls for. Products and prices will be added later, and nothing can be bought yet.</p>
      </Callout>
      {SHOP_CATEGORIES.map((cat) => (
        <ShopCategorySection key={cat.id} category={cat} />
      ))}
    </Page>
  );
}
