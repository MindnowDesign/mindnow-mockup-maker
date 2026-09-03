"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { AuthGate } from "@/components/auth/auth-gate";
import { useAuth } from "@/components/auth/auth-provider";
import { CatalystShell } from "@/components/catalyst-shell";
import { firebaseUserToShellUser } from "@/lib/auth-user";

export function MainLayoutClient({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  return (
    <AuthGate>
      <CatalystShell
        user={user ? firebaseUserToShellUser(user) : undefined}
        onSignOut={handleSignOut}
      >
        {children}
      </CatalystShell>
    </AuthGate>
  );
}
