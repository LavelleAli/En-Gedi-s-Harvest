// One shop item: its picture, name and description, and (for now) a "Coming soon" placeholder.
import Button from "@/frontend/components/ui/Button";
import type { ShopItem } from "@/frontend/data/shop";
import ItemImage from "./ItemImage";

// A glass card: the picture on top, the text filling the rest.
const CARD = "grid grid-rows-[auto_1fr] gap-3 rounded-lg border border-line bg-panel p-3 shadow-card backdrop-blur-glass";

export default function ShopItemCard({ item }: { item: ShopItem }) {
  return (
    <li className={CARD}>
      <ItemImage item={item} />
      <div className="grid content-start gap-2">
        <h4>{item.name}</h4>
        <p>{item.blurb}</p>
        <p className="text-sm font-bold text-muted">Price coming soon</p>
        <Button disabled className="justify-self-start">
          Coming soon
        </Button>
      </div>
    </li>
  );
}
