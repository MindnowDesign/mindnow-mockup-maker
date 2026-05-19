import { defaultVisualLabel } from "@/lib/mockup-visual-label";
import {
  projectCardPreviewSlides,
  type ProjectCardPreviewSlide,
} from "@/lib/project-card-preview-slides";
import {
  listSavedProjects,
  type SavedProject,
  type SavedVisualSlot,
} from "@/lib/saved-projects";

export type RecentVisualEntry = {
  projectId: string;
  visualId: string;
  title: string;
  updatedAt: number;
  href: string;
  previewSlide: ProjectCardPreviewSlide | null;
};

export function resolveSavedVisualTitle(
  slot: SavedVisualSlot,
  oneBasedIndex: number
): string {
  return slot.label?.trim()
    ? slot.label.trim()
    : defaultVisualLabel(oneBasedIndex);
}

function resolveSlots(project: SavedProject): SavedVisualSlot[] {
  if (project.visualSlots?.length) return project.visualSlots;
  if (project.mediaItems?.length) {
    return project.mediaItems.map((m) => ({
      id: m.id,
      mediaId: m.id,
      label: m.label,
    }));
  }
  return [];
}

/** Flatten all visuals across projects, newest edits first. */
export function listRecentVisuals(limit = 8): RecentVisualEntry[] {
  const entries: RecentVisualEntry[] = [];

  for (const project of listSavedProjects()) {
    const slots = resolveSlots(project);
    if (slots.length === 0) continue;

    const slides = projectCardPreviewSlides(project);
    const slideByVisualId = new Map(slides.map((s) => [s.visualId, s]));

    slots.forEach((slot, index) => {
      const updatedAt = resolveVisualEditedAt(slot, project, slots.length);
      if (updatedAt == null) return;

      entries.push({
        projectId: project.id,
        visualId: slot.id,
        title: resolveSavedVisualTitle(slot, index + 1),
        updatedAt,
        href: `/projects/${project.id}?visual=${encodeURIComponent(slot.id)}`,
        previewSlide: slideByVisualId.get(slot.id) ?? null,
      });
    });
  }

  return entries
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, limit);
}

/** Per-visual edit time only — project `updatedAt` is used for single-visual legacy saves. */
export function resolveVisualEditedAt(
  slot: SavedVisualSlot,
  project: SavedProject,
  visualCount: number
): number | null {
  if (slot.updatedAt != null) return slot.updatedAt;
  if (visualCount === 1) return project.updatedAt;
  return null;
}
