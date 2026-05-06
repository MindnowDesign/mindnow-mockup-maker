"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { useMockupFrame } from "@/components/mockup-frame-context";
import { useMockupMedia } from "@/components/mockup-media-context";
import { getSavedProject } from "@/lib/saved-projects";
import { getProjectsWorkspaceSegment } from "@/lib/project-workspace";

/**
 * Restores frame preset + media when opening a saved project (`/projects/:id`).
 * Clears media on `/projects/new`. Title is handled in `ProjectWorkspaceTitleProvider`.
 */
export function ProjectWorkspaceHydrate() {
  const pathname = usePathname();
  const { setAspectPreset, hydrateCanvasBackground } = useMockupFrame();
  const { hydrateFromSaved } = useMockupMedia();

  useEffect(() => {
    const segment = getProjectsWorkspaceSegment(pathname);
    if (segment === "new") {
      setAspectPreset("square-1-1");
      hydrateCanvasBackground(null);
      hydrateFromSaved(null);
      return;
    }
    if (!segment) return;

    const saved = getSavedProject(segment);
    if (saved) {
      setAspectPreset(saved.aspectPreset);
      hydrateCanvasBackground(saved.canvasBackground);
      hydrateFromSaved({
        mediaItems: saved.mediaItems,
        activeMediaId: saved.activeMediaId ?? null,
      });
    } else {
      hydrateCanvasBackground(null);
      hydrateFromSaved(null);
    }
  }, [pathname, setAspectPreset, hydrateCanvasBackground, hydrateFromSaved]);

  return null;
}
