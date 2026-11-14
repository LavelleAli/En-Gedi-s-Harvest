// Path helpers shared by the sidebar, the Tools menu and the tour.

// The site's URLs all end in a slash (/plants/), but usePathname() can return them without one
// (/plants) or as null before the router is ready. This makes every form comparable to ROUTES' hrefs.
export function normalizePath(path: string | null): string {
  if (!path) return "/";
  return path.endsWith("/") ? path : path + "/";
}
