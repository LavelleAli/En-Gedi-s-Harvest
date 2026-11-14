"use client";

// Firebase Authentication in the browser. The Firebase SDK loads only when a page needs sign-in state,
// so it adds nothing to pages that don't. If the NEXT_PUBLIC_FIREBASE_* settings are missing (the
// offline build, or a copy without Firebase), accounts are simply turned off.
import { useEffect, useSyncExternalStore } from "react";
import type { Auth } from "@firebase/auth";

export type AuthUser = { uid: string; email: string; name: string };
export type AuthState =
  | { status: "disabled" | "loading" | "signed-out"; user: null }
  | { status: "signed-in"; user: AuthUser };
type Sdk = { auth: Auth; fns: typeof import("@firebase/auth") };

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
export const authEnabled = Object.values(firebaseConfig).every(Boolean);

const initial: AuthState = { status: authEnabled ? "loading" : "disabled", user: null };
let state: AuthState = initial;
const listeners = new Set<() => void>();
let loading: Promise<Sdk> | null = null;

function set(next: AuthState) {
  state = next;
  listeners.forEach((l) => l());
}

function load(): Promise<Sdk | null> {
  if (!authEnabled) return Promise.resolve(null);
  loading ??= Promise.all([import("@firebase/app"), import("@firebase/auth")]).then(([appMod, fns]) => {
    const app = appMod.getApps()[0] || appMod.initializeApp(firebaseConfig);
    const auth = fns.getAuth(app);
    fns.onAuthStateChanged(auth, (u) => set(u ? { status: "signed-in", user: { uid: u.uid, email: u.email || "", name: u.displayName || "" } } : { status: "signed-out", user: null }));
    return { auth, fns };
  });
  return loading;
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

// { status: "disabled" | "loading" | "signed-out" | "signed-in", user }
export function useAuth(): AuthState {
  useEffect(() => {
    load();
  }, []);
  return useSyncExternalStore(subscribe, () => state, () => initial);
}

export async function getIdToken(): Promise<string | null> {
  const s = await load();
  return s?.auth.currentUser ? s.auth.currentUser.getIdToken() : null;
}

// Plain-language messages for the Firebase errors people actually hit.
const MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "That email and password don't match. Check them, or reset your password.",
  "auth/wrong-password": "That email and password don't match. Check them, or reset your password.",
  "auth/user-not-found": "That email and password don't match. Check them, or reset your password.",
  "auth/email-already-in-use": "There's already an account with that email. Sign in instead.",
  "auth/weak-password": "Use a password of at least 8 characters.",
  "auth/invalid-email": "Enter a valid email address, like name@example.com.",
  "auth/too-many-requests": "Too many tries. Wait a few minutes, then try again.",
  "auth/popup-closed-by-user": "The Google window closed before sign-in finished.",
  "auth/popup-blocked": "Your browser blocked the Google sign-in window. Allow pop-ups for this site and try again.",
  "auth/network-request-failed": "Can't reach the sign-in service. Check your connection.",
};
export const authMessage = (err: unknown): string => MESSAGES[String((err as { code?: unknown })?.code)] || "Sign-in didn't work. Try again.";

// The sign-in actions run only where accounts are on (the buttons are hidden otherwise).
async function sdk(): Promise<Sdk> {
  const s = await load();
  if (!s) throw new Error("Accounts aren't set up on this copy of the site.");
  return s;
}

export async function signInWithGoogle(): Promise<void> {
  const { auth, fns } = await sdk();
  await fns.signInWithPopup(auth, new fns.GoogleAuthProvider());
}
export async function signInWithEmail(email: string, password: string): Promise<void> {
  const { auth, fns } = await sdk();
  await fns.signInWithEmailAndPassword(auth, email, password);
}
export async function createAccount(email: string, password: string): Promise<void> {
  const { auth, fns } = await sdk();
  await fns.createUserWithEmailAndPassword(auth, email, password);
}
export async function resetPassword(email: string): Promise<void> {
  const { auth, fns } = await sdk();
  await fns.sendPasswordResetEmail(auth, email);
}
export async function signOutUser(): Promise<void> {
  const { auth, fns } = await sdk();
  await fns.signOut(auth);
}
