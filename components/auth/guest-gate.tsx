"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useAuth } from "@/components/auth/auth-provider";

export function GuestGate({ children }: { children: ReactNode }) {
  const { user, loading, configured } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (configured && user) {
      router.replace("/");
    }
  }, [user, loading, configured, router]);

  if (loading) {
    return (
      <div
        className="flex min-h-dvh items-center justify-center bg-shell text-sm text-neutral-400"
        aria-busy
        aria-label="Loading"
      >
        Loading…
      </div>
    );
  }

  if (configured && user) {
    return null;
  }

  return children;
}
