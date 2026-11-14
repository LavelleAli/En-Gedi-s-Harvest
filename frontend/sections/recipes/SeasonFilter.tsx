// The recipe book's season chips: All, Winter, Spring, Summer, Fall. One is pressed at a time. Not printed.
import Chip from "@/frontend/components/ui/Chip";

export const SEASONS = ["All", "Winter", "Spring", "Summer", "Fall"];

export default function SeasonFilter({ value, onChange }: { value: string; onChange: (season: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2 print:hidden" role="group" aria-label="Season">
      {SEASONS.map((s) => (
        <Chip key={s} pressed={value === s} onClick={() => onChange(s)}>
          {s}
        </Chip>
      ))}
    </div>
  );
}
