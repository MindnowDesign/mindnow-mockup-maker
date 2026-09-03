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

function isPopupFallbackError(code: string | null): boolean {
  return (
    code === "auth/popup-blocked" ||
    code === "auth/popup-closed-by-user" ||
    code === "auth/cancelled-popup-request" ||
    code === "auth/operation-not-supported-in-this-environment"
  );
}

export async function completeGoogleRedirectSignIn(): Promise<UserCredential | null> {
  return getRedirectResult(getFirebaseAuth());
}

/**
 * Google Sign-In on Vercel must use popup — redirect breaks when browsers block
 * third-party cookies between vercel.app and firebaseapp.com.
 * @see https://firebase.google.com/docs/auth/web/redirect-best-practices
 */
export async function signInWithGoogle(): Promise<UserCredential | void> {
  const auth = getFirebaseAuth();
  const provider = createGoogleProvider();

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

    if (isPopupFallbackError(code)) {
      await signInWithRedirect(auth, provider);
      return;
    }

    throw error;
  }
}
