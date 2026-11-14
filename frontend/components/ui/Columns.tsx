// Side-by-side columns that wrap: as many as fit at the given minimum width, stacked on a phone.
//   <Columns min={15}><Packet …/><Packet …/></Columns>
import type { ReactNode } from "react";

// Tailwind needs whole class names, so each width is spelled out.
const MIN = {
  15: "grid-cols-[repeat(auto-fit,minmax(min(100%,15rem),1fr))]",
  16: "grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),1fr))]",
};

export default function Columns({ min, children }: { min: keyof typeof MIN; children: ReactNode }) {
  return <div className={`grid gap-4 [&>*]:min-w-0 ${MIN[min]}`}>{children}</div>;
}
