"use client";

// "Add a crop that isn't listed": search the stock list and the shared library, research a new plant
// with Claude (signed-in readers; free accounts get a few a month), or type one in by hand.
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/frontend/account/auth";
import Button from "@/frontend/components/ui/Button";
import Chip from "@/frontend/components/ui/Chip";
import Dialog from "@/frontend/components/ui/Dialog";
import Field from "@/frontend/components/ui/Field";
import Hint from "@/frontend/components/ui/Hint";
import { useFadeDialog } from "@/frontend/lib/useFadeDialog";
import { normalizeName, type Crop } from "@/shared/crop";
import CropCard from "./CropCard";
import ManualForm from "./ManualForm";
import ResearchBox from "./ResearchBox";
import { useDebounced } from "./useDebounced";
import { useLibrarySearch } from "./useLibrarySearch";
import { useResearch } from "./useResearch";

// A group in the window: a small heading and what's under it.
const GROUP = "grid content-start gap-2";

type AddCropDialogProps = {
  open: boolean;
  bedName: string;
  zone: string;
  crops: Crop[];
  onClose: () => void;
  onAdd: (crop: Crop) => void;
};

export default function AddCropDialog({ open, bedName, zone, crops, onClose, onAdd }: AddCropDialogProps) {
  const { status } = useAuth();
  const [query, setQuery] = useState("");
  const [manual, setManual] = useState(false);
  const q = useDebounced(query.trim(), 300);
  const library = useLibrarySearch(q, crops);
  const { research, elapsed, run, cancel, reset } = useResearch(zone);

  // Once the window has faded out (Close, Esc, a click outside, or a crop added): clear it for next time
  // and tell the planner.
  const resetAndClose = () => {
    reset();
    setQuery("");
    setManual(false);
    onClose();
  };

  const { ref: dialogRef, open: openDialog, close: closeDialog, onCancel, onClick: onBackdropClick } = useFadeDialog({ onClosed: resetAndClose });
  // The planner opens and closes the window through the `open` prop.
  useEffect(() => {
    if (open) openDialog();
    else closeDialog();
  }, [open, openDialog, closeDialog]);

  // Stock crops matching the query, searched right here in the browser.
  const stockMatches = useMemo(() => {
    const key = normalizeName(q);
    if (key.length < 2) return [];
    return crops.filter((c) => normalizeName(c.name).includes(key) || (c.book && normalizeName(c.book).includes(key))).slice(0, 6);
  }, [q, crops]);

  const nothingFound = q.length >= 2 && stockMatches.length === 0 && library.state === "done" && library.results.length === 0;

  return (
    <Dialog dialogRef={dialogRef} onCancel={onCancel} onBackdropClick={onBackdropClick} titleId="addcrop-title" wide>
      <div className="grid content-start gap-4">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="addcrop-title">Add a crop to {bedName}</h2>
          <Button variant="link" onClick={closeDialog}>
            Close
          </Button>
        </div>
        <Field id="addcrop-q" label="Plant name">
          <input
            id="addcrop-q"
            type="search"
            autoComplete="off"
            enterKeyHint="search"
            maxLength={60}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tomatillo, ground cherry, sorrel…"
            aria-describedby="addcrop-hint"
          />
          <Hint id="addcrop-hint">Searches the stock list and the shared library first. Both are free.</Hint>
        </Field>

        {stockMatches.length > 0 && (
          <div className={GROUP}>
            <h3 className="text-md">On the stock list</h3>
            <div className="flex flex-wrap gap-2">
              {stockMatches.map((c) => (
                <Chip key={c.id} onClick={() => onAdd(c)}>
                  + {c.name}
                </Chip>
              ))}
            </div>
          </div>
        )}
        {library.results.length > 0 && (
          <div className={GROUP}>
            <h3 className="text-md">In the shared library</h3>
            {library.results.map((c) => (
              <CropCard key={c.id} crop={c} bedName={bedName} onAdd={onAdd} />
            ))}
          </div>
        )}
        <p role="status" aria-live="polite">
          {library.state === "loading" && "Searching the shared library…"}
          {library.state === "error" && library.error?.code === "offline" && "The shared library needs the online version of the site."}
          {library.state === "error" && library.error?.code !== "offline" && `Couldn't search the shared library: ${library.error?.title}.`}
          {nothingFound && `No match for “${q}” yet.`}
        </p>

        {q.length >= 2 && (
          <ResearchBox
            name={query.trim()}
            zone={zone}
            status={status}
            research={research}
            elapsed={elapsed}
            onRun={() => run(query.trim())}
            onCancel={cancel}
            bedName={bedName}
            onAdd={onAdd}
          />
        )}

        <div className={GROUP}>
          {manual ? (
            <>
              <h3 className="text-md">Enter it by hand</h3>
              <ManualForm initialName={query.trim()} onSave={onAdd} />
            </>
          ) : (
            <Button variant="link" onClick={() => setManual(true)}>
              Or enter a plant by hand
            </Button>
          )}
        </div>
      </div>
    </Dialog>
  );
}
