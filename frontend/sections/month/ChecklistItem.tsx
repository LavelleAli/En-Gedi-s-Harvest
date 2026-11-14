// One checklist item: a checkbox and its label. A ticked item is struck through in its packet's color
// (--tone, set by Packet) and dimmed, so it still reads as done without color.
type ChecklistItemProps = {
  label: string;
  checked: boolean;
  onToggle: () => void;
};

export default function ChecklistItem({ label, checked, onToggle }: ChecklistItemProps) {
  return (
    <li>
      {/* The whole row is the click target, with a quiet 300ms hover fill. */}
      <label className="-mx-2 flex cursor-pointer items-start gap-3 rounded-sm p-2 transition-colors hover:bg-surface">
        <input type="checkbox" className="peer m-0 mt-0.5 size-5 flex-none cursor-pointer accent-green" checked={checked} onChange={onToggle} />
        <span className="peer-checked:text-muted peer-checked:line-through peer-checked:decoration-(--tone) peer-checked:decoration-2">{label}</span>
      </label>
    </li>
  );
}
