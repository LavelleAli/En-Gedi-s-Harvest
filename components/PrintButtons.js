"use client";

import Link from "next/link";

export default function PrintButtons() {
  return (
    <div className="printbar">
      <button type="button" onClick={() => window.print()}>
        Print this page
      </button>
      <Link className="btn" href="/book/">
        Whole book
      </Link>
    </div>
  );
}
