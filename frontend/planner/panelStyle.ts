// The planner's panels (Add to the yard, Sun and shade, the editor, In this yard): glass cards with their
// contents stacked. Headings are a step smaller than elsewhere. Not printed.
export const PANEL = [
  "grid content-start gap-4 rounded-lg border border-line bg-panel p-4 shadow-card backdrop-blur-glass print:hidden",
  "[&_h3]:text-lg [&_h4]:text-sm",
].join(" ");

// Add to the yard and Sun and shade, once they sit beside the sandbox (windows 111rem+, see PlannerApp):
// exactly as tall as the sandbox box (same clamp as SCENE_BOX), scrolling inside when their contents are taller.
export const SIDE_PANEL = "min-[111rem]:h-[clamp(300px,62vh,40rem)] min-[111rem]:self-start min-[111rem]:overflow-auto";
