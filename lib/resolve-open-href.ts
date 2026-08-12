import { getSavedProject } from "@/lib/saved-projects";

/** Extract a saved-project id from `/projects/:id` (optional `?visual=`). */
export function projectIdFromHref(href: string): string | null {
  try {
    const path = href.startsWith("http")
      ? new URL(href).pathname
      : href.split("?")[0] ?? href;
    const match = path.match(/^\/projects\/([^/]+)\/?$/);
    if (!match?.[1]) return null;
    const id = decodeURIComponent(match[1]);
    if (!id || id === "new") return null;
    return id;
  } catch {
    return null;
  }
}

/** Only allow in-app project/visual destinations after Restore. */
export function isSafeProjectNextHref(href: string | null | undefined): href is string {
  if (!href || !href.startsWith("/") || href.startsWith("//")) return false;
  return projectIdFromHref(href) != null;
}

export function trashFocusHref(projectId: string, nextHref?: string): string {
  const params = new URLSearchParams({ focus: projectId });
  if (nextHref && isSafeProjectNextHref(nextHref)) {
    params.set("next", nextHref);
  }
  return `/trash?${params.toString()}`;
}

/**
 * If the target project is in Trash, open Trash focused on it (with Restore).
 * Otherwise return the original href.
 */
export function resolveOpenHref(href: string): string {
  const projectId = projectIdFromHref(href);
  if (!projectId) return href;

  const project = getSavedProject(projectId);
  if (project?.trashedAt != null) {
    return trashFocusHref(projectId, href);
  }

  return href;
}
