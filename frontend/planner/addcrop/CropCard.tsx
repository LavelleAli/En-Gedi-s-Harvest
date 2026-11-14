// A crop found in the shared library (or just researched): what it is, its needs, any note for the
// reader's zone, its sources, and a button to add it to the bed.
import Button from "@/frontend/components/ui/Button";
import Card from "@/frontend/components/ui/Card";
import { KIND_LABEL, zoneRangeText, type Crop } from "@/shared/crop";

type CropCardProps = { crop: Crop; onAdd: (crop: Crop) => void; bedName: string };

export default function CropCard({ crop, onAdd, bedName }: CropCardProps) {
  const harvest = crop.days ? ` · ${crop.days[0]}–${crop.days[1]} days` : crop.firstHarvest ? ` · ${crop.firstHarvest}` : "";
  return (
    <Card className="grid content-start gap-2">
      <div>
        <h4 className="text-lg">{crop.name}</h4>
        <p>{[crop.botanical, KIND_LABEL[crop.kind], zoneRangeText(crop)].filter(Boolean).join(" · ")}</p>
      </div>
      {crop.summary && <p>{crop.summary}</p>}
      <p>
        Sun {crop.sunHours} h · {crop.spacingIn} in apart · {crop.waterIn} in water a week{harvest}
      </p>
      {crop.zoneNote && (
        <p>
          <b>In your zone:</b> {crop.zoneNote}
        </p>
      )}
      {crop.sources.length > 0 && (
        <p>
          Sources:{" "}
          {crop.sources.map((s, i) => (
            <span key={s.url}>
              {i ? ", " : ""}
              <a href={s.url} target="_blank" rel="noopener noreferrer">
                {s.title}
              </a>
            </span>
          ))}
        </p>
      )}
      <div>
        <Button variant="primary" onClick={() => onAdd(crop)}>
          Add to {bedName}
        </Button>
      </div>
    </Card>
  );
}
