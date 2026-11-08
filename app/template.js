// A template (unlike a layout) remounts on every navigation,
// so each page replays the 500ms fade-in defined in globals.css (.page-fade).
export default function Template({ children }) {
  return <div className="page-fade">{children}</div>;
}
