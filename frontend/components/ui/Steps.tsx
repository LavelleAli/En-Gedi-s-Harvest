// A list of steps: numbered (bold green numbers) for things done in order, or bulleted (muted bullets)
// for a set of rules. `compact` sets a bulleted list a little tighter, for inside a Packet.
//   <Steps ordered><li>Let it settle.</li><li>Boil it.</li></Steps>
import type { ReactNode } from "react";

const BASE = "m-0 grid gap-2 ps-[1.375rem]";
const COMPACT = "m-0 grid gap-1.5 ps-[1.125rem]";

type StepsProps = { ordered?: boolean; compact?: boolean; children: ReactNode };

export default function Steps({ ordered, compact, children }: StepsProps) {
  return ordered ? (
    <ol className={`${BASE} marker:font-bold marker:text-green`}>{children}</ol>
  ) : (
    <ul className={`${compact ? COMPACT : BASE} marker:text-muted`}>{children}</ul>
  );
}
