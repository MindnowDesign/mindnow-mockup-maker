"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { AuthGate } from "@/components/auth/auth-gate";
import { useAuth } from "@/components/auth/auth-provider";
import { CatalystShell } from "@/components/catalyst-shell";
import { firebaseUserToShellUser } from "@/lib/auth-user";
import { getEffectiveAuthUser } from "@/lib/firebase/effective-user";

export function MainLayoutClient({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const effectiveUser = getEffectiveAuthUser(user);
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  return (
    <AuthGate>
      <CatalystShell
        user={
          effectiveUser ? firebaseUserToShellUser(effectiveUser) : undefined
        }
        onSignOut={handleSignOut}
      >
        {children}
      </CatalystShell>
    </AuthGate>
  );
}
