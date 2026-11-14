// One shop category (beekeeping, water filtration, garden): its heading with a link to its guide, a
// short description, and its items in as many 14rem columns as fit.
import Link from "next/link";
import Reveal from "@/frontend/components/Reveal";
import { SHOP_ITEMS, type SHOP_CATEGORIES } from "@/frontend/data/shop";
import ShopItemCard from "./ShopItemCard";

type Category = (typeof SHOP_CATEGORIES)[number];

export default function ShopCategorySection({ category }: { category: Category }) {
  const headingId = `shop-${category.id}`;
  return (
    <section className="grid content-start gap-4" aria-labelledby={headingId}>
      <div className="flex items-baseline justify-between gap-3">
        <h3 id={headingId}>{category.title}</h3>
        <Link href={category.guide}>Read the guide</Link>
      </div>
      <p>{category.blurb}</p>
      {/* Items lower on the page fade up as they scroll into view. */}
      <Reveal as="ul" className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(100%,14rem),1fr))] gap-4 p-0">
        {SHOP_ITEMS.filter((i) => i.category === category.id).map((item) => (
          <ShopItemCard key={item.id} item={item} />
        ))}
      </Reveal>
    </section>
  );
}
