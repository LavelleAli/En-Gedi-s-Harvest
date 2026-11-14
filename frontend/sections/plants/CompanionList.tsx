// "Basil, marigolds, carrots": each name that has its own entry becomes a link that opens it.
// Pass `text` (a book list like "Basil, marigolds") or `names` (a catalog crop's ids or names).
import { CATALOG } from "@/shared/catalog";
import { findCrop } from "@/shared/crop";
import { ENTRIES } from "./entries";

export default function CompanionList({ text, names }: { text?: string; names?: string[] }) {
  const parts = text ? text.split(/,\s*|;\s*|\s+\+\s+/) : (names ?? []);
  return (
    <>
      {parts.map((part, i) => {
        const match = findCrop(part, CATALOG);
        const entry = match && ENTRIES.find((e) => e.crop.id === match.id);
        return (
          <span key={`${part}-${i}`}>
            {i > 0 && ", "}
            {entry ? <a href={`#${entry.id}`}>{part}</a> : part}
          </span>
        );
      })}
    </>
  );
}
