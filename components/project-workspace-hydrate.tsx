"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { useMockupFrame } from "@/components/mockup-frame-context";
import { useMockupMedia } from "@/components/mockup-media-context";
import type { VisualWorkspacePrefs } from "@/lib/mockup-workspace-snapshot";
import { getSavedProject } from "@/lib/saved-projects";
import {
  getProjectsWorkspaceSegment,
  skipHydrateSessionStorageKey,
  WORKSPACE_HYDRATED_EVENT,
  type WorkspaceHydratedDetail,
} from "@/lib/project-workspace";

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
    const signalHydrated = () => {
      window.setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent<WorkspaceHydratedDetail>(WORKSPACE_HYDRATED_EVENT, {
            detail: { pathname },
          })
        );
      }, 0);
    };

    if (segment === "new") {
      setAspectPreset("square-1-1");
      hydrateCanvasBackground(null);
      hydrateFromSaved(null);
      signalHydrated();
      return;
    }
    if (!segment) {
      signalHydrated();
      return;
    }

    try {
      if (
        typeof window !== "undefined" &&
        window.sessionStorage.getItem(skipHydrateSessionStorageKey(segment)) ===
          "1"
      ) {
        window.sessionStorage.removeItem(skipHydrateSessionStorageKey(segment));
        signalHydrated();
        return;
      }
    } catch {
      /* ignore sessionStorage */
    }

    const saved = getSavedProject(segment);
    if (saved) {
      const resolvedActive =
        saved.activeVisualId ??
        saved.activeMediaId ??
        saved.visualSlots?.[saved.visualSlots.length - 1]?.id ??
        saved.mediaItems?.[saved.mediaItems.length - 1]?.id ??
        null;

      const perVisual: VisualWorkspacePrefs | undefined =
        resolvedActive != null
          ? saved.visualWorkspacePrefs?.[resolvedActive]
          : undefined;
      const projectFrameSeed: VisualWorkspacePrefs = {
        aspectPreset: saved.aspectPreset,
        canvasBackground: saved.canvasBackground ?? null,
      };
      const seedForFrame = perVisual ?? projectFrameSeed;

      setAspectPreset(seedForFrame.aspectPreset);
      hydrateCanvasBackground(seedForFrame.canvasBackground);
      hydrateFromSaved({
        mediaItems: saved.mediaItems,
        visualSlots: saved.visualSlots,
        activeVisualId:
          saved.activeVisualId ?? saved.activeMediaId ?? null,
        projectFrameSeed,
        visualWorkspacePrefs: saved.visualWorkspacePrefs ?? null,
      });
    } else {
      hydrateCanvasBackground(null);
      hydrateFromSaved(null);
    }
    signalHydrated();
  }, [pathname, setAspectPreset, hydrateCanvasBackground, hydrateFromSaved]);

  return null;
}
