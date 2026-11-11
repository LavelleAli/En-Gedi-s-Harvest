// "Onion (incl. green and walking onions)" -> "onion-incl-green-and-walking-onions"
export function slug(text: unknown): string {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
