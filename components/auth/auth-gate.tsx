"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

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
    return (
      <div
        className="flex h-dvh items-center justify-center bg-shell text-sm text-neutral-400"
        aria-busy
        aria-label="Loading"
      >
        Loading…
      </div>
    );
  }

  if (!configured || !effectiveUser) {
    return null;
  }

  return children;
}
