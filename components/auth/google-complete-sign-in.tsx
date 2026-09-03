"use client";

import {
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { AuthLoadingScreen } from "@/components/auth/auth-loading-screen";
import { getAuthErrorMessage } from "@/lib/firebase/auth-errors";
import { GOOGLE_ID_TOKEN_STORAGE_KEY } from "@/lib/firebase/google-auth-cookie";
import { GOOGLE_SIGN_IN_LOADING_LABEL } from "@/lib/firebase/google-callback-bridge-html";
import { getFirebaseAuth } from "@/lib/firebase/client";

export function GoogleCompleteSignIn() {
  const router = useRouter();
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const idToken = sessionStorage.getItem(GOOGLE_ID_TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(GOOGLE_ID_TOKEN_STORAGE_KEY);

    if (!idToken) {
      router.replace(
        "/login?googleError=Google+sign-in+expired.+Please+try+again."
      );
      return;
    }

    void (async () => {
      try {
        const credential = GoogleAuthProvider.credential(idToken);
        if (!credential) {
          throw new Error("Google Sign-In did not return a valid credential.");
        }

        await signInWithCredential(getFirebaseAuth(), credential);
        await getFirebaseAuth().authStateReady();
        router.replace("/");
      } catch (error) {
        const message = encodeURIComponent(getAuthErrorMessage(error));
        router.replace(`/login?googleError=${message}`);
      }
    })();
  }, [router]);

  return <AuthLoadingScreen label={GOOGLE_SIGN_IN_LOADING_LABEL} />;
}
