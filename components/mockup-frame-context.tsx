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

import type { FrameAspectPresetId } from "@/lib/mockup-aspect";
import type {
  CanvasBackgroundMode,
  PersistedCanvasBackground,
} from "@/lib/mockup-canvas-background";
import {
  DEFAULT_CANVAS_NOISE_COLOR,
  DEFAULT_CANVAS_NOISE_COLOR_OPACITY,
  DEFAULT_CANVAS_SOLID_COLOR,
} from "@/lib/mockup-canvas-background";
import type { CanvasNoiseBlendModeId } from "@/lib/mockup-noise-blend";
import {
  DEFAULT_CANVAS_NOISE_BLEND_MODE,
  parseCanvasNoiseBlendMode,
} from "@/lib/mockup-noise-blend";
import type { CanvasNoiseTypeId } from "@/lib/mockup-noise";
import {
  DEFAULT_CANVAS_NOISE_TYPE,
  parseCanvasNoiseType,
} from "@/lib/mockup-noise";
import type {
  PersistedScreenshotStyle,
  ScreenshotBorderPosition,
  ScreenshotStyleId,
} from "@/lib/mockup-screenshot-style";
import {
  clampScreenshotBorderOpacity,
  clampScreenshotBorderWeight,
  DEFAULT_SCREENSHOT_BORDER_COLOR,
  DEFAULT_SCREENSHOT_BORDER_COLOR_OPACITY,
  DEFAULT_SCREENSHOT_BORDER_POSITION,
  DEFAULT_SCREENSHOT_BORDER_WEIGHT,
  DEFAULT_SCREENSHOT_OUTLINE_COLOR,
  DEFAULT_SCREENSHOT_OUTLINE_COLOR_OPACITY,
  DEFAULT_SCREENSHOT_STYLE,
  parseScreenshotBorderPosition,
  parseScreenshotStyle,
} from "@/lib/mockup-screenshot-style";

function clampPercent(n: number | undefined): number {
  if (n == null || Number.isNaN(n)) return 0;
  return Math.min(100, Math.max(0, Math.round(n)));
}

type MockupFrameContextValue = {
  aspectPreset: FrameAspectPresetId;
  setAspectPreset: (id: FrameAspectPresetId) => void;
  canvasBackgroundMode: CanvasBackgroundMode;
  setCanvasBackgroundMode: (mode: CanvasBackgroundMode) => void;
  canvasSolidColor: string;
  setCanvasSolidColor: (color: string) => void;
  canvasBackgroundImageUrl: string | null;
  setCanvasBackgroundImageFromFile: (file: File | null) => void;
  canvasNoisePercent: number;
  setCanvasNoisePercent: (value: number) => void;
  canvasBlurPercent: number;
  setCanvasBlurPercent: (value: number) => void;
  canvasNoiseType: CanvasNoiseTypeId;
  setCanvasNoiseType: (id: CanvasNoiseTypeId) => void;
  canvasNoiseColor: string;
  setCanvasNoiseColor: (hex: string) => void;
  canvasNoiseColorOpacity: number;
  setCanvasNoiseColorOpacity: (value: number) => void;
  canvasNoiseBlendMode: CanvasNoiseBlendModeId;
  setCanvasNoiseBlendMode: (id: CanvasNoiseBlendModeId) => void;
  /** While hovering blend menu items — temporary `mix-blend-mode` on the noise layer. */
  canvasNoiseBlendModePreview: CanvasNoiseBlendModeId | null;
  setCanvasNoiseBlendModePreview: (
    id: CanvasNoiseBlendModeId | null
  ) => void;
  hydrateCanvasBackground: (
    payload: PersistedCanvasBackground | null | undefined
  ) => void;
  /** Device PNG overlay (`null` = plain canvas). */
  deviceTemplateId: string | null;
  setDeviceTemplateId: (id: string | null) => void;
  /** Screenshot styling (only applied when no device frame is selected). */
  screenshotStyle: ScreenshotStyleId;
  setScreenshotStyle: (id: ScreenshotStyleId) => void;
  screenshotBorderColor: string;
  setScreenshotBorderColor: (hex: string) => void;
  screenshotBorderColorOpacity: number;
  setScreenshotBorderColorOpacity: (value: number) => void;
  screenshotBorderPosition: ScreenshotBorderPosition;
  setScreenshotBorderPosition: (position: ScreenshotBorderPosition) => void;
  screenshotBorderWeight: number;
  setScreenshotBorderWeight: (value: number) => void;
  screenshotOutlineColor: string;
  setScreenshotOutlineColor: (hex: string) => void;
  screenshotOutlineColorOpacity: number;
  setScreenshotOutlineColorOpacity: (value: number) => void;
  hydrateScreenshotStyle: (
    payload: PersistedScreenshotStyle | null | undefined
  ) => void;
};

const MockupFrameContext = createContext<MockupFrameContextValue | null>(null);

function revokeIfBlob(url: string | null) {
  if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
}

export function MockupFrameProvider({ children }: { children: ReactNode }) {
  const [aspectPreset, setAspectPreset] =
    useState<FrameAspectPresetId>("square-1-1");

  const [canvasBackgroundMode, setCanvasBackgroundMode] =
    useState<CanvasBackgroundMode>("solid");
  const [canvasSolidColor, setCanvasSolidColor] = useState(
    DEFAULT_CANVAS_SOLID_COLOR
  );
  const [canvasBackgroundImageUrl, setCanvasBackgroundImageUrlState] = useState<
    string | null
  >(null);
  const [canvasNoisePercent, setCanvasNoisePercent] = useState(0);
  const [canvasBlurPercent, setCanvasBlurPercent] = useState(0);
  const [canvasNoiseType, setCanvasNoiseType] =
    useState<CanvasNoiseTypeId>(DEFAULT_CANVAS_NOISE_TYPE);
  const [canvasNoiseColor, setCanvasNoiseColor] = useState(
    DEFAULT_CANVAS_NOISE_COLOR
  );
  const [canvasNoiseColorOpacity, setCanvasNoiseColorOpacity] = useState(
    DEFAULT_CANVAS_NOISE_COLOR_OPACITY
  );
  const [canvasNoiseBlendMode, setCanvasNoiseBlendMode] =
    useState<CanvasNoiseBlendModeId>(DEFAULT_CANVAS_NOISE_BLEND_MODE);
  const [canvasNoiseBlendModePreview, setCanvasNoiseBlendModePreview] =
    useState<CanvasNoiseBlendModeId | null>(null);

  const [deviceTemplateId, setDeviceTemplateId] = useState<string | null>(null);

  const [screenshotStyle, setScreenshotStyleState] =
    useState<ScreenshotStyleId>(DEFAULT_SCREENSHOT_STYLE);
  const [screenshotBorderColor, setScreenshotBorderColorState] = useState(
    DEFAULT_SCREENSHOT_BORDER_COLOR
  );
  const [screenshotBorderColorOpacity, setScreenshotBorderColorOpacityState] =
    useState(DEFAULT_SCREENSHOT_BORDER_COLOR_OPACITY);
  const [screenshotBorderPosition, setScreenshotBorderPositionState] =
    useState<ScreenshotBorderPosition>(DEFAULT_SCREENSHOT_BORDER_POSITION);
  const [screenshotBorderWeight, setScreenshotBorderWeightState] = useState(
    DEFAULT_SCREENSHOT_BORDER_WEIGHT
  );
  const [screenshotOutlineColor, setScreenshotOutlineColorState] = useState(
    DEFAULT_SCREENSHOT_OUTLINE_COLOR
  );
  const [screenshotOutlineColorOpacity, setScreenshotOutlineColorOpacityState] =
    useState(DEFAULT_SCREENSHOT_OUTLINE_COLOR_OPACITY);

  const setScreenshotStyle = useCallback((id: ScreenshotStyleId) => {
    setScreenshotStyleState(parseScreenshotStyle(id));
  }, []);
  const setScreenshotBorderColor = useCallback((hex: string) => {
    const trimmed = hex.trim();
    if (/^#[0-9A-Fa-f]{6}$/.test(trimmed)) {
      setScreenshotBorderColorState(trimmed.toUpperCase());
    } else {
      setScreenshotBorderColorState(DEFAULT_SCREENSHOT_BORDER_COLOR);
    }
  }, []);
  const setScreenshotBorderColorOpacity = useCallback((value: number) => {
    setScreenshotBorderColorOpacityState(clampScreenshotBorderOpacity(value));
  }, []);
  const setScreenshotBorderPosition = useCallback(
    (position: ScreenshotBorderPosition) => {
      setScreenshotBorderPositionState(parseScreenshotBorderPosition(position));
    },
    []
  );
  const setScreenshotBorderWeight = useCallback((value: number) => {
    setScreenshotBorderWeightState(clampScreenshotBorderWeight(value));
  }, []);
  const setScreenshotOutlineColor = useCallback((hex: string) => {
    const trimmed = hex.trim();
    if (/^#[0-9A-Fa-f]{6}$/.test(trimmed)) {
      setScreenshotOutlineColorState(trimmed.toUpperCase());
    } else {
      setScreenshotOutlineColorState(DEFAULT_SCREENSHOT_OUTLINE_COLOR);
    }
  }, []);
  const setScreenshotOutlineColorOpacity = useCallback((value: number) => {
    setScreenshotOutlineColorOpacityState(
      clampScreenshotBorderOpacity(value)
    );
  }, []);

  const hydrateScreenshotStyle = useCallback(
    (payload: PersistedScreenshotStyle | null | undefined) => {
      if (!payload) {
        setScreenshotStyleState(DEFAULT_SCREENSHOT_STYLE);
        setScreenshotBorderColorState(DEFAULT_SCREENSHOT_BORDER_COLOR);
        setScreenshotBorderColorOpacityState(
          DEFAULT_SCREENSHOT_BORDER_COLOR_OPACITY
        );
        setScreenshotBorderPositionState(DEFAULT_SCREENSHOT_BORDER_POSITION);
        setScreenshotBorderWeightState(DEFAULT_SCREENSHOT_BORDER_WEIGHT);
        setScreenshotOutlineColorState(DEFAULT_SCREENSHOT_OUTLINE_COLOR);
        setScreenshotOutlineColorOpacityState(
          DEFAULT_SCREENSHOT_OUTLINE_COLOR_OPACITY
        );
        return;
      }
      setScreenshotStyleState(parseScreenshotStyle(payload.style));
      const rawColor = payload.borderColor?.trim();
      setScreenshotBorderColorState(
        rawColor && /^#[0-9A-Fa-f]{6}$/.test(rawColor)
          ? rawColor.toUpperCase()
          : DEFAULT_SCREENSHOT_BORDER_COLOR
      );
      setScreenshotBorderColorOpacityState(
        clampScreenshotBorderOpacity(payload.borderColorOpacity)
      );
      setScreenshotBorderPositionState(
        parseScreenshotBorderPosition(payload.borderPosition)
      );
      setScreenshotBorderWeightState(
        clampScreenshotBorderWeight(payload.borderWeight)
      );
      const rawOutlineColor = payload.outlineColor?.trim();
      setScreenshotOutlineColorState(
        rawOutlineColor && /^#[0-9A-Fa-f]{6}$/.test(rawOutlineColor)
          ? rawOutlineColor.toUpperCase()
          : DEFAULT_SCREENSHOT_OUTLINE_COLOR
      );
      setScreenshotOutlineColorOpacityState(
        clampScreenshotBorderOpacity(payload.outlineColorOpacity)
      );
    },
    []
  );

  const canvasBgImageUrlRef = useRef<string | null>(null);

  const setCanvasBgImageUrl = useCallback((next: string | null) => {
    revokeIfBlob(canvasBgImageUrlRef.current);
    canvasBgImageUrlRef.current = next;
    setCanvasBackgroundImageUrlState(next);
  }, []);

  const setCanvasBackgroundImageFromFile = useCallback(
    (file: File | null) => {
      if (!file || !file.type.startsWith("image/")) {
        setCanvasBgImageUrl(null);
        return;
      }
      /**
       * Use a data URL, not `blob:` — blob URLs are revoked when switching visuals
       * or hydrating another visual’s prefs (`setCanvasBgImageUrl(null)`), but
       * `visualWorkspacePrefs` still held the old blob string, so the image vanished.
       */
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === "string") {
          setCanvasBgImageUrl(result);
        }
      };
      reader.onerror = () => {
        setCanvasBgImageUrl(null);
      };
      reader.readAsDataURL(file);
    },
    [setCanvasBgImageUrl]
  );

  const hydrateCanvasBackground = useCallback(
    (payload: PersistedCanvasBackground | null | undefined) => {
      setCanvasNoiseBlendModePreview(null);
      if (!payload?.mode) {
        setCanvasBackgroundMode("solid");
        setCanvasSolidColor(DEFAULT_CANVAS_SOLID_COLOR);
        setCanvasBgImageUrl(null);
        setCanvasNoisePercent(0);
        setCanvasBlurPercent(0);
        setCanvasNoiseType(DEFAULT_CANVAS_NOISE_TYPE);
        setCanvasNoiseColor(DEFAULT_CANVAS_NOISE_COLOR);
        setCanvasNoiseColorOpacity(DEFAULT_CANVAS_NOISE_COLOR_OPACITY);
        setCanvasNoiseBlendMode(DEFAULT_CANVAS_NOISE_BLEND_MODE);
        return;
      }
      setCanvasBackgroundMode(payload.mode);
      setCanvasSolidColor(
        payload.solidColor?.trim() || DEFAULT_CANVAS_SOLID_COLOR
      );
      setCanvasNoisePercent(clampPercent(payload.noisePercent));
      setCanvasBlurPercent(clampPercent(payload.blurPercent));
      setCanvasNoiseType(parseCanvasNoiseType(payload.noiseType));
      {
        const raw = payload.noiseColor?.trim();
        setCanvasNoiseColor(
          raw && /^#[0-9A-Fa-f]{6}$/.test(raw)
            ? raw.toUpperCase()
            : DEFAULT_CANVAS_NOISE_COLOR
        );
      }
      setCanvasNoiseColorOpacity(
        payload.noiseColorOpacity != null &&
          !Number.isNaN(Number(payload.noiseColorOpacity))
          ? clampPercent(payload.noiseColorOpacity)
          : DEFAULT_CANVAS_NOISE_COLOR_OPACITY
      );
      setCanvasNoiseBlendMode(parseCanvasNoiseBlendMode(payload.noiseBlendMode));
      if (payload.mode === "image" && payload.imageDataUrl?.trim()) {
        setCanvasBgImageUrl(payload.imageDataUrl.trim());
      } else {
        setCanvasBgImageUrl(null);
      }
    },
    [setCanvasBgImageUrl]
  );

  useEffect(() => {
    return () => {
      revokeIfBlob(canvasBgImageUrlRef.current);
    };
  }, []);

  const value = useMemo(
    () => ({
      aspectPreset,
      setAspectPreset,
      canvasBackgroundMode,
      setCanvasBackgroundMode,
      canvasSolidColor,
      setCanvasSolidColor,
      canvasBackgroundImageUrl,
      setCanvasBackgroundImageFromFile,
      canvasNoisePercent,
      setCanvasNoisePercent,
      canvasBlurPercent,
      setCanvasBlurPercent,
      canvasNoiseType,
      setCanvasNoiseType,
      canvasNoiseColor,
      setCanvasNoiseColor,
      canvasNoiseColorOpacity,
      setCanvasNoiseColorOpacity,
      canvasNoiseBlendMode,
      setCanvasNoiseBlendMode,
      canvasNoiseBlendModePreview,
      setCanvasNoiseBlendModePreview,
      hydrateCanvasBackground,
      deviceTemplateId,
      setDeviceTemplateId,
      screenshotStyle,
      setScreenshotStyle,
      screenshotBorderColor,
      setScreenshotBorderColor,
      screenshotBorderColorOpacity,
      setScreenshotBorderColorOpacity,
      screenshotBorderPosition,
      setScreenshotBorderPosition,
      screenshotBorderWeight,
      setScreenshotBorderWeight,
      screenshotOutlineColor,
      setScreenshotOutlineColor,
      screenshotOutlineColorOpacity,
      setScreenshotOutlineColorOpacity,
      hydrateScreenshotStyle,
    }),
    [
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
      canvasNoiseBlendModePreview,
      deviceTemplateId,
      setCanvasBackgroundImageFromFile,
      hydrateCanvasBackground,
      screenshotStyle,
      setScreenshotStyle,
      screenshotBorderColor,
      setScreenshotBorderColor,
      screenshotBorderColorOpacity,
      setScreenshotBorderColorOpacity,
      screenshotBorderPosition,
      setScreenshotBorderPosition,
      screenshotBorderWeight,
      setScreenshotBorderWeight,
      screenshotOutlineColor,
      setScreenshotOutlineColor,
      screenshotOutlineColorOpacity,
      setScreenshotOutlineColorOpacity,
      hydrateScreenshotStyle,
    ]
  );

  return (
    <MockupFrameContext.Provider value={value}>
      {children}
    </MockupFrameContext.Provider>
  );
}

export function useMockupFrame() {
  const ctx = useContext(MockupFrameContext);
  if (!ctx) {
    throw new Error("useMockupFrame must be used within MockupFrameProvider");
  }
  return ctx;
}
