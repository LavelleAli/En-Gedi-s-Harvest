// A "seed packet" card: a tinted header in one of the job colors over a glass body.
//   <Packet tone="green" title="Plant or sow" badge="0/4">…</Packet>
// It sets --tone to its color, so things inside can use it: list markers (marker:text-(--tone)) or the
// line through a ticked checklist item.
import type { ReactNode } from "react";
import { cx } from "@/frontend/lib/cx";
import type { Tone } from "./tone";

// Each tone: the --tone color, and the header's fill and text.
const TONES: Record<Tone, string> = {
  plain: "[--tone:var(--muted)] [&>header]:bg-surface [&>header]:text-fg",
  green: "[--tone:var(--green)] [&>header]:bg-green-soft [&>header]:text-green-ink",
  yellow: "[--tone:var(--yellow)] [&>header]:bg-yellow-soft [&>header]:text-yellow-ink",
  red: "[--tone:var(--red)] [&>header]:bg-red-soft [&>header]:text-red-ink",
  blue: "[--tone:var(--blue)] [&>header]:bg-blue-soft [&>header]:text-blue-ink",
};

const PACKET = [
  // Glass card; the header's fill reaches the rounded corners.
  "flex min-w-0 flex-col overflow-hidden rounded-lg border border-line bg-panel shadow-card backdrop-blur-glass",
  // Printing never splits one across two pages.
  "print:break-inside-avoid",
].join(" ");

const HEADER = [
  "flex items-center justify-between gap-2 border-b border-line px-4 pt-3.5 pb-3",
  // A 3px stripe of the job color along the top. In Windows High Contrast (no shadows) it becomes a border.
  "shadow-[inset_0_3px_0_var(--tone)] forced-colors:border-t-3 forced-colors:border-t-[CanvasText]",
].join(" ");

// The small outlined count or label at the right of the header ("0/4", "1 liter").
const BADGE = "flex-none rounded-full border border-current px-2 py-0.5 font-mono text-[0.6875rem] tracking-[0.1em] opacity-85";

type PacketProps = {
  tone?: Tone;
  title: ReactNode;
  badge?: ReactNode;
  children: ReactNode;
};

export default function Packet({ tone = "plain", title, badge, children }: PacketProps) {
  return (
    <div className={cx(PACKET, TONES[tone])}>
      <header className={HEADER}>
        <h3 className="text-lg text-inherit">{title}</h3>
        {badge && <span className={BADGE}>{badge}</span>}
      </header>
      <div className="grid gap-3 px-4 pt-4 pb-[1.125rem]">{children}</div>
    </div>
  );
}
