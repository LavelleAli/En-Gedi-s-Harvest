// How much a piece of gear matters: "Required" in red, or a quieter outlined tag for the optional ones.
import { cx } from "@/frontend/lib/cx";

export default function NeedTag({ required, children }: { required: boolean; children: string }) {
  return (
    <span
      className={cx(
        "inline-block rounded-full px-2 py-0.5 text-xs font-bold whitespace-nowrap",
        required ? "bg-red-soft text-red-ink" : "border border-line bg-surface text-muted",
      )}
    >
      {children}
    </span>
  );
}
