"use client";

// The Tools window: every page of the book, opened from "Tools" in the sidebar. It fades in and out
// over 500ms (useFadeDialog), and closes itself when you pick a page.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/frontend/data/routes";

function normalize(path) {
  if (!path) return "/";
  return path.endsWith("/") ? path : path + "/";
}

// dialogRef, onClose, onCancel and onBackdropClick come from useFadeDialog() in Sidebar.js.
export default function Nav({ dialogRef, onClose, onCancel, onBackdropClick }) {
  const pathname = normalize(usePathname());

  return (
    <dialog ref={dialogRef} className="dialog fade-dialog tools-dialog" aria-labelledby="tools-title" onCancel={onCancel} onClick={onBackdropClick}>
      <div className="panel-head">
        <h2 id="tools-title">Tools</h2>
        <button type="button" onClick={onClose}>Close</button>
      </div>
      <nav className="tools-grid" aria-label="Sections">
        {ROUTES.map((r) => {
          const active = pathname === r.href;
          return (
            <Link key={r.href} href={r.href} aria-current={active ? "page" : undefined} onClick={onClose}>
              <span className="dot" style={{ background: r.color }} aria-hidden="true" />
              {r.label}
            </Link>
          );
        })}
      </nav>
    </dialog>
  );
}
