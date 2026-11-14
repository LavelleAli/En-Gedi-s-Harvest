// Color theme: with nothing saved the site follows the OS; "light" and "dark" are saved overrides.
// The saved choice lives in localStorage and is applied as <html data-theme="…">.
export const THEME_KEY = "fhb-theme";
export const THEME_EVENT = "fhb-theme-change";

// Runs inline in <head> before first paint, so a saved theme never flashes the wrong colors.
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(THEME_KEY)});if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`;
