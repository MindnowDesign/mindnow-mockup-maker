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
  PersistedCanvasImageBaseline,
  PersistedCanvasImageLayer,
  PersistedCanvasImageRect,
} from "@/lib/mockup-workspace-snapshot";
import type {
  CanvasBackgroundMode,
  PersistedCanvasBackground,
} from "@/lib/mockup-canvas-background";
import { isValidCanvasBackgroundTemplateId } from "@/lib/canvas-background-template-id";
import {
  DEFAULT_CANVAS_MOOD_SHADOW_PLACEMENT,
  isCanvasMoodShadowTemplateId,
  normalizeCanvasMoodShadowTemplateId,
  parseCanvasMoodShadowPlacement,
  type CanvasMoodShadowPlacement,
} from "@/lib/canvas-mood-shadow-templates";
import {
  normalizeGradientBlendModesByTemplate,
  normalizeTemplateFillBlendModes,
} from "@/lib/canvas-gradient-fill-blend";
import {
  normalizeGradientOpacitiesByTemplate,
  normalizeTemplateFillOpacities,
  resolveActiveTemplateFillOpacities,
} from "@/lib/canvas-gradient-fill-opacity";
import {
  normalizeGradientFillHex,
  normalizeGradientFillsByTemplate,
  resolveActiveGradientFillHex,
  templateSupportsEditableGradientFills,
} from "@/lib/canvas-gradient-1-fill";
import {
  DEFAULT_CANVAS_NOISE_COLOR,
  DEFAULT_CANVAS_NOISE_COLOR_OPACITY,
  DEFAULT_CANVAS_OVERLAY_SHADOW_OPACITY,
  DEFAULT_CANVAS_SOLID_COLOR,
} from "@/lib/mockup-canvas-background";
import {
  clampCanvasDitherColorSteps,
  clampCanvasDitherSize,
  DEFAULT_CANVAS_DITHER_COLOR_BACK,
  DEFAULT_CANVAS_DITHER_COLOR_FRONT,
  DEFAULT_CANVAS_DITHER_COLOR_HIGHLIGHT,
  DEFAULT_CANVAS_DITHER_COLOR_STEPS,
  DEFAULT_CANVAS_DITHER_ENABLED,
  DEFAULT_CANVAS_DITHER_INVERTED,
  DEFAULT_CANVAS_DITHER_ORIGINAL_COLORS,
  DEFAULT_CANVAS_DITHER_SIZE,
  DEFAULT_CANVAS_DITHER_TYPE,
  normalizeDitherHex,
  parseCanvasDitherType,
  type CanvasDitherTypeId,
} from "@/lib/canvas-dither";
import {
  clampCanvasHalftoneContrast,
  clampCanvasHalftoneRadius,
  clampCanvasHalftoneSize,
  DEFAULT_CANVAS_HALFTONE_COLOR_BACK,
  DEFAULT_CANVAS_HALFTONE_COLOR_FRONT,
  DEFAULT_CANVAS_HALFTONE_CONTRAST,
  DEFAULT_CANVAS_HALFTONE_ENABLED,
  DEFAULT_CANVAS_HALFTONE_GRID,
  DEFAULT_CANVAS_HALFTONE_INVERTED,
  DEFAULT_CANVAS_HALFTONE_ORIGINAL_COLORS,
  DEFAULT_CANVAS_HALFTONE_RADIUS,
  DEFAULT_CANVAS_HALFTONE_SIZE,
  DEFAULT_CANVAS_HALFTONE_TYPE,
  normalizeHalftoneHex,
  parseCanvasHalftoneGrid,
  parseCanvasHalftoneType,
  type CanvasHalftoneGridId,
  type CanvasHalftoneTypeId,
} from "@/lib/canvas-halftone";
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
  ScreenshotCornerType,
  ScreenshotStyleId,
} from "@/lib/mockup-screenshot-style";
import {
  DEFAULT_FRAME_SHADOW_PRESET,
  defaultFrameShadowNumbers,
  FRAME_SHADOW_PRESET_SPECS,
  type FrameShadowPresetId,
  type PersistedFrameShadow,
  normalizePersistedFrameShadow,
} from "@/lib/mockup-frame-shadow";
import {
  clampScreenshotBorderOpacity,
  clampScreenshotBorderWeight,
  clampScreenshotCornerRadius,
  clampScreenshotGlassFramePadding,
  DEFAULT_SCREENSHOT_BORDER_COLOR,
  DEFAULT_SCREENSHOT_GLASS_FRAME_PADDING,
  DEFAULT_SCREENSHOT_BORDER_COLOR_OPACITY,
  DEFAULT_SCREENSHOT_BORDER_POSITION,
  DEFAULT_SCREENSHOT_BORDER_WEIGHT,
  DEFAULT_SCREENSHOT_CORNER_RADIUS,
  DEFAULT_SCREENSHOT_CORNER_TYPE,
  DEFAULT_SCREENSHOT_OUTLINE_COLOR,
  DEFAULT_SCREENSHOT_OUTLINE_COLOR_OPACITY,
  DEFAULT_SCREENSHOT_STYLE,
  parseScreenshotBorderPosition,
  parseScreenshotCornerType,
  parseScreenshotStyle,
} from "@/lib/mockup-screenshot-style";
import { normalizeBrowserUrl } from "@/lib/mockup-browser-templates";
import {
  MOCKUP_SCALE_DEFAULT,
  clampMockupScale,
} from "@/lib/mockup-canvas-transform";

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
  canvasGradientTemplateId: string | null;
  setCanvasGradientTemplateId: (id: string | null) => void;
  /** Active template fills (CSS var keys → `#RRGGBB`). */
  canvasGradientFillHex: Record<string, string>;
  /** Per-template fill overrides for editable gradient presets. */
  canvasGradientFillsByTemplate: Record<string, Record<string, string>>;
  patchCanvasGradientFillKey: (key: string, hex: string) => void;
  canvasGradientFillOpacity: Record<string, number>;
  canvasGradientOpacitiesByTemplate: Record<string, Record<string, number>>;
  /** @internal Legacy blend modes — kept for snapshot compatibility. */
  canvasGradientBlendModesByTemplate: Record<
    string,
    Record<string, import("@/lib/canvas-gradient-fill-blend").TemplateFillBlendModeId>
  >;
  patchCanvasGradientFillOpacity: (key: string, percent: number) => void;
  resetCanvasGradientFillToDefaults: () => void;
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
  canvasOverlayShadowId: string | null;
  setCanvasOverlayShadowId: (id: string | null) => void;
  canvasOverlayShadowOpacity: number;
  setCanvasOverlayShadowOpacity: (value: number) => void;
  canvasOverlayShadowPlacement: CanvasMoodShadowPlacement;
  setCanvasOverlayShadowPlacement: (placement: CanvasMoodShadowPlacement) => void;
  canvasDitherEnabled: boolean;
  setCanvasDitherEnabled: (value: boolean) => void;
  canvasDitherColorBack: string;
  setCanvasDitherColorBack: (hex: string) => void;
  canvasDitherColorFront: string;
  setCanvasDitherColorFront: (hex: string) => void;
  canvasDitherColorHighlight: string;
  setCanvasDitherColorHighlight: (hex: string) => void;
  canvasDitherOriginalColors: boolean;
  setCanvasDitherOriginalColors: (value: boolean) => void;
  canvasDitherInverted: boolean;
  setCanvasDitherInverted: (value: boolean) => void;
  canvasDitherType: CanvasDitherTypeId;
  setCanvasDitherType: (id: CanvasDitherTypeId) => void;
  canvasDitherSize: number;
  setCanvasDitherSize: (value: number) => void;
  canvasDitherColorSteps: number;
  setCanvasDitherColorSteps: (value: number) => void;
  canvasHalftoneEnabled: boolean;
  setCanvasHalftoneEnabled: (value: boolean) => void;
  canvasHalftoneColorBack: string;
  setCanvasHalftoneColorBack: (hex: string) => void;
  canvasHalftoneColorFront: string;
  setCanvasHalftoneColorFront: (hex: string) => void;
  canvasHalftoneOriginalColors: boolean;
  setCanvasHalftoneOriginalColors: (value: boolean) => void;
  canvasHalftoneInverted: boolean;
  setCanvasHalftoneInverted: (value: boolean) => void;
  canvasHalftoneType: CanvasHalftoneTypeId;
  setCanvasHalftoneType: (id: CanvasHalftoneTypeId) => void;
  canvasHalftoneGrid: CanvasHalftoneGridId;
  setCanvasHalftoneGrid: (id: CanvasHalftoneGridId) => void;
  canvasHalftoneSize: number;
  setCanvasHalftoneSize: (value: number) => void;
  canvasHalftoneRadius: number;
  setCanvasHalftoneRadius: (value: number) => void;
  canvasHalftoneContrast: number;
  setCanvasHalftoneContrast: (value: number) => void;
  hydrateCanvasBackground: (
    payload: PersistedCanvasBackground | null | undefined
  ) => void;
  /** Device PNG overlay (`null` = plain canvas). */
  deviceTemplateId: string | null;
  setDeviceTemplateId: (id: string | null) => void;
  /** Address bar label for browser chrome templates. */
  browserUrl: string;
  setBrowserUrl: (url: string) => void;
  /** Custom favicon (data URL) for Chrome browser templates. */
  browserFaviconUrl: string | null;
  setBrowserFaviconUrl: (url: string | null) => void;
  setBrowserFaviconFromFile: (file: File | null) => void;
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
  screenshotCornerType: ScreenshotCornerType;
  setScreenshotCornerType: (type: ScreenshotCornerType) => void;
  screenshotCornerRadius: number;
  setScreenshotCornerRadius: (value: number) => void;
  screenshotGlassFramePadding: number;
  setScreenshotGlassFramePadding: (value: number) => void;
  hydrateScreenshotStyle: (
    payload: PersistedScreenshotStyle | null | undefined
  ) => void;
  frameShadowPreset: FrameShadowPresetId;
  setFrameShadowPreset: (id: FrameShadowPresetId) => void;
  frameShadowOffsetX: number;
  setFrameShadowOffsetX: (value: number) => void;
  frameShadowOffsetY: number;
  setFrameShadowOffsetY: (value: number) => void;
  frameShadowBlur: number;
  setFrameShadowBlur: (value: number) => void;
  frameShadowSpread: number;
  setFrameShadowSpread: (value: number) => void;
  frameShadowColor: string;
  setFrameShadowColor: (hex: string) => void;
  frameShadowColorOpacity: number;
  setFrameShadowColorOpacity: (value: number) => void;
  hydrateFrameShadow: (
    payload: PersistedFrameShadow | null | undefined
  ) => void;
  /** Mockup content offset from canvas center (px). */
  mockupOffsetX: number;
  mockupOffsetY: number;
  mockupScale: number;
  setMockupOffset: (x: number, y: number) => void;
  setMockupScale: (scale: number) => void;
  hydrateMockupTransform: (x: number, y: number, scale: number) => void;
  /** Free-form image layers on the canvas (empty until canvas-image editor ships). */
  canvasLayers: PersistedCanvasImageLayer[];
  selectedCanvasLayerId: string | null;
  /** @deprecated Legacy single-image rect — use `canvasLayers`. */
  canvasImageRect: PersistedCanvasImageRect | null;
  /** @deprecated Legacy single-image baseline — use `canvasLayers`. */
  canvasImageBaseline: PersistedCanvasImageBaseline | null;
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
  const [canvasGradientTemplateId, setCanvasGradientTemplateIdState] = useState<
    string | null
  >(null);
  const [canvasGradientFillsByTemplate, setCanvasGradientFillsByTemplate] =
    useState<Record<string, Record<string, string>>>(() =>
      normalizeGradientFillsByTemplate(undefined)
    );
  const [canvasGradientBlendModesByTemplate, setCanvasGradientBlendModesByTemplate] =
    useState(() => normalizeGradientBlendModesByTemplate(undefined));

  const [canvasGradientOpacitiesByTemplate, setCanvasGradientOpacitiesByTemplate] =
    useState<Record<string, Record<string, number>>>(() =>
      normalizeGradientOpacitiesByTemplate(undefined)
    );

  const canvasGradientFillHex = useMemo(
    () =>
      resolveActiveGradientFillHex(
        canvasGradientTemplateId,
        canvasGradientFillsByTemplate
      ),
    [canvasGradientTemplateId, canvasGradientFillsByTemplate]
  );

  const canvasGradientFillOpacity = useMemo(
    () =>
      resolveActiveTemplateFillOpacities(
        canvasGradientTemplateId,
        canvasGradientOpacitiesByTemplate
      ),
    [canvasGradientTemplateId, canvasGradientOpacitiesByTemplate]
  );

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
  const [canvasOverlayShadowId, setCanvasOverlayShadowIdState] = useState<
    string | null
  >(null);
  const [canvasOverlayShadowOpacity, setCanvasOverlayShadowOpacityState] =
    useState(DEFAULT_CANVAS_OVERLAY_SHADOW_OPACITY);
  const [canvasOverlayShadowPlacement, setCanvasOverlayShadowPlacementState] =
    useState<CanvasMoodShadowPlacement>(DEFAULT_CANVAS_MOOD_SHADOW_PLACEMENT);

  const [canvasDitherEnabled, setCanvasDitherEnabled] = useState(
    DEFAULT_CANVAS_DITHER_ENABLED
  );
  const [canvasDitherColorBack, setCanvasDitherColorBackState] = useState(
    DEFAULT_CANVAS_DITHER_COLOR_BACK
  );
  const [canvasDitherColorFront, setCanvasDitherColorFrontState] = useState(
    DEFAULT_CANVAS_DITHER_COLOR_FRONT
  );
  const [canvasDitherColorHighlight, setCanvasDitherColorHighlightState] =
    useState(DEFAULT_CANVAS_DITHER_COLOR_HIGHLIGHT);
  const [canvasDitherOriginalColors, setCanvasDitherOriginalColors] = useState(
    DEFAULT_CANVAS_DITHER_ORIGINAL_COLORS
  );
  const [canvasDitherInverted, setCanvasDitherInverted] = useState(
    DEFAULT_CANVAS_DITHER_INVERTED
  );
  const [canvasDitherType, setCanvasDitherTypeState] =
    useState<CanvasDitherTypeId>(DEFAULT_CANVAS_DITHER_TYPE);
  const [canvasDitherSize, setCanvasDitherSizeState] = useState(
    DEFAULT_CANVAS_DITHER_SIZE
  );
  const [canvasDitherColorSteps, setCanvasDitherColorStepsState] = useState(
    DEFAULT_CANVAS_DITHER_COLOR_STEPS
  );

  const setCanvasDitherColorBack = useCallback((hex: string) => {
    setCanvasDitherColorBackState(
      normalizeDitherHex(hex, DEFAULT_CANVAS_DITHER_COLOR_BACK)
    );
  }, []);
  const setCanvasDitherColorFront = useCallback((hex: string) => {
    setCanvasDitherColorFrontState(
      normalizeDitherHex(hex, DEFAULT_CANVAS_DITHER_COLOR_FRONT)
    );
  }, []);
  const setCanvasDitherColorHighlight = useCallback((hex: string) => {
    setCanvasDitherColorHighlightState(
      normalizeDitherHex(hex, DEFAULT_CANVAS_DITHER_COLOR_HIGHLIGHT)
    );
  }, []);
  const setCanvasDitherType = useCallback((id: CanvasDitherTypeId) => {
    setCanvasDitherTypeState(parseCanvasDitherType(id));
  }, []);
  const setCanvasDitherSize = useCallback((value: number) => {
    setCanvasDitherSizeState(clampCanvasDitherSize(value));
  }, []);
  const setCanvasDitherColorSteps = useCallback((value: number) => {
    setCanvasDitherColorStepsState(clampCanvasDitherColorSteps(value));
  }, []);

  const [canvasHalftoneEnabled, setCanvasHalftoneEnabled] = useState(
    DEFAULT_CANVAS_HALFTONE_ENABLED
  );
  const [canvasHalftoneColorBack, setCanvasHalftoneColorBackState] = useState(
    DEFAULT_CANVAS_HALFTONE_COLOR_BACK
  );
  const [canvasHalftoneColorFront, setCanvasHalftoneColorFrontState] = useState(
    DEFAULT_CANVAS_HALFTONE_COLOR_FRONT
  );
  const [canvasHalftoneOriginalColors, setCanvasHalftoneOriginalColors] =
    useState(DEFAULT_CANVAS_HALFTONE_ORIGINAL_COLORS);
  const [canvasHalftoneInverted, setCanvasHalftoneInverted] = useState(
    DEFAULT_CANVAS_HALFTONE_INVERTED
  );
  const [canvasHalftoneType, setCanvasHalftoneTypeState] =
    useState<CanvasHalftoneTypeId>(DEFAULT_CANVAS_HALFTONE_TYPE);
  const [canvasHalftoneGrid, setCanvasHalftoneGridState] =
    useState<CanvasHalftoneGridId>(DEFAULT_CANVAS_HALFTONE_GRID);
  const [canvasHalftoneSize, setCanvasHalftoneSizeState] = useState(
    DEFAULT_CANVAS_HALFTONE_SIZE
  );
  const [canvasHalftoneRadius, setCanvasHalftoneRadiusState] = useState(
    DEFAULT_CANVAS_HALFTONE_RADIUS
  );
  const [canvasHalftoneContrast, setCanvasHalftoneContrastState] = useState(
    DEFAULT_CANVAS_HALFTONE_CONTRAST
  );

  const setCanvasHalftoneColorBack = useCallback((hex: string) => {
    setCanvasHalftoneColorBackState(
      normalizeHalftoneHex(hex, DEFAULT_CANVAS_HALFTONE_COLOR_BACK)
    );
  }, []);
  const setCanvasHalftoneColorFront = useCallback((hex: string) => {
    setCanvasHalftoneColorFrontState(
      normalizeHalftoneHex(hex, DEFAULT_CANVAS_HALFTONE_COLOR_FRONT)
    );
  }, []);
  const setCanvasHalftoneType = useCallback((id: CanvasHalftoneTypeId) => {
    setCanvasHalftoneTypeState(parseCanvasHalftoneType(id));
  }, []);
  const setCanvasHalftoneGrid = useCallback((id: CanvasHalftoneGridId) => {
    setCanvasHalftoneGridState(parseCanvasHalftoneGrid(id));
  }, []);
  const setCanvasHalftoneSize = useCallback((value: number) => {
    setCanvasHalftoneSizeState(clampCanvasHalftoneSize(value));
  }, []);
  const setCanvasHalftoneRadius = useCallback((value: number) => {
    setCanvasHalftoneRadiusState(clampCanvasHalftoneRadius(value));
  }, []);
  const setCanvasHalftoneContrast = useCallback((value: number) => {
    setCanvasHalftoneContrastState(clampCanvasHalftoneContrast(value));
  }, []);

  const [deviceTemplateId, setDeviceTemplateId] = useState<string | null>(null);
  const [browserUrl, setBrowserUrlState] = useState("");

  const setBrowserUrl = useCallback((url: string) => {
    setBrowserUrlState(normalizeBrowserUrl(url));
  }, []);

  const [browserFaviconUrl, setBrowserFaviconUrlState] = useState<string | null>(
    null
  );

  const setBrowserFaviconUrl = useCallback((url: string | null) => {
    setBrowserFaviconUrlState(url);
  }, []);

  const setBrowserFaviconFromFile = useCallback((file: File | null) => {
    if (!file || !file.type.startsWith("image/")) {
      setBrowserFaviconUrlState(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setBrowserFaviconUrlState(result);
      }
    };
    reader.onerror = () => {
      setBrowserFaviconUrlState(null);
    };
    reader.readAsDataURL(file);
  }, []);

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
  const [screenshotCornerType, setScreenshotCornerTypeState] =
    useState<ScreenshotCornerType>(DEFAULT_SCREENSHOT_CORNER_TYPE);
  const [screenshotCornerRadius, setScreenshotCornerRadiusState] = useState(
    DEFAULT_SCREENSHOT_CORNER_RADIUS
  );
  const [screenshotGlassFramePadding, setScreenshotGlassFramePaddingState] =
    useState(DEFAULT_SCREENSHOT_GLASS_FRAME_PADDING);

  const initialShadow = defaultFrameShadowNumbers();
  const [frameShadowPreset, setFrameShadowPresetState] =
    useState<FrameShadowPresetId>(DEFAULT_FRAME_SHADOW_PRESET);
  const [frameShadowOffsetX, setFrameShadowOffsetXState] = useState(
    initialShadow.offsetX
  );
  const [frameShadowOffsetY, setFrameShadowOffsetYState] = useState(
    initialShadow.offsetY
  );
  const [frameShadowBlur, setFrameShadowBlurState] = useState(initialShadow.blur);
  const [frameShadowSpread, setFrameShadowSpreadState] = useState(
    initialShadow.spread
  );
  const [frameShadowColor, setFrameShadowColorState] = useState(
    initialShadow.color
  );
  const [frameShadowColorOpacity, setFrameShadowColorOpacityState] = useState(
    initialShadow.colorOpacity
  );
  const [mockupOffsetX, setMockupOffsetXState] = useState(0);
  const [mockupOffsetY, setMockupOffsetYState] = useState(0);
  const [mockupScale, setMockupScaleState] = useState(MOCKUP_SCALE_DEFAULT);

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
  const setScreenshotCornerType = useCallback((type: ScreenshotCornerType) => {
    setScreenshotCornerTypeState(parseScreenshotCornerType(type));
  }, []);
  const setScreenshotCornerRadius = useCallback((value: number) => {
    setScreenshotCornerRadiusState(clampScreenshotCornerRadius(value));
  }, []);
  const setScreenshotGlassFramePadding = useCallback((value: number) => {
    setScreenshotGlassFramePaddingState(clampScreenshotGlassFramePadding(value));
  }, []);

  const setFrameShadowPreset = useCallback((id: FrameShadowPresetId) => {
    setFrameShadowPresetState(id);
    const spec = FRAME_SHADOW_PRESET_SPECS[id];
    setFrameShadowOffsetXState(spec.offsetX);
    setFrameShadowOffsetYState(spec.offsetY);
    setFrameShadowBlurState(spec.blur);
    setFrameShadowSpreadState(spec.spread);
    setFrameShadowColorState(spec.color);
    setFrameShadowColorOpacityState(spec.colorOpacity);
  }, []);

  const setFrameShadowOffsetX = useCallback((value: number) => {
    setFrameShadowPresetState("custom");
    setFrameShadowOffsetXState(
      Math.min(128, Math.max(-128, Math.round(value)))
    );
  }, []);
  const setFrameShadowOffsetY = useCallback((value: number) => {
    setFrameShadowPresetState("custom");
    setFrameShadowOffsetYState(
      Math.min(128, Math.max(-128, Math.round(value)))
    );
  }, []);
  const setFrameShadowBlur = useCallback((value: number) => {
    setFrameShadowPresetState("custom");
    setFrameShadowBlurState(Math.min(128, Math.max(0, Math.round(value))));
  }, []);
  const setFrameShadowSpread = useCallback((value: number) => {
    setFrameShadowPresetState("custom");
    setFrameShadowSpreadState(
      Math.min(64, Math.max(-64, Math.round(value)))
    );
  }, []);
  const setFrameShadowColor = useCallback((hex: string) => {
    setFrameShadowPresetState("custom");
    const trimmed = hex.trim();
    if (/^#[0-9A-Fa-f]{6}$/.test(trimmed)) {
      setFrameShadowColorState(trimmed.toUpperCase());
    } else {
      setFrameShadowColorState("#000000");
    }
  }, []);
  const setFrameShadowColorOpacity = useCallback((value: number) => {
    setFrameShadowPresetState("custom");
    setFrameShadowColorOpacityState(clampPercent(value));
  }, []);

  const setMockupOffset = useCallback((x: number, y: number) => {
    setMockupOffsetXState(Math.round(x));
    setMockupOffsetYState(Math.round(y));
  }, []);

  const setMockupScale = useCallback((scale: number) => {
    setMockupScaleState(clampMockupScale(scale));
  }, []);

  const hydrateMockupTransform = useCallback(
    (x: number, y: number, scale: number) => {
      setMockupOffsetXState(Math.round(x));
      setMockupOffsetYState(Math.round(y));
      setMockupScaleState(clampMockupScale(scale));
    },
    []
  );

  const hydrateFrameShadow = useCallback(
    (payload: PersistedFrameShadow | null | undefined) => {
      if (!payload) {
        const d = defaultFrameShadowNumbers();
        setFrameShadowPresetState(DEFAULT_FRAME_SHADOW_PRESET);
        setFrameShadowOffsetXState(d.offsetX);
        setFrameShadowOffsetYState(d.offsetY);
        setFrameShadowBlurState(d.blur);
        setFrameShadowSpreadState(d.spread);
        setFrameShadowColorState(d.color);
        setFrameShadowColorOpacityState(d.colorOpacity);
        return;
      }
      const { preset, numbers } = normalizePersistedFrameShadow(payload);
      setFrameShadowPresetState(preset);
      setFrameShadowOffsetXState(numbers.offsetX);
      setFrameShadowOffsetYState(numbers.offsetY);
      setFrameShadowBlurState(numbers.blur);
      setFrameShadowSpreadState(numbers.spread);
      setFrameShadowColorState(numbers.color);
      setFrameShadowColorOpacityState(numbers.colorOpacity);
    },
    []
  );

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
        setScreenshotCornerTypeState(DEFAULT_SCREENSHOT_CORNER_TYPE);
        setScreenshotCornerRadiusState(DEFAULT_SCREENSHOT_CORNER_RADIUS);
        setScreenshotGlassFramePaddingState(DEFAULT_SCREENSHOT_GLASS_FRAME_PADDING);
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
      setScreenshotCornerTypeState(
        parseScreenshotCornerType(payload.cornerType)
      );
      setScreenshotCornerRadiusState(
        clampScreenshotCornerRadius(payload.cornerRadius)
      );
      setScreenshotGlassFramePaddingState(
        clampScreenshotGlassFramePadding(payload.glassFramePadding)
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

  const setCanvasGradientTemplateId = useCallback((id: string | null) => {
    if (id == null || id.trim() === "") {
      setCanvasGradientTemplateIdState(null);
      return;
    }
    const next = id.trim();
    if (!isValidCanvasBackgroundTemplateId(next)) {
      setCanvasGradientTemplateIdState(null);
      return;
    }
    setCanvasGradientTemplateIdState(next);
  }, []);

  const patchCanvasGradientFillKey = useCallback(
    (key: string, hex: string) => {
      const templateId = canvasGradientTemplateId;
      if (!templateId || !templateSupportsEditableGradientFills(templateId)) {
        return;
      }
      const trimmed = hex.trim().toUpperCase();
      if (!/^#[0-9A-Fa-f]{6}$/.test(trimmed)) return;
      setCanvasGradientFillsByTemplate((prev) => ({
        ...prev,
        [templateId]: normalizeGradientFillHex(templateId, {
          ...prev[templateId],
          [key]: trimmed,
        }),
      }));
    },
    [canvasGradientTemplateId]
  );

  const patchCanvasGradientFillOpacity = useCallback(
    (key: string, percent: number) => {
      const templateId = canvasGradientTemplateId;
      if (!templateId || !templateSupportsEditableGradientFills(templateId)) {
        return;
      }
      const clamped = Math.min(100, Math.max(0, Math.round(percent)));
      setCanvasGradientOpacitiesByTemplate((prev) => ({
        ...prev,
        [templateId]: {
          ...normalizeTemplateFillOpacities(templateId, prev[templateId]),
          [key]: clamped,
        },
      }));
    },
    [canvasGradientTemplateId]
  );

  const resetCanvasGradientFillToDefaults = useCallback(() => {
    const templateId = canvasGradientTemplateId;
    if (!templateId || !templateSupportsEditableGradientFills(templateId)) {
      return;
    }
    setCanvasGradientFillsByTemplate((prev) => ({
      ...prev,
      [templateId]: normalizeGradientFillHex(templateId, undefined),
    }));
    setCanvasGradientBlendModesByTemplate((prev) => ({
      ...prev,
      [templateId]: normalizeTemplateFillBlendModes(templateId, undefined),
    }));
    setCanvasGradientOpacitiesByTemplate((prev) => ({
      ...prev,
      [templateId]: normalizeTemplateFillOpacities(templateId, undefined),
    }));
  }, [canvasGradientTemplateId]);

  const setCanvasOverlayShadowId = useCallback((id: string | null) => {
    setCanvasOverlayShadowIdState(normalizeCanvasMoodShadowTemplateId(id));
  }, []);

  const setCanvasOverlayShadowOpacity = useCallback((value: number) => {
    setCanvasOverlayShadowOpacityState(clampPercent(value));
  }, []);

  const setCanvasOverlayShadowPlacement = useCallback(
    (placement: CanvasMoodShadowPlacement) => {
      setCanvasOverlayShadowPlacementState(
        parseCanvasMoodShadowPlacement(placement)
      );
    },
    []
  );

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
        setCanvasGradientTemplateIdState(null);
        setCanvasGradientFillsByTemplate(normalizeGradientFillsByTemplate(undefined));
        setCanvasGradientBlendModesByTemplate(
          normalizeGradientBlendModesByTemplate(undefined)
        );
        setCanvasGradientOpacitiesByTemplate(
          normalizeGradientOpacitiesByTemplate(undefined)
        );
        setCanvasNoisePercent(0);
        setCanvasBlurPercent(0);
        setCanvasNoiseType(DEFAULT_CANVAS_NOISE_TYPE);
        setCanvasNoiseColor(DEFAULT_CANVAS_NOISE_COLOR);
        setCanvasNoiseColorOpacity(DEFAULT_CANVAS_NOISE_COLOR_OPACITY);
        setCanvasNoiseBlendMode(DEFAULT_CANVAS_NOISE_BLEND_MODE);
        setCanvasOverlayShadowIdState(null);
        setCanvasOverlayShadowOpacityState(DEFAULT_CANVAS_OVERLAY_SHADOW_OPACITY);
        setCanvasOverlayShadowPlacementState(DEFAULT_CANVAS_MOOD_SHADOW_PLACEMENT);
        setCanvasDitherEnabled(DEFAULT_CANVAS_DITHER_ENABLED);
        setCanvasDitherColorBackState(DEFAULT_CANVAS_DITHER_COLOR_BACK);
        setCanvasDitherColorFrontState(DEFAULT_CANVAS_DITHER_COLOR_FRONT);
        setCanvasDitherColorHighlightState(DEFAULT_CANVAS_DITHER_COLOR_HIGHLIGHT);
        setCanvasDitherOriginalColors(DEFAULT_CANVAS_DITHER_ORIGINAL_COLORS);
        setCanvasDitherInverted(DEFAULT_CANVAS_DITHER_INVERTED);
        setCanvasDitherTypeState(DEFAULT_CANVAS_DITHER_TYPE);
        setCanvasDitherSizeState(DEFAULT_CANVAS_DITHER_SIZE);
        setCanvasDitherColorStepsState(DEFAULT_CANVAS_DITHER_COLOR_STEPS);
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
      {
        setCanvasOverlayShadowIdState(
          normalizeCanvasMoodShadowTemplateId(payload.overlayShadowId)
        );
      }
      setCanvasOverlayShadowOpacityState(
        payload.overlayShadowOpacity != null &&
          !Number.isNaN(Number(payload.overlayShadowOpacity))
          ? clampPercent(payload.overlayShadowOpacity)
          : DEFAULT_CANVAS_OVERLAY_SHADOW_OPACITY
      );
      setCanvasOverlayShadowPlacementState(
        parseCanvasMoodShadowPlacement(payload.overlayShadowPlacement)
      );
      {
        const dither = payload.dither;
        setCanvasDitherEnabled(Boolean(dither?.enabled));
        setCanvasDitherColorBackState(
          normalizeDitherHex(
            dither?.colorBack,
            DEFAULT_CANVAS_DITHER_COLOR_BACK
          )
        );
        setCanvasDitherColorFrontState(
          normalizeDitherHex(
            dither?.colorFront,
            DEFAULT_CANVAS_DITHER_COLOR_FRONT
          )
        );
        setCanvasDitherColorHighlightState(
          normalizeDitherHex(
            dither?.colorHighlight,
            DEFAULT_CANVAS_DITHER_COLOR_HIGHLIGHT
          )
        );
        setCanvasDitherOriginalColors(
          dither?.originalColors ?? DEFAULT_CANVAS_DITHER_ORIGINAL_COLORS
        );
        setCanvasDitherInverted(
          dither?.inverted ?? DEFAULT_CANVAS_DITHER_INVERTED
        );
        setCanvasDitherTypeState(parseCanvasDitherType(dither?.type));
        setCanvasDitherSizeState(clampCanvasDitherSize(dither?.size));
        setCanvasDitherColorStepsState(
          clampCanvasDitherColorSteps(dither?.colorSteps)
        );
      }
      {
        const halftone = payload.halftone;
        setCanvasHalftoneEnabled(Boolean(halftone?.enabled));
        setCanvasHalftoneColorBackState(
          normalizeHalftoneHex(
            halftone?.colorBack,
            DEFAULT_CANVAS_HALFTONE_COLOR_BACK
          )
        );
        setCanvasHalftoneColorFrontState(
          normalizeHalftoneHex(
            halftone?.colorFront,
            DEFAULT_CANVAS_HALFTONE_COLOR_FRONT
          )
        );
        setCanvasHalftoneOriginalColors(
          halftone?.originalColors ?? DEFAULT_CANVAS_HALFTONE_ORIGINAL_COLORS
        );
        setCanvasHalftoneInverted(
          halftone?.inverted ?? DEFAULT_CANVAS_HALFTONE_INVERTED
        );
        setCanvasHalftoneTypeState(parseCanvasHalftoneType(halftone?.type));
        setCanvasHalftoneGridState(parseCanvasHalftoneGrid(halftone?.grid));
        setCanvasHalftoneSizeState(clampCanvasHalftoneSize(halftone?.size));
        setCanvasHalftoneRadiusState(
          clampCanvasHalftoneRadius(halftone?.radius)
        );
        setCanvasHalftoneContrastState(
          clampCanvasHalftoneContrast(halftone?.contrast)
        );
      }
      {
        const rawG = payload.gradientTemplateId?.trim();
        setCanvasGradientTemplateIdState(
          rawG && isValidCanvasBackgroundTemplateId(rawG) ? rawG : null
        );
      }
      {
        const byTemplate = { ...payload.gradientFillsByTemplate };
        if (payload.gradientFillHex && payload.gradientTemplateId) {
          byTemplate[payload.gradientTemplateId] = payload.gradientFillHex;
        }
        setCanvasGradientFillsByTemplate(
          normalizeGradientFillsByTemplate(byTemplate)
        );
      }
      {
        const blendByTemplate = { ...payload.gradientBlendModesByTemplate };
        setCanvasGradientBlendModesByTemplate(
          normalizeGradientBlendModesByTemplate(blendByTemplate)
        );
      }
      {
        const opacityByTemplate = { ...payload.gradientOpacitiesByTemplate };
        setCanvasGradientOpacitiesByTemplate(
          normalizeGradientOpacitiesByTemplate(opacityByTemplate)
        );
      }
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
      canvasGradientTemplateId,
      setCanvasGradientTemplateId,
      canvasGradientFillHex,
      canvasGradientFillsByTemplate,
      patchCanvasGradientFillKey,
      canvasGradientFillOpacity,
      canvasGradientOpacitiesByTemplate,
      canvasGradientBlendModesByTemplate,
      patchCanvasGradientFillOpacity,
      resetCanvasGradientFillToDefaults,
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
      canvasOverlayShadowId,
      setCanvasOverlayShadowId,
      canvasOverlayShadowOpacity,
      setCanvasOverlayShadowOpacity,
      canvasOverlayShadowPlacement,
      setCanvasOverlayShadowPlacement,
      canvasDitherEnabled,
      setCanvasDitherEnabled,
      canvasDitherColorBack,
      setCanvasDitherColorBack,
      canvasDitherColorFront,
      setCanvasDitherColorFront,
      canvasDitherColorHighlight,
      setCanvasDitherColorHighlight,
      canvasDitherOriginalColors,
      setCanvasDitherOriginalColors,
      canvasDitherInverted,
      setCanvasDitherInverted,
      canvasDitherType,
      setCanvasDitherType,
      canvasDitherSize,
      setCanvasDitherSize,
      canvasDitherColorSteps,
      setCanvasDitherColorSteps,
      canvasHalftoneEnabled,
      setCanvasHalftoneEnabled,
      canvasHalftoneColorBack,
      setCanvasHalftoneColorBack,
      canvasHalftoneColorFront,
      setCanvasHalftoneColorFront,
      canvasHalftoneOriginalColors,
      setCanvasHalftoneOriginalColors,
      canvasHalftoneInverted,
      setCanvasHalftoneInverted,
      canvasHalftoneType,
      setCanvasHalftoneType,
      canvasHalftoneGrid,
      setCanvasHalftoneGrid,
      canvasHalftoneSize,
      setCanvasHalftoneSize,
      canvasHalftoneRadius,
      setCanvasHalftoneRadius,
      canvasHalftoneContrast,
      setCanvasHalftoneContrast,
      hydrateCanvasBackground,
      deviceTemplateId,
      setDeviceTemplateId,
      browserUrl,
      setBrowserUrl,
      browserFaviconUrl,
      setBrowserFaviconUrl,
      setBrowserFaviconFromFile,
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
      screenshotCornerType,
      setScreenshotCornerType,
      screenshotCornerRadius,
      setScreenshotCornerRadius,
      screenshotGlassFramePadding,
      setScreenshotGlassFramePadding,
      hydrateScreenshotStyle,
      frameShadowPreset,
      setFrameShadowPreset,
      frameShadowOffsetX,
      setFrameShadowOffsetX,
      frameShadowOffsetY,
      setFrameShadowOffsetY,
      frameShadowBlur,
      setFrameShadowBlur,
      frameShadowSpread,
      setFrameShadowSpread,
      frameShadowColor,
      setFrameShadowColor,
      frameShadowColorOpacity,
      setFrameShadowColorOpacity,
      hydrateFrameShadow,
      mockupOffsetX,
      mockupOffsetY,
      mockupScale,
      setMockupOffset,
      setMockupScale,
      hydrateMockupTransform,
      canvasLayers: [],
      selectedCanvasLayerId: null,
      canvasImageRect: null,
      canvasImageBaseline: null,
    }),
    [
      aspectPreset,
      canvasBackgroundMode,
      canvasSolidColor,
      canvasBackgroundImageUrl,
      canvasGradientTemplateId,
      canvasGradientFillHex,
      canvasGradientFillsByTemplate,
      canvasGradientFillOpacity,
      canvasGradientOpacitiesByTemplate,
      canvasGradientBlendModesByTemplate,
      canvasNoisePercent,
      canvasBlurPercent,
      canvasNoiseType,
      canvasNoiseColor,
      canvasNoiseColorOpacity,
      canvasNoiseBlendMode,
      canvasNoiseBlendModePreview,
      canvasOverlayShadowId,
      canvasOverlayShadowOpacity,
      canvasOverlayShadowPlacement,
      canvasDitherEnabled,
      setCanvasDitherEnabled,
      canvasDitherColorBack,
      setCanvasDitherColorBack,
      canvasDitherColorFront,
      setCanvasDitherColorFront,
      canvasDitherColorHighlight,
      setCanvasDitherColorHighlight,
      canvasDitherOriginalColors,
      setCanvasDitherOriginalColors,
      canvasDitherInverted,
      setCanvasDitherInverted,
      canvasDitherType,
      setCanvasDitherType,
      canvasDitherSize,
      setCanvasDitherSize,
      canvasDitherColorSteps,
      setCanvasDitherColorSteps,
      canvasHalftoneEnabled,
      setCanvasHalftoneEnabled,
      canvasHalftoneColorBack,
      setCanvasHalftoneColorBack,
      canvasHalftoneColorFront,
      setCanvasHalftoneColorFront,
      canvasHalftoneOriginalColors,
      setCanvasHalftoneOriginalColors,
      canvasHalftoneInverted,
      setCanvasHalftoneInverted,
      canvasHalftoneType,
      setCanvasHalftoneType,
      canvasHalftoneGrid,
      setCanvasHalftoneGrid,
      canvasHalftoneSize,
      setCanvasHalftoneSize,
      canvasHalftoneRadius,
      setCanvasHalftoneRadius,
      canvasHalftoneContrast,
      setCanvasHalftoneContrast,
      deviceTemplateId,
      browserUrl,
      browserFaviconUrl,
      setBrowserUrl,
      setBrowserFaviconUrl,
      setBrowserFaviconFromFile,
      setCanvasBackgroundImageFromFile,
      setCanvasGradientTemplateId,
      patchCanvasGradientFillKey,
      patchCanvasGradientFillOpacity,
      resetCanvasGradientFillToDefaults,
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
      screenshotCornerType,
      setScreenshotCornerType,
      screenshotCornerRadius,
      setScreenshotCornerRadius,
      screenshotGlassFramePadding,
      setScreenshotGlassFramePadding,
      hydrateScreenshotStyle,
      frameShadowPreset,
      setFrameShadowPreset,
      frameShadowOffsetX,
      setFrameShadowOffsetX,
      frameShadowOffsetY,
      setFrameShadowOffsetY,
      frameShadowBlur,
      setFrameShadowBlur,
      frameShadowSpread,
      setFrameShadowSpread,
      frameShadowColor,
      setFrameShadowColor,
      frameShadowColorOpacity,
      setFrameShadowColorOpacity,
      hydrateFrameShadow,
      mockupOffsetX,
      mockupOffsetY,
      mockupScale,
      setMockupOffset,
      setMockupScale,
      hydrateMockupTransform,
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
