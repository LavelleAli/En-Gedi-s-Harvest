"use client";

// The sidebar: Account, Profile, Tools and Shop. A column down the left on wider screens and a bar
// along the bottom on phones (see .sidebar in globals.css). Tools opens the page list (Nav.js) in a
// window instead of going to a page.
import Link from "next/link";
import { usePathname } from "next/navigation";
import Nav from "@/frontend/components/Nav";
import { useAuth } from "@/frontend/account/auth";
import { useFadeDialog } from "@/frontend/lib/useFadeDialog";

// Simple line icons, drawn on a 24×24 grid with the current text color.
const ICONS = {
  account: <><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></>,
  profile: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="11" r="2.5" /><path d="M5.5 17c.8-1.8 2-2.7 3.5-2.7s2.7.9 3.5 2.7M14.5 10h4M14.5 14h4" /></>,
  tools: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
  shop: <><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>,
};

function Icon({ name }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

function normalize(path) {
  if (!path) return "/";
  return path.endsWith("/") ? path : path + "/";
}

export default function Sidebar() {
  const pathname = normalize(usePathname());
  const { status } = useAuth();
  const { ref: toolsRef, open: openTools, close: closeTools, onCancel, onClick } = useFadeDialog();

  const link = (href, icon, label) => (
    <Link href={href} className="side-item" aria-current={pathname === href ? "page" : undefined}>
      <Icon name={icon} />
      <span>{label}</span>
    </Link>
  );

  return (
    <aside className="sidebar">
      <nav aria-label="Main menu">
        {link("/account/", "account", status === "signed-in" ? "Account" : "Sign in")}
        {link("/profile/", "profile", "Profile")}
        <button type="button" className="side-item" onClick={openTools} aria-haspopup="dialog">
          <Icon name="tools" />
          <span>Tools</span>
        </button>
        {link("/shop/", "shop", "Shop")}
      </nav>
      <Nav dialogRef={toolsRef} onClose={closeTools} onCancel={onCancel} onBackdropClick={onClick} />
    </aside>
  );
}
