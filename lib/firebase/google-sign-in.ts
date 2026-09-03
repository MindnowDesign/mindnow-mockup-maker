import {
  GoogleAuthProvider,
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
  type UserCredential,
} from "firebase/auth";

import { getFirebaseAuth } from "@/lib/firebase/client";

function createGoogleProvider() {
  const provider = new GoogleAuthProvider();
  provider.addScope("profile");
  provider.addScope("email");
  provider.setCustomParameters({ prompt: "select_account" });
  return provider;
}

export async function completeGoogleRedirectSignIn(): Promise<UserCredential | null> {
  return getRedirectResult(getFirebaseAuth());
}

export async function signInWithGoogle(): Promise<UserCredential | void> {
  const auth = getFirebaseAuth();
  const provider = createGoogleProvider();

  // Redirect is more reliable on deployed domains; popup for local dev.
  const preferPopup =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");

  if (preferPopup) {
    try {
      return await signInWithPopup(auth, provider);
    } catch (error) {
      const code =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        typeof (error as { code: string }).code === "string"
          ? (error as { code: string }).code
          : null;

      if (
        code === "auth/popup-blocked" ||
        code === "auth/popup-closed-by-user" ||
        code === "auth/invalid-action" ||
        code === "auth/operation-not-allowed"
      ) {
        await signInWithRedirect(auth, provider);
        return;
      }

      throw error;
    }
  }

  await signInWithRedirect(auth, provider);
}
