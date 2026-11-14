// One of a month's checklists ("Plant or sow", "Harvest", "Other tasks") as a colored packet, with its
// count in the header. Items flow into two columns when the packet is wide enough.
import Packet from "@/frontend/components/ui/Packet";
import { toneFromLetter } from "@/frontend/components/ui/tone";
import type { ChecklistGroup, Done } from "@/frontend/lib/todos";
import ChecklistItem from "./ChecklistItem";
import { countDone } from "./progress";

type ChecklistPacketProps = {
  group: ChecklistGroup;
  done: Done;
  onToggle: (key: string) => void;
};

export default function ChecklistPacket({ group, done, onToggle }: ChecklistPacketProps) {
  const c = countDone([group], done);
  const badge = (
    <>
      <span aria-hidden="true">
        {c.done}/{c.total}
      </span>
      <span className="sr-only">
        {c.done} of {c.total} done
      </span>
    </>
  );
  return (
    <Packet tone={toneFromLetter(group.tone)} title={group.title} badge={badge}>
      <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(100%,15rem),1fr))] gap-1.5 p-0">
        {group.items.map((item) => (
          <ChecklistItem key={item.key} label={item.label} checked={!!done[item.key]} onToggle={() => onToggle(item.key)} />
        ))}
      </ul>
    </Packet>
  );
}
