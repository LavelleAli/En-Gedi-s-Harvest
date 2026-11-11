// The shop: gear for the book's projects, grouped by category. Every item is a placeholder for now,
// so there are no prices and the buttons say "Coming soon". Items live in frontend/data/shop.js.
import Link from "next/link";
import { SHOP_CATEGORIES, SHOP_ITEMS } from "@/frontend/data/shop";
import { Credit, getPhoto } from "@/frontend/components/Photo";
import Reveal from "@/frontend/components/Reveal";

// Drawn stand-ins shown until `npm run photos` downloads real photos.
const CATEGORY_ICONS = {
  bees: <><path d="M24 14l8 4.5v9L24 32l-8-4.5v-9z" /><path d="M16 18.5l-8 4.5v9l8 4.5M32 18.5l8 4.5v9l-8 4.5M16 36l8 4.5 8-4.5" /></>,
  water: <><path d="M24 8c6 8 11 14 11 20a11 11 0 0 1-22 0c0-6 5-12 11-20z" /><path d="M18 29a6 6 0 0 0 6 6" /></>,
  garden: <><path d="M24 40V20" /><path d="M24 26c-6 0-10-4-10-10 6 0 10 4 10 10zM24 22c0-6 4-10 10-10 0 6-4 10-10 10z" /><path d="M10 40h28" /></>,
};

function ItemImage({ item }) {
  const photo = getPhoto(`shop-${item.id}`);
  if (photo) {
    return (
      <figure className="shop-photo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.file} alt={item.name} loading="lazy" />
        <figcaption><Credit photo={photo} /></figcaption>
      </figure>
    );
  }
  return (
    <div className={`shop-photo shop-placeholder tone-${item.category}`} aria-hidden="true">
      <svg viewBox="0 0 48 48" width="56" height="56" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
        {CATEGORY_ICONS[item.category]}
      </svg>
    </div>
  );
}

export default function ShopSection() {
  return (
    <section className="view">
      <div>
        <div className="kicker">Gear and supplies</div>
        <h2>Shop</h2>
      </div>
      <div className="callout y">
        <strong>Coming soon</strong>
        <p>These are placeholder items: the gear each guide calls for. Products and prices will be added later, and nothing can be bought yet.</p>
      </div>
      {SHOP_CATEGORIES.map((cat) => (
        <section key={cat.id} className="stack" aria-labelledby={`shop-${cat.id}`}>
          <div className="panel-head">
            <h3 id={`shop-${cat.id}`}>{cat.title}</h3>
            <Link href={cat.guide} className="pmeta">Read the guide</Link>
          </div>
          <p className="pmeta">{cat.blurb}</p>
          <Reveal as="ul" className="shop-grid">
            {SHOP_ITEMS.filter((i) => i.category === cat.id).map((item) => (
              <li key={item.id} className="shop-item">
                <ItemImage item={item} />
                <div className="stack-sm">
                  <h4>{item.name}</h4>
                  <p className="pmeta">{item.blurb}</p>
                  <p className="shop-price">Price coming soon</p>
                  <button type="button" disabled>Coming soon</button>
                </div>
              </li>
            ))}
          </Reveal>
        </section>
      ))}
    </section>
  );
}
