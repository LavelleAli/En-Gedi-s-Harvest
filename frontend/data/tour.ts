// The steps of the optional walkthrough (frontend/components/Tour.tsx), in order.
//
//   route   the page the step is on; leave it out for things on every page (masthead, sidebar)
//   target  the element to point at: the value of its data-tour="…" attribute. Leave it out for a
//           card in the middle of the screen. If the element can't be found, the card is centered.
//   title   short heading for the card
//   body    one or two sentences on what it is and how to use it
export type TourStep = { route?: string; target?: string; title: string; body: string };

export const TOUR: TourStep[] = [
  {
    route: "/",
    title: "Welcome to En Gedi's Harvest",
    body: "This tour points out the main tools in about two minutes. Use Next and Back (or the arrow keys), and end it any time with End tour or Esc.",
  },
  {
    target: "location",
    title: "Set your zone first",
    body: "Planting dates, the calendar and the plant suggestions all follow your hardiness zone. Choose Change, then click your state on the map and pick your zone.",
  },
  {
    route: "/",
    target: "months",
    title: "Pick a month",
    body: "Each month has its own checklist for the garden, kitchen and animals. Tick items off as you go; the tiles fill in as the month gets done.",
  },
  {
    route: "/",
    target: "suggestions",
    title: "What to plant now",
    body: "These crops have a planting window open this month in your zone, with how to start each one.",
  },
  {
    target: "tools",
    title: "Every page is under Tools",
    body: "Open Tools for the calendar, planner, encyclopedia, plant doctor, recipes, pantry, water, remedies, bees, chickens and fish.",
  },
  {
    route: "/calendar/",
    target: "calendar",
    title: "The whole year at a glance",
    body: "What to plant or sow, what to harvest, and other jobs for every month, shifted to your zone's frost dates.",
  },
  {
    route: "/plants/",
    target: "plant-tools",
    title: "Find a plant",
    body: "Search by name, nutrient or problem, or pick a type of plant from the list: fruits, vegetables, herbs, roses, peonies and more. Tap a row to open its full entry, and star the plants you grow to build your own garden list.",
  },
  {
    route: "/planner/",
    target: "planner-tools",
    title: "Lay out your beds",
    body: "Add raised or in-ground beds and shade sources here, then drag them into place in the 3D view and turn them with R or the turn buttons. Everything you add is listed under the view. Snap to grid (under the yard size) keeps them lined up, and the sun-hours map (with the date) shows the sunny and shady spots.",
  },
  {
    route: "/planner/",
    target: "planner-scene",
    title: "Look around in 3D",
    body: "Drag empty ground to orbit, scroll to zoom, and press 1, 3 or 7 for front, side or top views. Click a bed to pick crops for it. The full key list is under the view.",
  },
  {
    route: "/planner/",
    target: "planner-sun",
    title: "Follow the sun",
    body: "Pick a date and slide the time to see where the shadows fall in your yard on that day.",
  },
  {
    route: "/plant-doctor/",
    target: "doctor",
    title: "Something wrong with a plant?",
    body: "Each card puts a healthy plant next to a common problem, with the cause and the fix.",
  },
  {
    target: "print",
    title: "Print it",
    body: "Print the page you're on, or the whole book to keep in the shed or the kitchen.",
  },
  {
    target: "theme",
    title: "Light or dark",
    body: "Switch between light and dark. The book remembers your choice.",
  },
  {
    target: "account",
    title: "Keep it on every device",
    body: "Everything works without an account and saves in this browser. Sign in to keep your checklists, stars and garden plan on your other devices too.",
  },
  {
    title: "That's the tour",
    body: "You can take it again any time from Tools → Take the tour.",
  },
];
