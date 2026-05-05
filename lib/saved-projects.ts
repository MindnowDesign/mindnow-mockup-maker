import type { FrameAspectPresetId } from "@/lib/mockup-aspect";

export type SavedProject = {
  id: string;
  title: string;
  updatedAt: number;
  /** PNG data URL used on project cards (scaled down for storage). */
  previewDataUrl: string;
  aspectPreset: FrameAspectPresetId;
  visualCount: number;
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
