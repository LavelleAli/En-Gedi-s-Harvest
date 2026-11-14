// The crops the reader added (researched or entered by hand), with their sources, and Remove.
import Button from "@/frontend/components/ui/Button";
import Card from "@/frontend/components/ui/Card";
import type { Crop } from "@/shared/crop";

export default function CustomCropsCard({ crops, onRemove }: { crops: Crop[]; onRemove: (id: string) => void }) {
  if (!crops.length) return null;
  return (
    <Card className="grid content-start gap-2">
      <h3>Crops you added</h3>
      <ul className="m-0 grid list-none p-0">
        {crops.map((c) => (
          <li key={c.id} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-line py-2">
            <span>
              <b>{c.name}</b> <span>{c.origin === "research" ? "researched" : "entered by hand"}</span>
            </span>
            {c.sources.length > 0 && (
              <span>
                Sources:{" "}
                {c.sources.map((s, i) => (
                  <span key={s.url}>
                    {i ? ", " : ""}
                    <a href={s.url} target="_blank" rel="noopener noreferrer">
                      {s.title}
                    </a>
                  </span>
                ))}
              </span>
            )}
            <Button variant="link" onClick={() => onRemove(c.id)} aria-label={`Remove ${c.name} from your crops`}>
              Remove
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
