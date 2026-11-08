"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { ROUTES } from "@/lib/routes";

function normalize(path) {
  if (!path) return "/";
  return path.endsWith("/") ? path : path + "/";
}

export default function Nav() {
  const pathname = normalize(usePathname());
  const barRef = useRef(null);

  // Keep the active tab visible when the row scrolls sideways on phones.
  useEffect(() => {
    const active = barRef.current?.querySelector('[aria-current="page"]');
    active?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [pathname]);

  return (
    <nav className="tabs" aria-label="Sections">
      <div className="wrap" ref={barRef}>
        {ROUTES.map((r) => {
          const active = pathname === r.href;
          return (
            <Link key={r.href} href={r.href} aria-current={active ? "page" : undefined}>
              <span className="dot" style={{ background: r.color }} aria-hidden="true" />
              {r.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
