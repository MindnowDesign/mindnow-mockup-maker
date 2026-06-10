import { projectCardPreviewSlides } from "@/lib/project-card-preview-slides";
import type { SavedProject } from "@/lib/saved-projects";

/**
 * Ordered preview URLs for project cards (one entry per visual slot, workspace order).
 * Skips slots with no saved thumbnail yet.
 */
export function projectCardPreviewSrcs(
  project: SavedProject
): string[] | undefined {
  const slides = projectCardPreviewSlides(project);
  const urls = slides
    .map((s) => s.captureSrc)
    .filter((url): url is string => Boolean(url));
  if (urls.length > 0) return urls;
  return undefined;
}
