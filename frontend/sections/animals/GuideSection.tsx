// One numbered section of a guide ("3. Gear requirements"). Its id ("b-3") is what the guide's section
// links point at; scroll-mt keeps the heading clear of the top of the window. Guide draws the rule
// between one section and the next.
import type { ReactNode } from "react";

export default function GuideSection({ id, title, children }: { id?: string; title: string; children: ReactNode }) {
  return (
    <div className="grid scroll-mt-20 gap-3" id={id} data-guide-section>
      <h3>{title}</h3>
      {children}
    </div>
  );
}
