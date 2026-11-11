import Link from "next/link";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <section className="view">
      <div>
        <div className="kicker">404</div>
        <h2>That page isn&apos;t in the book</h2>
      </div>
      <p className="lead">The link may be old or mistyped. Pick a section from the row above, or start with this month&apos;s garden tasks.</p>
      <p>
        <Link className="btn" href="/">Go to this month</Link>
      </p>
    </section>
  );
}
