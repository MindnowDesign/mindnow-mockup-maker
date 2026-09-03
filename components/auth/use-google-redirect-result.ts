"use client";

import { useEffect, useRef } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { getAuthErrorMessage } from "@/lib/firebase/auth-errors";
import { completeGoogleRedirectSignIn } from "@/lib/firebase/google-sign-in";

export function useGoogleRedirectResult(onError: (message: string) => void) {
  const { configured } = useAuth();
  const handledRef = useRef(false);

  useEffect(() => {
    if (!configured || handledRef.current) return;

    handledRef.current = true;

    completeGoogleRedirectSignIn().catch((error) => {
      onError(getAuthErrorMessage(error));
    });
  }, [configured, onError]);
}
