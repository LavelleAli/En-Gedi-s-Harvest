// The small muted line at the end of a guide that names where its advice comes from.
//   <SourceNote>Source: <a href="…">CDC, How to Make Water Safe</a></SourceNote>
import type { ReactNode } from "react";

export default function SourceNote({ children }: { children: ReactNode }) {
  return <p className="grid gap-1 text-sm text-muted">{children}</p>;
}
