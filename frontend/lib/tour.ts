// Small helpers for the optional walkthrough (frontend/components/Tour.tsx).
// The tour is offered once; after that it only starts when the reader asks for it (Tools → Take the tour).

const SEEN_KEY = "fhb-tour"; // set once the reader has answered the offer or taken the tour
export const TOUR_START_EVENT = "fhb-tour-start";

/** Has the reader already been offered the tour? (If storage is blocked, don't keep offering it.) */
export function tourSeen(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) !== null;
  } catch {
    return true;
  }
}

export function markTourSeen() {
  try {
    localStorage.setItem(SEEN_KEY, "seen");
  } catch {}
}

/** Start the tour from anywhere, e.g. a button: the Tour component listens for this event. */
export function startTour() {
  window.dispatchEvent(new Event(TOUR_START_EVENT));
}
