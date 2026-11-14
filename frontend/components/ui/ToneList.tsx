// A bulleted list inside a Packet: its bullets take the packet's color (--tone).
//   <Packet tone="blue" title="Filters"><ToneList><li>…</li></ToneList></Packet>
import type { ReactNode } from "react";

export default function ToneList({ children }: { children: ReactNode }) {
  return <ul className="m-0 grid gap-1.5 ps-[1.125rem] marker:text-(--tone)">{children}</ul>;
}
