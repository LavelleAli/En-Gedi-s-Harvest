// An open entry: the facts box, and the text beside it: what the plant is good for, how to grow it, a
// healthy plant, its problems, companions and sources. Two columns from 52rem (text left, facts right).
import { forwardRef } from "react";
import FactList from "@/frontend/components/ui/FactList";
import { METHOD_LABEL } from "@/shared/crop";
import { seasonFit } from "@/shared/planting";
import CompanionList from "./CompanionList";
import Infobox from "./Infobox";
import ProblemList from "./ProblemList";
import type { Entry } from "./entries";

const CARD = "grid gap-x-8 gap-y-3 px-2 pt-2 pb-6 min-[52rem]:grid-cols-[minmax(0,1fr)_17rem]";

const BODY = [
  // "entry-body" is a test hook. The left-hand column from 52rem.
  "entry-body grid min-w-0 content-start gap-2 min-[52rem]:col-start-1 min-[52rem]:row-start-1",
  // Its small headings ("GROWING", "PROBLEMS"): spaced-out green capitals.
  "[&_h5]:mt-3 [&_h5]:font-mono [&_h5]:text-xs [&_h5]:font-medium [&_h5]:tracking-[0.12em] [&_h5]:text-green [&_h5]:uppercase",
].join(" ");

type EntryCardProps = { entry: Entry; zone: string };

// The ref lets the row animate the card's height as it opens and closes.
const EntryCard = forwardRef<HTMLDivElement, EntryCardProps>(function EntryCard({ entry, zone }, ref) {
  const { crop, book, id } = entry;
  const fit = seasonFit(crop, zone);
  return (
    <div className={CARD} id={`${id}-card`} ref={ref}>
      <Infobox entry={entry} zone={zone} />
      <div className={BODY}>
        <p className="text-lg leading-[1.55]">
          {book ? book.ben : crop.summary}
          {book && <> A good source of {book.nut.slice(0, -1).join(", ")}{book.nut.length > 1 ? " and " : ""}{book.nut[book.nut.length - 1]}.</>}
        </p>
        <h5>Growing</h5>
        <p>
          {crop.how} {book && <>Feed: {book.care[3].charAt(0).toLowerCase() + book.care[3].slice(1)}.</>}
        </p>
        <p>
          {METHOD_LABEL[crop.method]}{crop.depthIn ? `, ${crop.depthIn} in deep` : ""}. {crop.bedNote}
          {!fit.ok && ` ${fit.note}`}
        </p>
        {crop.flower?.note && <p>{crop.flower.note}</p>}
        {book && (
          <>
            <h5>A healthy plant</h5>
            <p>{book.ok}</p>
            <h5>Problems</h5>
            <ProblemList problems={book.pr} />
          </>
        )}
        {crop.flower?.companions && (
          <>
            <h5>Companions</h5>
            <FactList>
              <dt>Plant with</dt>
              <dd><CompanionList text={crop.flower.companions} /></dd>
            </FactList>
          </>
        )}
        {crop.flower && crop.sources.length > 0 && (
          <>
            <h5>Sources</h5>
            <ul>
              {crop.sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a>
                </li>
              ))}
            </ul>
          </>
        )}
        {(book || crop.friends.length > 0 || crop.foes.length > 0) && (
          <>
            <h5>Companions</h5>
            <FactList>
              <dt>Grows well with</dt>
              <dd>{book ? <CompanionList text={book.good} /> : crop.friends.length ? <CompanionList names={crop.friends} /> : "No strong pairings"}</dd>
              <dt>Keep apart from</dt>
              <dd>{book ? <CompanionList text={book.bad} /> : crop.foes.length ? <CompanionList names={crop.foes} /> : "Nothing major"}</dd>
            </FactList>
          </>
        )}
      </div>
    </div>
  );
});

export default EntryCard;
