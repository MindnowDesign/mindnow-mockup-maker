/** `/projects/:segment` (e.g. `/projects/new`, `/projects/:id`) — not the list at `/projects`. */
export function isProjectWorkspacePath(pathname: string): boolean {
  return /^\/projects\/[^/]+$/.test(pathname);
}

/** Title shown in the workspace top bar from the current path. */
export function getWorkspaceTitle(pathname: string): string {
  const m = pathname.match(/^\/projects\/([^/]+)$/);
  if (!m) return "Project";
  if (m[1] === "new") return "New project";
  return "Project";
}
