import photos from "@/frontend/data/photos.json";
import type { PhotoInfo } from "@/frontend/components/Photo";

export default function CreditsSection() {
  const entries = Object.entries(photos as Record<string, PhotoInfo>);
  return (
    <section className="view">
      <div>
        <div className="kicker">Wikimedia Commons</div>
        <h2>Photo credits</h2>
      </div>
      <p className="lead">
        Every photo comes from Wikimedia Commons under a free license (public domain or Creative Commons Attribution). Photos were picked
        automatically by search, so check each one; to swap one, pin a different file in <span className="mono">data/photo-queries.json</span>{" "}
        and run <span className="mono">npm run photos -- slot-name</span>.
      </p>
      {entries.length === 0 ? (
        <div className="callout y">
          <strong>No photos downloaded yet</strong>
          <p>
            Run <span className="mono">npm run photos</span> once while online. Until then the app shows drawn illustrations.
          </p>
        </div>
      ) : (
        <div className="credits">
          {entries.map(([slot, p]) => (
            <figure key={slot}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.file} alt={p.title} loading="lazy" />
              <figcaption>
                <span className="mono">{slot}</span>
                <a href={p.source} target="_blank" rel="noopener noreferrer">{p.title}</a>
                <span>{p.artist}</span>
                <span>{p.licenseUrl ? <a href={p.licenseUrl} target="_blank" rel="noopener noreferrer">{p.license}</a> : p.license}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}
