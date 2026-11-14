// The facts box in an open entry: a photo, then family, type, size, hardiness, sun, water, spacing,
// harvest or bloom time, and when to plant in the reader's zone. Beside the text on wide screens.
import Photo, { getPhoto } from "@/frontend/components/Photo";
import { KIND_LABEL, suitsZone, zoneRangeText } from "@/shared/crop";
import { plantingWindows, windowText } from "@/shared/planting";
import { slug } from "@/shared/slug";
import { zoneNumber } from "@/shared/zones";
import { LIFE, type Entry } from "./entries";

const BOX = [
  // "infobox" is a test hook. A glass panel without a shadow.
  "infobox self-start overflow-hidden rounded-lg border border-line bg-panel text-sm backdrop-blur-glass",
  // From 52rem: the right-hand column.
  "min-[52rem]:col-start-2 min-[52rem]:row-start-1",
].join(" ");

// Labels on the left in muted bold, values beside them.
const FACTS = "m-0 grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 px-4 pt-3 pb-4 [&_dd]:m-0 [&_dt]:font-bold [&_dt]:text-muted";

export default function Infobox({ entry, zone }: { entry: Entry; zone: string }) {
  const { crop, book, title } = entry;
  const slot = `plant-${slug(title)}`;
  const windows = plantingWindows(crop, zone);
  const fits = suitsZone(crop, zoneNumber(zone));
  const fl = crop.flower;
  return (
    <aside className={BOX} aria-label={`${title} at a glance`}>
      {getPhoto(slot) && (
        <figure className="m-0 [&_img]:aspect-[4/3] [&_img]:w-full [&_img]:object-cover">
          <Photo slot={slot} alt={title} />
        </figure>
      )}
      <dl className={FACTS}>
        {crop.family && <><dt>Family</dt><dd><i>{crop.family}</i></dd></>}
        <dt>Type</dt><dd>{fl?.type || `${KIND_LABEL[crop.kind]}, ${LIFE[crop.life].toLowerCase()}`}</dd>
        {fl?.height && <><dt>Height</dt><dd>{fl.height}</dd></>}
        {fl?.color && <><dt>Color</dt><dd>{fl.color}</dd></>}
        {fl?.scent && <><dt>Scent</dt><dd>{fl.scent}</dd></>}
        <dt>Hardiness</dt><dd>{zoneRangeText(crop)}</dd>
        <dt>Sun</dt><dd>{book ? book.care[0] : fl?.sun || `${crop.sunHours}+ hours${crop.shadeOk ? "; tolerates part shade" : ""}`}</dd>
        <dt>Water</dt><dd>{book ? book.care[1] : `About ${crop.waterIn} in a week`}</dd>
        {book && <><dt>Soil</dt><dd>{book.care[2]}</dd></>}
        <dt>{fl ? "Space" : "Spacing"}</dt><dd>{book ? book.care[4] : fl?.space || `${crop.spacingIn} in apart`}</dd>
        {fl ? (
          <>
            <dt>Blooms</dt><dd>{fl.bloom || crop.firstHarvest}</dd>
            {fl.disease && <><dt>Disease</dt><dd>{fl.disease}</dd></>}
          </>
        ) : (
          <><dt>Harvest</dt><dd>{crop.days ? `${crop.days[0]}–${crop.days[1]} days from planting` : crop.firstHarvest}</dd></>
        )}
        <dt>Zone {zone}</dt>
        <dd>
          {!fits
            ? "Not a good fit outdoors; grow it in a pot or a protected spot."
            : windows.length
              ? windows.map((w) => `Plant in ${w.season}: ${windowText(w)}`).join(". ")
              : "Grow in a container you can move."}
        </dd>
      </dl>
    </aside>
  );
}
