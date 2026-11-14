"use client";

// Loads the signed-in reader's plan and this month's lookups. Coming back from Stripe checkout
// (?checkout=success or cancel), it says how it went, and after a purchase polls for a few seconds
// until the new plan shows up (Stripe tells the server by webhook, which can take a moment).
import { useEffect, useState } from "react";
import { api, ApiError } from "@/frontend/account/api";
import type { AccountSummary } from "@/shared/account";

// Anything thrown by api() is an ApiError; anything else gets a generic message.
export const asApiError = (err: unknown): ApiError =>
  err instanceof ApiError ? err : new ApiError(0, "error", "Something went wrong", "Try again in a minute.");

export function useAccountSummary() {
  const [account, setAccount] = useState<AccountSummary | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let cancelled = false;
    const checkout = new URLSearchParams(window.location.search).get("checkout");
    const first = api<AccountSummary>("/api/account/", { auth: true }).then(
      (a) => !cancelled && setAccount(a),
      (err) => !cancelled && setError(asApiError(err)),
    );
    if (checkout === "success") {
      first.then(async () => {
        if (!cancelled) setNotice("Thanks for subscribing! Your Garden plan will show here in a moment.");
        for (let i = 0; i < 5 && !cancelled; i++) {
          await new Promise((r) => setTimeout(r, 2000));
          const a = await api<AccountSummary>("/api/account/", { auth: true }).catch(() => null);
          if (a && !cancelled) setAccount(a);
          if (a?.plan === "garden") {
            setNotice("Your Garden plan is active: plant research is unlimited.");
            break;
          }
        }
      });
    } else if (checkout === "cancel") {
      first.then(() => !cancelled && setNotice("Checkout was cancelled. You're still on the Free plan."));
    }
    // Take ?checkout off the address, so a reload doesn't repeat the message.
    if (checkout) window.history.replaceState(null, "", window.location.pathname);
    return () => {
      cancelled = true;
    };
  }, []);

  return { account, error, setError, notice, setNotice };
}
