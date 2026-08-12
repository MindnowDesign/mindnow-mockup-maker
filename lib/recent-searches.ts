export type RecentSearchKind = "visual" | "project";

export type RecentSearch = {
  id: string;
  /** Display name of the opened visual/project. */
  title: string;
  href: string;
  kind: RecentSearchKind;
  searchedAt: number;
};

const STORAGE_KEY = "mindnow:recent-searches-v2";
const LEGACY_STORAGE_KEY = "mindnow:recent-searches-v1";
const MAX_RECENT = 10;
const CHANGE_EVENT = "mindnow:recent-searches-changed";

type StoredFile = {
  searches: RecentSearch[];
};

/** Legacy / mixed stored shape. */
type LegacySearch = {
  id?: string;
  query?: string;
  title?: string;
  href?: string;
  kind?: RecentSearchKind;
  searchedAt?: number;
};

/** Only keep clicked results (title + href). Drop old typed-query rows. */
function normalizeEntry(raw: LegacySearch): RecentSearch | null {
  const title = (raw.title ?? "").trim();
  const href = (raw.href ?? "").trim();
  if (!title || !href) return null;

  const searchedAt =
    typeof raw.searchedAt === "number" && Number.isFinite(raw.searchedAt)
      ? raw.searchedAt
      : Date.now();

  const kind: RecentSearchKind =
    raw.kind === "project" || raw.kind === "visual"
      ? raw.kind
      : href.includes("?visual=")
        ? "visual"
        : "project";

  return {
    id:
      typeof raw.id === "string" && raw.id
        ? raw.id
        : `search-${searchedAt.toString(36)}`,
    title,
    href,
    kind,
    searchedAt,
  };
}

function readAll(): StoredFile {
  if (typeof window === "undefined") return { searches: [] };
  try {
    // Prefer v2; ignore legacy v1 query-only history entirely.
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
      return { searches: [] };
    }
    const parsed = JSON.parse(raw) as { searches?: LegacySearch[] };
    if (!parsed?.searches || !Array.isArray(parsed.searches)) {
      return { searches: [] };
    }
    return {
      searches: parsed.searches
        .map(normalizeEntry)
        .filter((s): s is RecentSearch => s != null),
    };
  } catch {
    return { searches: [] };
  }
}

function writeAll(searches: RecentSearch[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ searches }));
  window.localStorage.removeItem(LEGACY_STORAGE_KEY);
}

export function listRecentSearches(limit = MAX_RECENT): RecentSearch[] {
  return [...readAll().searches]
    .sort((a, b) => b.searchedAt - a.searchedAt)
    .slice(0, limit);
}

/** Record a clicked visual/project — newest first, max 10, dedupe by href. */
export function recordRecentSearch(input: {
  title: string;
  href: string;
  kind: RecentSearchKind;
}): RecentSearch | null {
  const title = input.title.trim();
  const href = input.href.trim();
  if (!title || !href) return null;

  const now = Date.now();
  const existing = readAll().searches.filter((s) => s.href !== href);

  const entry: RecentSearch = {
    id: `search-${now.toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    href,
    kind: input.kind,
    searchedAt: now,
  };

  writeAll([entry, ...existing].slice(0, MAX_RECENT));
  notifyRecentSearchesChanged();
  return entry;
}

export function clearRecentSearches() {
  writeAll([]);
  notifyRecentSearchesChanged();
}

export function notifyRecentSearchesChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

export const RECENT_SEARCHES_CHANGED_EVENT = CHANGE_EVENT;
export const MAX_RECENT_SEARCHES = MAX_RECENT;
