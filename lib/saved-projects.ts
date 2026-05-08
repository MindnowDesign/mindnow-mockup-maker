import type { FrameAspectPresetId } from "@/lib/mockup-aspect";
import type { PersistedCanvasBackground } from "@/lib/mockup-canvas-background";
import type { VisualWorkspacePrefs } from "@/lib/mockup-workspace-snapshot";

/** One canvas media item persisted as a data URL (survives reload). */
export type SavedMediaItem = {
  id: string;
  kind: "image" | "video";
  dataUrl: string;
  /** @deprecated Prefer `SavedVisualSlot.label` — kept for legacy saves. */
  label?: string;
};

/** One canvas slot referencing `SavedMediaItem.id` in the library. */
export type SavedVisualSlot = {
  id: string;
  mediaId: string | null;
  label?: string;
};

export type SavedProject = {
  id: string;
  title: string;
  updatedAt: number;
  /** PNG data URL used on project cards (scaled down for storage). */
  previewDataUrl: string;
  /** One thumbnail per canvas slot (workspace order); legacy / denormalized cache. */
  previewDataUrls?: string[];
  /** Per-visual PNG thumbnails for project cards; updated without switching the active canvas. */
  previewThumbByVisualId?: Record<string, string>;
  aspectPreset: FrameAspectPresetId;
  /** Canvas frame fill (transparency preview, solid color, or image). */
  canvasBackground?: PersistedCanvasBackground;
  visualCount: number;
  /** Serialized media library (pool of assets). */
  mediaItems?: SavedMediaItem[];
  /** Canvas slots; when absent, each legacy `mediaItems` row doubles as one slot. */
  visualSlots?: SavedVisualSlot[];
  /** Selected canvas slot id. */
  activeVisualId?: string | null;
  /** @deprecated Legacy — same as `activeVisualId` when `visualSlots` was not stored. */
  activeMediaId?: string | null;
  /** Per-visual frame + canvas fill; legacy saves omit this (see root `aspectPreset` / `canvasBackground`). */
  visualWorkspacePrefs?: Record<string, VisualWorkspacePrefs>;
};

const STORAGE_KEY = "mindnow:saved-projects-v1";

type StoredFile = {
  projects: SavedProject[];
};

function readAll(): StoredFile {
  if (typeof window === "undefined") return { projects: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { projects: [] };
    const parsed = JSON.parse(raw) as StoredFile;
    if (!parsed?.projects || !Array.isArray(parsed.projects)) return { projects: [] };
    return parsed;
  } catch {
    return { projects: [] };
  }
}

function writeAll(projects: SavedProject[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ projects }));
}

export function listSavedProjects(): SavedProject[] {
  return [...readAll().projects].sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getSavedProject(id: string): SavedProject | undefined {
  return readAll().projects.find((p) => p.id === id);
}

export function upsertSavedProject(project: SavedProject) {
  const { projects } = readAll();
  const idx = projects.findIndex((p) => p.id === project.id);
  if (idx >= 0) projects[idx] = project;
  else projects.push(project);
  writeAll(projects);
}

export function deleteSavedProject(id: string) {
  const { projects } = readAll();
  writeAll(projects.filter((p) => p.id !== id));
}

export function notifySavedProjectsChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("mindnow:saved-projects-changed"));
}
