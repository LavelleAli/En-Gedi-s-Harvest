// One letter of the encyclopedia: a big green letter heading (the A to Z index links to it), then
// that letter's plants.
import type { ReactNode } from "react";

export default function LetterGroup({ letter, children }: { letter: string; children: ReactNode }) {
  return (
    <section className="grid scroll-mt-20" aria-labelledby={`letter-${letter}`}>
      <h3 className="mb-1 border-b-2 border-line pb-1 text-[2.5rem] font-extrabold text-green" id={`letter-${letter}`}>
        {letter}
      </h3>
      {children}
    </section>
  );
}
