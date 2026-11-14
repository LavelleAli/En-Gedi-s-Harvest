// One photo's credit: the photo, its slot name (for swapping it), its title (linked to its source page),
// the photographer and the license.
import type { PhotoInfo } from "@/frontend/components/Photo";

const CARD = "overflow-hidden rounded-lg border border-line bg-panel shadow-card backdrop-blur-glass";

export default function CreditCard({ slot, photo }: { slot: string; photo: PhotoInfo }) {
  return (
    <figure className={CARD}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.file} alt={photo.title} loading="lazy" className="aspect-[4/3] w-full object-cover" />
      {/* Long titles and URLs break anywhere rather than widen the card. */}
      <figcaption className="grid gap-0.5 px-3 pt-2 pb-3 text-[0.8125rem] wrap-anywhere">
        <span className="font-mono text-[0.85em]">{slot}</span>
        {photo.source ? (
          <a href={photo.source} target="_blank" rel="noopener noreferrer">
            {photo.title}
          </a>
        ) : (
          <span>{photo.title}</span>
        )}
        <span>{photo.artist}</span>
        <span>
          {photo.licenseUrl ? (
            <a href={photo.licenseUrl} target="_blank" rel="noopener noreferrer">
              {photo.license}
            </a>
          ) : (
            photo.license
          )}
        </span>
      </figcaption>
    </figure>
  );
}
