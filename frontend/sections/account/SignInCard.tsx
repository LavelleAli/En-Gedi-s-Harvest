"use client";

// Signing in: with Google, or with an email and password (to sign in, or to create a free account).
// Also "Forgot password?", which emails a reset link. Errors and news show under the form.
import { useState, type FormEvent } from "react";
import { authMessage, createAccount, resetPassword, signInWithEmail, signInWithGoogle } from "@/frontend/account/auth";
import Button from "@/frontend/components/ui/Button";
import Card from "@/frontend/components/ui/Card";
import Field from "@/frontend/components/ui/Field";
import FormMessage from "@/frontend/components/ui/FormMessage";
import Hint from "@/frontend/components/ui/Hint";
import OrDivider from "./OrDivider";

type Message = { kind: "" | "ok" | "error"; text: string };

export default function SignInCard() {
  const [mode, setMode] = useState<"sign-in" | "create">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<Message>({ kind: "", text: "" });

  // Runs a sign-in step, showing "Working…" meanwhile and any error (or `success`) afterwards.
  const run = async (fn: () => Promise<void>, success = "") => {
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

  const submit = (e: FormEvent) => {
    e.preventDefault();
    run(() => (mode === "sign-in" ? signInWithEmail(email, password) : createAccount(email, password)));
  };

  const forgot = () =>
    email
      ? run(() => resetPassword(email), `If there's an account for ${email}, a reset link is on its way.`)
      : setMessage({ kind: "error", text: "Enter your email above first." });

  return (
    <Card as="section" className="grid content-start gap-4" aria-labelledby="signin-title">
      <h3 id="signin-title">{mode === "sign-in" ? "Sign in" : "Create a free account"}</h3>
      <Button wide onClick={() => run(signInWithGoogle)} disabled={busy}>
        Continue with Google
      </Button>
      <OrDivider>or use email</OrDivider>
      <form className="grid content-start gap-4" onSubmit={submit}>
        <Field id="acct-email" label="Email">
          <input id="acct-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field id="acct-password" label="Password">
          <input
            id="acct-password"
            type="password"
            required
            minLength={8}
            autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
            aria-describedby="acct-password-hint"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Hint id="acct-password-hint">At least 8 characters.</Hint>
        </Field>
        <Button variant="primary" type="submit" disabled={busy}>
          {busy ? "Working…" : mode === "sign-in" ? "Sign in" : "Create account"}
        </Button>
      </form>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="link" onClick={() => setMode(mode === "sign-in" ? "create" : "sign-in")}>
          {mode === "sign-in" ? "New here? Create an account" : "Have an account? Sign in"}
        </Button>
        {mode === "sign-in" && (
          <Button variant="link" disabled={busy} onClick={forgot}>
            Forgot password?
          </Button>
        )}
      </div>
      <FormMessage kind={message.kind}>{message.text}</FormMessage>
    </Card>
  );
}
