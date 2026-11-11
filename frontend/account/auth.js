"use client";

// Firebase Authentication in the browser. The Firebase SDK loads only when a page needs sign-in state,
// so it adds nothing to pages that don't. If the NEXT_PUBLIC_FIREBASE_* settings are missing (the
// offline build, or a copy without Firebase), accounts are simply turned off.
import { useEffect, useSyncExternalStore } from "react";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
export const authEnabled = Object.values(firebaseConfig).every(Boolean);

let state = { status: authEnabled ? "loading" : "disabled", user: null };
const listeners = new Set();
let sdk = null; // { auth, fns } once loaded
let loading = null;

function set(next) {
  state = next;
  listeners.forEach((l) => l());
}

function load() {
  if (!authEnabled) return Promise.resolve(null);
  loading ??= Promise.all([import("@firebase/app"), import("@firebase/auth")]).then(([appMod, fns]) => {
    const app = appMod.getApps()[0] || appMod.initializeApp(firebaseConfig);
    const auth = fns.getAuth(app);
    fns.onAuthStateChanged(auth, (u) => set({ status: u ? "signed-in" : "signed-out", user: u ? { uid: u.uid, email: u.email || "", name: u.displayName || "" } : null }));
    sdk = { auth, fns };
    return sdk;
  });
  return loading;
}

const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

// { status: "disabled" | "loading" | "signed-out" | "signed-in", user }
export function useAuth() {
  useEffect(() => {
    load();
  }, []);
  return useSyncExternalStore(subscribe, () => state, () => ({ status: authEnabled ? "loading" : "disabled", user: null }));
}

export async function getIdToken() {
  const s = await load();
  return s?.auth.currentUser ? s.auth.currentUser.getIdToken() : null;
}

// Plain-language messages for the Firebase errors people actually hit.
const MESSAGES = {
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
export const authMessage = (err) => MESSAGES[err?.code] || "Sign-in didn't work. Try again.";

export async function signInWithGoogle() {
  const { auth, fns } = await load();
  await fns.signInWithPopup(auth, new fns.GoogleAuthProvider());
}
export async function signInWithEmail(email, password) {
  const { auth, fns } = await load();
  await fns.signInWithEmailAndPassword(auth, email, password);
}
export async function createAccount(email, password) {
  const { auth, fns } = await load();
  await fns.createUserWithEmailAndPassword(auth, email, password);
}
export async function resetPassword(email) {
  const { auth, fns } = await load();
  await fns.sendPasswordResetEmail(auth, email);
}
export async function signOutUser() {
  const { auth, fns } = await load();
  await fns.signOut(auth);
}
