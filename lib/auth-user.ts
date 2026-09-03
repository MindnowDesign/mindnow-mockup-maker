import type { User } from "firebase/auth";

import type { CatalystShellUser } from "@/components/catalyst-shell";

export function firebaseUserToShellUser(user: User): CatalystShellUser {
  const displayName = user.displayName?.trim() ?? "";
  const parts = displayName.split(/\s+/).filter(Boolean);
  const firstName = parts[0] ?? user.email?.split("@")[0] ?? "User";
  const lastName = parts.slice(1).join(" ");

  return {
    firstName,
    lastName,
    email: user.email ?? "",
  };
}
