"use client";

import {
  Check,
  Droplet,
  Grid3x3,
  Image as ImageIcon,
  LayoutPanelTop,
  PaintBucket,
  Trash2,
  Upload,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Fragment,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { CanvasBackgroundTemplatesSection } from "@/components/canvas-background-templates-section";
import { CanvasDitherControls } from "@/components/canvas-dither-controls";
import { CanvasHalftoneControls } from "@/components/canvas-halftone-controls";
import {
  MoodShadowIcon,
  StyleBlurIcon,
  StyleDitherIcon,
  StyleHalftoneIcon,
  StyleNoiseIcon,
} from "@/components/canvas-style-icons";
import {
  CANVAS_MOOD_SHADOW_TEMPLATES,
  type CanvasMoodShadowPlacement,
} from "@/lib/canvas-mood-shadow-templates";
import { canvasHasShaderableBackground } from "@/lib/canvas-shader-source";
import { CanvasSolidColorPicker } from "@/components/canvas-solid-color-picker";
import { EffectAccordionSection } from "@/components/effect-accordion-section";
import { SolidColorPopoverRow } from "@/components/solid-color-popover-row";
import { useMockupFrame } from "@/components/mockup-frame-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { CanvasBackgroundMode } from "@/lib/mockup-canvas-background";
import { DEFAULT_CANVAS_NOISE_COLOR } from "@/lib/mockup-canvas-background";
import type { CanvasNoiseBlendModeId } from "@/lib/mockup-noise-blend";
import { CANVAS_NOISE_BLEND_GROUPS } from "@/lib/mockup-noise-blend";
import type { CanvasNoiseTypeId } from "@/lib/mockup-noise";
import { CANVAS_NOISE_TYPE_OPTIONS } from "@/lib/mockup-noise";
import { cn } from "@/lib/utils";

function normalizeNoiseHex(raw: string): string {
  let t = raw.trim();
  if (!t.startsWith("#")) {
    if (/^[0-9A-Fa-f]{6}$/i.test(t)) t = `#${t}`;
    else if (/^[0-9A-Fa-f]{3}$/i.test(t)) t = `#${t}`;
  }
  if (/^#[0-9A-Fa-f]{6}$/.test(t)) return t.toUpperCase();
  if (/^#[0-9A-Fa-f]{3}$/.test(t)) {
    const r = t[1]!;
    const g = t[2]!;
    const b = t[3]!;
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  return DEFAULT_CANVAS_NOISE_COLOR;
}

/** Matches `CanvasSolidColorPicker` value field chrome (HSB row / HEX input). */
const pickerChrome =
  "rounded-lg border border-zinc-700 bg-zinc-950 outline-none transition-colors hover:bg-zinc-900 focus-within:ring-2 focus-within:ring-white/25";

const percentFieldInputClass =
  "min-w-0 flex-1 bg-transparent px-1.5 py-1 text-center font-mono text-[11px] leading-none tabular-nums text-zinc-100 outline-none focus-visible:bg-white/5";

function EffectPercentField({
  id,
  value,
  onCommit,
  variant = "default",
}: {
  id: string;
  value: number;
  onCommit: (next: number) => void;
  /** `attached`: right segment inside a shared chrome row (no outer border). */
  variant?: "default" | "attached";
}) {
  const [focused, setFocused] = useState(false);
  const [text, setText] = useState(String(value));

  useEffect(() => {
    if (!focused) {
      setText(String(value));
    }
  }, [value, focused]);

  function commitFromText(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 3);
    if (digits === "") {
      onCommit(0);
      setText("0");
      return;
    }
    const n = Math.min(100, Math.max(0, parseInt(digits, 10)));
    onCommit(n);
    setText(String(n));
  }

  /** Parse current field text for stepping; fall back to committed `value`. */
  function stepBaseFromField(): number {
    const digits = text.replace(/\D/g, "");
    if (digits === "") return value;
    const n = parseInt(digits, 10);
    if (Number.isNaN(n)) return value;
    return Math.min(100, Math.max(0, n));
  }

  /** ↑/↓: ±1. Shift + ↑/↓: ±10 (same idea as HSB in `CanvasSolidColorPicker`). */
  function handleArrowKeys(e: ReactKeyboardEvent<HTMLInputElement>) {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    e.preventDefault();
    const base = stepBaseFromField();
    const step = e.shiftKey ? 10 : 1;
    const delta = e.key === "ArrowUp" ? step : -step;
    const next = Math.min(100, Math.max(0, base + delta));
    onCommit(next);
    setText(String(next));
  }

  const embeddedInner = (
    <>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        aria-label="Percent"
        value={text}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          commitFromText(text);
        }}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, "").slice(0, 3);
          setText(digits);
          if (digits !== "") {
            const n = Math.min(100, Math.max(0, parseInt(digits, 10)));
            onCommit(n);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            handleArrowKeys(e);
            return;
          }
          if (e.key === "Enter") {
            e.currentTarget.blur();
          }
        }}
        className={cn(
          percentFieldInputClass,
          variant === "attached" && "flex-1 px-1.5 py-1"
        )}
      />
      <span
        className={cn(
          "flex shrink-0 items-center justify-center px-1.5 font-mono text-[11px] text-zinc-400 tabular-nums",
          variant === "default" ? "min-w-7" : "min-w-9"
        )}
        aria-hidden
      >
        %
      </span>
    </>
  );

  if (variant === "attached") {
    return (
      <div className="flex min-h-8 min-w-0 flex-1 divide-x divide-zinc-700 overflow-hidden">
        {embeddedInner}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex min-h-8 min-w-0 max-w-[5rem] shrink-0 divide-x divide-zinc-700 overflow-hidden",
        pickerChrome
      )}
    >
      {embeddedInner}
    </div>
  );
}

/** Applied when picking a noise type while intensity is 0 (None). */
const NOISE_TYPE_ACTIVATE_PERCENT = 25;

function CanvasNoiseTypePicker({
  value,
  onChange,
  noneSelected,
  onSelectNone,
}: {
  value: CanvasNoiseTypeId;
  onChange: (id: CanvasNoiseTypeId) => void;
  noneSelected: boolean;
  onSelectNone: () => void;
}) {
  const optionClass = (selected: boolean) =>
    cn(
      "min-h-8 rounded-lg border px-0.5 py-1.5 text-center text-[11px] font-medium leading-tight transition-colors",
      selected
        ? "border-zinc-500 bg-zinc-800 text-white shadow-sm"
        : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-900 hover:text-zinc-200"
    );

  return (
    <TooltipProvider delayDuration={300}>
      <div
        role="radiogroup"
        aria-label="Noise type"
        className="grid grid-cols-5 gap-1.5"
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              role="radio"
              aria-checked={noneSelected}
              aria-label="None: turn off noise"
              onClick={onSelectNone}
              className={optionClass(noneSelected)}
            >
              None
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={6}>
            Turn off noise
          </TooltipContent>
        </Tooltip>
        {CANVAS_NOISE_TYPE_OPTIONS.map(({ id, label, description }) => (
          <Tooltip key={id}>
            <TooltipTrigger asChild>
              <button
                type="button"
                role="radio"
                aria-checked={!noneSelected && value === id}
                aria-label={`${label}: ${description}`}
                onClick={() => onChange(id)}
                className={optionClass(!noneSelected && value === id)}
              >
                {label}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={6}>
              {description}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}

function NoiseColorCompactRow({
  color,
  onColorChange,
}: {
  color: string;
  onColorChange: (hex: string) => void;
}) {
  const hex = normalizeNoiseHex(color);
  return (
    <SolidColorPopoverRow
      variant="field"
      className="w-full min-w-0"
      displayHex={hex}
      onColorChange={(next) => onColorChange(normalizeNoiseHex(next))}
      triggerAriaLabel="Open noise color picker"
    />
  );
}

function NoiseBlendModeDropdown({
  value,
  onChange,
}: {
  value: CanvasNoiseBlendModeId;
  onChange: (id: CanvasNoiseBlendModeId) => void;
}) {
  const { setCanvasNoiseBlendModePreview } = useMockupFrame();

  function handleMenuContentPointerLeave(e: ReactPointerEvent<HTMLDivElement>) {
    const next = e.relatedTarget;
    if (next instanceof Node && e.currentTarget.contains(next)) return;
    setCanvasNoiseBlendModePreview(null);
  }

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (!open) setCanvasNoiseBlendModePreview(null);
      }}
    >
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "box-border flex h-10 min-h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-950 outline-none transition-colors",
            "hover:bg-zinc-900 focus-visible:ring-2 focus-visible:ring-white/25"
          )}
          aria-label="Blend mode"
        >
          <Droplet className="size-4 text-white" strokeWidth={2} aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="min-w-[220px] max-h-[min(var(--radix-dropdown-menu-content-available-height),420px)]"
        onPointerLeave={handleMenuContentPointerLeave}
      >
        {CANVAS_NOISE_BLEND_GROUPS.map((group, gi) => (
          <Fragment key={gi}>
            {gi > 0 ? <DropdownMenuSeparator /> : null}
            {group.modes.map(({ id, label }) => (
              <DropdownMenuItem
                key={id}
                onSelect={() => onChange(id)}
                onPointerEnter={() => setCanvasNoiseBlendModePreview(id)}
                onFocus={() => setCanvasNoiseBlendModePreview(id)}
                className="gap-2 py-1.5 pr-2 pl-2"
              >
                <Check
                  className={cn(
                    "size-4 shrink-0",
                    value === id ? "text-white opacity-100" : "opacity-0"
                  )}
                  strokeWidth={2}
                  aria-hidden
                />
                <span className="text-sm">{label}</span>
              </DropdownMenuItem>
            ))}
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const templatePreviewGridClass = "grid w-full grid-cols-5 gap-2";

const overlayPreviewButtonBase = cn(
  "aspect-square w-full min-w-0 overflow-hidden rounded-lg border text-left outline-none transition-colors",
  "focus-visible:ring-2 focus-visible:ring-white/25"
);

const MOOD_SHADOW_PLACEMENT_OPTIONS: {
  id: CanvasMoodShadowPlacement;
  label: string;
}[] = [
  { id: "underlay", label: "Underlay" },
  { id: "overlay", label: "Overlay" },
];

const overlayShadowPlacementButtonClass = (selected: boolean) =>
  cn(
    "min-h-9 rounded-lg border px-2 py-1.5 text-center text-[11px] font-semibold leading-tight transition-colors",
    selected
      ? "border-zinc-500 bg-zinc-800 text-white shadow-sm"
      : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-900 hover:text-zinc-200"
  );

export function CanvasEffectSliderRow({
  id,
  label,
  Icon,
  value,
  onChange,
  hideLabel = false,
}: {
  id: string;
  label: string;
  Icon: LucideIcon;
  value: number;
  onChange: (next: number) => void;
  /** Use inside accordion: header shows title; slider row only. */
  hideLabel?: boolean;
}) {
  const percentFieldId = `${useId()}-percent`;

  return (
    <div className="space-y-1.5">
      {!hideLabel ? (
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor={id}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400"
          >
            <Icon
              className="size-3.5 shrink-0 text-zinc-500"
              strokeWidth={2}
              aria-hidden
            />
            {label}
          </label>
        </div>
      ) : null}
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="range"
          min={0}
          max={100}
          step={1}
          value={value}
          aria-label={hideLabel ? label : undefined}
          onChange={(e) => onChange(Number(e.target.value))}
          style={
            {
              ["--range-pct" as string]: `${value}%`,
            } as CSSProperties
          }
          className={cn(
            "canvas-effect-range w-full min-w-0 flex-1 cursor-pointer",
          )}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={value}
        />
        <EffectPercentField
          id={percentFieldId}
          value={value}
          onCommit={onChange}
        />
      </div>
    </div>
  );
}

const MODES: {
  id: CanvasBackgroundMode;
  label: string;
  Icon: LucideIcon;
}[] = [
  { id: "transparent", label: "Transparency", Icon: Grid3x3 },
  { id: "solid", label: "Solid", Icon: PaintBucket },
  { id: "image", label: "Image", Icon: ImageIcon },
  { id: "template", label: "Template", Icon: LayoutPanelTop },
];

export function CanvasBackgroundControls() {
  const fileRef = useRef<HTMLInputElement>(null);
  const {
    canvasBackgroundMode: mode,
    setCanvasBackgroundMode: setMode,
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
    canvasNoiseBlendMode,
    setCanvasNoiseBlendMode,
    canvasOverlayShadowId,
    setCanvasOverlayShadowId,
    canvasOverlayShadowOpacity,
    setCanvasOverlayShadowOpacity,
    canvasOverlayShadowPlacement,
    setCanvasOverlayShadowPlacement,
    canvasDitherEnabled,
    setCanvasDitherEnabled,
    canvasHalftoneEnabled,
    setCanvasHalftoneEnabled,
    canvasGradientTemplateId,
  } = useMockupFrame();

  const [openEffectSection, setOpenEffectSection] = useState("");
  const [openShaderSection, setOpenShaderSection] = useState("");
  const [openMoodSection, setOpenMoodSection] = useState("");

  const noiseSectionOpen = openEffectSection === "canvas-effect-noise";
  const blurSectionOpen = openEffectSection === "canvas-effect-blur";
  const ditherSectionOpen = openShaderSection === "canvas-shader-dither";
  const halftoneSectionOpen = openShaderSection === "canvas-shader-halftone";
  const shadowSectionOpen = openMoodSection === "canvas-mood-shadow";

  const canApplyShader = canvasHasShaderableBackground({
    mode,
    imageUrl: canvasBackgroundImageUrl,
    templateId: canvasGradientTemplateId,
  });

  function toggleEffectSection(sectionId: string) {
    setOpenEffectSection((current) =>
      current === sectionId ? "" : sectionId
    );
  }

  function toggleShaderSection(sectionId: string) {
    setOpenShaderSection((current) =>
      current === sectionId ? "" : sectionId
    );
  }

  function toggleMoodSection(sectionId: string) {
    setOpenMoodSection((current) => (current === sectionId ? "" : sectionId));
  }

  return (
    <>
    <div className="space-y-2">
      <span
        className="block text-xs font-medium text-zinc-400"
        id="canvas-bg-label"
      >
        Background
      </span>
      <TooltipProvider delayDuration={300}>
        <div
          role="radiogroup"
          aria-labelledby="canvas-bg-label"
          className="flex w-full gap-2"
        >
          {MODES.map(({ id, label, Icon }) => (
            <Tooltip key={id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  role="radio"
                  aria-checked={mode === id}
                  aria-label={label}
                  onClick={() => setMode(id)}
                  className={cn(
                    "flex h-12 min-w-0 flex-1 items-center justify-center rounded-lg border p-1.5 transition-colors",
                    mode === id
                      ? "border-zinc-500 bg-zinc-800 text-white shadow-sm"
                      : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-900 hover:text-zinc-200"
                  )}
                >
                  <span className="flex size-[20px] shrink-0 items-center justify-center [&>svg]:block [&>svg]:size-[20px]">
                    <Icon
                      className="size-[20px] shrink-0"
                      strokeWidth={2}
                      aria-hidden
                    />
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={6}>
                {label}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>

      {mode === "solid" ? (
        <CanvasSolidColorPicker
          color={canvasSolidColor}
          onChange={setCanvasSolidColor}
        />
      ) : null}

      {mode === "image" ? (
        <div className="space-y-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              setCanvasBackgroundImageFromFile(file);
              e.target.value = "";
            }}
          />
          {!canvasBackgroundImageUrl ? (
            <>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg border border-dashed border-zinc-600 bg-zinc-950/80 px-3 py-2.5 text-left text-sm font-medium text-zinc-300 outline-none transition-colors",
                  "hover:border-zinc-500 hover:bg-zinc-900 hover:text-white",
                  "focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
                )}
              >
                <Upload className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
                Upload background image
              </button>
              <p className="text-xs leading-relaxed text-zinc-500">
                Choose an image to fill the canvas frame behind your content.
              </p>
            </>
          ) : (
            <div className="group/preview relative w-full overflow-hidden rounded-md border border-zinc-800">
              {/* eslint-disable-next-line @next/next/no-img-element -- blob / data URL preview */}
              <img
                src={canvasBackgroundImageUrl}
                alt=""
                decoding="async"
                className="max-h-24 w-full object-cover"
              />
              <div
                className={cn(
                  "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-150",
                  "group-hover/preview:pointer-events-auto group-hover/preview:opacity-100",
                  "group-focus-within/preview:pointer-events-auto group-focus-within/preview:opacity-100"
                )}
              >
                <TooltipProvider delayDuration={300}>
                  <div className="absolute right-1 top-1 flex gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => setCanvasBackgroundImageFromFile(null)}
                          className={cn(
                            "flex size-8 shrink-0 items-center justify-center rounded-md border border-zinc-600/80 bg-zinc-950/90 text-zinc-300 shadow-md backdrop-blur-sm outline-none transition-colors",
                            "hover:border-red-900/70 hover:bg-red-950/50 hover:text-red-200",
                            "focus-visible:ring-2 focus-visible:ring-white/35"
                          )}
                          aria-label="Remove background image"
                        >
                          <Trash2 className="size-4" strokeWidth={2} aria-hidden />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" sideOffset={6}>
                        Remove
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => fileRef.current?.click()}
                          className={cn(
                            "flex size-8 shrink-0 items-center justify-center rounded-md border border-zinc-600/80 bg-zinc-950/90 text-zinc-200 shadow-md backdrop-blur-sm outline-none transition-colors",
                            "hover:border-zinc-500 hover:bg-zinc-800 hover:text-white",
                            "focus-visible:ring-2 focus-visible:ring-white/35"
                          )}
                          aria-label="Upload another background image"
                        >
                          <Upload className="size-4" strokeWidth={2} aria-hidden />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" sideOffset={6}>
                        Upload another
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {mode === "template" ? <CanvasBackgroundTemplatesSection /> : null}
    </div>

    <div className="space-y-2 pt-1">
      <span className="block text-xs font-medium text-zinc-400">Effects</span>
      <div className="space-y-2">
        <EffectAccordionSection
          sectionId="canvas-effect-noise"
          label="Noise"
          Icon={StyleNoiseIcon}
          open={noiseSectionOpen}
          onToggle={() => toggleEffectSection("canvas-effect-noise")}
        >
          <CanvasEffectSliderRow
            id="canvas-effect-noise"
            label="Noise"
            Icon={Droplet}
            value={canvasNoisePercent}
            onChange={setCanvasNoisePercent}
            hideLabel
          />
          <CanvasNoiseTypePicker
            value={canvasNoiseType}
            onChange={(id) => {
              setCanvasNoiseType(id);
              if (canvasNoisePercent === 0) {
                setCanvasNoisePercent(NOISE_TYPE_ACTIVATE_PERCENT);
              }
            }}
            noneSelected={canvasNoisePercent === 0}
            onSelectNone={() => setCanvasNoisePercent(0)}
          />
          {canvasNoisePercent > 0 ? (
            <div className="flex min-h-0 items-center gap-2">
              <div className="min-w-0 flex-1">
                <NoiseColorCompactRow
                  color={canvasNoiseColor}
                  onColorChange={setCanvasNoiseColor}
                />
              </div>
              <NoiseBlendModeDropdown
                value={canvasNoiseBlendMode}
                onChange={setCanvasNoiseBlendMode}
              />
            </div>
          ) : null}
        </EffectAccordionSection>
        <EffectAccordionSection
          sectionId="canvas-effect-blur"
          label="Blur"
          Icon={StyleBlurIcon}
          open={blurSectionOpen}
          onToggle={() => toggleEffectSection("canvas-effect-blur")}
        >
          <CanvasEffectSliderRow
            id="canvas-effect-blur"
            label="Blur"
            Icon={Droplet}
            value={canvasBlurPercent}
            onChange={setCanvasBlurPercent}
            hideLabel
          />
        </EffectAccordionSection>
      </div>
    </div>

    <div className="space-y-2 pt-1">
      <span className="block text-xs font-medium text-zinc-400">Shaders</span>
      <div className="space-y-2">
        <EffectAccordionSection
          sectionId="canvas-shader-dither"
          label="Dither"
          Icon={StyleDitherIcon}
          open={ditherSectionOpen}
          onToggle={() => {
            if (ditherSectionOpen && canvasDitherEnabled) {
              setCanvasDitherEnabled(false);
              setOpenShaderSection("");
              return;
            }
            if (!ditherSectionOpen) {
              setOpenShaderSection("canvas-shader-dither");
              if (canApplyShader) {
                setCanvasHalftoneEnabled(false);
                setCanvasDitherEnabled(true);
              }
              return;
            }
            toggleShaderSection("canvas-shader-dither");
          }}
          openTrailingIcon={canvasDitherEnabled ? "remove" : "collapse"}
        >
          <CanvasDitherControls />
        </EffectAccordionSection>
        <EffectAccordionSection
          sectionId="canvas-shader-halftone"
          label="Halftone Dots"
          Icon={StyleHalftoneIcon}
          open={halftoneSectionOpen}
          onToggle={() => {
            if (halftoneSectionOpen && canvasHalftoneEnabled) {
              setCanvasHalftoneEnabled(false);
              setOpenShaderSection("");
              return;
            }
            if (!halftoneSectionOpen) {
              setOpenShaderSection("canvas-shader-halftone");
              if (canApplyShader) {
                setCanvasDitherEnabled(false);
                setCanvasHalftoneEnabled(true);
              }
              return;
            }
            toggleShaderSection("canvas-shader-halftone");
          }}
          openTrailingIcon={canvasHalftoneEnabled ? "remove" : "collapse"}
        >
          <CanvasHalftoneControls />
        </EffectAccordionSection>
      </div>
    </div>

    <div className="space-y-2 pt-1">
      <span className="block text-xs font-medium text-zinc-400">Mood</span>
      <div className="space-y-2">
        <EffectAccordionSection
          sectionId="canvas-mood-shadow"
          label="Shadow"
          Icon={MoodShadowIcon}
          open={shadowSectionOpen}
          onToggle={() => toggleMoodSection("canvas-mood-shadow")}
        >
          <div className="space-y-3">
            <div
              role="radiogroup"
              aria-label="Mood shadow presets"
              className={templatePreviewGridClass}
            >
              {CANVAS_MOOD_SHADOW_TEMPLATES.map((entry) => {
                const selected = canvasOverlayShadowId === entry.id;
                return (
                  <button
                    key={entry.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={entry.label}
                    onClick={() =>
                      setCanvasOverlayShadowId(selected ? null : entry.id)
                    }
                    className={cn(
                      overlayPreviewButtonBase,
                      selected
                        ? "border-zinc-500 shadow-sm ring-2 ring-inset ring-white/20"
                        : "border-zinc-700 hover:border-zinc-500"
                    )}
                    style={{ background: entry.previewBackground }}
                  />
                );
              })}
            </div>
            <CanvasEffectSliderRow
              id="canvas-mood-shadow-opacity"
              label="Opacity"
              Icon={Droplet}
              value={canvasOverlayShadowOpacity}
              onChange={setCanvasOverlayShadowOpacity}
              hideLabel
            />
            <div
              role="radiogroup"
              aria-label="Shadow placement"
              className="grid grid-cols-2 gap-1.5"
            >
              {MOOD_SHADOW_PLACEMENT_OPTIONS.map(({ id, label }) => {
                const selected = canvasOverlayShadowPlacement === id;
                return (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setCanvasOverlayShadowPlacement(id)}
                    className={overlayShadowPlacementButtonClass(selected)}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </EffectAccordionSection>
      </div>
    </div>
    </>
  );
}
