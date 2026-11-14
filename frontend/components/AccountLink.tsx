"use client";

// The masthead's account link: "Sign in" or "Account", hidden when accounts aren't set up.
import ButtonLink from "@/frontend/components/ui/ButtonLink";
import { useAuth } from "@/frontend/account/auth";

export default function AccountLink() {
  const { status } = useAuth();
  if (status === "disabled") return null;
  return (
    <ButtonLink href="/account/">{status === "signed-in" ? "Account" : "Sign in"}</ButtonLink>
  );
}
