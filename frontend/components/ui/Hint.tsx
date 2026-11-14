// Small helper text under a form field. Give it an id and point the field's aria-describedby at it, so
// screen readers read it with the field. It disappears while empty (e.g. a status line with nothing to say).
import type { HTMLAttributes } from "react";
import { cx } from "@/frontend/lib/cx";

export default function Hint({ className, ...rest }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cx("text-xs text-muted empty:hidden", className)} {...rest} />;
}
