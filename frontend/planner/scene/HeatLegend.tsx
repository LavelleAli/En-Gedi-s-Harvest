// The key for the sun-hours map, in the sandbox's top-left corner just under the camera buttons: what each
// color means. It stops short of the navigation controls on the right.
const BANDS: [color: string, label: string][] = [
  ["rgb(46 64 120)", "Shade (<2 h)"],
  ["rgb(40 130 140)", "Part shade (2–4 h)"],
  ["rgb(230 200 70)", "Part sun (4–6 h)"],
  ["rgb(240 140 40)", "Full sun (6+ h)"],
];

const LEGEND = [
  "absolute start-3 top-[4.25rem] z-10 flex max-w-[calc(100%-7rem)] flex-wrap gap-x-3 gap-y-1",
  // A frosted panel, so the labels read over the scene.
  "rounded-md border border-line bg-panel px-3 py-2 text-xs font-semibold shadow-card backdrop-blur-glass",
].join(" ");

export default function HeatLegend() {
  return (
    <div className={LEGEND} aria-label="Sun-hours map colors">
      {BANDS.map(([color, label]) => (
        <span key={label} className="inline-flex items-center gap-1">
          <i className="size-3 rounded-[3px]" style={{ background: color }} />
          {label}
        </span>
      ))}
    </div>
  );
}
