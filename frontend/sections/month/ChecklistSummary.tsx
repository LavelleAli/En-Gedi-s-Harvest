// Above the checklist: "3 of 16 done in March", a progress bar, and a button that clears the month.
import Button from "@/frontend/components/ui/Button";
import ProgressBar from "./ProgressBar";
import { percent, type Progress } from "./progress";

type ChecklistSummaryProps = {
  monthName: string;
  progress: Progress;
  onClear: () => void;
};

export default function ChecklistSummary({ monthName, progress, onClear }: ChecklistSummaryProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
      <div className="grid max-w-md flex-[1_1_16rem] gap-2">
        <p>
          <b>
            {progress.done} of {progress.total} done
          </b>{" "}
          in {monthName}
        </p>
        <ProgressBar pct={percent(progress)} thick className="print:hidden" />
      </div>
      <Button className="print:hidden" disabled={progress.done === 0} onClick={onClear}>
        Clear {monthName}
      </Button>
    </div>
  );
}
