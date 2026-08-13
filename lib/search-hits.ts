import { listRecentVisuals, type RecentVisualEntry } from "@/lib/recent-visuals";
import { listSavedProjects, type SavedProject } from "@/lib/saved-projects";

export type SearchHits = {
  visuals: RecentVisualEntry[];
  projects: SavedProject[];
};

export const EMPTY_SEARCH_HITS: SearchHits = { visuals: [], projects: [] };

export function matchesQuery(haystack: string, query: string) {
  return haystack.toLowerCase().includes(query.toLowerCase());
}

export function collectHits(query: string): SearchHits {
  const q = query.trim();
  if (!q) return EMPTY_SEARCH_HITS;

  return {
    visuals: listRecentVisuals(50).filter((v) => matchesQuery(v.title, q)),
    projects: listSavedProjects().filter((p) => matchesQuery(p.title, q)),
  };
}

export type SearchHitItem = {
  id: string;
  href: string;
  title: string;
  kind: "visual" | "project";
  projectTitle?: string;
  previewSlide?: RecentVisualEntry["previewSlide"];
};

export function flattenSearchHits(hits: SearchHits): SearchHitItem[] {
  return [
    ...hits.visuals.map((visual) => ({
      id: `visual:${visual.projectId}:${visual.visualId}`,
      href: visual.href,
      title: visual.title,
      kind: "visual" as const,
      projectTitle: visual.projectTitle,
      previewSlide: visual.previewSlide,
    })),
    ...hits.projects.map((project) => ({
      id: `project:${project.id}`,
      href: `/projects/${project.id}`,
      title: project.title,
      kind: "project" as const,
    })),
  ];
}
