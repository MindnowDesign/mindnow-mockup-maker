"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { AuthLoadingScreen } from "@/components/auth/auth-loading-screen";
import { useAuth } from "@/components/auth/auth-provider";
import { getEffectiveAuthUser } from "@/lib/firebase/effective-user";

export function GuestGate({ children }: { children: ReactNode }) {
  const { user, loading, configured } = useAuth();
  const effectiveUser = getEffectiveAuthUser(user);
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (configured && effectiveUser) {
      router.replace("/");
    }
  }, [effectiveUser, loading, configured, router]);

  if (loading) {
    return <AuthLoadingScreen label="Checking sign-in…" />;
  }

  if (configured && effectiveUser) {
    return <AuthLoadingScreen label="Signing you in…" />;
  }

  return children;
}
