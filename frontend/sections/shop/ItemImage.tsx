// A shop item's picture: its photo with the credit, or until `npm run photos` has downloaded one, a
// drawn icon on a tile in the category's color.
import type { ReactNode } from "react";
import { Credit, getPhoto } from "@/frontend/components/Photo";
import type { ShopCategory, ShopItem } from "@/frontend/data/shop";

// Each category's color, matching its guide: bees yellow, water blue, garden green.
const TONE: Record<ShopCategory, string> = {
  bees: "bg-yellow-soft text-yellow-ink",
  water: "bg-blue-soft text-blue-ink",
  garden: "bg-green-soft text-green-ink",
};

const ICONS: Record<ShopCategory, ReactNode> = {
  bees: <><path d="M24 14l8 4.5v9L24 32l-8-4.5v-9z" /><path d="M16 18.5l-8 4.5v9l8 4.5M32 18.5l8 4.5v9l-8 4.5M16 36l8 4.5 8-4.5" /></>,
  water: <><path d="M24 8c6 8 11 14 11 20a11 11 0 0 1-22 0c0-6 5-12 11-20z" /><path d="M18 29a6 6 0 0 0 6 6" /></>,
  garden: <><path d="M24 40V20" /><path d="M24 26c-6 0-10-4-10-10 6 0 10 4 10 10zM24 22c0-6 4-10 10-10 0 6-4 10-10 10z" /><path d="M10 40h28" /></>,
};

export default function ItemImage({ item }: { item: ShopItem }) {
  const photo = getPhoto(`shop-${item.id}`);
  if (photo) {
    return (
      <figure className="m-0 grid gap-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.file} alt={item.name} loading="lazy" className="aspect-[4/3] w-full rounded-md object-cover" />
        <figcaption>
          <Credit photo={photo} />
        </figcaption>
      </figure>
    );
  }
  return (
    // Decorative: the item's name says what it is.
    <div className={`grid aspect-[4/3] place-items-center gap-1 rounded-md ${TONE[item.category]}`} aria-hidden="true">
      <svg viewBox="0 0 48 48" width="56" height="56" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
        {ICONS[item.category]}
      </svg>
    </div>
  );
}
