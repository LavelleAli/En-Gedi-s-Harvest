"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

// After a client-side page change, move keyboard and screen-reader focus to the new content
// (unless the link targets an anchor like /plant-doctor/#sym-spots, which handles its own scroll).
export default function RouteFocus() {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const hash = window.location.hash.slice(1);
    const target = hash && document.getElementById(hash);
    if (target) {
      target.scrollIntoView({ block: "start" });
      return;
    }
    window.scrollTo(0, 0);
    document.getElementById("main")?.focus({ preventScroll: true });
  }, [pathname]);

  return null;
}
