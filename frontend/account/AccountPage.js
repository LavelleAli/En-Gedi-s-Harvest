"use client";

// The account page: sign in or create an account, see this month's plant lookups, upgrade to the
// Garden plan ($3/month through Stripe), manage billing, sign out, or delete the account.
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/frontend/account/api";
import { authMessage, createAccount, resetPassword, signInWithEmail, signInWithGoogle, signOutUser, useAuth } from "@/frontend/account/auth";

function SignIn() {
  const [mode, setMode] = useState("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState({ kind: "", text: "" });

  const run = async (fn, success = "") => {
    setBusy(true);
    setMessage({ kind: "", text: "" });
    try {
      await fn();
      if (success) setMessage({ kind: "ok", text: success });
    } catch (err) {
      setMessage({ kind: "error", text: authMessage(err) });
    } finally {
      setBusy(false);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    run(() => (mode === "sign-in" ? signInWithEmail(email, password) : createAccount(email, password)));
  };

  return (
    <div className="account-grid">
      <section className="card stack" aria-labelledby="signin-title">
        <h3 id="signin-title">{mode === "sign-in" ? "Sign in" : "Create a free account"}</h3>
        <button type="button" className="btn-wide" onClick={() => run(signInWithGoogle)} disabled={busy}>
          Continue with Google
        </button>
        <p className="divider-text"><span>or use email</span></p>
        <form className="stack" onSubmit={submit} noValidate={false}>
          <div className="field">
            <label htmlFor="acct-email">Email</label>
            <input id="acct-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="acct-password">Password</label>
            <input
              id="acct-password" type="password" required minLength={8}
              autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
              aria-describedby="acct-password-hint" value={password} onChange={(e) => setPassword(e.target.value)}
            />
            <p className="hint" id="acct-password-hint">At least 8 characters.</p>
          </div>
          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? "Working…" : mode === "sign-in" ? "Sign in" : "Create account"}
          </button>
        </form>
        <div className="row-actions">
          <button type="button" className="link-button" onClick={() => setMode(mode === "sign-in" ? "create" : "sign-in")}>
            {mode === "sign-in" ? "New here? Create an account" : "Have an account? Sign in"}
          </button>
          {mode === "sign-in" && (
            <button
              type="button" className="link-button" disabled={busy}
              onClick={() => (email ? run(() => resetPassword(email), `If there's an account for ${email}, a reset link is on its way.`) : setMessage({ kind: "error", text: "Enter your email above first." }))}
            >
              Forgot password?
            </button>
          )}
        </div>
        <p className={`form-message ${message.kind}`} role={message.kind === "error" ? "alert" : "status"}>{message.text}</p>
      </section>
      <PlanCompare />
    </div>
  );
}

function PlanCompare({ current, onUpgrade, busy, billingAvailable = true }) {
  return (
    <section className="card stack" aria-labelledby="plans-title">
      <h3 id="plans-title">Plans</h3>
      <div className="plans">
        <div className={`plan${current === "free" ? " is-current" : ""}`}>
          <h4>Free</h4>
          <p className="price">$0</p>
          <ul>
            <li>The whole book, planner and stock plant list</li>
            <li>Search the shared plant library: unlimited</li>
            <li>Research 5 new plants a month with Claude</li>
          </ul>
          {current === "free" && <p className="plan-tag">Your plan</p>}
        </div>
        <div className={`plan${current === "garden" ? " is-current" : ""}`}>
          <h4>Garden</h4>
          <p className="price">$3<span>/month</span></p>
          <ul>
            <li>Everything in Free</li>
            <li>Research new plants: unlimited</li>
            <li>Cancel any time from the billing page</li>
          </ul>
          {current === "garden" && <p className="plan-tag">Your plan</p>}
          {current === "free" && billingAvailable && (
            <button type="button" className="btn-primary" onClick={onUpgrade} disabled={busy}>
              {busy ? "Opening checkout…" : "Upgrade for $3/month"}
            </button>
          )}
        </div>
      </div>
      <p className="hint">Every plant anyone researches joins the shared library, so popular plants are usually free to look up.</p>
    </section>
  );
}

function Account({ user }) {
  const [account, setAccount] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");
    const first = api("/api/account/", { auth: true }).then(
      (a) => !cancelled && setAccount(a),
      (err) => !cancelled && setError(err),
    );
    if (checkout === "success") {
      // Stripe tells the server by webhook; poll briefly until the plan shows up.
      first.then(async () => {
        if (!cancelled) setNotice("Thanks for subscribing! Your Garden plan will show here in a moment.");
        for (let i = 0; i < 5 && !cancelled; i++) {
          await new Promise((r) => setTimeout(r, 2000));
          const a = await api("/api/account/", { auth: true }).catch(() => null);
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
    if (checkout) window.history.replaceState(null, "", window.location.pathname);
    return () => {
      cancelled = true;
    };
  }, []);

  const go = async (path, label) => {
    setBusy(label);
    try {
      const { url } = await api(path, { method: "POST", auth: true });
      window.location.assign(url);
    } catch (err) {
      setError(err);
      setBusy("");
    }
  };

  const remove = async () => {
    setBusy("delete");
    try {
      await api("/api/account/", { method: "DELETE", auth: true });
      await signOutUser().catch(() => {});
      setNotice("Your account and its data are deleted.");
    } catch (err) {
      setError(err);
    } finally {
      setBusy("");
      setConfirmDelete(false);
    }
  };

  const usage = account?.usage;
  const monthName = usage ? new Date(`${usage.month}-15T12:00:00Z`).toLocaleDateString("en-US", { month: "long", timeZone: "UTC" }) : "";

  return (
    <div className="stack-lg">
      {notice && <div className="callout g" role="status"><strong>{notice}</strong></div>}
      {error && (
        <div className="callout" role="alert">
          <strong>{error.title}</strong>
          {error.detail && <p>{error.detail}</p>}
        </div>
      )}
      <div className="account-grid">
        <section className="card stack" aria-labelledby="you-title">
          <h3 id="you-title">Signed in</h3>
          <p>{user.email || user.name}</p>
          {account && (
            <dl className="kv">
              <dt>Plan</dt>
              <dd>{account.plan === "garden" ? "Garden ($3/month)" : "Free"}</dd>
              <dt>Lookups</dt>
              <dd>
                {usage.limit === null
                  ? `${usage.used} new plants researched in ${monthName} (unlimited)`
                  : `${usage.used} of ${usage.limit} new-plant lookups used in ${monthName}`}
              </dd>
            </dl>
          )}
          {!account && !error && <p className="pmeta">Loading your account…</p>}
          <div className="row-actions">
            {account?.hasBilling && (
              <button type="button" onClick={() => go("/api/billing/portal/", "portal")} disabled={!!busy}>
                {busy === "portal" ? "Opening…" : "Manage billing"}
              </button>
            )}
            <button type="button" onClick={() => signOutUser()} disabled={!!busy}>Sign out</button>
          </div>
        </section>
        <PlanCompare current={account?.plan} busy={busy === "checkout"} billingAvailable={account?.billingAvailable} onUpgrade={() => go("/api/billing/checkout/", "checkout")} />
      </div>
      <section className="card stack" aria-labelledby="shop-title">
        <h3 id="shop-title">Gear shop</h3>
        <p>Beekeeping, water filtration and garden supplies for the projects in the book. Coming soon.</p>
        <div><Link className="btn" href="/shop/">Browse the shop</Link></div>
      </section>
      <section className="card stack danger-zone" aria-labelledby="delete-title">
        <h3 id="delete-title">Delete account</h3>
        <p>Cancels any subscription and permanently deletes your account and lookup history. Plants you researched stay in the shared library without your name. Synced copies of your starred plants, checklists and garden plan are deleted too; the copies in this browser stay.</p>
        {confirmDelete ? (
          <div className="row-actions">
            <button type="button" className="btn-danger" onClick={remove} disabled={busy === "delete"}>
              {busy === "delete" ? "Deleting…" : "Delete my account permanently"}
            </button>
            <button type="button" onClick={() => setConfirmDelete(false)}>Keep my account</button>
          </div>
        ) : (
          <div><button type="button" onClick={() => setConfirmDelete(true)}>Delete my account…</button></div>
        )}
      </section>
    </div>
  );
}

export default function AccountPage() {
  const { status, user } = useAuth();
  return (
    <section className="view">
      <div>
        <div className="kicker">Your account</div>
        <h2>Account and plans</h2>
      </div>
      <p className="lead">
        You don&apos;t need an account to read the book or use the garden planner. An account lets you research plants that aren&apos;t in
        the stock list: Claude searches extension services and seed companies and fills in a growing guide for your zone.
      </p>
      {status === "disabled" && (
        <div className="callout y">
          <strong>Accounts aren&apos;t turned on for this copy of the site</strong>
          <p>The offline version has no server. On the online version, accounts work once Firebase is set up (see the README).</p>
        </div>
      )}
      {status === "loading" && <p className="pmeta" role="status">Checking sign-in…</p>}
      {status === "signed-out" && <SignIn />}
      {status === "signed-in" && <Account user={user} />}
    </section>
  );
}
