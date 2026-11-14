// Links to each numbered section of a guide, as a row of chip-style links (6px corners). Not printed.
const LINK = [
  "inline-flex min-h-10 items-center rounded-md border border-line bg-panel px-3.5",
  "text-[0.8125rem] leading-[1.3] font-semibold text-fg no-underline",
  "transition-[background-color,border-color] hover:border-line-strong hover:bg-surface",
].join(" ");

export default function GuideNav({ links }: { links: [href: string, label: string][] }) {
  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      {links.map(([href, label]) => (
        <a key={href} href={href} className={LINK}>
          {label}
        </a>
      ))}
    </div>
  );
}
