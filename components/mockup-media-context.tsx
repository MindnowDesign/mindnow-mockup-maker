"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

import { useMockupFrame } from "@/components/mockup-frame-context";
import { normalizeAspectPreset } from "@/lib/mockup-aspect";
import {
  WORKSPACE_HYDRATED_EVENT,
  WORKSPACE_PLACEHOLDER_VISUAL_ID,
  type WorkspaceHydratedDetail,
} from "@/lib/project-workspace";
import type { SavedMediaItem, SavedVisualSlot } from "@/lib/saved-projects";
import {
  captureVisualWorkspacePrefs,
  DEFAULT_NEW_VISUAL_WORKSPACE_PREFS,
  normalizeVisualWorkspacePrefs,
  type VisualWorkspacePrefs,
} from "@/lib/mockup-workspace-snapshot";

/** Asset in the project library (blob or data URL). */
export type MockupLibraryItem = {
  id: string;
  kind: "image" | "video";
  url: string;
};

/** Canvas slot; optional assignment to a library asset by id. */
export type MockupVisualSlot = {
  id: string;
  mediaId: string | null;
  label?: string;
};

/** @deprecated Use `MockupLibraryItem` — kept for snapshot/history casts. */
export type MockupMediaItem = MockupLibraryItem;

type MockupMediaState = {
  library: MockupLibraryItem[];
  visuals: MockupVisualSlot[];
  activeVisualId: string | null;
  /** Frame preset + canvas fill keyed by visual id (`undefined` = inherit global until first switch). */
  visualWorkspacePrefs: Record<string, VisualWorkspacePrefs>;
};

export type HydrateFromSavedPayload = {
  mediaItems?: SavedMediaItem[];
  visualSlots?: SavedVisualSlot[];
  activeVisualId?: string | null;
  /** Legacy — treated as active canvas slot id when `visualSlots` is absent. */
  activeMediaId?: string | null;
  /** Seeds each visual’s saved frame appearance when reopening a project. */
  projectFrameSeed?: VisualWorkspacePrefs | null;
  /** Per-visual appearance from disk (preferred over `projectFrameSeed` per slot). */
  visualWorkspacePrefs?: Record<string, VisualWorkspacePrefs> | null;
} | null;

function replacePlaceholderVisualIds(
  visuals: MockupVisualSlot[],
  prefs: Record<string, VisualWorkspacePrefs>,
  activeVisualId: string | null
): {
  visuals: MockupVisualSlot[];
  prefs: Record<string, VisualWorkspacePrefs>;
  activeVisualId: string | null;
} {
  if (!visuals.some((v) => v.id === WORKSPACE_PLACEHOLDER_VISUAL_ID)) {
    return { visuals, prefs, activeVisualId };
  }

  const newId = crypto.randomUUID();
  const nextVisuals = visuals.map((v) =>
    v.id === WORKSPACE_PLACEHOLDER_VISUAL_ID ? { ...v, id: newId } : v
  );
  const nextPrefs = { ...prefs };
  if (nextPrefs[WORKSPACE_PLACEHOLDER_VISUAL_ID]) {
    nextPrefs[newId] = nextPrefs[WORKSPACE_PLACEHOLDER_VISUAL_ID]!;
    delete nextPrefs[WORKSPACE_PLACEHOLDER_VISUAL_ID];
  }
  const nextActive =
    activeVisualId === WORKSPACE_PLACEHOLDER_VISUAL_ID ? newId : activeVisualId;
  return {
    visuals: nextVisuals,
    prefs: nextPrefs,
    activeVisualId: nextActive,
  };
}

function createFreshWorkspaceState(): MockupMediaState {
  return {
    library: [],
    visuals: [{ id: WORKSPACE_PLACEHOLDER_VISUAL_ID, mediaId: null }],
    activeVisualId: WORKSPACE_PLACEHOLDER_VISUAL_ID,
    visualWorkspacePrefs: {},
  };
}

type MockupMediaContextValue = {
  library: MockupLibraryItem[];
  visuals: MockupVisualSlot[];
  activeVisualId: string | null;
  activeVisual: MockupVisualSlot | null;
  /** Resolved media for the active canvas (null = empty slot). */
  activeItem: MockupLibraryItem | null;
  /** Sidebar / pool: add files without creating a canvas slot. */
  addLibraryFromFileList: (files: FileList | null) => void;
  /** Canvas / paste / drop: assigns into the active visual (and library). */
  addFromFileList: (files: FileList | null) => void;
  setActiveVisualId: (id: string | null) => void;
  addEmptyVisual: () => void;
  assignMediaToActiveVisual: (libraryItemId: string) => void;
  updateVisualLabel: (visualId: string, value: string) => void;
  removeLibraryItem: (libraryItemId: string) => void;
  /** Removes a canvas slot; library assets are kept. At least one visual remains. */
  removeVisual: (visualId: string) => void;
  /**
   * Adds a canvas slot pointing at an existing library asset (no blob copy).
   */
  createNewVisualFromItem: (libraryItemId: string) => Promise<void>;
  hydrateFromSaved: (payload: HydrateFromSavedPayload) => void;
  replaceWorkspaceMedia: (
    library: MockupLibraryItem[],
    visuals: MockupVisualSlot[],
    activeVisualId: string | null,
    frameSeed?: VisualWorkspacePrefs | null,
    visualWorkspacePrefsOverride?: Record<string, VisualWorkspacePrefs> | null
  ) => void;
  /** Frame + canvas keyed by visual slot id (active canvas mirrors its entry). */
  visualWorkspacePrefs: Record<string, VisualWorkspacePrefs>;
};

const MockupMediaContext = createContext<MockupMediaContextValue | null>(null);

function revokeIfBlobUrl(url: string) {
  if (url.startsWith("blob:")) URL.revokeObjectURL(url);
}

function pickKind(file: File): "image" | "video" | null {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return null;
}

function filesToLibraryItems(files: FileList): MockupLibraryItem[] {
  const additions: MockupLibraryItem[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const kind = pickKind(file);
    if (!kind) continue;
    additions.push({
      id: crypto.randomUUID(),
      kind,
      url: URL.createObjectURL(file),
    });
  }
  return additions;
}

export function MockupMediaProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const frame = useMockupFrame();
  const [{ library, visuals, activeVisualId, visualWorkspacePrefs }, setState] =
    useState<MockupMediaState>(createFreshWorkspaceState);

  /** Wait for `ProjectWorkspaceHydrate` before applying frame prefs (avoids reset race). */
  const [workspaceHydrated, setWorkspaceHydrated] = useState(false);

  const libraryRef = useRef(library);
  libraryRef.current = library;

  const visualWorkspacePrefsRef = useRef(visualWorkspacePrefs);
  visualWorkspacePrefsRef.current = visualWorkspacePrefs;

  const skipFramePrefsSyncRef = useRef(false);

  useEffect(() => {
    setWorkspaceHydrated(false);
    function onHydrated(ev: Event) {
      const detail = (ev as CustomEvent<WorkspaceHydratedDetail>).detail;
      if (detail?.pathname === pathname) {
        setWorkspaceHydrated(true);
      }
    }
    window.addEventListener(WORKSPACE_HYDRATED_EVENT, onHydrated);
    return () => window.removeEventListener(WORKSPACE_HYDRATED_EVENT, onHydrated);
  }, [pathname]);

  const activeVisualPrefsKey = useMemo(() => {
    if (!activeVisualId) return "";
    const raw = visualWorkspacePrefs[activeVisualId];
    return JSON.stringify(raw ?? "__none__");
  }, [activeVisualId, visualWorkspacePrefs]);

  useEffect(() => {
    return () => {
      for (const item of libraryRef.current) {
        revokeIfBlobUrl(item.url);
      }
    };
  }, []);

  const setAspectPresetRef = useRef(frame.setAspectPreset);
  const hydrateCanvasBackgroundRef = useRef(frame.hydrateCanvasBackground);
  const setDeviceTemplateIdRef = useRef(frame.setDeviceTemplateId);
  const setBrowserUrlRef = useRef(frame.setBrowserUrl);
  const setBrowserFaviconUrlRef = useRef(frame.setBrowserFaviconUrl);
  const hydrateScreenshotStyleRef = useRef(frame.hydrateScreenshotStyle);
  const hydrateFrameShadowRef = useRef(frame.hydrateFrameShadow);
  const hydrateMockupTransformRef = useRef(frame.hydrateMockupTransform);
  setAspectPresetRef.current = frame.setAspectPreset;
  hydrateCanvasBackgroundRef.current = frame.hydrateCanvasBackground;
  setDeviceTemplateIdRef.current = frame.setDeviceTemplateId;
  setBrowserUrlRef.current = frame.setBrowserUrl;
  setBrowserFaviconUrlRef.current = frame.setBrowserFaviconUrl;
  hydrateScreenshotStyleRef.current = frame.hydrateScreenshotStyle;
  hydrateFrameShadowRef.current = frame.hydrateFrameShadow;
  hydrateMockupTransformRef.current = frame.hydrateMockupTransform;

  useEffect(() => {
    if (!workspaceHydrated) return;
    if (!activeVisualId) return;
    const raw = visualWorkspacePrefsRef.current[activeVisualId];
    const prefs = raw ?? DEFAULT_NEW_VISUAL_WORKSPACE_PREFS;
    skipFramePrefsSyncRef.current = true;
    setAspectPresetRef.current(normalizeAspectPreset(prefs.aspectPreset));
    hydrateCanvasBackgroundRef.current(prefs.canvasBackground);
    setDeviceTemplateIdRef.current(prefs.deviceTemplateId ?? null);
    setBrowserUrlRef.current(prefs.browserUrl ?? "");
    setBrowserFaviconUrlRef.current(prefs.browserFaviconUrl ?? null);
    hydrateScreenshotStyleRef.current(prefs.screenshotStyle ?? null);
    hydrateFrameShadowRef.current(prefs.frameShadow ?? null);
    hydrateMockupTransformRef.current(
      prefs.mockupOffsetX ?? 0,
      prefs.mockupOffsetY ?? 0,
      prefs.mockupScale ?? 1
    );
    if (raw === undefined) {
      setState((s) => ({
        ...s,
        visualWorkspacePrefs: {
          ...s.visualWorkspacePrefs,
          [activeVisualId]: DEFAULT_NEW_VISUAL_WORKSPACE_PREFS,
        },
      }));
    }
  }, [workspaceHydrated, activeVisualId, activeVisualPrefsKey]);

  useEffect(() => {
    if (!workspaceHydrated) return;
    if (!activeVisualId) return;
    if (skipFramePrefsSyncRef.current) {
      skipFramePrefsSyncRef.current = false;
      return;
    }
    const snap = captureVisualWorkspacePrefs(frame);
    setState((s) => ({
      ...s,
      visualWorkspacePrefs: {
        ...s.visualWorkspacePrefs,
        [activeVisualId]: snap,
      },
    }));
  }, [
    activeVisualId,
    frame.aspectPreset,
    frame.canvasBackgroundMode,
    frame.canvasSolidColor,
    frame.canvasBackgroundImageUrl,
    frame.canvasGradientTemplateId,
    frame.canvasGradientFillHex,
    frame.canvasGradientFillsByTemplate,
    frame.canvasGradientBlendModesByTemplate,
    frame.canvasGradientOpacitiesByTemplate,
    frame.canvasNoisePercent,
    frame.canvasBlurPercent,
    frame.canvasNoiseType,
    frame.canvasNoiseColor,
    frame.canvasNoiseColorOpacity,
    frame.canvasNoiseBlendMode,
    frame.canvasOverlayShadowId,
    frame.canvasOverlayShadowOpacity,
    frame.canvasOverlayShadowPlacement,
    frame.canvasDitherEnabled,
    frame.canvasDitherColorBack,
    frame.canvasDitherColorFront,
    frame.canvasDitherColorHighlight,
    frame.canvasDitherOriginalColors,
    frame.canvasDitherInverted,
    frame.canvasDitherType,
    frame.canvasDitherSize,
    frame.canvasDitherColorSteps,
    frame.canvasHalftoneEnabled,
    frame.canvasHalftoneColorBack,
    frame.canvasHalftoneColorFront,
    frame.canvasHalftoneOriginalColors,
    frame.canvasHalftoneInverted,
    frame.canvasHalftoneType,
    frame.canvasHalftoneGrid,
    frame.canvasHalftoneSize,
    frame.canvasHalftoneRadius,
    frame.canvasHalftoneContrast,
    frame.deviceTemplateId,
    frame.browserUrl,
    frame.browserFaviconUrl,
    frame.screenshotStyle,
    frame.screenshotBorderColor,
    frame.screenshotBorderColorOpacity,
    frame.screenshotBorderPosition,
    frame.screenshotBorderWeight,
    frame.screenshotOutlineColor,
    frame.screenshotOutlineColorOpacity,
    frame.screenshotCornerType,
    frame.screenshotCornerRadius,
    frame.screenshotGlassFramePadding,
    frame.frameShadowPreset,
    frame.frameShadowOffsetX,
    frame.frameShadowOffsetY,
    frame.frameShadowBlur,
    frame.frameShadowSpread,
    frame.frameShadowColor,
    frame.frameShadowColorOpacity,
    frame.mockupOffsetX,
    frame.mockupOffsetY,
    frame.mockupScale,
    workspaceHydrated,
  ]);

  const hydrateFromSaved = useCallback((payload: HydrateFromSavedPayload) => {
    setState((s) => {
      for (const item of s.library) {
        revokeIfBlobUrl(item.url);
      }
      if (!payload?.mediaItems?.length) {
        return createFreshWorkspaceState();
      }

      const nextLibrary: MockupLibraryItem[] = payload.mediaItems.map(
        (m) => ({
          id: m.id,
          kind: m.kind,
          url: m.dataUrl,
        })
      );

      let nextVisuals: MockupVisualSlot[];
      let nextActive: string | null;

      if (payload.visualSlots?.length) {
        nextVisuals = payload.visualSlots.map((v) => ({
          id: v.id,
          mediaId:
            v.mediaId &&
            nextLibrary.some((x) => x.id === v.mediaId)
              ? v.mediaId
              : null,
          ...(v.label?.trim() ? { label: v.label.trim() } : {}),
        }));
        nextActive =
          payload.activeVisualId ??
          payload.activeMediaId ??
          nextVisuals[0]!.id;
      } else {
        nextVisuals = nextLibrary.map((lib) => {
          const legacyLabel = payload.mediaItems?.find(
            (m) => m.id === lib.id
          )?.label;
          return {
            id: lib.id,
            mediaId: lib.id,
            ...(legacyLabel?.trim()
              ? { label: legacyLabel.trim() }
              : {}),
          };
        });
        nextActive =
          payload.activeVisualId ??
          payload.activeMediaId ??
          nextVisuals[0]!.id;
      }

      if (
        nextActive &&
        !nextVisuals.some((v) => v.id === nextActive)
      ) {
        nextActive = nextVisuals[0]!.id;
      }
      if (!nextActive && nextVisuals.length > 0) {
        nextActive = nextVisuals[0]!.id;
      }

      if (!nextVisuals.length) {
        return createFreshWorkspaceState();
      }

      const seed = payload.projectFrameSeed ?? null;
      const diskPrefs = payload.visualWorkspacePrefs ?? null;

      const nextVisualWorkspacePrefs: Record<string, VisualWorkspacePrefs> =
        {};
      for (const v of nextVisuals) {
        const per = diskPrefs?.[v.id];
        if (per) {
          nextVisualWorkspacePrefs[v.id] = normalizeVisualWorkspacePrefs(per);
        } else if (seed) {
          nextVisualWorkspacePrefs[v.id] = normalizeVisualWorkspacePrefs(seed);
        } else {
          nextVisualWorkspacePrefs[v.id] = normalizeVisualWorkspacePrefs(null);
        }
      }

      const migrated = replacePlaceholderVisualIds(
        nextVisuals,
        nextVisualWorkspacePrefs,
        nextActive
      );

      return {
        library: nextLibrary,
        visuals: migrated.visuals,
        activeVisualId: migrated.activeVisualId,
        visualWorkspacePrefs: migrated.prefs,
      };
    });
  }, []);

  const addLibraryFromFileList = useCallback((files: FileList | null) => {
    if (!files?.length) return;
    const additions = filesToLibraryItems(files);
    if (!additions.length) return;
    setState((s) => ({
      ...s,
      library: [...s.library, ...additions],
    }));
  }, []);

  const addFromFileList = useCallback(
    (files: FileList | null) => {
      if (!files?.length) return;
      const additions = filesToLibraryItems(files);
      if (!additions.length) return;

      const inheritPrefs = captureVisualWorkspacePrefs(frame);

      setState((s) => {
        const activeId = s.activeVisualId;
        if (additions.length === 1 && activeId) {
          const lib = additions[0]!;
          if (activeId === WORKSPACE_PLACEHOLDER_VISUAL_ID) {
            const nextActiveId = crypto.randomUUID();
            const prefsMap = { ...s.visualWorkspacePrefs };
            if (prefsMap[activeId]) {
              prefsMap[nextActiveId] = prefsMap[activeId]!;
              delete prefsMap[activeId];
            }
            return {
              library: [...s.library, lib],
              visuals: s.visuals.map((v) =>
                v.id === activeId
                  ? { id: nextActiveId, mediaId: lib.id }
                  : v
              ),
              activeVisualId: nextActiveId,
              visualWorkspacePrefs: prefsMap,
            };
          }
          return {
            library: [...s.library, lib],
            visuals: s.visuals.map((v) =>
              v.id === activeId ? { ...v, mediaId: lib.id } : v
            ),
            activeVisualId: activeId,
            visualWorkspacePrefs: s.visualWorkspacePrefs,
          };
        }

        const newVisuals: MockupVisualSlot[] = additions.map((lib) => ({
          id: crypto.randomUUID(),
          mediaId: lib.id,
        }));

        const prefsMap = { ...s.visualWorkspacePrefs };
        if (s.activeVisualId) {
          prefsMap[s.activeVisualId] = inheritPrefs;
        }
        for (const nv of newVisuals) {
          prefsMap[nv.id] = inheritPrefs;
        }

        return {
          library: [...s.library, ...additions],
          visuals: [...s.visuals, ...newVisuals],
          activeVisualId: newVisuals[newVisuals.length - 1]!.id,
          visualWorkspacePrefs: prefsMap,
        };
      });
    },
    [frame]
  );

  const setActiveVisualId = useCallback(
    (id: string | null) => {
      setState((s) => {
        const prefsMap = { ...s.visualWorkspacePrefs };
        if (s.activeVisualId != null && id !== s.activeVisualId) {
          prefsMap[s.activeVisualId] = captureVisualWorkspacePrefs(frame);
        }
        return {
          ...s,
          visualWorkspacePrefs: prefsMap,
          activeVisualId: id,
        };
      });
    },
    [frame]
  );

  const addEmptyVisual = useCallback(() => {
    const snap = captureVisualWorkspacePrefs(frame);
    setState((s) => {
      const prefsMap = { ...s.visualWorkspacePrefs };
      if (s.activeVisualId) {
        prefsMap[s.activeVisualId] = snap;
      }
      const id = crypto.randomUUID();
      prefsMap[id] = DEFAULT_NEW_VISUAL_WORKSPACE_PREFS;
      return {
        ...s,
        visualWorkspacePrefs: prefsMap,
        visuals: [...s.visuals, { id, mediaId: null }],
        activeVisualId: id,
      };
    });
  }, [frame]);

  const assignMediaToActiveVisual = useCallback((libraryItemId: string) => {
    setState((s) => {
      if (!s.library.some((m) => m.id === libraryItemId)) return s;
      if (!s.activeVisualId) return s;
      return {
        ...s,
        visuals: s.visuals.map((v) =>
          v.id === s.activeVisualId
            ? { ...v, mediaId: libraryItemId }
            : v
        ),
      };
    });
  }, []);

  const updateVisualLabel = useCallback((visualId: string, label: string) => {
    setState((s) => {
      const trimmed = label.trim();
      return {
        ...s,
        visuals: s.visuals.map((v) => {
          if (v.id !== visualId) return v;
          if (trimmed === "") {
            const { label: _removed, ...rest } = v;
            return rest as MockupVisualSlot;
          }
          return { ...v, label: trimmed };
        }),
      };
    });
  }, []);

  const removeLibraryItem = useCallback((libraryItemId: string) => {
    setState((s) => {
      const target = s.library.find((x) => x.id === libraryItemId);
      if (target) revokeIfBlobUrl(target.url);
      const nextLibrary = s.library.filter((x) => x.id !== libraryItemId);
      const nextVisuals = s.visuals.map((v) =>
        v.mediaId === libraryItemId ? { ...v, mediaId: null } : v
      );
      return {
        ...s,
        library: nextLibrary,
        visuals: nextVisuals,
        activeVisualId: s.activeVisualId,
      };
    });
  }, []);

  const removeVisual = useCallback((visualId: string) => {
    setState((s) => {
      if (s.visuals.length <= 1) return s;
      const nextVisuals = s.visuals.filter((v) => v.id !== visualId);
      let nextActive = s.activeVisualId;
      if (nextActive === visualId) {
        nextActive = nextVisuals[nextVisuals.length - 1]!.id;
      }
      const prefsMap = { ...s.visualWorkspacePrefs };
      delete prefsMap[visualId];
      return {
        ...s,
        visuals: nextVisuals,
        activeVisualId: nextActive,
        visualWorkspacePrefs: prefsMap,
      };
    });
  }, []);

  const createNewVisualFromItem = useCallback(
    async (libraryItemId: string) => {
      const snap = captureVisualWorkspacePrefs(frame);
      setState((s) => {
        if (!s.library.some((x) => x.id === libraryItemId)) return s;
        const id = crypto.randomUUID();
        const prefsMap = { ...s.visualWorkspacePrefs };
        if (s.activeVisualId) prefsMap[s.activeVisualId] = snap;
        prefsMap[id] = snap;
        return {
          ...s,
          visualWorkspacePrefs: prefsMap,
          visuals: [...s.visuals, { id, mediaId: libraryItemId }],
          activeVisualId: id,
        };
      });
    },
    [frame]
  );

  const replaceWorkspaceMedia = useCallback(
    (
      nextLibrary: MockupLibraryItem[],
      nextVisuals: MockupVisualSlot[],
      nextActiveVisualId: string | null,
      frameSeed?: VisualWorkspacePrefs | null,
      visualWorkspacePrefsOverride?: Record<string, VisualWorkspacePrefs> | null
    ) => {
      setState((s) => {
        const nextIds = new Set(nextLibrary.map((x) => x.id));
        for (const item of s.library) {
          if (!nextIds.has(item.id)) {
            revokeIfBlobUrl(item.url);
          }
        }

        let visuals = nextVisuals.map((x) => ({ ...x }));
        let av = nextActiveVisualId;

        if (visuals.length === 0) {
          const vid = crypto.randomUUID();
          visuals = [{ id: vid, mediaId: null }];
          av = vid;
        } else {
          if (av && !visuals.some((v) => v.id === av)) {
            av = visuals[visuals.length - 1]!.id;
          }
          if (!av) {
            av = visuals[visuals.length - 1]!.id;
          }
        }

        let nextPrefs: Record<string, VisualWorkspacePrefs>;
        if (
          visualWorkspacePrefsOverride &&
          Object.keys(visualWorkspacePrefsOverride).length > 0
        ) {
          nextPrefs = Object.fromEntries(
            visuals.map((v) => [
              v.id,
              visualWorkspacePrefsOverride[v.id] ??
                DEFAULT_NEW_VISUAL_WORKSPACE_PREFS,
            ])
          );
        } else if (frameSeed != null) {
          nextPrefs = Object.fromEntries(
            visuals.map((v) => [v.id, { ...frameSeed }])
          );
        } else {
          nextPrefs = Object.fromEntries(
            visuals.map((v) => [
              v.id,
              s.visualWorkspacePrefs[v.id] ??
                DEFAULT_NEW_VISUAL_WORKSPACE_PREFS,
            ])
          );
        }

        return {
          library: nextLibrary.map((x) => ({ ...x })),
          visuals,
          activeVisualId: av,
          visualWorkspacePrefs: nextPrefs,
        };
      });
    },
    []
  );

  const activeVisual = useMemo(() => {
    if (!activeVisualId) return null;
    return visuals.find((v) => v.id === activeVisualId) ?? null;
  }, [visuals, activeVisualId]);

  const activeItem = useMemo(() => {
    if (!activeVisual?.mediaId) return null;
    return library.find((m) => m.id === activeVisual.mediaId) ?? null;
  }, [library, activeVisual]);

  const value = useMemo(
    () => ({
      library,
      visuals,
      activeVisualId,
      activeVisual,
      activeItem,
      addLibraryFromFileList,
      addFromFileList,
      setActiveVisualId,
      addEmptyVisual,
      assignMediaToActiveVisual,
      updateVisualLabel,
      removeLibraryItem,
      removeVisual,
      createNewVisualFromItem,
      hydrateFromSaved,
      replaceWorkspaceMedia,
      visualWorkspacePrefs,
    }),
    [
      library,
      visuals,
      activeVisualId,
      activeVisual,
      activeItem,
      visualWorkspacePrefs,
      addLibraryFromFileList,
      addFromFileList,
      setActiveVisualId,
      addEmptyVisual,
      assignMediaToActiveVisual,
      updateVisualLabel,
      removeLibraryItem,
      removeVisual,
      createNewVisualFromItem,
      hydrateFromSaved,
      replaceWorkspaceMedia,
    ]
  );

  return (
    <MockupMediaContext.Provider value={value}>
      {children}
    </MockupMediaContext.Provider>
  );
}

export function useMockupMedia() {
  const ctx = useContext(MockupMediaContext);
  if (!ctx) {
    throw new Error("useMockupMedia must be used within MockupMediaProvider");
  }
  return ctx;
}
