// The frame for a long guide (bees, chickens, fish): the page grid, with a hairline and space between
// one numbered section and the next.
import type { ReactNode } from "react";
import Page from "@/frontend/components/ui/Page";

const BETWEEN_SECTIONS =
  "[&>[data-guide-section]+[data-guide-section]]:border-t [&>[data-guide-section]+[data-guide-section]]:border-line [&>[data-guide-section]+[data-guide-section]]:pt-6";

export default function Guide({ children }: { children: ReactNode }) {
  return <Page className={BETWEEN_SECTIONS}>{children}</Page>;
}
