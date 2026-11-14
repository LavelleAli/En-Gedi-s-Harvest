// The top of an editor: what's being edited, and "Done" to deselect it and go back to the yard.
import Button from "@/frontend/components/ui/Button";

export default function PanelHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h3>{title}</h3>
      <Button variant="link" onClick={onClose}>
        Done
      </Button>
    </div>
  );
}
