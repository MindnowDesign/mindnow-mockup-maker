/** Dispatched after `ProjectWorkspaceHydrate` applies saved state (or resets `/projects/new`). */
export const WORKSPACE_HYDRATED_EVENT = "mindnow:workspace-hydrated";

export type WorkspaceHydratedDetail = {
  pathname: string;
};

export function skipHydrateSessionStorageKey(projectId: string) {
  return `mindnow:skip-hydrate:${projectId}`;
}

/** Strip trailing slashes so `/projects/new/` matches workspace routes like `/projects/new`. */
function normalizePathname(pathname: string): string {
  const t = pathname.replace(/\/+$/, "");
  return t === "" ? "/" : t;
}

/** `/projects/:segment` (e.g. `/projects/new`, `/projects/:id`) — not the list at `/projects`. */
export function isProjectWorkspacePath(pathname: string): boolean {
  return /^\/projects\/[^/]+$/.test(normalizePathname(pathname));
}

/** Segment after `/projects/` or null (not a workspace route). */
export function getProjectsWorkspaceSegment(pathname: string): string | null {
  const m = normalizePathname(pathname).match(/^\/projects\/([^/]+)$/);
  return m?.[1] ?? null;
}

/** `?visual=` on `/projects/:id` — open that canvas slot after hydrate. */
export function getRequestedVisualIdFromSearch(search: string): string | null {
  const id = new URLSearchParams(search).get("visual")?.trim();
  return id && id.length > 0 ? id : null;
}

/** Title shown in the workspace top bar from the current path. */
export function getWorkspaceTitle(pathname: string): string {
  const m = normalizePathname(pathname).match(/^\/projects\/([^/]+)$/);
  if (!m) return "Project";
  if (m[1] === "new") return "New project";
  return "Project";
}
