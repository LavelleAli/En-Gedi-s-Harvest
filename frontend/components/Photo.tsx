import photos from "@/frontend/data/photos.json";
import { DRAW } from "@/frontend/data/art";

/** A downloaded photo and its credit (written by scripts/fetch-photos.mjs). */
export type PhotoInfo = { file: string; title: string; source: string; artist: string; license: string; licenseUrl?: string };
const PHOTOS = photos as Record<string, PhotoInfo | undefined>;

export function getPhoto(slot: string): PhotoInfo | null {
  return PHOTOS[slot] || null;
}

// Drawn illustration, used wherever no photo has been downloaded yet.
export function Art({ name, className }: { name: string; className?: string }) {
  const draw = (DRAW as Record<string, (() => string) | undefined>)[name];
  if (!draw) return null;
  return <span className={className} aria-hidden="true" dangerouslySetInnerHTML={{ __html: draw() }} />;
}

export function Credit({ photo }: { photo: PhotoInfo | null }) {
  if (!photo) return null;
  return (
    <span className="credit">
      Photo: <a href={photo.source} target="_blank" rel="noopener noreferrer">{photo.artist}</a>,{" "}
      {photo.licenseUrl ? (
        <a href={photo.licenseUrl} target="_blank" rel="noopener noreferrer">{photo.license}</a>
      ) : (
        photo.license
      )}
    </span>
  );
}

// A photo with its credit line, or the fallback illustration when the photo is missing.
export default function Photo({ slot, alt, fallback, credit = true }: { slot: string; alt: string; fallback?: string; credit?: boolean }) {
  const photo = getPhoto(slot);
  if (!photo) return fallback ? <Art name={fallback} /> : null;
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.file} alt={alt} loading="lazy" />
      {credit && <Credit photo={photo} />}
    </>
  );
}

export function Hero({ slot, alt }: { slot: string; alt: string }) {
  const photo = getPhoto(slot);
  if (!photo) return null;
  return (
    <figure className="hero">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.file} alt={alt} />
      <figcaption>
        <Credit photo={photo} />
      </figcaption>
    </figure>
  );
}
