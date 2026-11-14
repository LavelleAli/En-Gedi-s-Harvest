// The type-of-plant filter in the crop picker: All, Vegetables, Fruits, Herbs, Flowers, each with how many
// crops it holds. One is on at a time (aria-pressed, filled with the accent).
import Chip from "@/frontend/components/ui/Chip";
import { CATEGORIES, type Category } from "./cropFilter";

type CategoryFilterProps = {
  value: Category;
  counts: Record<Category, number>;
  onChange: (category: Category) => void;
};

export default function CategoryFilter({ value, counts, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Type of plant">
      {CATEGORIES.map(([id, label]) => (
        <Chip key={id} pressed={value === id} onClick={() => onChange(id)}>
          {label}
          <span className="ms-1.5 font-normal opacity-80">{counts[id]}</span>
        </Chip>
      ))}
    </div>
  );
}
