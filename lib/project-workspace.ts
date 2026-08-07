/** Stable until `ProjectWorkspaceHydrate` runs — must not be persisted as a canvas slot id. */
export const WORKSPACE_PLACEHOLDER_VISUAL_ID = "workspace-pending-visual";

/** Dispatched after `ProjectWorkspaceHydrate` applies saved state (or resets `/projects/new`). */
export const WORKSPACE_HYDRATED_EVENT = "mindnow:workspace-hydrated";

export type WorkspaceHydratedDetail = {
  pathname: string;
};

export function skipHydrateSessionStorageKey(projectId: string) {
  return `mindnow:skip-hydrate:${projectId}`;
}

const PENDING_NEW_PROJECT_ID_KEY = "mindnow:pending-new-project-id";

/** Stable id for all autosaves on `/projects/new` until redirect to `/projects/:id`. */
export function getOrCreatePendingNewProjectId(): string {
  if (typeof window === "undefined") return "";
  let id = window.sessionStorage.getItem(PENDING_NEW_PROJECT_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.sessionStorage.setItem(PENDING_NEW_PROJECT_ID_KEY, id);
  }
  return id;
}

export function clearPendingNewProjectId() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(PENDING_NEW_PROJECT_ID_KEY);
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
