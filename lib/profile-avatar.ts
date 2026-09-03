export function getProfileInitials(firstName: string, lastName: string) {
  const parts = `${firstName} ${lastName}`.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "–";
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase() || "–";
  }

  const first = parts[0].charAt(0);
  const last = parts[parts.length - 1].charAt(0);
  return (first + last).toUpperCase();
}

/** True only for a user-uploaded Google profile photo (not letter/color placeholders). */
export function isGoogleCustomProfilePhoto(url: string) {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("googleusercontent.com")) return false;
    if (parsed.pathname.includes("default-user")) return false;
    if (url.includes("AAAAAAAAAAI")) return false;
    // Real Google uploads use the /a-/ path; letter avatars use other /a/ variants.
    return parsed.pathname.startsWith("/a-/");
  } catch {
    return false;
  }
}

export function resolveProfileAvatarUrl(avatarUrl: string | null | undefined) {
  const trimmed = avatarUrl?.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("data:")) return trimmed;
  if (trimmed.includes("googleusercontent.com")) {
    return isGoogleCustomProfilePhoto(trimmed) ? trimmed : null;
  }
  return trimmed;
}
