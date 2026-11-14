// One side of a plant doctor comparison: a square photo (or a drawing when there's no photo), a short
// caption in green (healthy) or red (problem), and the photo's credit.
import { Art, Credit, getPhoto } from "@/frontend/components/Photo";
import { cx } from "@/frontend/lib/cx";

// The square: the photo or drawing fills it.
const FRAME = [
  "aspect-square max-w-full overflow-hidden rounded-md bg-surface",
  "[&>span]:block [&>span]:size-full [&_:is(img,svg)]:block [&_:is(img,svg)]:size-full [&_:is(img,svg)]:object-cover",
].join(" ");

type CompareFrameProps = {
  slot: string; // the photo's slot in data/photos.json
  art: string; // the drawing to show when there's no photo
  alt: string;
  caption: string;
  healthy: boolean; // green caption, or red for the problem
};

export default function CompareFrame({ slot, art, alt, caption, healthy }: CompareFrameProps) {
  const photo = getPhoto(slot);
  return (
    // The credit under it is centered and plain, not the usual padded credit line.
    <figure className="grid content-start gap-1 [&_.credit]:p-0 [&_.credit]:text-center [&_.credit]:font-normal">
      <div className={FRAME}>
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo.file} alt={alt} loading="lazy" />
        ) : (
          <Art name={art} />
        )}
      </div>
      <figcaption className={cx("text-center text-[0.8125rem] font-bold", healthy ? "text-green-ink" : "text-red-ink")}>{caption}</figcaption>
      {photo && <Credit photo={photo} />}
    </figure>
  );
}
