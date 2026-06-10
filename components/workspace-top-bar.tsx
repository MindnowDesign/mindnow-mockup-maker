"use client";

import { Download, Pencil } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import { useMockupFrame } from "@/components/mockup-frame-context";
import { useMockupMedia } from "@/components/mockup-media-context";
import { Button } from "@/components/ui/button";
import { useProjectWorkspaceTitle } from "@/components/project-workspace-title-context";
import {
  clearPendingNewProjectId,
  getOrCreatePendingNewProjectId,
  getProjectsWorkspaceSegment,
  getWorkspaceTitle,
  skipHydrateSessionStorageKey,
  WORKSPACE_HYDRATED_EVENT,
  type WorkspaceHydratedDetail,
} from "@/lib/project-workspace";
import { backfillVisualThumbnails } from "@/lib/backfill-visual-thumbnails";
import { captureMockupPreview } from "@/lib/capture-mockup-preview";
import { frameMatchesVisualPrefs } from "@/lib/frame-matches-visual-prefs";
import {
  preloadAllCanvasGradientSvgs,
  preloadAllCanvasWaveSvgs,
} from "@/lib/gradient-svg-cache";
import { isCanvasOrganicTemplateId } from "@/lib/canvas-background-organic-templates";
import { preloadOrganicTemplateId } from "@/lib/organic-image-cache";
import type { PersistedCanvasBackground } from "@/lib/mockup-canvas-background";
import {
  DEFAULT_CANVAS_NOISE_COLOR,
  DEFAULT_CANVAS_NOISE_COLOR_OPACITY,
} from "@/lib/mockup-canvas-background";
import {
  DEFAULT_CANVAS_NOISE_BLEND_MODE,
} from "@/lib/mockup-noise-blend";
import {
  DEFAULT_CANVAS_NOISE_TYPE,
} from "@/lib/mockup-noise";
import { resourceUrlToDataUrl } from "@/lib/resource-to-data-url";
import { applyVisualUpdatedAt } from "@/lib/apply-visual-updated-at";
import { serializeMockupMediaForSave } from "@/lib/serialize-mockup-media";
import {
  getSavedProject,
  notifySavedProjectsChanged,
  upsertSavedProject,
} from "@/lib/saved-projects";
import { templateSupportsEditableGradientFills } from "@/lib/canvas-gradient-1-fill";
import { collectCanvasMediaIdsForSave } from "@/lib/collect-canvas-media-ids";
import {
  cloneVisualWorkspacePrefsForSave,
  resolveVisualPrefsForSave,
} from "@/lib/mockup-workspace-snapshot";
import { cn } from "@/lib/utils";

const DEFAULT_WORKSPACE_LOGO_SRC = "/images/logo.png";

type WorkspaceTopBarProps = {
  className?: string;
  /** Shown next to the logo (accessibility / branding). */
  teamLabel?: string;
  /** Replace default Mindnow mark in the header. */
  logo?: ReactNode;
};

const AUTOSAVE_DEBOUNCE_MS = 600;
const THUMBNAIL_CAPTURE_DEBOUNCE_MS = 2500;
const THUMBNAIL_CAPTURE_ON_VISUAL_SWITCH_MS = 800;

/**
 * Top bar for project workspace routes: logo (home) + editable title + Export.
 * Project state persists automatically (debounced) without header UI.
 */
export function WorkspaceTopBar({
  className,
  teamLabel = "Mindnow",
  logo,
}: WorkspaceTopBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const frame = useMockupFrame();
  const {
    aspectPreset,
    canvasBackgroundMode,
    canvasSolidColor,
    canvasBackgroundImageUrl,
    canvasGradientTemplateId,
    canvasGradientFillHex,
    canvasGradientFillsByTemplate,
    canvasGradientBlendModesByTemplate,
    canvasGradientOpacitiesByTemplate,
    canvasNoisePercent,
    canvasBlurPercent,
    canvasNoiseType,
    canvasNoiseColor,
    canvasNoiseColorOpacity,
    canvasNoiseBlendMode,
    deviceTemplateId,
    screenshotStyle,
    screenshotBorderColor,
    screenshotBorderColorOpacity,
    screenshotBorderPosition,
    screenshotBorderWeight,
    screenshotOutlineColor,
    screenshotOutlineColorOpacity,
    screenshotCornerType,
    screenshotCornerRadius,
  } = frame;
  const {
    library,
    visuals,
    activeVisualId,
    visualWorkspacePrefs,
    setActiveVisualId,
  } = useMockupMedia();
  const { title, setTitle } = useProjectWorkspaceTitle();
  const fallbackTitle = getWorkspaceTitle(pathname);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [hydrationReady, setHydrationReady] = useState(false);
  /** Blocks autosave until initial hydrate finishes (prevents empty overwrite). */
  const isRestoringRef = useRef(true);
  const persistInFlightRef = useRef(false);
  const persistQueuedRef = useRef(false);
  const persistPendingCaptureRef = useRef(false);
  const backfillingThumbsRef = useRef(false);
  const backfillAbortRef = useRef(false);
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;
  /** Last workspace segment — used when flushing save after navigating away. */
  const lastWorkspaceSegmentRef = useRef<string | null>(null);
  /** One id for all autosaves on `/projects/new` (avoids duplicate projects per save). */
  const pendingNewProjectIdRef = useRef<string | null>(null);

  const frameCaptureRef = useRef({
    aspectPreset,
    canvasBackgroundMode,
    canvasSolidColor,
    canvasGradientTemplateId,
    deviceTemplateId,
  });
  frameCaptureRef.current = {
    aspectPreset,
    canvasBackgroundMode,
    canvasSolidColor,
    canvasGradientTemplateId,
    deviceTemplateId,
  };
  const activeVisualIdRef = useRef(activeVisualId);
  activeVisualIdRef.current = activeVisualId;
  const libraryPersistRef = useRef(library);
  libraryPersistRef.current = library;
  const visualsPersistRef = useRef(visuals);
  visualsPersistRef.current = visuals;
  const visualWorkspacePrefsRef = useRef(visualWorkspacePrefs);
  visualWorkspacePrefsRef.current = visualWorkspacePrefs;
  const frameForPersistRef = useRef(frame);
  frameForPersistRef.current = frame;

  useEffect(() => {
    const seg = getProjectsWorkspaceSegment(pathname);
    if (seg) lastWorkspaceSegmentRef.current = seg;
  }, [pathname]);

  useEffect(() => {
    backfillAbortRef.current = false;
    return () => {
      backfillAbortRef.current = true;
      backfillingThumbsRef.current = false;
      persistPendingCaptureRef.current = false;
    };
  }, [pathname]);

  useEffect(() => {
    const segment = getProjectsWorkspaceSegment(pathname);
    if (segment === "new") {
      pendingNewProjectIdRef.current = getOrCreatePendingNewProjectId();
    } else {
      pendingNewProjectIdRef.current = null;
    }
  }, [pathname]);

  useEffect(() => {
    isRestoringRef.current = true;
    setHydrationReady(false);
    const segment = getProjectsWorkspaceSegment(pathname);
    if (!segment) {
      isRestoringRef.current = false;
      return;
    }

    function onHydrated(ev: Event) {
      const e = ev as CustomEvent<WorkspaceHydratedDetail>;
      if (e.detail?.pathname !== pathname) return;
      setHydrationReady(true);
      // Brief grace so frame prefs (canvas layers) apply before autosave runs.
      isRestoringRef.current = true;
      window.setTimeout(() => {
        if (pathnameRef.current === pathname) {
          isRestoringRef.current = false;
        }
      }, 400);
    }

    window.addEventListener(WORKSPACE_HYDRATED_EVENT, onHydrated);
    return () =>
      window.removeEventListener(WORKSPACE_HYDRATED_EVENT, onHydrated);
  }, [pathname]);

  const runPersistRef = useRef<
    (opts?: { capture?: boolean; force?: boolean }) => Promise<void>
  >(() => Promise.resolve());
  const prevActiveVisualIdRef = useRef(activeVisualId);

  const runPersist = useCallback(async (opts?: { capture?: boolean; force?: boolean }) => {
    if (opts?.capture) {
      persistPendingCaptureRef.current = true;
    }
    const shouldCapture =
      opts?.capture === true || persistPendingCaptureRef.current;

    if (persistInFlightRef.current) {
      persistQueuedRef.current = true;
      return;
    }

    persistPendingCaptureRef.current = false;

    const segment =
      getProjectsWorkspaceSegment(pathnameRef.current) ??
      lastWorkspaceSegmentRef.current;
    if (!segment) return;

    const preferStoredLayersWhenFrameEmpty = isRestoringRef.current;
    if (isRestoringRef.current && !opts?.force) return;

    persistInFlightRef.current = true;
    persistQueuedRef.current = false;

    const persistLibrary = libraryPersistRef.current;
    const persistVisuals = visualsPersistRef.current;
    const persistActiveVisualId = activeVisualIdRef.current;
    const persistPrefs = visualWorkspacePrefsRef.current;
    const persistFrame = frameForPersistRef.current;

    try {
      const projectId =
        segment === "new"
          ? (pendingNewProjectIdRef.current ||
              getOrCreatePendingNewProjectId())
          : segment;

      const canvasMediaIds = collectCanvasMediaIdsForSave(
        persistLibrary,
        persistPrefs,
        persistFrame
      );
      const serialized = await serializeMockupMediaForSave(
        persistLibrary,
        persistVisuals,
        persistActiveVisualId,
        canvasMediaIds
      );

      const diskEarly = getSavedProject(projectId);
      if (
        persistLibrary.length > 0 &&
        serialized.mediaItems.length === 0 &&
        diskEarly?.mediaItems?.length
      ) {
        console.warn(
          "Autosave: could not re-serialize library blobs; keeping last saved mediaItems."
        );
        serialized.mediaItems = diskEarly.mediaItems;
        if (diskEarly.visualSlots?.length) {
          serialized.visualSlots = diskEarly.visualSlots;
        }
      } else if (
        persistFrame.canvasLayers.length > 0 &&
        serialized.mediaItems.length === 0 &&
        !(diskEarly?.mediaItems?.length)
      ) {
        console.warn(
          "Autosave skipped: canvas images present but media could not be serialized."
        );
        return;
      }

      let captured = "";
      if (shouldCapture) {
        const captureEl = document.querySelector<HTMLElement>(
          "[data-mockup-capture-target]"
        );
        if (captureEl && serialized.activeVisualId) {
          captured = await captureMockupPreview(captureEl);
        }
      }

      const slotIds = new Set(serialized.visualSlots.map((s) => s.id));
      const disk = diskEarly ?? getSavedProject(projectId);
      let mergedThumbs: Record<string, string> = {
        ...(disk?.previewThumbByVisualId ?? {}),
      };
      if (
        Object.keys(mergedThumbs).length === 0 &&
        disk?.previewDataUrls?.length &&
        disk.visualSlots?.length
      ) {
        mergedThumbs = {};
        for (let i = 0; i < disk.visualSlots.length; i++) {
          const u = disk.previewDataUrls![i];
          if (u) mergedThumbs[disk.visualSlots[i]!.id] = u;
        }
      }
      if (serialized.activeVisualId && captured) {
        mergedThumbs[serialized.activeVisualId] = captured;
      }

      const focusVisualIdAtPersistStart = persistActiveVisualId;

      const canBackfillThumbs =
        shouldCapture &&
        serialized.visualSlots.length > 0 &&
        !backfillAbortRef.current &&
        getProjectsWorkspaceSegment(pathnameRef.current) != null;

      if (canBackfillThumbs) {
        preloadAllCanvasGradientSvgs();
        preloadAllCanvasWaveSvgs();
        for (const slot of serialized.visualSlots) {
          const prefs = resolveVisualPrefsForSave(
            slot.id,
            persistActiveVisualId,
            persistPrefs,
            persistFrame,
            { preferStoredLayersWhenFrameEmpty }
          );
          const templateId = prefs.canvasBackground?.gradientTemplateId;
          if (templateId && isCanvasOrganicTemplateId(templateId)) {
            preloadOrganicTemplateId(templateId);
          }
        }

        backfillingThumbsRef.current = true;
        try {
          mergedThumbs = await backfillVisualThumbnails({
            visualSlotIds: serialized.visualSlots.map((s) => s.id),
            thumbs: mergedThumbs,
            justCapturedVisualId: serialized.activeVisualId,
            justCapturedDataUrl: captured,
            activeVisualId: focusVisualIdAtPersistStart,
            switchToVisual: setActiveVisualId,
            getCaptureElement: () =>
              document.querySelector<HTMLElement>(
                "[data-mockup-capture-target]"
              ),
            isFrameSyncedForVisual: (visualId) => {
              if (activeVisualIdRef.current !== visualId) return false;
              return frameMatchesVisualPrefs(
                frameCaptureRef.current,
                visualWorkspacePrefsRef.current[visualId]
              );
            },
            gradientTemplateIdForVisual: (visualId) => {
              const bg =
                visualWorkspacePrefsRef.current[visualId]?.canvasBackground;
              if (bg?.mode !== "template") return null;
              return bg.gradientTemplateId ?? null;
            },
            shouldAbort: () =>
              backfillAbortRef.current ||
              getProjectsWorkspaceSegment(pathnameRef.current) == null,
          });
        } finally {
          backfillingThumbsRef.current = false;
        }
      }

      for (const id of Object.keys(mergedThumbs)) {
        if (!slotIds.has(id)) delete mergedThumbs[id];
      }

      const previewDataUrls = serialized.visualSlots.map(
        (s) => mergedThumbs[s.id] ?? ""
      );
      const previewDataUrl =
        captured ||
        previewDataUrls.find((u) => u.length > 0) ||
        "";

      const effectsPayload = {
        ...(canvasNoisePercent > 0 && { noisePercent: canvasNoisePercent }),
        ...(canvasBlurPercent > 0 && { blurPercent: canvasBlurPercent }),
        ...(canvasNoiseType !== DEFAULT_CANVAS_NOISE_TYPE && {
          noiseType: canvasNoiseType,
        }),
        ...(canvasNoiseColor.trim().toUpperCase() !==
          DEFAULT_CANVAS_NOISE_COLOR && {
          noiseColor: canvasNoiseColor.trim().toUpperCase(),
        }),
        ...(canvasNoiseColorOpacity !== DEFAULT_CANVAS_NOISE_COLOR_OPACITY && {
          noiseColorOpacity: canvasNoiseColorOpacity,
        }),
        ...(canvasNoiseBlendMode !== DEFAULT_CANVAS_NOISE_BLEND_MODE && {
          noiseBlendMode: canvasNoiseBlendMode,
        }),
      };

      const trimmedGradient =
        canvasBackgroundMode === "template"
          ? canvasGradientTemplateId?.trim()
          : null;
      const gradientPayload =
        trimmedGradient != null && trimmedGradient !== ""
          ? {
              gradientTemplateId: trimmedGradient,
              gradientFillsByTemplate: Object.fromEntries(
                Object.entries(canvasGradientFillsByTemplate).map(
                  ([id, fills]) => [id, { ...fills }]
                )
              ),
              ...(templateSupportsEditableGradientFills(trimmedGradient)
                ? { gradientFillHex: { ...canvasGradientFillHex } }
                : {}),
              gradientBlendModesByTemplate: Object.fromEntries(
                Object.entries(canvasGradientBlendModesByTemplate).map(
                  ([id, modes]) => [id, { ...modes }]
                )
              ),
              gradientOpacitiesByTemplate: Object.fromEntries(
                Object.entries(canvasGradientOpacitiesByTemplate).map(
                  ([id, opacities]) => [id, { ...opacities }]
                )
              ),
            }
          : {};

      const activeResolved =
        persistActiveVisualId != null
          ? resolveVisualPrefsForSave(
              persistActiveVisualId,
              persistActiveVisualId,
              persistPrefs,
              persistFrame,
              { preferStoredLayersWhenFrameEmpty }
            )
          : undefined;

      let canvasBackgroundFromFrame: PersistedCanvasBackground | undefined;
      if (canvasBackgroundMode === "transparent") {
        canvasBackgroundFromFrame = {
          mode: "transparent",
          ...gradientPayload,
          ...effectsPayload,
        };
      } else if (canvasBackgroundMode === "solid") {
        canvasBackgroundFromFrame = {
          mode: "solid",
          solidColor: canvasSolidColor,
          ...gradientPayload,
          ...effectsPayload,
        };
      } else if (canvasBackgroundMode === "image") {
        if (canvasBackgroundImageUrl) {
          const imageDataUrl = await resourceUrlToDataUrl(
            canvasBackgroundImageUrl
          );
          canvasBackgroundFromFrame = {
            mode: "image",
            imageDataUrl,
            ...gradientPayload,
            ...effectsPayload,
          };
        } else {
          canvasBackgroundFromFrame = {
            mode: "image",
            ...gradientPayload,
            ...effectsPayload,
          };
        }
      } else if (canvasBackgroundMode === "template") {
        canvasBackgroundFromFrame = {
          mode: "template",
          ...gradientPayload,
          ...effectsPayload,
        };
      }

      const aspectPresetRoot =
        activeResolved?.aspectPreset ?? aspectPreset;
      const canvasBackgroundRoot =
        activeResolved != null
          ? activeResolved.canvasBackground ?? undefined
          : canvasBackgroundFromFrame;

      const prefsPayload =
        serialized.visualSlots.length > 0
          ? Object.fromEntries(
              serialized.visualSlots.map((slot) => {
                const resolved = resolveVisualPrefsForSave(
                  slot.id,
                  persistActiveVisualId,
                  persistPrefs,
                  persistFrame,
                  { preferStoredLayersWhenFrameEmpty }
                );
                return [
                  slot.id,
                  cloneVisualWorkspacePrefsForSave(resolved),
                ];
              })
            )
          : undefined;

      const resolvedTitle = title.trim() || fallbackTitle;
      const savedAt = Date.now();
      const visualSlotsWithTimestamps = applyVisualUpdatedAt(
        serialized.visualSlots,
        serialized.activeVisualId,
        disk,
        savedAt
      );

      try {
        upsertSavedProject({
          id: projectId,
          title: resolvedTitle,
          updatedAt: savedAt,
          previewDataUrl,
          ...(Object.keys(mergedThumbs).length > 0
            ? { previewThumbByVisualId: mergedThumbs }
            : {}),
          ...(previewDataUrls.length > 0 ? { previewDataUrls } : {}),
          aspectPreset: aspectPresetRoot,
          canvasBackground: canvasBackgroundRoot,
          visualCount: visualSlotsWithTimestamps.length,
          mediaItems: serialized.mediaItems,
          visualSlots: visualSlotsWithTimestamps,
          activeVisualId: serialized.activeVisualId,
          activeMediaId: serialized.activeVisualId,
          ...(prefsPayload ? { visualWorkspacePrefs: prefsPayload } : {}),
        });
      } catch (persistErr) {
        if (
          persistErr instanceof DOMException &&
          persistErr.name === "QuotaExceededError"
        ) {
          console.error(
            "localStorage quota exceeded; retrying without preview images"
          );
          try {
            upsertSavedProject({
              id: projectId,
              title: resolvedTitle,
              updatedAt: savedAt,
              previewDataUrl: "",
              aspectPreset: aspectPresetRoot,
              canvasBackground: canvasBackgroundRoot,
              visualCount: visualSlotsWithTimestamps.length,
              mediaItems: serialized.mediaItems,
              visualSlots: visualSlotsWithTimestamps,
              activeVisualId: serialized.activeVisualId,
              activeMediaId: serialized.activeVisualId,
              ...(prefsPayload ? { visualWorkspacePrefs: prefsPayload } : {}),
            });
          } catch {
            console.error(
              "localStorage quota exceeded; saving metadata without media payload"
            );
            upsertSavedProject({
              id: projectId,
              title: resolvedTitle,
              updatedAt: savedAt,
              previewDataUrl: "",
              aspectPreset: aspectPresetRoot,
              visualCount: visualSlotsWithTimestamps.length,
              visualSlots: visualSlotsWithTimestamps,
              activeVisualId: serialized.activeVisualId,
              ...(prefsPayload ? { visualWorkspacePrefs: prefsPayload } : {}),
            });
          }
        } else {
          throw persistErr;
        }
      }
      notifySavedProjectsChanged();

      if (segment === "new") {
        persistQueuedRef.current = false;
        clearPendingNewProjectId();
        try {
          window.sessionStorage.setItem(
            skipHydrateSessionStorageKey(projectId),
            "1"
          );
        } catch {
          /* ignore */
        }
        router.replace(`/projects/${projectId}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      persistInFlightRef.current = false;
      if (persistQueuedRef.current) {
        persistQueuedRef.current = false;
        void runPersistRef.current({
          capture: persistPendingCaptureRef.current,
        });
      }
    }
  }, [
    pathname,
    router,
    aspectPreset,
    canvasBackgroundMode,
    canvasSolidColor,
    canvasBackgroundImageUrl,
    canvasNoisePercent,
    canvasBlurPercent,
    canvasNoiseType,
    canvasNoiseColor,
    canvasNoiseColorOpacity,
    canvasNoiseBlendMode,
    library,
    visuals,
    activeVisualId,
    visualWorkspacePrefs,
    setActiveVisualId,
    title,
    fallbackTitle,
    frame,
    frame.canvasLayers,
    frame.selectedCanvasLayerId,
    frame.canvasImageRect,
    frame.canvasImageBaseline,
  ]);

  useEffect(() => {
    runPersistRef.current = runPersist;
  }, [runPersist]);

  useEffect(() => {
    if (!hydrationReady) return;
    const segment = getProjectsWorkspaceSegment(pathname);
    if (!segment) return;

    const id = window.setTimeout(() => {
      void runPersistRef.current({ capture: false });
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => window.clearTimeout(id);
  }, [
    hydrationReady,
    pathname,
    aspectPreset,
    canvasBackgroundMode,
    canvasSolidColor,
    canvasBackgroundImageUrl,
    canvasNoisePercent,
    canvasBlurPercent,
    canvasNoiseType,
    canvasNoiseColor,
    canvasNoiseColorOpacity,
    canvasNoiseBlendMode,
    library,
    visuals,
    activeVisualId,
    visualWorkspacePrefs,
    title,
    frame,
    frame.canvasLayers,
    frame.selectedCanvasLayerId,
    frame.canvasImageRect,
    frame.canvasImageBaseline,
  ]);

  useEffect(() => {
    const segment = getProjectsWorkspaceSegment(pathname);
    if (!segment) return;

    const flush = () => {
      void runPersistRef.current({ capture: false, force: true });
    };

    const onPageHide = () => flush();
    window.addEventListener("pagehide", onPageHide);

    return () => {
      window.removeEventListener("pagehide", onPageHide);
      flush();
    };
  }, [pathname]);

  useEffect(() => {
    if (!hydrationReady) return;
    const segment = getProjectsWorkspaceSegment(pathname);
    if (!segment) return;

    if (backfillingThumbsRef.current) return;

    const visualSwitched = prevActiveVisualIdRef.current !== activeVisualId;
    prevActiveVisualIdRef.current = activeVisualId;

    const debounceMs = visualSwitched
      ? THUMBNAIL_CAPTURE_ON_VISUAL_SWITCH_MS
      : THUMBNAIL_CAPTURE_DEBOUNCE_MS;

    const id = window.setTimeout(() => {
      void runPersistRef.current({ capture: true });
    }, debounceMs);

    return () => window.clearTimeout(id);
  }, [
    hydrationReady,
    pathname,
    aspectPreset,
    canvasBackgroundMode,
    canvasSolidColor,
    canvasBackgroundImageUrl,
    canvasGradientTemplateId,
    canvasNoisePercent,
    canvasBlurPercent,
    deviceTemplateId,
    screenshotStyle,
    screenshotBorderColor,
    screenshotBorderColorOpacity,
    screenshotBorderPosition,
    screenshotBorderWeight,
    screenshotOutlineColor,
    screenshotOutlineColorOpacity,
    screenshotCornerType,
    screenshotCornerRadius,
    library,
    visuals,
    activeVisualId,
    visualWorkspacePrefs,
    frame,
    frame.canvasLayers,
    frame.selectedCanvasLayerId,
    frame.canvasImageRect,
    frame.canvasImageBaseline,
  ]);

  return (
    <header
      className={cn(
        "flex min-h-14 shrink-0 items-center gap-3 border-b border-zinc-800 bg-zinc-950 px-4 py-3",
        className
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Link
          href="/"
          aria-label="Home"
          className="flex size-[40px] shrink-0 flex-none items-center justify-center overflow-hidden rounded-lg text-zinc-400 outline-none transition-colors hover:bg-white/5 hover:text-white focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
        >
          <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg">
            {logo ?? (
              <Image
                src={DEFAULT_WORKSPACE_LOGO_SRC}
                alt=""
                width={32}
                height={32}
                className="size-full object-contain"
                priority
              />
            )}
          </span>
        </Link>
        <div className="flex min-w-0 flex-1 justify-start">
          <div className="group inline-flex w-fit max-w-full min-w-0 cursor-text items-center gap-2">
            <input
              ref={titleInputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => {
                const trimmed = title.trim();
                setTitle(trimmed || fallbackTitle);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.currentTarget.blur();
                }
                if (e.key === "Escape") {
                  setTitle(fallbackTitle);
                  e.currentTarget.blur();
                }
              }}
              spellCheck={false}
              autoComplete="off"
              aria-label="Project name"
              placeholder="Untitled project"
              maxLength={128}
              className={cn(
                "max-w-full border-0 bg-transparent px-0 py-0 text-base font-semibold tracking-tight text-white outline-none ring-0 shadow-none",
                "min-w-0 [field-sizing:content]",
                "focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0",
                "placeholder:text-zinc-500"
              )}
            />
            <span
              className={cn(
                "inline-flex shrink-0 opacity-0 transition-opacity duration-150",
                "group-hover:opacity-100 group-focus-within:opacity-100"
              )}
              onMouseDown={(e) => {
                e.preventDefault();
                titleInputRef.current?.focus();
              }}
            >
              <Pencil
                className="size-4 text-zinc-500"
                strokeWidth={2}
                aria-hidden
              />
            </span>
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          type="button"
          variant="default"
          size="lg"
        >
          <Download className="size-4" strokeWidth={1.75} aria-hidden />
          Export
        </Button>
      </div>
    </header>
  );
}
