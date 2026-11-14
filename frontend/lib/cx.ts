// Joins class names, skipping empty ones: cx("a", open && "b", undefined) → "a b".
// (No class-merging: a component's own classes and the ones passed in shouldn't set the same property.)
export function cx(...names: (string | false | null | undefined)[]): string {
  return names.filter(Boolean).join(" ");
}
