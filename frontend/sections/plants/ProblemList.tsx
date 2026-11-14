// An entry's common problems: for each, a healthy leaf beside the problem (photos, or drawings when
// there's no photo), the problem's name linking to the plant doctor, and a note.
import Link from "next/link";
import Photo from "@/frontend/components/Photo";
import { SYM } from "@/frontend/data/art";
import { OK_SLOT } from "@/frontend/data/healthy";

// One small square picture: a photo, or a drawing (an <svg>) filling it.
const ART = "block size-14 overflow-hidden rounded-sm border border-line bg-panel [&_:is(img,svg)]:block [&_:is(img,svg)]:size-full [&_:is(img,svg)]:object-cover";

export default function ProblemList({ problems }: { problems: [string, string][] }) {
  return (
    <ul className="m-0 grid list-none gap-2 p-0">
      {problems.map(([key, note]) => {
        const sym = SYM[key];
        return (
          <li key={key} className="grid grid-cols-[auto_1fr] items-center gap-3 rounded-md border border-line bg-surface p-3 print:break-inside-avoid">
            {/* Decorative: the problem's name says the same thing. */}
            <div className="flex gap-1" aria-hidden="true">
              <span className={ART}>
                <Photo slot={OK_SLOT[sym.ok]} alt="" fallback={sym.ok} credit={false} />
              </span>
              <span className={ART}>
                <Photo slot={`sym-${key}`} alt="" fallback={key} credit={false} />
              </span>
            </div>
            <div>
              <b>
                <Link href={`/plant-doctor/#sym-${key}`}>{sym.t}</Link>
              </b>
              <br />
              <span>{note}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
