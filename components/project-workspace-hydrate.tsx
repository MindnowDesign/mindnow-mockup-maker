"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { useMockupFrame } from "@/components/mockup-frame-context";
import { useMockupMedia } from "@/components/mockup-media-context";
import type { VisualWorkspacePrefs } from "@/lib/mockup-workspace-snapshot";
import { normalizeAspectPreset } from "@/lib/mockup-aspect";
import { normalizeDeviceTemplateId } from "@/lib/mockup-browser-templates";
import { getSavedProject } from "@/lib/saved-projects";
import {
  getProjectsWorkspaceSegment,
  getRequestedVisualIdFromSearch,
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
  const {
    setAspectPreset,
    hydrateCanvasBackground,
    setDeviceTemplateId,
    hydrateScreenshotStyle,
  } = useMockupFrame();
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
      setDeviceTemplateId(null);
      hydrateScreenshotStyle(null);
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
      }
    } catch {
      /* ignore sessionStorage */
    }

    const saved = getSavedProject(segment);
    if (saved) {
      const slotIds = new Set(
        (saved.visualSlots ?? saved.mediaItems ?? []).map((s) => s.id)
      );
      const firstVisualId =
        saved.visualSlots?.[0]?.id ?? saved.mediaItems?.[0]?.id ?? null;
      const requestedVisualId =
        typeof window !== "undefined"
          ? getRequestedVisualIdFromSearch(window.location.search)
          : null;
      const activeVisualId =
        requestedVisualId && slotIds.has(requestedVisualId)
          ? requestedVisualId
          : firstVisualId;

      const perVisual: VisualWorkspacePrefs | undefined =
        activeVisualId != null
          ? saved.visualWorkspacePrefs?.[activeVisualId]
          : undefined;
      const projectFrameSeed: VisualWorkspacePrefs = {
        aspectPreset: saved.aspectPreset,
        canvasBackground: saved.canvasBackground ?? null,
        deviceTemplateId: normalizeDeviceTemplateId(saved.deviceTemplateId),
        screenshotStyle: null,
      };
      const seedForFrame = perVisual ?? projectFrameSeed;

      setAspectPreset(normalizeAspectPreset(seedForFrame.aspectPreset));
      hydrateCanvasBackground(seedForFrame.canvasBackground);
      setDeviceTemplateId(
        normalizeDeviceTemplateId(seedForFrame.deviceTemplateId)
      );
      hydrateScreenshotStyle(seedForFrame.screenshotStyle ?? null);
      hydrateFromSaved({
        mediaItems: saved.mediaItems,
        visualSlots: saved.visualSlots,
        activeVisualId,
        projectFrameSeed,
        visualWorkspacePrefs: saved.visualWorkspacePrefs ?? null,
      });
    } else {
      hydrateCanvasBackground(null);
      setDeviceTemplateId(null);
      hydrateScreenshotStyle(null);
      hydrateFromSaved(null);
    }
    signalHydrated();
  }, [
    pathname,
    setAspectPreset,
    hydrateCanvasBackground,
    setDeviceTemplateId,
    hydrateScreenshotStyle,
    hydrateFromSaved,
  ]);

  return null;
}
