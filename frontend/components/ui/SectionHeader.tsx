// The top of every page: a kicker, the page's h2, and an optional lead paragraph under it.
//   <SectionHeader kicker="Cook what you pick" title="Recipe book" lead="Recipes grouped by…" />
// It returns separate pieces (not one wrapper), so the page's grid spaces the title and the lead apart
// exactly as before. `picture` goes between them, for pages that open with a photo.
import type { ReactNode } from "react";
import Kicker, { type KickerTone } from "./Kicker";

type SectionHeaderProps = {
  kicker: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  picture?: ReactNode; // shown between the title and the lead
  tone?: KickerTone; // the kicker's color (the page's job color)
  titleId?: string;
};

export default function SectionHeader({ kicker, title, lead, picture, tone, titleId }: SectionHeaderProps) {
  return (
    <>
      <div>
        <Kicker tone={tone}>{kicker}</Kicker>
        <h2 id={titleId} className="mt-2">
          {title}
        </h2>
      </div>
      {picture}
      {/* The lead: a little larger and quieter than body text, kept to a readable line length. */}
      {lead && <p className="max-w-[62ch] text-lg leading-[1.55] text-muted">{lead}</p>}
    </>
  );
}
