// Under the toolbar: how many plants are listed (announced to screen readers as it changes), and
// buttons to open or close every listed entry. Not printed.
import Button from "@/frontend/components/ui/Button";

type ListStatusProps = {
  shown: number;
  total: number;
  emptyStarred: boolean; // "My garden" is on and nothing is starred yet
  anyOpen: boolean;
  onOpenAll: () => void;
  onCloseAll: () => void;
};

export default function ListStatus({ shown, total, emptyStarred, anyOpen, onOpenAll, onCloseAll }: ListStatusProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
      <p className="m-0" aria-live="polite">
        {shown} of {total} plants
        {emptyStarred ? " · star plants to build your garden list" : ""}
      </p>
      <div className="flex gap-2">
        <Button onClick={onOpenAll}>Open all</Button>
        <Button onClick={onCloseAll} disabled={!anyOpen}>
          Close all
        </Button>
      </div>
    </div>
  );
}
