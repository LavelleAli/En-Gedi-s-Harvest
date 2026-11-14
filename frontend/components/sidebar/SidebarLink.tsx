// One plain link in the sidebar (Account, Profile, Shop): icon over label, marked as the current
// page when you're on it.
import Link from "next/link";
import SidebarIcon, { type IconName } from "./SidebarIcon";
import { ITEM } from "./itemStyle";

type SidebarLinkProps = {
  href: string;
  icon: IconName;
  label: string;
  current: boolean; // true on this link's own page
};

export default function SidebarLink({ href, icon, label, current }: SidebarLinkProps) {
  return (
    // data-tour lets the tour point at this item.
    <Link href={href} className={ITEM} aria-current={current ? "page" : undefined} data-tour={icon}>
      <SidebarIcon name={icon} />
      <span>{label}</span>
    </Link>
  );
}
