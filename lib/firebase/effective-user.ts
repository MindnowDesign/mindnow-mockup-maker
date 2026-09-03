import type { User } from "firebase/auth";

import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase/client";

/** React auth state can lag behind Firebase after sign-in; read currentUser as fallback. */
export function getEffectiveAuthUser(contextUser: User | null): User | null {
  if (contextUser) return contextUser;
  if (!isFirebaseConfigured()) return null;

  try {
    return getFirebaseAuth().currentUser;
  } catch {
    return null;
  }
}
