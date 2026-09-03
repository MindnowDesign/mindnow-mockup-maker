"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { AuthLoadingScreen } from "@/components/auth/auth-loading-screen";
import { useAuth } from "@/components/auth/auth-provider";
import { getEffectiveAuthUser } from "@/lib/firebase/effective-user";

export function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading, configured } = useAuth();
  const effectiveUser = getEffectiveAuthUser(user);
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!configured || !effectiveUser) {
      router.replace("/login");
    }
  }, [effectiveUser, loading, configured, router]);

  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (!configured || !effectiveUser) {
    return <AuthLoadingScreen label="Redirecting to sign in…" />;
  }

  return children;
}
