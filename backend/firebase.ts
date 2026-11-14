// Firebase Admin: verifies the ID tokens the browser sends and gives access to Firestore.
// One app instance per server process.
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { config } from "@/backend/config";
import { HttpError } from "@/backend/http";

function app() {
  if (getApps().length) return getApps()[0];
  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = config("firebase");
  return initializeApp({ credential: cert({ projectId: FIREBASE_PROJECT_ID, clientEmail: FIREBASE_CLIENT_EMAIL, privateKey: FIREBASE_PRIVATE_KEY }) });
}

export const db = () => getFirestore(app());
export const adminAuth = () => getAuth(app());

// Reads "Authorization: Bearer <Firebase ID token>" and returns { uid, email }.
// verifyIdToken checks the signature, issuer, audience and expiry against Google's public keys.
export type User = { uid: string; email: string };
export async function requireUser(req: Request): Promise<User> {
  const header = req.headers.get("authorization") || "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  if (!match) throw new HttpError(401, "sign-in-required", "Sign in to use this", "Create a free account or sign in to research new plants.");
  try {
    const decoded = await adminAuth().verifyIdToken(match[1], true);
    return { uid: decoded.uid, email: decoded.email || "" };
  } catch (err) {
    if (err instanceof HttpError) throw err;
    throw new HttpError(401, "bad-token", "Your sign-in has expired", "Sign in again and retry.");
  }
}
