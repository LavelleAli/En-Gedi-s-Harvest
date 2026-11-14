// The line under a form that reports what happened: an error in red, a success in green. Hidden while
// empty. Errors are announced at once (role="alert"); other news politely (role="status").
import { cx } from "@/frontend/lib/cx";

type FormMessageProps = { kind?: "error" | "ok" | ""; children?: string };

export default function FormMessage({ kind = "", children }: FormMessageProps) {
  return (
    <p className={cx("text-sm empty:hidden", kind === "error" && "text-red-ink", kind === "ok" && "text-green-ink")} role={kind === "error" ? "alert" : "status"}>
      {children}
    </p>
  );
}
