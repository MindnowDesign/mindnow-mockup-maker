import { clearAllSavedProjects } from "@/lib/saved-projects";
import { clearRecentSearches } from "@/lib/recent-searches";
import { clearPendingNewProjectId } from "@/lib/project-workspace";

const LOCAL_DATA_USER_KEY = "mindnow:local-data-user-id";
const SKIP_HYDRATE_PREFIX = "mindnow:skip-hydrate:";

/** Wipe guest / prior-user workspace data from this browser. */
export function clearLocalWorkspaceData() {
  if (typeof window === "undefined") return;

  clearAllSavedProjects();
  clearRecentSearches();
  clearPendingNewProjectId();

  for (let i = window.sessionStorage.length - 1; i >= 0; i -= 1) {
    const key = window.sessionStorage.key(i);
    if (key?.startsWith(SKIP_HYDRATE_PREFIX)) {
      window.sessionStorage.removeItem(key);
    }
  }
}

/**
 * Keep local workspace data scoped to the signed-in Firebase user.
 * Clears stale guest or other-account data when the uid changes.
 */
export function syncLocalDataForUser(userId: string) {
  if (typeof window === "undefined") return;

  const previousUserId = window.localStorage.getItem(LOCAL_DATA_USER_KEY);
  if (previousUserId === userId) return;

  clearLocalWorkspaceData();
  window.localStorage.setItem(LOCAL_DATA_USER_KEY, userId);
}
