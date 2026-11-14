// A small rounded label that isn't clickable, tinted with one of the job colors.
//   <Tag tone="green">Spring</Tag>   <Tag>Serves 4</Tag>
import type { ReactNode } from "react";
import { cx } from "@/frontend/lib/cx";
import type { Tone } from "./tone";

// Every tone keeps a 1px border (transparent when tinted), so plain and tinted tags are the same size.
const TONES: Record<Tone, string> = {
  plain: "border-line bg-panel text-fg",
  green: "border-transparent bg-green-soft text-green-ink",
  yellow: "border-transparent bg-yellow-soft text-yellow-ink",
  red: "border-transparent bg-red-soft text-red-ink",
  blue: "border-transparent bg-blue-soft text-blue-ink",
};

export default function Tag({ tone = "plain", children }: { tone?: Tone; children: ReactNode }) {
  return <span className={cx("inline-flex items-center rounded-full border px-3 py-1 text-[0.8125rem] leading-[1.3] font-semibold", TONES[tone])}>{children}</span>;
}
