import {
  GoogleAuthProvider,
  signInWithCredential,
  type UserCredential,
} from "firebase/auth";

import { getFirebaseAuth } from "@/lib/firebase/client";

export async function signInWithGoogleCredential(
  idToken: string
): Promise<UserCredential> {
  const credential = GoogleAuthProvider.credential(idToken);
  if (!credential) {
    throw new Error("Google Sign-In did not return a valid credential.");
  }

  return signInWithCredential(getFirebaseAuth(), credential);
}
