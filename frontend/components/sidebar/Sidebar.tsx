"use client";

// The sidebar: Account, Profile, Tools and Shop. A column down the left on wider screens and a bar
// along the bottom on phones. Account, Profile and Shop are plain links; Tools opens a menu of every
// page (ToolsMenu.tsx).
import { usePathname } from "next/navigation";
import { useAuth } from "@/frontend/account/auth";
import { normalizePath } from "@/frontend/lib/paths";
import SidebarLink from "./SidebarLink";
import ToolsMenu from "./ToolsMenu";

// The bar's classes, grouped by job.
const BAR = [
  // Phones: a frosted bar along the bottom of the screen, clear of the home indicator and notches.
  "fixed inset-x-0 bottom-0 z-20 border-t border-line bg-panel shadow-raised backdrop-blur-glass print:hidden",
  "pb-[env(safe-area-inset-bottom,0px)] ps-[env(safe-area-inset-left,0px)] pe-[env(safe-area-inset-right,0px)]",
  // Wider screens: a 5.75rem column down the left edge.
  "md:inset-x-auto md:top-0 md:left-0 md:w-[5.75rem] md:border-t-0 md:border-e",
  "md:pt-[calc(env(safe-area-inset-top,0px)+1rem)] md:pb-4 md:pe-0",
].join(" ");

export default function Sidebar() {
  const pathname = normalizePath(usePathname());
  const { status } = useAuth();

  return (
    // data-sidebar lets the tour find this bar, to keep its card above it on phones.
    <aside data-sidebar className={BAR}>
      <nav aria-label="Main menu" className="grid grid-cols-4 md:grid-cols-1 md:gap-1 md:px-2">
        <SidebarLink href="/account/" icon="account" label={status === "signed-in" ? "Account" : "Sign in"} current={pathname === "/account/"} />
        <SidebarLink href="/profile/" icon="profile" label="Profile" current={pathname === "/profile/"} />
        <ToolsMenu pathname={pathname} />
        <SidebarLink href="/shop/" icon="shop" label="Shop" current={pathname === "/shop/"} />
      </nav>
    </aside>
  );
}
