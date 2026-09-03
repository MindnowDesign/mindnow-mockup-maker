"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { authCardClass } from "@/lib/auth-form-styles";
import { cn } from "@/lib/utils";

export function FirebaseConfigNotice() {
  const { configured } = useAuth();

  if (configured) {
    return null;
  }

  return (
    <div
      className={cn(
        authCardClass,
        "mb-4 border-amber-700/50 bg-amber-950/30 text-sm text-amber-100"
      )}
      role="status"
    >
      <p className="font-semibold">Firebase not configured</p>
      <p className="mt-1 text-amber-200/80">
        Add your Firebase web app credentials to{" "}
        <code className="rounded bg-black/20 px-1">.env.local</code> to enable
        sign-in.
      </p>
    </div>
  );
}
