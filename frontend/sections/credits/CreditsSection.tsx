// The photo credits page: every downloaded photo with its source, photographer and license, in as many
// 13.75rem columns as fit. Before `npm run photos` has run, it says how to get them.
import type { PhotoInfo } from "@/frontend/components/Photo";
import Callout from "@/frontend/components/ui/Callout";
import Page from "@/frontend/components/ui/Page";
import SectionHeader from "@/frontend/components/ui/SectionHeader";
import photos from "@/frontend/data/photos.json";
import CreditCard from "./CreditCard";

// Commands and file names in the monospace face.
const CODE = "font-mono text-[0.85em]";

export default function CreditsSection() {
  const entries = Object.entries(photos as Record<string, PhotoInfo>);
  return (
    <Page>
      <SectionHeader
        kicker="Wikimedia Commons"
        title="Photo credits"
        lead={
          <>
            Every photo comes from Wikimedia Commons under a free license (public domain or Creative Commons Attribution). Photos were picked
            automatically by search, so check each one; to swap one, pin a different file in <span className={CODE}>data/photo-queries.json</span>{" "}
            and run <span className={CODE}>npm run photos -- slot-name</span>.
          </>
        }
      />
      {entries.length === 0 ? (
        <Callout tone="yellow" title="No photos downloaded yet">
          <p>
            Run <span className={CODE}>npm run photos</span> once while online. Until then the app shows drawn illustrations.
          </p>
        </Callout>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,13.75rem),1fr))] gap-3">
          {entries.map(([slot, p]) => (
            <CreditCard key={slot} slot={slot} photo={p} />
          ))}
        </div>
      )}
    </Page>
  );
}
