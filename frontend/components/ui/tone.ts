// The site's job colors, as names the components take: green = plants, yellow = harvest and bees,
// red = safety and chickens, blue = water and fish, plain = no job color.
export type Tone = "plain" | "green" | "yellow" | "red" | "blue";

// Older data uses one-letter codes (frontend/lib/todos.ts, data files): g, y, r, b, and k for plain.
const LETTERS: Record<string, Tone> = { g: "green", y: "yellow", r: "red", b: "blue", k: "plain" };
export const toneFromLetter = (letter: string): Tone => LETTERS[letter] ?? "plain";
