// "—— or use email ——": a label with a hairline on each side, between two ways to sign in.
const DIVIDER = [
  "flex items-center gap-3 text-sm text-muted",
  // The two hairlines, drawn before and after the label, sharing the leftover width.
  "before:flex-1 before:border-t before:border-line before:content-['']",
  "after:flex-1 after:border-t after:border-line after:content-['']",
].join(" ");

export default function OrDivider({ children }: { children: string }) {
  return (
    <p className={DIVIDER}>
      <span>{children}</span>
    </p>
  );
}
