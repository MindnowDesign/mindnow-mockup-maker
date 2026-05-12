"use client";

import { Pencil, Plus } from "lucide-react";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import { useMockupFrame } from "@/components/mockup-frame-context";
import { MockupDeviceFrame } from "@/components/mockup-device-frame";
import { useMockupMedia } from "@/components/mockup-media-context";
import { CanvasBackgroundNoiseOverlay } from "@/components/canvas-background-noise-overlay";
import { hexToRgb } from "@/lib/color-hex-hsv";
import { scaledFramePixelSize } from "@/lib/mockup-aspect";
import {
  checkerboardBackgroundStyle,
} from "@/lib/mockup-canvas-background";
import {
  SCREENSHOT_GLASS_LIGHT,
  SCREENSHOT_OUTLINE,
  screenshotBorderOutlineOffset,
  screenshotEffectiveCornerRadius,
  type ScreenshotBorderPosition,
  type ScreenshotStyleId,
} from "@/lib/mockup-screenshot-style";
import { defaultVisualLabel } from "@/lib/mockup-visual-label";
import { cn } from "@/lib/utils";

function rgbaFromHex(hex: string, opacityPercent: number): string {
  const rgb = hexToRgb(hex) ?? { r: 0, g: 0, b: 0 };
  const a = Math.min(1, Math.max(0, opacityPercent / 100));
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`;
}

type ScreenshotBorderStyle = {
  /** Pixel weight; pass 0 to disable. */
  weight: number;
  color: string;
  opacity: number;
  position: ScreenshotBorderPosition;
};

/** Max border-box size for the orange frame (fits main canvas). */
function useFrameViewportCaps() {
  const [caps, setCaps] = useState({ maxW: 920, maxH: 820 });

  useLayoutEffect(() => {
    function measure() {
      setCaps({
        maxW: Math.min(920, window.innerWidth * 0.92),
        maxH: Math.min(820, window.innerHeight * 0.7),
      });
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return caps;
}

/**
 * Screenshot upload: outer stage fills the canvas cell; inner `[data-mockup-media-shell]`
 * gets explicit width/height matching `object-contain` math so DevTools shows a tight box
 * around the image (CSS % alone often resolves against the grid cell, not the bitmap).
 */
function UploadedScreenshotImage({
  src,
  style,
  border,
  outlineColor,
  outlineColorOpacity,
  cornerRadius,
}: {
  src: string;
  style: ScreenshotStyleId;
  border: ScreenshotBorderStyle | null;
  outlineColor: string;
  outlineColorOpacity: number;
  cornerRadius: number;
}) {
  const effectiveCornerRadius = screenshotEffectiveCornerRadius(cornerRadius);
  const stageRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);

  useLayoutEffect(() => {
    setNatural(null);
    const id = window.requestAnimationFrame(() => {
      const img = imgRef.current;
      if (img?.complete && img.naturalWidth > 0) {
        setNatural({ w: img.naturalWidth, h: img.naturalHeight });
      }
    });
    return () => window.cancelAnimationFrame(id);
  }, [src]);

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect;
      if (!cr) return;
      setViewport({ w: cr.width, h: cr.height });
    });
    ro.observe(el);
    const r0 = el.getBoundingClientRect();
    setViewport({ w: r0.width, h: r0.height });
    return () => ro.disconnect();
  }, []);

  const fitted = useMemo(() => {
    if (!natural || viewport.w < 1 || viewport.h < 1) return null;
    const s = Math.min(viewport.w / natural.w, viewport.h / natural.h);
    return {
      w: Math.max(1, Math.round(natural.w * s)),
      h: Math.max(1, Math.round(natural.h * s)),
    };
  }, [natural, viewport.w, viewport.h]);

  const borderStyle = useMemo<CSSProperties | undefined>(() => {
    if (style !== "border") return undefined;
    if (!border || border.weight <= 0) return undefined;
    return {
      outlineStyle: "solid",
      outlineColor: rgbaFromHex(border.color, border.opacity),
      outlineWidth: `${border.weight}px`,
      outlineOffset: `${screenshotBorderOutlineOffset(
        border.position,
        border.weight
      )}px`,
    };
  }, [border, style]);

  const glassFrameStyle = useMemo<CSSProperties | undefined>(() => {
    if (style !== "glass") return undefined;
    return {
      padding: `${SCREENSHOT_GLASS_LIGHT.framePadding}px`,
      borderRadius: `${SCREENSHOT_GLASS_LIGHT.frameRadius}px`,
      background: SCREENSHOT_GLASS_LIGHT.background,
      backdropFilter: SCREENSHOT_GLASS_LIGHT.backdropFilter,
      WebkitBackdropFilter: SCREENSHOT_GLASS_LIGHT.backdropFilter,
    };
  }, [style]);

  /**
   * Outline = wrapper border with `padding` for the gap so the stroke ends up
   * `gap` px from the image, and follows the image's corner radius via the
   * wrapper's own `border-radius` (image radius + gap).
   */
  const outlineFrameStyle = useMemo<CSSProperties | undefined>(() => {
    if (style !== "outline") return undefined;
    return {
      padding: `${SCREENSHOT_OUTLINE.gap}px`,
      border: `${SCREENSHOT_OUTLINE.weight}px solid ${rgbaFromHex(
        outlineColor,
        outlineColorOpacity
      )}`,
      borderRadius: `${effectiveCornerRadius + SCREENSHOT_OUTLINE.gap}px`,
      boxSizing: "border-box",
    };
  }, [style, outlineColor, outlineColorOpacity, effectiveCornerRadius]);

  const wrapperStyle = glassFrameStyle ?? outlineFrameStyle;

  const shellStyle = useMemo<CSSProperties>(() => {
    const base: CSSProperties = fitted
      ? { width: fitted.w, height: fitted.h }
      : {};
    const radiusBase: CSSProperties =
      effectiveCornerRadius > 0
        ? { borderRadius: `${effectiveCornerRadius}px`, overflow: "hidden" }
        : {};
    if (style === "glass") {
      return {
        ...base,
        borderRadius: `${effectiveCornerRadius}px`,
        ...(effectiveCornerRadius > 0 ? { overflow: "hidden" } : {}),
      };
    }
    if (style === "outline") {
      return { ...base, ...radiusBase };
    }
    return { ...base, ...radiusBase, ...borderStyle };
  }, [fitted, style, borderStyle, effectiveCornerRadius]);

  return (
    <div
      ref={stageRef}
      data-mockup-canvas-stage
      /**
       * No `overflow-hidden`: outside borders / glass frames need to bleed past
       * the stage when the screenshot fills it on one axis. The outer
       * `[data-mockup-capture-target]` keeps the rounded canvas clip, so any
       * bleed still stops at the visible canvas edge.
       */
      className="grid h-full min-h-0 w-full min-w-0 grid-cols-1 grid-rows-1 place-content-center place-items-center"
    >
      <div
        className={cn(
          "relative shrink-0",
          !fitted && "max-h-full max-w-full"
        )}
        style={wrapperStyle}
      >
        <div
          data-mockup-media-shell
          className={cn(
            "relative shrink-0",
            !fitted && "max-h-full max-w-full"
          )}
          style={shellStyle}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- user-provided blob URL */}
          <img
            ref={imgRef}
            src={src}
            alt=""
            draggable={false}
            onLoad={(e) =>
              setNatural({
                w: e.currentTarget.naturalWidth,
                h: e.currentTarget.naturalHeight,
              })
            }
            className={cn(
              "pointer-events-none select-none object-contain",
              fitted
                ? "block h-full w-full"
                : "block h-auto w-auto max-h-full max-w-full"
            )}
          />
        </div>
      </div>
    </div>
  );
}

function MockupVisualTitle({
  itemId,
  storedLabel,
  fallbackLabel,
  updateLabel,
}: {
  itemId: string;
  storedLabel: string | undefined;
  /** Shown when there is no custom name (e.g. "Visual 01"). */
  fallbackLabel: string;
  updateLabel: (id: string, value: string) => void;
}) {
  const resolvedDisplay = useMemo(
    () => (storedLabel?.trim() ? storedLabel.trim() : fallbackLabel),
    [storedLabel, fallbackLabel]
  );

  const [isFocused, setIsFocused] = useState(false);
  const [draft, setDraft] = useState(resolvedDisplay);
  const revertRef = useRef("");
  const skipBlurCommitRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isFocused) {
      setDraft(resolvedDisplay);
    }
  }, [resolvedDisplay, isFocused]);

  useEffect(() => {
    setDraft(resolvedDisplay);
    setIsFocused(false);
  }, [itemId]);

  const value = isFocused ? draft : resolvedDisplay;

  return (
    <div className="min-w-0 w-full shrink-0">
      <div className="group inline-flex w-fit max-w-full min-w-0 cursor-text items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setDraft(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            revertRef.current = storedLabel?.trim() ?? "";
            setDraft(resolvedDisplay);
          }}
          onBlur={() => {
            if (skipBlurCommitRef.current) {
              skipBlurCommitRef.current = false;
              setIsFocused(false);
              return;
            }
            setIsFocused(false);
            const t = draft.trim();
            updateLabel(itemId, t === "" ? "" : draft.trim());
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur();
            }
            if (e.key === "Escape") {
              e.preventDefault();
              skipBlurCommitRef.current = true;
              updateLabel(itemId, revertRef.current);
              setDraft(
                revertRef.current.trim()
                  ? revertRef.current.trim()
                  : fallbackLabel
              );
              setIsFocused(false);
              e.currentTarget.blur();
            }
          }}
          spellCheck={false}
          autoComplete="off"
          aria-label="Visual name"
          placeholder={fallbackLabel}
          maxLength={128}
          className={cn(
            "min-w-0 max-w-full border-0 bg-transparent px-0 py-0 text-sm font-medium tracking-tight text-zinc-400 outline-none ring-0 shadow-none",
            "[field-sizing:content]",
            "focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0",
            "focus:text-zinc-200",
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
            inputRef.current?.focus();
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
  );
}

/**
 * Canvas frame: dimensions from design presets, scaled to viewport.
 * Parent page uses `grid place-items-center` so this block stays visually centered.
 */
export function MockupWorkspaceStage() {
  const {
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
    screenshotStyle,
    screenshotBorderColor,
    screenshotBorderColorOpacity,
    screenshotBorderPosition,
    screenshotBorderWeight,
    screenshotOutlineColor,
    screenshotOutlineColorOpacity,
    screenshotCornerRadius,
  } = useMockupFrame();
  const canvasNoiseFilterId = `canvas-noise-${useId().replace(/:/g, "")}`;
  const noiseBlendModeEffective =
    canvasNoiseBlendModePreview ?? canvasNoiseBlendMode;
  const {
    activeVisual,
    activeItem,
    visuals,
    addFromFileList,
    updateVisualLabel,
  } = useMockupMedia();

  const visualForTitle = activeVisual ?? visuals[0] ?? null;
  const { maxW, maxH } = useFrameViewportCaps();

  const { width, height } = useMemo(
    () => scaledFramePixelSize(aspectPreset, maxW, maxH),
    [aspectPreset, maxW, maxH]
  );

  const captureSurfaceStyle: CSSProperties = useMemo(() => {
    const base: CSSProperties = { width: "100%", height };
    switch (canvasBackgroundMode) {
      case "transparent":
        return { ...base, ...checkerboardBackgroundStyle() };
      case "solid":
        return { ...base, backgroundColor: canvasSolidColor };
      case "image":
        if (canvasBackgroundImageUrl) {
          return {
            ...base,
            backgroundImage: `url(${canvasBackgroundImageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          };
        }
        return { ...base, backgroundColor: canvasSolidColor };
      default:
        return { ...base, backgroundColor: canvasSolidColor };
    }
  }, [
    canvasBackgroundMode,
    canvasSolidColor,
    canvasBackgroundImageUrl,
    height,
  ]);

  const backgroundBlurPx = useMemo(
    () => (canvasBlurPercent / 100) * 28,
    [canvasBlurPercent]
  );

  const screenshotBorder = useMemo<ScreenshotBorderStyle | null>(() => {
    if (deviceTemplateId != null) return null;
    if (screenshotStyle !== "border") return null;
    if (screenshotBorderWeight <= 0) return null;
    return {
      weight: screenshotBorderWeight,
      color: screenshotBorderColor,
      opacity: screenshotBorderColorOpacity,
      position: screenshotBorderPosition,
    };
  }, [
    deviceTemplateId,
    screenshotStyle,
    screenshotBorderColor,
    screenshotBorderColorOpacity,
    screenshotBorderPosition,
    screenshotBorderWeight,
  ]);

  /** Glass styling has no inputs — only the `style` flag is needed downstream. */
  const screenshotStyleForCanvas =
    deviceTemplateId == null ? screenshotStyle : "default";

  /**
   * Blur on a layer that is then clipped to rounded rect can look like a vignette
   * (darker/soft edge). Extra bleed lets the gaussian falloff sit outside the clip.
   */
  const backgroundBlurLayerStyle: CSSProperties = useMemo(() => {
    const blurPx = backgroundBlurPx;
    const blurFilter = blurPx > 0 ? `blur(${blurPx}px)` : undefined;
    const bleed =
      blurPx > 0 ? Math.min(80, Math.ceil(blurPx * 3) + 20) : 0;
    const base = { ...captureSurfaceStyle };

    if (bleed <= 0) {
      return {
        ...base,
        filter: blurFilter,
        position: "absolute",
        inset: 0,
      };
    }

    return {
      ...base,
      filter: blurFilter,
      position: "absolute",
      top: -bleed,
      left: -bleed,
      width: `calc(100% + ${bleed * 2}px)`,
      height: `calc(100% + ${bleed * 2}px)`,
    };
  }, [captureSurfaceStyle, backgroundBlurPx]);

  return (
    <div
      className="flex max-w-full flex-col gap-2"
      style={{ width }}
    >
      {visualForTitle ? (
        <MockupVisualTitle
          itemId={visualForTitle.id}
          storedLabel={visualForTitle.label}
          fallbackLabel={defaultVisualLabel(
            Math.max(
              0,
              visuals.findIndex((x) => x.id === visualForTitle.id)
            ) + 1
          )}
          updateLabel={updateVisualLabel}
        />
      ) : null}
      <div
        key={aspectPreset}
        data-mockup-capture-target
        style={{ width: "100%", height }}
        role="region"
        aria-label="Mockup canvas"
        tabIndex={0}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          addFromFileList(e.dataTransfer.files);
        }}
        onPaste={(e) => {
          const files = e.clipboardData?.files;
          if (files?.length) {
            e.preventDefault();
            addFromFileList(files);
          }
        }}
        className={cn(
          "group relative box-border grid shrink-0 grid-rows-[minmax(0,1fr)] overflow-hidden rounded-[16px] p-8 shadow-[0_32px_80px_-20px_rgba(0,0,0,0.75)] md:p-12",
          "min-h-0 min-w-0 outline-none focus-visible:ring-2 focus-visible:ring-white/20"
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[16px]"
        >
          <div style={backgroundBlurLayerStyle} />
        </div>
        <CanvasBackgroundNoiseOverlay
          strength={canvasNoisePercent / 100}
          filterId={canvasNoiseFilterId}
          noiseType={canvasNoiseType}
          noiseColor={canvasNoiseColor}
          noiseColorOpacity={canvasNoiseColorOpacity}
          blendMode={noiseBlendModeEffective}
        />
        <div className="relative z-10 flex min-h-0 min-w-0 flex-1 items-center justify-center">
          <MockupDeviceFrame deviceTemplateId={deviceTemplateId}>
            {activeItem?.kind === "image" ? (
              deviceTemplateId == null ? (
                <UploadedScreenshotImage
                  key={activeItem.url}
                  src={activeItem.url}
                  style={screenshotStyleForCanvas}
                  border={screenshotBorder}
                  outlineColor={screenshotOutlineColor}
                  outlineColorOpacity={screenshotOutlineColorOpacity}
                  cornerRadius={screenshotCornerRadius}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element -- user-provided blob URL
                <img
                  src={activeItem.url}
                  alt=""
                  draggable={false}
                  className={cn(
                    "pointer-events-none select-none block max-h-full max-w-full h-auto w-auto object-contain"
                  )}
                />
              )
            ) : (
              <div
                className={cn(
                  "flex max-h-full max-w-full min-h-0 min-w-0 flex-col overflow-hidden rounded-[16px]",
                  deviceTemplateId
                    ? "h-full min-h-[140px] w-full"
                    : "aspect-square",
                  activeItem
                    ? "bg-zinc-950"
                    : "border border-zinc-900/80 bg-zinc-950 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.9)]"
                )}
              >
                {activeItem ? (
                  <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                    <video
                      src={activeItem.url}
                      controls
                      playsInline
                      className="h-full w-full min-h-0 min-w-0 object-contain"
                    />
                  </div>
                ) : (
                  <label className="flex min-h-0 min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-6 px-6 py-10 text-center outline-none transition-colors hover:bg-white/[0.03] focus-within:ring-2 focus-within:ring-white/25 focus-within:ring-inset">
                    <span className="sr-only">Upload images or videos</span>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      className="sr-only"
                      onChange={(event) => {
                        addFromFileList(event.target.files);
                        event.target.value = "";
                      }}
                    />
                    <div className="relative flex items-center justify-center">
                      <span
                        className="flex size-14 shrink-0 items-center justify-center rounded-full border border-dashed border-zinc-500 bg-zinc-900/35 transition-colors group-hover:border-zinc-400"
                        aria-hidden
                      >
                        <Plus
                          className="size-7 text-foreground transition-transform group-hover:scale-105"
                          strokeWidth={2}
                          aria-hidden
                        />
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xl font-semibold tracking-tight text-white md:text-2xl">
                        Drop or Paste
                      </p>
                      <p className="text-sm font-medium text-zinc-500">
                        Images &amp; Videos
                      </p>
                    </div>
                  </label>
                )}
              </div>
            )}
          </MockupDeviceFrame>
        </div>
      </div>
    </div>
  );
}
