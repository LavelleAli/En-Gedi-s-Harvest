"use client";

// The masthead's account link: "Sign in" or "Account", hidden when accounts aren't set up.
import Link from "next/link";
import { useAuth } from "@/frontend/account/auth";

export default function AccountLink() {
  const { status } = useAuth();
  if (status === "disabled") return null;
  return (
    <Link className="btn" href="/account/">
      {status === "signed-in" ? "Account" : "Sign in"}
    </Link>
  );
}
