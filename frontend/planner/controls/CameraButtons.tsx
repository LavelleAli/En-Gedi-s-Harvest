// The camera switch, floating in the sandbox's top-left corner: "3D" (the starting view) or "Top"
// (straight down). Pressing one again resets that view after you've orbited.
import { SELECT } from "./selectStyle";

// A frosted pill so it reads over the 3D scene.
const BAR = "absolute top-3 left-3 z-10 inline-flex gap-1 rounded-md border border-line bg-panel p-1 shadow-card backdrop-blur-glass";
const SEGMENT = `${SELECT} min-h-9 px-3`;

type CameraButtonsProps = { mode: "3d" | "top"; onView: (mode: "3d" | "top") => void };

export default function CameraButtons({ mode, onView }: CameraButtonsProps) {
  return (
    <div className={BAR} role="group" aria-label="Camera">
      <button type="button" className={SEGMENT} aria-pressed={mode === "3d"} onClick={() => onView("3d")} title="Starting 3D view (Home)">
        3D
      </button>
      <button type="button" className={SEGMENT} aria-pressed={mode === "top"} onClick={() => onView("top")} title="Look straight down (7)">
        Top
      </button>
    </div>
  );
}
