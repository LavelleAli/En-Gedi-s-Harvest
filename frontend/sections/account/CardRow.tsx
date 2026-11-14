// Cards side by side (at least 20rem each), stacked on a phone, lined up at the top. Used on the account
// and profile pages.
import type { ReactNode } from "react";

export default function CardRow({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,20rem),1fr))] items-start gap-4">{children}</div>;
}
